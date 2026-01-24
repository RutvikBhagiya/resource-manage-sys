import { prisma } from "@/lib/prisma"
import { NotificationType } from "@/generated/prisma/enums"

export async function sendNotification({
  userId,
  title,
  message,
  type
}: {
  userId: number
  title: string
  message: string
  type: NotificationType
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false
      }
    })
  } catch (error) {
    console.error("Failed to send notification:", error)
  }
}