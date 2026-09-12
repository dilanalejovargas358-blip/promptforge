import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SIGNUP_CREDITS, SIGNUP_RAYS } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Si el usuario no tiene password, fue creado con OAuth
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    // Los usuarios creados vía OAuth (Google) no pasan por /api/auth/register,
    // así que aquí se les asignan los valores iniciales explícitamente.
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: SIGNUP_CREDITS,
          rays: SIGNUP_RAYS,
          raysUpdatedAt: new Date(),
        },
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      // Refresca saldo y rol desde la BD en cada petición para que el gating de
      // la UI vea los valores reales y no los del momento del login. Es
      // necesario para `role`: el provider de credenciales no lo devuelve en
      // authorize(), así que sin esto un admin que entre con contraseña no
      // tendría rol y no vería el enlace de /admin.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { credits: true, rays: true, role: true },
        });
        token.credits = dbUser?.credits ?? 0;
        token.rays = dbUser?.rays ?? 0;
        token.role = dbUser?.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.credits = token.credits as number;
        session.user.rays = token.rays as number;
      }
      return session;
    },
  },
};
