import { envsafe, str } from 'envsafe';

export const browserEnv = envsafe({
  BFV_PERMANENT_TEAM_ID: str({
    allowEmpty: false,
    input: process.env.NEXT_PUBLIC_BFV_PERMANENT_TEAM_ID,
  }),
});
