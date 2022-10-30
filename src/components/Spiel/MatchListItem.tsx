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
  currentGame: boolean;
}

const NewMatchListItem: React.FC<NewProps> = (props) => {
  const {
    clubId,
    teamName,
    kickOffDate,
    result,
    spielId,
    resultStatus,
    currentGame,
  } = props;

  const router = useRouter();

  return (
    <Link
      href={`/spiele/?spielId=${spielId}`}
      as={`/spiele/${spielId}`}
      scroll={false}
    >
      <span
        className={`flex justify-between items-center gap-2 transition duration-500 ease rounded-xl px-2 py-2 ${
          spielId === router.query.spielId && 'bg-blue-100'
        }`}
      >
        <div className="">
          <img
            src={getClubLogoAPI(clubId)}
            className="object-contain aspect-square h-10 bg-white rounded-lg"
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
          <div className="font-semibold	flex justify-end">{result}</div>

          <div className="flex gap-2">
            {currentGame && (
              <div className="px-2 py-1 rounded-full font-semibold text-xs text-amber-200 bg-amber-500">
                Aktuelles Spiel!
              </div>
            )}
            <div
              className={`px-2 py-1 rounded-full font-semibold text-xs ${
                resultStatus === 'GEWONNEN'
                  ? 'text-green-500 bg-green-200'
                  : resultStatus === 'VERLOREN'
                  ? 'text-red-500 bg-red-200'
                  : 'text-gray-500 bg-gray-200'
              }`}
            >
              {resultStatus.toLowerCase().replaceAll('_', ' ')}
            </div>
          </div>
        </div>
      </span>
    </Link>
  );
};

export default NewMatchListItem;
