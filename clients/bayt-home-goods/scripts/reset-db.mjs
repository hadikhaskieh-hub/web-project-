#!/usr/bin/env node
/**
 * Deletes the shop database so the next boot recreates it from
 * db/schema.sql and reseeds the categories and products.
 *
 *   npm run db:reset
 *
 * Orders, staff accounts and settings all go with it. Uploaded photos in
 * public/uploads are left alone.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dbPath = process.env.BAYT_DB_PATH ?? path.join(root, "db", "shop.db");

let removed = 0;

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const file = `${dbPath}${suffix}`;
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    removed += 1;
    console.log(`Removed ${path.relative(root, file)}`);
  }
}

if (removed === 0) {
  console.log("No database file found. Nothing to reset.");
} else {
  console.log("Done. The next start will recreate and reseed the shop.");
}
