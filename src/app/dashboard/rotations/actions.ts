"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCoordinator } from "@/lib/authz";
import { assignMemberToDate, unassign } from "@/lib/data/coordinator";

const assignSchema = z.object({
  memberId: z.string().uuid(),
  assignedDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
});

export async function createAssignment(formData: FormData) {
  const { zoneId, session } = await requireCoordinator();

  const parsed = assignSchema.safeParse({
    memberId: formData.get("memberId")?.toString() ?? "",
    assignedDate: formData.get("assignedDate")?.toString() ?? "",
  });
  if (!parsed.success) throw new Error("Invalid assignment input.");

  await assignMemberToDate({
    zoneId,
    memberId: parsed.data.memberId,
    assignedDate: parsed.data.assignedDate,
    createdBy: session.user.email ?? undefined,
  });

  revalidatePath("/dashboard/rotations");
}

export async function deleteAssignment(assignmentId: string) {
  const { zoneId } = await requireCoordinator();
  await unassign({ zoneId, assignmentId });
  revalidatePath("/dashboard/rotations");
}

