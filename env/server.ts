import { envsafe, invalidEnvError, makeValidator, str } from 'envsafe';
import { browserEnv } from './browser';

if (typeof window !== 'undefined') {
  throw new Error(
    'This should only be included on the server (the env vars wont be exposed to the client)',
  );
}

const googleParser = makeValidator<string>((input) => {
  if (process.env.AUTH_PROVIDER === 'google' && input === '') {
    throw invalidEnvError('google config', input);
  }
  return input;
});

export const serverEnv = {
  ...browserEnv,
  ...envsafe({
    TURSO_DATABASE_URL: str({
      input:
        process.env.TURSO_DATABASE_URL ||
        (process.env.DATABASE_URL?.startsWith('libsql:') ||
        process.env.DATABASE_URL?.startsWith('file:') ||
        process.env.DATABASE_URL?.startsWith('https:')
          ? process.env.DATABASE_URL
          : undefined),
      devDefault: 'file:local.db',
    }),
    TURSO_AUTH_TOKEN: str({
      allowEmpty: true,
      default: '',
    }),
    NEXTAUTH_SECRET: str({
      devDefault: 'xxx',
    }),
    GOOGLE_CLIENT_ID: googleParser({ allowEmpty: true, default: '' }),
    GOOGLE_CLIENT_SECRET: googleParser({ allowEmpty: true, default: '' }),

    AUTH0_CLIENT_ID: googleParser({ allowEmpty: true, default: '' }),
    AUTH0_CLIENT_SECRET: googleParser({ allowEmpty: true, default: '' }),
    AUTH0_ISSUER: googleParser({ allowEmpty: true, default: '' }),
  }),
};
