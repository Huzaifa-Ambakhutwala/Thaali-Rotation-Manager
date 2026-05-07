import { NextResponse } from "next/server";

import { runReminderCron } from "@/lib/cron/reminders";

export async function GET(req: Request) {
  return await handle(req);
}

export async function POST(req: Request) {
  return await handle(req);
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await runReminderCron();
  return NextResponse.json({ ok: true, ...result });
}

