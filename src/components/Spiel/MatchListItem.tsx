import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const getClubLogoAPI = (ClubId: string) => {
  return `https://widget-prod.bfv.de/export.media?action=getLogo&format=0&id=${ClubId}`;
};

import { Result, Spiel } from '@prisma/client';
interface NewProps {
  spielId: string;
  clubId: string;
  teamName: string;
  kickOffDate: Date;
  result: Spiel['result'];
  resultStatus: Result;
}
import ListItemAvatar from '@mui/material/ListItemAvatar';

const NewMatchListItem: React.FC<NewProps> = (props) => {
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
                  {result} {resultStatus}
                </span>
              </div>
            </div>
          </ListItemText>
        </ListItemButton>
      </Link>
    </ListItem>
  );
};

export default NewMatchListItem;
