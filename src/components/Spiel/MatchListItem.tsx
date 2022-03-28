import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RESULT_SCORE } from '@/src/pages/spiele';

interface Props {
  spielId: string;
  homeClubId: string;
  homeTeamName: string;
  guestClubId: string;
  guestTeamName: string;
  kickOffDate: Date;
  result: string;
}

const MatchListItem: React.FC<Props> = (props) => {
  const {
    homeClubId,
    homeTeamName,
    guestClubId,
    guestTeamName,
    kickOffDate,
    result,
    spielId,
  } = props;

  const router = useRouter();

  return (
    <ListItem>
      <Link
        href={`/spiele/?spielId=${spielId}`}
        as={`/spiele/${spielId}`}
        scroll={false}
      >
        <ListItemButton selected={spielId === router.query.spielId}>
          <ListItemText>
            <div style={{ display: 'flex' }}>
              <img
                src={getClubLogoAPI(homeClubId)}
                style={{ height: '17px', marginRight: '5px' }}
              />
              <span>{homeTeamName}</span>
            </div>

            <div style={{ display: 'flex' }}>
              <img
                src={getClubLogoAPI(guestClubId)}
                style={{ height: '17px', marginRight: '5px' }}
              />
              <span>{guestTeamName}</span>
            </div>
          </ListItemText>
          <ListItemText style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div>
              {kickOffDate.toLocaleDateString('de', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div>{result}</div>
          </ListItemText>
        </ListItemButton>
      </Link>
    </ListItem>
  );
};

export default MatchListItem;

export const getClubLogoAPI = (ClubId: string) => {
  return `https://widget-prod.bfv.de/export.media?action=getLogo&format=0&id=${ClubId}`;
};

interface NewProps {
  spielId: string;
  clubId: string;
  teamName: string;
  kickOffDate: Date;
  result: string;
  resultStatus: RESULT_SCORE;
}
import ListItemAvatar from '@mui/material/ListItemAvatar';

export const NewMatchListItem: React.FC<NewProps> = (props) => {
  const { clubId, teamName, kickOffDate, result, spielId, resultStatus } =
    props;

  const router = useRouter();

  return (
    <ListItem>
      <Link
        href={`/spiele/?spielId=${spielId}`}
        as={`/spiele/${spielId}`}
        scroll={false}
      >
        <ListItemButton selected={spielId === router.query.spielId}>
          <ListItemAvatar>
            <img
              src={getClubLogoAPI(clubId)}
              style={{
                height: '40px',
                aspectRatio: '1/1',
                objectFit: 'contain',
              }}
            />
          </ListItemAvatar>
          <ListItemText>
            <span>{teamName}</span>
          </ListItemText>

          <ListItemText style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div>
                {kickOffDate.toLocaleDateString('de', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div>
                <span
                  style={{
                    fontWeight: 'medium',
                    color:
                      resultStatus === 'GEWONNEN'
                        ? 'green'
                        : resultStatus === 'VERLOREN'
                        ? 'red'
                        : '',
                  }}
                >
                  {result}
                </span>
              </div>
            </div>
          </ListItemText>
        </ListItemButton>
      </Link>
    </ListItem>
  );
};
