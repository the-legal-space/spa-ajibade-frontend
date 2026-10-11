import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection for the booking records (see src/lib/discuss/bookings.ts).
 *
 *   MONGODB_URI   connection string (e.g. from MongoDB Atlas). When it is not set, bookings still work
 *                 but nothing is stored and double bookings are not prevented.
 *   MONGODB_DB    database name (default "spa_ajibade")
 *
 * The client is created once per server process and reused (it is kept on globalThis so development
 * hot reloads do not open a new connection every time).
 */

const globalForMongo = globalThis as unknown as { _spaMongo?: Promise<MongoClient> };

export const mongoConfigured = () => !!process.env.MONGODB_URI;

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  globalForMongo._spaMongo ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5 }).connect();
  try {
    return (await globalForMongo._spaMongo).db(process.env.MONGODB_DB || "spa_ajibade");
  } catch (err) {
    globalForMongo._spaMongo = undefined; // try again on the next request instead of caching the failure
    throw err;
  }
}
