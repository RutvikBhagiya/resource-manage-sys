import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking/BookingForm";

export default async function NewBookingPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null; 

  const resources = await prisma.resource.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      isAvailable: true
    },
    select: {
      resourceId: true,
      name: true,
      roomNumber: true,
      requiresApproval: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="py-8 px-4">
      <BookingForm 
        resources={resources} 
        userId={Number(session.user.id)} 
      />
    </div>
  );
}