/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

declare module "@prisma/client" {
  export class PrismaClient {
    [key: string]: any;
  }
}
