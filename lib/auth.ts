import { serverEnv } from '@/env/server';
import { db, type Role } from '@/lib/db';
import { DrizzleAdapter } from '@/lib/db/auth-adapter';
import type { NextAuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    //   GoogleProvider({
    //     clientId: serverEnv.GOOGLE_CLIENT_ID,
    //     clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    //   }),
    Auth0Provider({
      clientId: serverEnv.AUTH0_CLIENT_ID,
      clientSecret: serverEnv.AUTH0_CLIENT_SECRET,
      issuer: serverEnv.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
      };
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  secret: serverEnv.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}
