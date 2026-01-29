import { DefaultSession } from "next-auth"
import { Role } from "@/generated/prisma/enums"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      organizationId?: number | null
      organizationName?: string | null
      organizationType?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    organizationId?: number | null
    organizationName?: string | null
    organizationType?: string | null
  }
}
