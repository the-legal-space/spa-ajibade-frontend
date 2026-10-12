import "server-only";
import type { Collection, ObjectId } from "mongodb";
import { getDb, mongoConfigured } from "@/lib/db/mongo";
import { STAFF, WORKING_HOURS, getSlotsForDate } from "@/lib/discuss/staff";
import { parseSlot } from "@/lib/mail/calendar";

/**
 * "Discuss a Mandate" bookings in MongoDB, collection `mandates`.
 *
 * A slot is one attorney at one date and time. Each active booking carries `slotKey`
 * ("<staffId>|<yyyy-mm-dd>|<time>") and `active: true`, and a unique index on `slotKey` (only for
 * active bookings) makes the database itself refuse a second booking of the same slot, even when two
 * visitors press "Confirm" at the same moment.
 *
 * To free a slot (the client cancels, the firm declines), set `active: false` and a `status` such as
 * "cancelled" or "declined" on the document: the slot becomes bookable again and the record is kept.
 *
 * If MongoDB is not configured, or is unreachable, bookings still go through (the firm confirms every
 * booking by hand anyway): nothing is stored and a warning is logged.
 */

export type MandateStatus = "requested" | "confirmed" | "cancelled" | "declined" | "email_failed";

export type MandateDoc = {
  reference: string;
  staffId: string;
  staffName: string;
  date: string; // yyyy-mm-dd, Lagos
  time: string; // "10:30 AM"
  slotStart: Date;
  slotKey: string;
  active: boolean;
  status: MandateStatus;
  client: { firstName: string; lastName: string; email: string; phone: string };
  description: string;
  emails: { staff: boolean | null; client: boolean | null };
  createdAt: Date;
};

const LAGOS_OFFSET_MS = 60 * 60 * 1000; // Africa/Lagos is UTC+1 all year

/** yyyy-mm-dd of a slot's start, in Lagos time. */
const lagosDate = (start: Date) => new Date(start.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);

const slotKey = (staffId: string, isoDate: string, time: string) => `${staffId}|${isoDate}|${time}`;

export type SlotCheck = { ok: true; isoDate: string; start: Date } | { ok: false; errors: Record<string, string> };

/** Server-side rules for a requested slot: a real working-day time on the firm's list, in the future. */
export function checkSlot(staffId: string, date: string, time: string): SlotCheck {
  if (!STAFF.some((s) => s.id === staffId)) return { ok: false, errors: { staffId: "Please choose who you would like to meet." } };
  const slot = parseSlot(date, time);
  if (!slot) return { ok: false, errors: { date: "Please choose a date and time." } };
  const weekday = new Date(slot.start.getTime() + LAGOS_OFFSET_MS).getUTCDay();
  if (!WORKING_HOURS.workDays.includes(weekday)) return { ok: false, errors: { date: "We are only available on weekdays." } };
  if (!getSlotsForDate().includes(time)) return { ok: false, errors: { time: "Please choose one of the available times." } };
  if (slot.start.getTime() <= Date.now()) return { ok: false, errors: { date: "Please choose a time in the future." } };
  return { ok: true, isoDate: lagosDate(slot.start), start: slot.start };
}

let indexesReady = false;

async function mandates(): Promise<Collection<MandateDoc> | null> {
  const db = await getDb();
  if (!db) return null;
  const col = db.collection<MandateDoc>("mandates");
  if (!indexesReady) {
    await col.createIndex({ slotKey: 1 }, { unique: true, partialFilterExpression: { active: true }, name: "one_active_booking_per_slot" });
    await col.createIndex({ reference: 1 }, { unique: true, name: "reference" });
    await col.createIndex({ staffId: 1, date: 1 }, { name: "staff_date" });
    await col.createIndex({ createdAt: -1 }, { name: "newest_first" });
    indexesReady = true;
  }
  return col;
}

let warned = false;
function warnOnce(message: string) {
  if (warned) return;
  warned = true;
  console.warn(`[bookings] ${message}`);
}

export type Reservation = { ok: true; id: ObjectId | null } | { ok: false; reason: "taken" };

export type ReserveInput = {
  reference: string;
  staffId: string;
  isoDate: string;
  start: Date;
  time: string;
  client: MandateDoc["client"];
  description: string;
};

/** Claims the slot. Returns `{ ok: false, reason: "taken" }` if someone already holds it. */
export async function reserveSlot(input: ReserveInput): Promise<Reservation> {
  if (!mongoConfigured()) {
    warnOnce("MONGODB_URI is not set: bookings are not stored and double bookings are not prevented.");
    return { ok: true, id: null };
  }
  try {
    const col = await mandates();
    if (!col) return { ok: true, id: null };
    const staff = STAFF.find((s) => s.id === input.staffId)!;
    const result = await col.insertOne({
      reference: input.reference,
      staffId: input.staffId,
      staffName: staff.name,
      date: input.isoDate,
      time: input.time,
      slotStart: input.start,
      slotKey: slotKey(input.staffId, input.isoDate, input.time),
      active: true,
      status: "requested",
      client: input.client,
      description: input.description,
      emails: { staff: null, client: null },
      createdAt: new Date(),
    });
    return { ok: true, id: result.insertedId };
  } catch (err) {
    if ((err as { code?: number })?.code === 11000) return { ok: false, reason: "taken" };
    // The database is down or misconfigured. The firm still wants the request, so let it through.
    console.error("[bookings] could not store the booking:", (err as Error)?.message ?? err);
    return { ok: true, id: null };
  }
}

/** Frees a slot that was claimed but whose email could not be sent, keeping the record. */
export async function releaseSlot(id: ObjectId | null) {
  if (!id) return;
  try {
    const col = await mandates();
    await col?.updateOne({ _id: id }, { $set: { active: false, status: "email_failed" } });
  } catch (err) {
    console.error("[bookings] could not release the slot:", (err as Error)?.message ?? err);
  }
}

/** Records which of the two emails went out. */
export async function recordEmails(id: ObjectId | null, emails: { staff: boolean; client: boolean }) {
  if (!id) return;
  try {
    const col = await mandates();
    await col?.updateOne({ _id: id }, { $set: { emails } });
  } catch (err) {
    console.error("[bookings] could not update the booking:", (err as Error)?.message ?? err);
  }
}

/** Times already taken for one attorney on one day (yyyy-mm-dd). Empty when the database is unavailable. */
export async function bookedTimes(staffId: string, isoDate: string): Promise<string[]> {
  if (!mongoConfigured()) return [];
  try {
    const col = await mandates();
    if (!col) return [];
    const rows = await col.find({ staffId, date: isoDate, active: true }, { projection: { time: 1, _id: 0 } }).toArray();
    return rows.map((r) => r.time);
  } catch (err) {
    console.error("[bookings] could not read bookings:", (err as Error)?.message ?? err);
    return [];
  }
}
