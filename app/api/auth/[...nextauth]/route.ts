import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// @ts-ignore
import { authenticateUser } from '@/lib/googleSheets';

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // @ts-ignore
        const user = await authenticateUser(credentials.email, credentials.password);
        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.name = user.name;
        token.campus = (user as any).campus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).campus = token.campus;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
