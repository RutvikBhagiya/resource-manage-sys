import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    email: session?.user?.email,
    name: session?.user?.name,
    role: (session?.user as any)?.role,
    image: (session?.user as any)?.image,
    id: (session?.user as any)?.id,
    organizationId: (session?.user as any)?.organizationId,
    organizationName: (session?.user as any)?.organizationName,
    organizationType: (session?.user as any)?.organizationType,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    status, // "authenticated", "loading", "unauthenticated"
  };
}