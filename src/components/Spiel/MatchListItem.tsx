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

const NewMatchListItem: React.FC<NewProps> = (props) => {
  const { clubId, teamName, kickOffDate, result, spielId, resultStatus } =
    props;

  const router = useRouter();

  return (
    <Link
      href={`/spiele/?spielId=${spielId}`}
      as={`/spiele/${spielId}`}
      scroll={false}
    >
      <a
        className={`flex justify-between mx-4 my-2 items-center gap-2 ${
          spielId === router.query.spielId && 'bg-green-200'
        }`}
      >
        <div className="">
          <img
            src={getClubLogoAPI(clubId)}
            className="object-contain aspect-square h-10"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="font-semibold">{teamName}</span>
          </div>
          <div className="text-slate-500">
            {kickOffDate.toLocaleDateString('de', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
        <div>
          <div>{result}</div>
          <div>{resultStatus.toLowerCase()}</div>
        </div>
      </a>
    </Link>
  );
};

export default NewMatchListItem;
