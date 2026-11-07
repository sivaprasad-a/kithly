import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * One MongoClient per server process. In dev, Next reloads modules on every
 * change, so the client is parked on globalThis to avoid opening a new pool
 * each time.
 */
const g = globalThis as unknown as { __mongo?: { client: MongoClient; db: Db } };

export function hasMongo() {
  return Boolean(process.env.MONGODB_URI);
}

export function getMongo(): { client: MongoClient; db: Db } {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!g.__mongo) {
    const client = new MongoClient(process.env.MONGODB_URI, { appName: "kithly" });
    const db = client.db(process.env.MONGODB_DB || "kithly");
    g.__mongo = { client, db };
  }
  return g.__mongo;
}
