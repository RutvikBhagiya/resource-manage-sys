import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: number | null;
  organizationName: string | null;
  organizationType: string | null;
  image: string | null;
  phone: string | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt"
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            Organization: true,
          }
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? null,
          organizationId: user.organizationId,
          organizationName: user.Organization?.name,
          organizationType: user.Organization?.type,
          phone: user.phone,
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      if (user) {
        const u = user as AppUser;

        token.id = u.id;
        token.role = u.role;
        token.organizationId = u.organizationId ?? null;
        token.organizationName = u.organizationName ?? null;
        token.organizationType = u.organizationType ?? null;
        token.image = u.image;
        token.phone = u.phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as number | null;
        session.user.organizationName = token.organizationName as string | null;
        session.user.organizationType = token.organizationType as string | null;
        session.user.image = token.image as string | null;
        session.user.phone = token.phone as string | null;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login"
  },

  secret: process.env.NEXTAUTH_SECRET
};