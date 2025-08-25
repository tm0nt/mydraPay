import NextAuth, { type NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import prisma from "@/lib/prisma"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(32),
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const authOptions: NextAuthOptions = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = (token as any).id
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = await signInSchema.safeParseAsync(credentials)
        if (!parsed.success) {
          await sleep(300)
          return null
        }
        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) {
          await sleep(300)
          return null
        }

        const { verifyPassword } = await import("@/utils/hash")
        const isValid = await verifyPassword(user.passwordHash, password)
        if (!isValid) {
          await sleep(300)
          return null
        }

        return { id: user.id, name: user.name ?? undefined, email: user.email }
      },
    }),
  ],
}

export const auth = () => getServerSession(authOptions)

// Se precisar forçar Node.js runtime (evitar edge):
export const runtime = "nodejs"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
