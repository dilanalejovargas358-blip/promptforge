import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "PROMPT_UNDER_REVIEW"
  | "PROMPT_REMOVED"
  | "REPORT_DISMISSED";

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/** Crea una notificación in-app. Se guarda el historial completo. */
export async function notifyUser(input: NotifyInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
  });
}
