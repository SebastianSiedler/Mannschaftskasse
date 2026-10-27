import { and, eq } from 'drizzle-orm';
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from 'next-auth/adapters';
import type { Database } from './index';
import { accounts, sessions, users, verificationTokens } from './schema';

export function DrizzleAdapter(db: Database): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, 'id'>) {
      const [user] = await db
        .insert(users)
        .values({
          name: data.name ?? null,
          email: data.email,
          emailVerified: data.emailVerified ?? null,
          image: data.image ?? null,
          role: data.role ?? 'USER',
        })
        .returning();

      return user as AdapterUser;
    },

    async getUser(id) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return (user as AdapterUser | undefined) ?? null;
    },

    async getUserByEmail(email) {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      return (user as AdapterUser | undefined) ?? null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.providerAccountId, providerAccountId),
          eq(accounts.provider, provider),
        ),
        with: {
          user: true,
        },
      });
      return (account?.user as AdapterUser | undefined) ?? null;
    },

    async updateUser({ id, ...data }) {
      if (!id) {
        throw new Error('User id is required to update user');
      }
      const [user] = await db
        .update(users)
        .set({
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.emailVerified !== undefined
            ? { emailVerified: data.emailVerified }
            : {}),
          ...(data.image !== undefined ? { image: data.image } : {}),
          ...(data.role !== undefined ? { role: data.role } : {}),
        })
        .where(eq(users.id, id))
        .returning();

      return user as AdapterUser;
    },

    async deleteUser(userId) {
      await db.delete(users).where(eq(users.id, userId));
    },

    async linkAccount(account: AdapterAccount) {
      await db.insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        refresh_token_expires_in:
          typeof account.refresh_token_expires_in === 'number'
            ? account.refresh_token_expires_in
            : null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
        oauth_token_secret:
          typeof account.oauth_token_secret === 'string'
            ? account.oauth_token_secret
            : null,
        oauth_token:
          typeof account.oauth_token === 'string' ? account.oauth_token : null,
      });
    },

    async unlinkAccount({
      providerAccountId,
      provider,
    }: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider),
          ),
        );
    },

    async createSession(data) {
      const [session] = await db
        .insert(sessions)
        .values({
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
        })
        .returning();

      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const sessionWithUser = await db.query.sessions.findFirst({
        where: eq(sessions.sessionToken, sessionToken),
        with: {
          user: true,
        },
      });

      if (!sessionWithUser || !sessionWithUser.user) {
        return null;
      }

      const { user, ...session } = sessionWithUser;
      return {
        session: session as AdapterSession,
        user: user as AdapterUser,
      };
    },

    async updateSession({ sessionToken, ...data }) {
      const [session] = await db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, sessionToken))
        .returning();

      return (session as AdapterSession | undefined) ?? null;
    },

    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(data) {
      const [token] = await db
        .insert(verificationTokens)
        .values(data)
        .returning();
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      const [deleted] = await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token),
          ),
        )
        .returning();

      return deleted ?? null;
    },
  };
}
