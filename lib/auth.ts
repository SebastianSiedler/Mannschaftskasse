import { Auth, type AuthConfig } from '@auth/core';
import Auth0 from '@auth/core/providers/auth0';
import { getCookie } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { serverEnv } from '@/env/server';
import { db, type Role, sessions } from '@/lib/db';
import {
  DrizzleAdapter,
  type ExtendedAdapterUser,
} from '@/lib/db/auth-adapter';

export interface AppSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: Role;
  };
  expires: string;
}

export const authConfig: AuthConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    Auth0({
      clientId: serverEnv.AUTH0_CLIENT_ID,
      clientSecret: serverEnv.AUTH0_CLIENT_SECRET,
      issuer: serverEnv.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const extUser = user as ExtendedAdapterUser;
      return {
        ...session,
        user: {
          ...session.user,
          id: extUser.id,
          role: extUser.role ?? 'USER',
        },
      };
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  secret: serverEnv.NEXTAUTH_SECRET,
  trustHost: true,
  basePath: '/api/auth',
};

export async function handleAuthRequest(request: Request): Promise<Response> {
  return await Auth(request, authConfig);
}

const SESSION_COOKIE_NAMES = [
  '__Secure-authjs.session-token',
  'authjs.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
];

export async function getServerAuthSession(): Promise<AppSession | null> {
  let sessionToken: string | undefined;
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const val = getCookie(cookieName);
    if (val) {
      sessionToken = val;
      break;
    }
  }

  if (!sessionToken) {
    return null;
  }

  const sessionRecord = await db.query.sessions.findFirst({
    where: eq(sessions.sessionToken, sessionToken),
    with: {
      user: true,
    },
  });

  if (!sessionRecord?.user) {
    return null;
  }

  if (sessionRecord.expires.getTime() < Date.now()) {
    return null;
  }

  return {
    user: {
      id: sessionRecord.user.id,
      name: sessionRecord.user.name,
      email: sessionRecord.user.email,
      image: sessionRecord.user.image,
      role: sessionRecord.user.role,
    },
    expires: sessionRecord.expires.toISOString(),
  };
}

export async function requireAuth(): Promise<AppSession> {
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireAdmin(): Promise<AppSession> {
  const session = await requireAuth();
  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin Role required!');
  }
  return session;
}
