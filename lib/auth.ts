import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SIGNUP_CREDITS, SIGNUP_RAYS } from "@/lib/constants";

// Cada cuánto se refrescan contra la BD el saldo y el rol que viajan en el token.
const JWT_REFRESH_MS = 30_000;

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
      // El token lleva el saldo y el rol, y se refrescan contra la BD como mucho
      // una vez cada JWT_REFRESH_MS. Antes se refrescaban en CADA petición, lo
      // que costaba una consulta por request en toda la app.
      //
      // El coste de no refrescar siempre: `credits` decide si las páginas de IA
      // muestran el botón habilitado, así que durante esa ventana un usuario sin
      // saldo puede verlo activo y comerse un error del servidor (que sí vuelve
      // a comprobar los créditos antes de gastarlos). El gating de admin no
      // depende de esto: app/admin/layout.tsx consulta el rol en la BD.
      if (token.id) {
        const last = typeof token.refreshedAt === "number" ? token.refreshedAt : 0;
        if (Date.now() - last >= JWT_REFRESH_MS) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { credits: true, rays: true, role: true },
          });
          token.credits = dbUser?.credits ?? 0;
          token.rays = dbUser?.rays ?? 0;
          token.role = dbUser?.role ?? token.role;
          token.refreshedAt = Date.now();
        }
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
