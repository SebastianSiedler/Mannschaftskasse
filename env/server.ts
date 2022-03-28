import { envsafe, invalidEnvError, makeValidator, str, url } from 'envsafe';
import { browserEnv } from './browser';

if (process.browser) {
  throw new Error(
    'This should only be included on the client (but the env vars wont be exposed)',
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
    DATABASE_URL: str(),
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
