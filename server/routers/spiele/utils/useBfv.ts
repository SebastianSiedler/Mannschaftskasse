import axios from 'axios';
import { BfvLeague } from './bfv.types';

/**
 * Get aktuelle Saison alle Spiele vom BFV
 */
export const getBfvData = async (permanentTeamId: string) => {
  const { data } = await axios.get<BfvLeague>(
    `https://widget-prod.bfv.de/api/service/widget/v1/team/${permanentTeamId}/matches`,
  );

  /* Spielfreie Spieltage herausfiltern */
  data.data.matches = data.data.matches.filter(
    (match) =>
      !(
        match.guestClubId == null ||
        match.homeClubId === null ||
        match.guestTeamName === 'SPIELFREI'
      ),
  );

  return data.data;
};

export const getBfvClubInfo = async (teamPermanentId: string) => {
  interface BfvClubinfo {
    data?: {
      club: {
        id: string;
        name: string;
        logoUrl: string;
      };
    };
  }
  const { data } = await axios.get<BfvClubinfo>(
    `https://widget-prod.bfv.de/api/service/widget/v1/club/info?teamPermanentId=${teamPermanentId}`,
  );

  return data;
};
