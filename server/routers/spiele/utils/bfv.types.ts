interface BfvTeam {
  permanentId: string;
  name: string;
  typeName: string;
  seasonId: string;
  clubId: string;
  clubName: string;
  compoundId: string;
  competitionName: string;
  competitionBreadcrumb: string;
}

export interface BfvMatch {
  matchId: string;
  compoundId: string;
  competitionName: string;
  competitionType: string;
  teamType: string;
  kickoffDate: string;
  kickoffTime: string;
  homeTeamName: string;
  homeTeamPermanentId: string;
  homeClubId: string;
  homeLogoPrivate: boolean;
  guestTeamName: string;
  guestTeamPermanentId: string;
  guestClubId: string;
  guestLogoPrivate: boolean;
  result: string;
  tickerMatchId: string | null;
  prePublished: boolean;
}

export interface BfvLeague {
  state: number;
  message: string | null;
  data: {
    team: BfvTeam;
    matches: BfvMatch[];
    actualMatchId: string;
    actualTickeredMatchId: string;
  };
}
