/**
 * Exécute un fichier .sql contre PostgreSQL (Insforge / local).
 *
 * Usage :
 *   DATABASE_URL="postgresql://..." node scripts/run-pg.cjs scripts/sql/001_mindstress_init.sql
 *
 * Ou avec .env.local (chargé automatiquement si DATABASE_URL absent) :
 *   node scripts/run-pg.cjs scripts/sql/002_seed_demo.sql
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main() {
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error(
      "Usage: node scripts/run-pg.cjs <fichier.sql>\nExemple: node scripts/run-pg.cjs scripts/sql/001_mindstress_init.sql"
    );
    process.exit(1);
  }

  loadEnvLocal();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL manquant. Ajoute-le dans .env.local ou exporte-le dans le terminal."
    );
    process.exit(1);
  }

  const abs = path.isAbsolute(sqlFile)
    ? sqlFile
    : path.join(__dirname, "..", sqlFile);
  if (!fs.existsSync(abs)) {
    console.error("Fichier introuvable:", abs);
    process.exit(1);
  }

  const sql = fs.readFileSync(abs, "utf8");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK — exécuté:", path.relative(process.cwd(), abs));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
