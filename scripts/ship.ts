import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const EXTENSION_DIR = join(import.meta.dir, "../apps/extension");
const SHOPIFY_APP_DIR = join(import.meta.dir, "../apps/emotifyai-app");

async function main() {
  console.log("🚀 Starting EmotifyAI Shipping Process...");

  // 1. Build Extension
  console.log("\n📦 Building Extension Artifacts...");
  try {
    await $`cd ${EXTENSION_DIR} && bun install && bun run zip && bun run zip:firefox`;
    console.log("✅ Extension built successfully!");
  } catch (error) {
    console.error("❌ Failed to build extension:", error);
    process.exit(1);
  }

  // 2. Check/Init Shopify App
  console.log("\n🛍️ Checking Shopify App...");
  if (!existsSync(SHOPIFY_APP_DIR)) {
    console.log("⚠️ Shopify App not found. Initializing...");
    console.log("👉 You will need to log in to Shopify.");
    try {
      // We run this interactively so the user can login and choose options
      const { spawn } = await import("node:child_process");
      await new Promise<void>((resolve, reject) => {
        const child = spawn("bun", ["create", "@shopify/app@latest", "--template", "remix", "--name", "emotifyai-app"], {
          cwd: join(EXTENSION_DIR, "../"),
          stdio: "inherit",
          shell: true,
        });

        child.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Shopify init exited with code ${code}`));
        });
      });
      console.log("✅ Shopify App initialized!");
    } catch (error) {
      console.error("❌ Failed to initialize Shopify App:", error);
      console.log("💡 Try running 'bun create @shopify/app@latest' manually in the 'apps' directory.");
      process.exit(1);
    }
  } else {
    console.log("✅ Shopify App found.");
  }

  // 3. Build Shopify App
  console.log("\n🏗️ Building Shopify App...");
  try {
    await $`cd ${SHOPIFY_APP_DIR} && bun install && bun run build`;
    console.log("✅ Shopify App built successfully!");
  } catch (error) {
    console.error("❌ Failed to build Shopify App:", error);
    process.exit(1);
  }

  // 4. Deploy (Optional)
  const deploy = confirm("Do you want to deploy the Shopify App now?");
  if (deploy) {
    console.log("\n🚀 Deploying to Shopify...");
    try {
      // Use spawn for interactive deployment
      const { spawn } = await import("node:child_process");
      await new Promise<void>((resolve, reject) => {
        const child = spawn("bun", ["run", "deploy"], {
          cwd: SHOPIFY_APP_DIR,
          stdio: "inherit",
          shell: true,
        });

        child.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Deployment exited with code ${code}`));
        });
      });
      console.log("✅ Deployed successfully!");
    } catch (error) {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    }
  }

  console.log("\n✨ Shipping process completed!");
}

main();
