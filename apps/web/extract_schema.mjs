#!/usr/bin/env node
/**
 * PostgreSQL / Supabase — Full Schema Extractor (Node.js)
 * ========================================================
 * Mirrors the Python extract_schema.py but runs on Node.js.
 * Uses raw pg (node-postgres) so it works with any Postgres
 * database — Supabase, Railway, Neon, local, etc.
 *
 * Covered
 * -------
 *   • Custom TYPES  (enums, composites, domains, ranges)
 *   • SEQUENCES
 *   • TABLES        (columns, constraints, indexes)
 *   • VIEWS
 *   • MATERIALIZED VIEWS
 *   • FUNCTIONS / PROCEDURES
 *   • TRIGGERS
 *   • FOREIGN KEY constraints
 *   • TABLE COMMENTS & COLUMN COMMENTS
 *   • EXTENSIONS    (informational header)
 *   • ROW-LEVEL SECURITY policies
 *   • GRANTS
 *
 * Install deps
 * ------------
 *   npm install pg dotenv
 *   # or: yarn add pg dotenv
 *
 * Connection — pick one
 * ---------------------
 *   Option 1 — .env file
 *     DATABASE_URL=postgresql://user:pass@host:5432/dbname
 *     or individually: DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
 *
 *   Option 2 — CLI flag
 *     node extract_schema.mjs --url "postgresql://..."
 *
 *   Option 3 — edit DEFAULT_URL below
 *
 * Usage
 * -----
 *   node extract_schema.mjs
 *   node extract_schema.mjs --schemas public
 *   node extract_schema.mjs --also-include auth storage
 *   node extract_schema.mjs --all-schemas --output full_dump.sql
 *   node extract_schema.mjs --url "postgresql://..." --output out.sql
 */

import fs   from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

// ── Optional dotenv ───────────────────────────────────────────────────────────
try {
  const { config } = await import("dotenv");
  config();
} catch {
  // dotenv not installed — env vars must come from the shell
}

// ── Optional pg ───────────────────────────────────────────────────────────────
let pg;
try {
  pg = (await import("pg")).default;
} catch {
  console.error("❌  'pg' package not found — run: npm install pg");
  process.exit(1);
}
const { Pool } = pg;

// ── Hardcode a fallback URL here if you prefer ────────────────────────────────
const DEFAULT_URL = "";
// e.g. "postgresql://postgres:secret@db.xxxx.supabase.co:5432/postgres"
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_SCHEMAS = new Set([
  "pg_catalog", "information_schema", "pg_toast",
  "pg_temp_1", "pg_toast_temp_1",
  "auth", "storage", "realtime", "_realtime",
  "supabase_functions", "supabase_migrations", "supabase_admin",
  "pgbouncer", "net", "vault",
  "graphql", "graphql_public",
  "pgsodium", "pgsodium_masks",
  "cron", "dblink", "extensions",
  "topology", "tiger", "tiger_data",
]);

// ── Global — populated in main() ─────────────────────────────────────────────
let ACTIVE_SCHEMAS = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.DB_HOST     ?? "localhost";
  const port = process.env.DB_PORT     ?? "5432";
  const user = process.env.DB_USER     ?? "postgres";
  const pass = process.env.DB_PASSWORD ?? "";
  const name = process.env.DB_NAME     ?? "postgres";
  return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
}

async function q(pool, sql, params = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

/** SQL IN-list fragment + matching values for ACTIVE_SCHEMAS. */
function schemaFilter(alias = "n") {
  const placeholders = ACTIVE_SCHEMAS.map((_, i) => `$${i + 1}`).join(", ");
  return { frag: `${alias}.nspname IN (${placeholders})`, vals: ACTIVE_SCHEMAS };
}

/** Same but with a custom param offset (for queries that already have params). */
function schemaFilterAt(alias = "n", offset = 0) {
  const placeholders = ACTIVE_SCHEMAS.map((_, i) => `$${offset + i + 1}`).join(", ");
  return { frag: `${alias}.nspname IN (${placeholders})`, vals: ACTIVE_SCHEMAS };
}

function header(title) {
  const bar = "═".repeat(72);
  return `\n\n-- ╔${bar}╗\n-- ║  ${title.padEnd(70)}║\n-- ╚${bar}╝\n`;
}

// ── Schema resolution ─────────────────────────────────────────────────────────

async function resolveSchemas(pool, args) {
  if (args.allSchemas) {
    const rows = await q(pool, `
      SELECT nspname FROM pg_namespace
      WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema'
      ORDER BY nspname
    `);
    const schemas = rows.map(r => r.nspname);
    console.log(`  ℹ  --all-schemas: dumping ${schemas.length} schemas`);
    return schemas;
  }

  if (args.schemas?.length) return [...new Set(args.schemas)].sort();

  const rows = await q(pool, "SELECT nspname FROM pg_namespace ORDER BY nspname");
  let detected = rows
    .map(r => r.nspname)
    .filter(n => !SYSTEM_SCHEMAS.has(n) && !n.startsWith("pg_"));

  if (args.alsoInclude?.length) {
    detected = [...new Set([...detected, ...args.alsoInclude])].sort();
  }
  return detected;
}

// ── Extractors ────────────────────────────────────────────────────────────────

async function extractExtensions(pool) {
  const rows = await q(pool, `
    SELECT extname, extversion, obj_description(oid, 'pg_extension') AS comment
    FROM pg_extension
    ORDER BY extname
  `);
  if (!rows.length) return "";
  const out = [header("EXTENSIONS  (installed — informational)")];
  for (const r of rows) {
    const cmt = r.comment ? `  -- ${r.comment}` : "";
    out.push(`-- CREATE EXTENSION IF NOT EXISTS ${r.extname};  -- v${r.extversion}${cmt}`);
  }
  return out.join("\n");
}

async function extractTypes(pool) {
  const { frag, vals } = schemaFilter();

  const enums = await q(pool, `
    SELECT n.nspname AS schema, t.typname AS name,
           array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE ${frag} AND t.typtype = 'e'
    GROUP BY n.nspname, t.typname
    ORDER BY n.nspname, t.typname
  `, vals);

  const domains = await q(pool, `
    SELECT n.nspname AS schema,
           t.typname AS name,
           pg_catalog.format_type(t.typbasetype, t.typtypmod) AS base,
           t.typnotnull,
           pg_get_expr(t.typdefaultbin, 'pg_type'::regclass) AS default_val,
           (SELECT string_agg('CONSTRAINT ' || c.conname || ' CHECK (' ||
                    pg_get_constraintdef(c.oid, true) || ')', ', ')
            FROM pg_constraint c WHERE c.contypid = t.oid) AS checks
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE ${frag} AND t.typtype = 'd'
    ORDER BY n.nspname, t.typname
  `, vals);

  const composites = await q(pool, `
    SELECT n.nspname AS schema, t.typname AS name,
           string_agg(
               a.attname || ' ' || pg_catalog.format_type(a.atttypid, a.atttypmod),
               ', ' ORDER BY a.attnum
           ) AS cols
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_class c ON c.oid = t.typrelid AND c.relkind = 'c'
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
    WHERE ${frag}
    GROUP BY n.nspname, t.typname
    ORDER BY n.nspname, t.typname
  `, vals);

  const ranges = await q(pool, `
    SELECT n.nspname AS schema, t.typname AS name,
           pg_catalog.format_type(r.rngsubtype, NULL) AS subtype
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_range r ON r.rngtypid = t.oid
    WHERE ${frag}
    ORDER BY n.nspname, t.typname
  `, vals);

  if (!enums.length && !domains.length && !composites.length && !ranges.length) return "";

  const out = [header("CUSTOM TYPES")];

  if (enums.length) {
    out.push("-- ── ENUMS ─────────────────────────────────────────────────────────\n");
    for (const r of enums) {
      const labels = r.labels.map(l => `'${l}'`).join(", ");
      out.push(`CREATE TYPE ${r.schema}.${r.name} AS ENUM (${labels});\n`);
    }
  }

  if (domains.length) {
    out.push("\n-- ── DOMAINS ───────────────────────────────────────────────────────\n");
    for (const r of domains) {
      const nn      = r.typnotnull ? " NOT NULL" : "";
      const def     = r.default_val ? ` DEFAULT ${r.default_val}` : "";
      const checks  = r.checks ? ` ${r.checks}` : "";
      out.push(`CREATE DOMAIN ${r.schema}.${r.name} AS ${r.base}${nn}${def}${checks};\n`);
    }
  }

  if (composites.length) {
    out.push("\n-- ── COMPOSITE TYPES ───────────────────────────────────────────────\n");
    for (const r of composites) {
      out.push(`CREATE TYPE ${r.schema}.${r.name} AS (${r.cols});\n`);
    }
  }

  if (ranges.length) {
    out.push("\n-- ── RANGE TYPES ────────────────────────────────────────────────────\n");
    for (const r of ranges) {
      out.push(`CREATE TYPE ${r.schema}.${r.name} AS RANGE (SUBTYPE = ${r.subtype});\n`);
    }
  }

  return out.join("\n");
}

async function extractSequences(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema, s.relname AS name,
           seq.seqstart, seq.seqmin, seq.seqmax, seq.seqincrement,
           seq.seqcycle, seq.seqcache
    FROM pg_class s
    JOIN pg_namespace n ON n.oid = s.relnamespace
    JOIN pg_sequence seq ON seq.seqrelid = s.oid
    WHERE ${frag} AND s.relkind = 'S'
    ORDER BY n.nspname, s.relname
  `, vals);
  if (!rows.length) return "";
  const out = [header("SEQUENCES")];
  for (const r of rows) {
    const cycle = r.seqcycle ? " CYCLE" : " NO CYCLE";
    out.push(
      `CREATE SEQUENCE IF NOT EXISTS ${r.schema}.${r.name}\n` +
      `    START WITH ${r.seqstart}\n` +
      `    INCREMENT BY ${r.seqincrement}\n` +
      `    MINVALUE ${r.seqmin}\n` +
      `    MAXVALUE ${r.seqmax}\n` +
      `    CACHE ${r.seqcache}${cycle};\n`
    );
  }
  return out.join("\n");
}

async function extractTables(pool) {
  const { frag, vals } = schemaFilter();
  const tables = await q(pool, `
    SELECT n.nspname AS schema, c.relname AS name, c.oid,
           obj_description(c.oid, 'pg_class') AS comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE ${frag} AND c.relkind = 'r'
    ORDER BY n.nspname, c.relname
  `, vals);
  if (!tables.length) return "";

  const out = [header("TABLES")];

  for (const tbl of tables) {
    const { schema, name, oid } = tbl;

    const cols = await q(pool, `
      SELECT a.attname AS col,
             pg_catalog.format_type(a.atttypid, a.atttypmod) AS type,
             a.attnotnull,
             pg_get_expr(d.adbin, d.adrelid) AS default_val,
             a.attidentity,
             a.attgenerated,
             col_description(a.attrelid, a.attnum) AS comment
      FROM pg_attribute a
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = $1 AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum
    `, [oid]);

    const cons = await q(pool, `
      SELECT conname, contype, pg_get_constraintdef(oid, true) AS def
      FROM pg_constraint
      WHERE conrelid = $1
      ORDER BY contype, conname
    `, [oid]);

    const idxs = await q(pool, `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = $1 AND tablename = $2
        AND indexname NOT IN (
            SELECT conname FROM pg_constraint WHERE conrelid = $3
        )
      ORDER BY indexname
    `, [schema, name, oid]);

    const colLines = [];

    for (const c of cols) {
      const parts = [`    ${c.col} ${c.type}`];
      if      (c.attidentity === "a")  parts.push("GENERATED ALWAYS AS IDENTITY");
      else if (c.attidentity === "d")  parts.push("GENERATED BY DEFAULT AS IDENTITY");
      else if (c.attgenerated === "s") parts.push(`GENERATED ALWAYS AS (${c.default_val}) STORED`);
      else if (c.default_val)          parts.push(`DEFAULT ${c.default_val}`);
      if (c.attnotnull) parts.push("NOT NULL");
      colLines.push(parts.join(" "));
    }

    for (const cn of cons) {
      if (cn.contype !== "f") { // FKs added later
        colLines.push(`    CONSTRAINT ${cn.conname} ${cn.def}`);
      }
    }

    const body = colLines.join(",\n");
    out.push(`CREATE TABLE IF NOT EXISTS ${schema}.${name} (\n${body}\n);\n`);

    for (const idx of idxs) {
      out.push(`${idx.indexdef};\n`);
    }

    if (tbl.comment) {
      out.push(`COMMENT ON TABLE ${schema}.${name} IS $$${tbl.comment}$$;\n`);
    }

    for (const c of cols) {
      if (c.comment) {
        out.push(`COMMENT ON COLUMN ${schema}.${name}.${c.col} IS $$${c.comment}$$;\n`);
      }
    }

    out.push("");
  }

  return out.join("\n");
}

async function extractForeignKeys(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema, cl.relname AS table,
           c.conname, pg_get_constraintdef(c.oid, true) AS def
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE ${frag} AND c.contype = 'f'
    ORDER BY n.nspname, cl.relname, c.conname
  `, vals);
  if (!rows.length) return "";
  const out = [header("FOREIGN KEY CONSTRAINTS")];
  for (const r of rows) {
    out.push(
      `ALTER TABLE ${r.schema}.${r.table}\n` +
      `    ADD CONSTRAINT ${r.conname} ${r.def};\n`
    );
  }
  return out.join("\n");
}

async function extractViews(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema, c.relname AS name,
           pg_get_viewdef(c.oid, true) AS definition,
           obj_description(c.oid, 'pg_class') AS comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE ${frag} AND c.relkind = 'v'
    ORDER BY n.nspname, c.relname
  `, vals);
  if (!rows.length) return "";
  const out = [header("VIEWS")];
  for (const r of rows) {
    out.push(`CREATE OR REPLACE VIEW ${r.schema}.${r.name} AS\n${r.definition.trim()};\n`);
    if (r.comment) out.push(`COMMENT ON VIEW ${r.schema}.${r.name} IS $$${r.comment}$$;\n`);
    out.push("");
  }
  return out.join("\n");
}

async function extractMaterializedViews(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema, c.relname AS name,
           pg_get_viewdef(c.oid, true) AS definition,
           obj_description(c.oid, 'pg_class') AS comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE ${frag} AND c.relkind = 'm'
    ORDER BY n.nspname, c.relname
  `, vals);
  if (!rows.length) return "";
  const out = [header("MATERIALIZED VIEWS")];
  for (const r of rows) {
    out.push(
      `CREATE MATERIALIZED VIEW IF NOT EXISTS ${r.schema}.${r.name} AS\n` +
      `${r.definition.trim()}\nWITH NO DATA;\n`
    );
    if (r.comment) {
      out.push(`COMMENT ON MATERIALIZED VIEW ${r.schema}.${r.name} IS $$${r.comment}$$;\n`);
    }
    out.push("");
  }
  return out.join("\n");
}

async function extractFunctions(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema,
           p.proname AS name,
           pg_get_function_identity_arguments(p.oid) AS args,
           pg_get_functiondef(p.oid) AS definition,
           p.prokind,
           obj_description(p.oid, 'pg_proc') AS comment
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE ${frag} AND p.prokind IN ('f', 'p')
    ORDER BY n.nspname, p.proname, args
  `, vals);
  if (!rows.length) return "";
  const out = [header("FUNCTIONS & PROCEDURES")];
  for (const r of rows) {
    const kind = r.prokind === "p" ? "PROCEDURE" : "FUNCTION";
    out.push(`-- ${kind}: ${r.schema}.${r.name}(${r.args})`);
    out.push(r.definition.trim() + ";\n");
    if (r.comment) {
      out.push(
        `COMMENT ON ${kind} ${r.schema}.${r.name}(${r.args}) IS $$${r.comment}$$;\n`
      );
    }
  }
  return out.join("\n");
}

async function extractTriggers(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema,
           t.tgname AS trigger_name,
           c.relname AS table_name,
           pg_get_triggerdef(t.oid, true) AS definition,
           t.tgenabled
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE ${frag} AND NOT t.tgisinternal
    ORDER BY n.nspname, c.relname, t.tgname
  `, vals);
  if (!rows.length) return "";
  const out = [header("TRIGGERS")];
  for (const r of rows) {
    const disabled = r.tgenabled === "O" ? "" : `  -- DISABLED (tgenabled=${r.tgenabled})`;
    out.push(`${r.definition};${disabled}\n`);
  }
  return out.join("\n");
}

async function extractRls(pool) {
  const { frag, vals } = schemaFilter();

  const rlsTables = await q(pool, `
    SELECT n.nspname AS schema, c.relname AS name,
           c.relrowsecurity, c.relforcerowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE ${frag} AND c.relkind = 'r' AND c.relrowsecurity
    ORDER BY n.nspname, c.relname
  `, vals);

  const policies = await q(pool, `
    SELECT n.nspname AS schema, c.relname AS table_name,
           p.polname, p.polcmd,
           p.polpermissive,
           pg_get_expr(p.polqual, p.polrelid, true) AS using_expr,
           pg_get_expr(p.polwithcheck, p.polrelid, true) AS check_expr,
           CASE WHEN p.polroles = '{0}'::oid[] THEN ARRAY['PUBLIC']
                ELSE array_agg(r.rolname)
           END AS roles
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_roles r ON r.oid = ANY(p.polroles)
    WHERE ${frag}
    GROUP BY n.nspname, c.relname, p.polname, p.polcmd, p.polpermissive,
             p.polqual, p.polwithcheck, p.polrelid, p.polroles
    ORDER BY n.nspname, c.relname, p.polname
  `, vals);

  if (!rlsTables.length && !policies.length) return "";

  const out = [header("ROW LEVEL SECURITY")];

  for (const t of rlsTables) {
    out.push(`ALTER TABLE ${t.schema}.${t.name} ENABLE ROW LEVEL SECURITY;`);
    if (t.relforcerowsecurity) {
      out.push(`ALTER TABLE ${t.schema}.${t.name} FORCE ROW LEVEL SECURITY;`);
    }
  }
  out.push("");

  const cmdMap = { r: "SELECT", a: "INSERT", w: "UPDATE", d: "DELETE", "*": "ALL" };

  for (const p of policies) {
    const permissive = p.polpermissive ? "PERMISSIVE" : "RESTRICTIVE";
    const cmd        = cmdMap[p.polcmd] ?? "ALL";
    const roles      = (p.roles ?? []).join(", ") || "PUBLIC";

    let policy =
      `CREATE POLICY ${p.polname}\n` +
      `    ON ${p.schema}.${p.table_name}\n` +
      `    AS ${permissive}\n` +
      `    FOR ${cmd}\n` +
      `    TO ${roles}`;

    if (p.using_expr)  policy += `\n    USING (${p.using_expr})`;
    if (p.check_expr)  policy += `\n    WITH CHECK (${p.check_expr})`;
    out.push(policy + ";\n");
  }

  return out.join("\n");
}

async function extractGrants(pool) {
  const { frag, vals } = schemaFilter();
  const rows = await q(pool, `
    SELECT n.nspname AS schema, c.relname AS name,
           array_agg(DISTINCT privilege_type) AS privs,
           grantee
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL (
        SELECT (aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner)))).grantee,
               (aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner)))).privilege_type
    ) acl
    JOIN pg_roles gr ON gr.oid = acl.grantee
    WHERE ${frag} AND c.relkind IN ('r', 'v', 'm')
      AND gr.rolname NOT IN ('postgres', 'supabase_admin', 'rdsadmin')
    GROUP BY n.nspname, c.relname, acl.grantee
    ORDER BY n.nspname, c.relname
  `, vals);
  if (!rows.length) return "";
  const out = [header("GRANTS  (table / view level)")];
  for (const r of rows) {
    const privs = [...r.privs].sort().join(", ");
    out.push(`GRANT ${privs} ON ${r.schema}.${r.name} TO ${r.grantee};`);
  }
  return out.join("\n");
}

// ── CLI parsing ───────────────────────────────────────────────────────────────

function parseCliArgs() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      url:          { type: "string" },
      output:       { type: "string", default: "schema_dump.sql" },
      schemas:      { type: "string", multiple: true },
      "also-include":{ type: "string", multiple: true },
      "all-schemas": { type: "boolean", default: false },
      help:         { type: "boolean", default: false },
    },
  });

  if (values.help) {
    console.log(`
Usage: node extract_schema.mjs [options]

Options:
  --url <url>              PostgreSQL connection string
  --output <file>          Output file (default: schema_dump.sql)
  --schemas <s> [<s>...]   Dump ONLY these schemas
  --also-include <s> [...] Add schemas on top of auto-detected defaults
  --all-schemas            Dump every schema (including Supabase internals)
  --help                   Show this help

Examples:
  node extract_schema.mjs
  node extract_schema.mjs --schemas public
  node extract_schema.mjs --also-include auth storage
  node extract_schema.mjs --all-schemas --output full_dump.sql
  node extract_schema.mjs --url "postgresql://user:pass@host/db"
    `.trim());
    process.exit(0);
  }

  const alsoInclude = values["also-include"];
  const allSchemas  = values["all-schemas"];

  if (alsoInclude?.length && (values.schemas?.length || allSchemas)) {
    console.error("❌  --also-include cannot be combined with --schemas or --all-schemas");
    process.exit(1);
  }

  return {
    url:         values.url,
    output:      values.output,
    schemas:     values.schemas ?? [],
    alsoInclude: alsoInclude   ?? [],
    allSchemas,
  };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseCliArgs();
  const url  = args.url || DEFAULT_URL || buildUrl();

  console.log("🔌  Connecting …");

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

  let dbInfo;
  try {
    dbInfo = (await q(pool, "SELECT current_database() AS db, version() AS ver"))[0];
  } catch (err) {
    console.error("❌  Connection failed:", err.message);
    process.exit(1);
  }

  console.log(`✅  Connected to: ${dbInfo.db}`);
  console.log(`    ${dbInfo.ver.slice(0, 60)}…`);

  ACTIVE_SCHEMAS = await resolveSchemas(pool, args);

  if (!ACTIVE_SCHEMAS.length) {
    console.error("❌  No schemas matched. Check your --schemas arguments.");
    process.exit(1);
  }

  console.log(`\n📦  Schemas to dump: ${ACTIVE_SCHEMAS.join(", ")}\n`);

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const sections = [
    `-- ================================================================\n` +
    `-- Schema Dump\n` +
    `-- Database : ${dbInfo.db}\n` +
    `-- Schemas  : ${ACTIVE_SCHEMAS.join(", ")}\n` +
    `-- Generated: ${now} UTC\n` +
    `-- ================================================================\n` +
    `SET statement_timeout = 0;\n` +
    `SET lock_timeout = 0;\n` +
    `SET client_encoding = 'UTF8';\n` +
    `SET standard_conforming_strings = on;\n`,
  ];

  const steps = [
    ["Extensions",           extractExtensions],
    ["Types",                extractTypes],
    ["Sequences",            extractSequences],
    ["Tables",               extractTables],
    ["Foreign Keys",         extractForeignKeys],
    ["Views",                extractViews],
    ["Materialized Views",   extractMaterializedViews],
    ["Functions/Procedures", extractFunctions],
    ["Triggers",             extractTriggers],
    ["RLS / Policies",       extractRls],
    ["Grants",               extractGrants],
  ];

  for (const [label, fn] of steps) {
    process.stdout.write(`  ⚙  Extracting ${label} … `);
    try {
      const chunk = await fn(pool);
      if (chunk) {
        sections.push(chunk);
        console.log("✓");
      } else {
        console.log("(empty)");
      }
    } catch (err) {
      console.log(`⚠  ${err.message}`);
    }
  }

  await pool.end();

  const finalSql = sections.join("\n");
  fs.writeFileSync(args.output, finalSql, "utf8");

  const sizeKb = (fs.statSync(args.output).size / 1024).toFixed(1);
  console.log(`\n🎉  Done!  →  ${args.output}  (${sizeKb} KB)`);
}

main().catch(err => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});
