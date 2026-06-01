#!/usr/bin/env node
// scripts/setup.js

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const blue = (s) => `\x1b[34m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

console.log(bold("\n🎯 Teal — Local Setup\n"));

const secret = crypto.randomBytes(32).toString("hex");

// ── .env.local (for Next.js) ──────────────────────────────────────────────────
const envLocalPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envLocalPath)) {
  const envLocal = `# Next.js environment variables
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobtrackr"
AUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"
`;
  fs.writeFileSync(envLocalPath, envLocal);
  console.log(green("✅ Created .env.local (for Next.js) with a generated AUTH_SECRET"));
} else {
  console.log(green("✅ .env.local already exists"));
}

// ── .env (for Prisma CLI) ─────────────────────────────────────────────────────
// Prisma CLI reads .env, not .env.local — both files are needed.
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  const envContent = `# Prisma reads this file (not .env.local)
# Keep DATABASE_URL in sync with .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobtrackr"
`;
  fs.writeFileSync(envPath, envContent);
  console.log(green("✅ Created .env (for Prisma CLI)"));
} else {
  console.log(green("✅ .env already exists"));
}

// Check node_modules
if (!fs.existsSync("node_modules")) {
  console.log(blue("\n📦 Installing dependencies..."));
  execSync("npm install", { stdio: "inherit" });
} else {
  console.log(green("✅ Dependencies already installed"));
}

// Generate Prisma client
console.log(blue("\n⚙️  Generating Prisma client..."));
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log(green("✅ Prisma client generated"));
} catch {
  console.log(yellow("⚠️  Prisma generate failed — check your schema"));
}

console.log(bold("\n📋 Next steps:\n"));
console.log("1. Edit " + yellow(".env.local") + " and set DATABASE_URL to your Neon/PostgreSQL URL");
console.log("   " + yellow("IMPORTANT:") + " also paste the same DATABASE_URL into " + yellow(".env"));
console.log("   (Prisma CLI reads .env, Next.js reads .env.local — both need the URL)\n");
console.log("2. Run " + blue("npm run db:migrate") + " to create database tables");
console.log("3. Run " + blue("npm run db:seed") + " (optional) to load demo data");
console.log("4. Run " + blue("npm run dev") + " to start the dev server\n");
console.log("   Demo login: demo@jobtrackr.dev / Demo1234!\n");
