import { envsafe, str } from 'envsafe';

const rawTeamId =
  (typeof process !== 'undefined'
    ? process.env.VITE_BFV_PERMANENT_TEAM_ID ||
      process.env.NEXT_PUBLIC_BFV_PERMANENT_TEAM_ID
    : undefined) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env.VITE_BFV_PERMANENT_TEAM_ID ||
      (import.meta as any).env.NEXT_PUBLIC_BFV_PERMANENT_TEAM_ID
    : undefined);

export const browserEnv = envsafe({
  BFV_PERMANENT_TEAM_ID: str({
    allowEmpty: false,
    input: rawTeamId,
    devDefault: '027B821L9S000000VS5489B2VVB7EFSC',
  }),
});
