// import NextAuth from "next-auth"
 
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [],
// })

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
import { compare } from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"; 
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";


async function getUserFromDb(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user || !user.password) {
    return null;
  }

  const isValidPassword = await compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  return user;
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  // debug: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await getUserFromDb(
          credentials.email as string,
          credentials.password as string
        )

        // Return null if invalid credentials (NextAuth will show CredentialsSignin error)
        if (!user) {
          return null
        }

        return user
      },
    }),
  ],
})