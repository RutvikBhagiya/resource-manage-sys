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
  organizationId: number;
  organizationName: string;
  organizationType: string;
  image: string | null;
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
          organizationName: user.Organization.name,
          organizationType: user.Organization.type
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AppUser;

        token.id = u.id;
        token.role = u.role;
        token.organizationId = u.organizationId;
        token.organizationName = u.organizationName;
        token.organizationType = u.organizationType;
        token.image = u.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as number;
        session.user.organizationName = token.organizationName as string;
        session.user.organizationType = token.organizationType;
        session.user.image = token.image as string | null;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login"
  },

  secret: process.env.NEXTAUTH_SECRET
};