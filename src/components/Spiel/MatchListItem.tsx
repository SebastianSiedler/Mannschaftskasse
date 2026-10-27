import { Link, useLocation } from '@tanstack/react-router';
import type { Result, Spiel } from '@/lib/db';

export const getClubLogoAPI = (ClubId: string) => {
  return `https://app.bfv.de/export.media/-/action/getLogo/format/5/id/${ClubId}/verband/00ES8GNCQK000000VV0AG08LVUPGND5I/strat_code/bfv`;
};

interface NewProps {
  spielId: string;
  clubId: string;
  teamName: string;
  kickOffDate: Date | string | number;
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

  const location = useLocation();
  const isSelected = location.pathname.includes(spielId);
  const parsedDate =
    kickOffDate instanceof Date ? kickOffDate : new Date(kickOffDate);

  return (
    <Link to="/spiele/$spielId" params={{ spielId }} resetScroll={false}>
      <span
        className={`flex justify-between items-center gap-2 transition duration-500 ease rounded-xl px-2 py-2 ${
          isSelected ? 'bg-blue-100' : ''
        }`}
      >
        <div className="">
          <img
            src={getClubLogoAPI(clubId)}
            alt={teamName}
            className="object-contain aspect-square h-10 bg-white rounded-lg"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="font-semibold">{teamName}</span>
          </div>
          <div className="text-slate-500">
            {parsedDate.toLocaleString('de-DE', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            Uhr
          </div>
        </div>
        <div>
          <div className="font-semibold flex justify-end">{result}</div>

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
