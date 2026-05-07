import "server-only";

import { render } from "@react-email/components";
import { format } from "date-fns";

import { ReminderEmail } from "@/emails/reminder-email";
import { getResend } from "@/lib/email/resend";

export async function sendReminderEmail(args: {
  to: string;
  memberName: string;
  assignedDate: string; // yyyy-mm-dd
  deliveryAddress: string;
  coordinatorEmail?: string | null;
  zoneName: string;
}) {
  const from = process.env.FROM_EMAIL;
  if (!from) throw new Error("Missing FROM_EMAIL.");

  const resend = getResend();
  const assignedDateLabel = format(new Date(args.assignedDate), "EEE, MMM d");
  const appUrl = process.env.NEXTAUTH_URL;

  const html = await render(
    ReminderEmail({
      memberName: args.memberName,
      assignedDateLabel,
      deliveryAddress: args.deliveryAddress,
      coordinatorEmail: args.coordinatorEmail,
      zoneName: args.zoneName,
      appUrl,
    }),
  );

  return await resend.emails.send({
    from,
    to: args.to,
    subject: `Thaali pickup reminder — ${assignedDateLabel}`,
    html,
  });
}

