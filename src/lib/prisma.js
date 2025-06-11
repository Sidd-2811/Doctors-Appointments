import { PrismaClient } from "@/generated/prisma";

export const db = globalThis.prisma || new PrismaClient();
if(process.env.NODE_ENV != "production"){
    globalThis.prisma = db;
}

// globalThis.prisma : thus variable ensure that tne prisma client instance is reused across hot reloads in development.Without this each time your application reloads, a new PrismaClient instance would be created, leading to potential issues like connection limits being exceeded.