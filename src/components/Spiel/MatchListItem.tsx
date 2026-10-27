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
  hasGoalMismatch?: boolean;
  recordedGoals?: number;
  bfvOwnGoals?: number | null;
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
    hasGoalMismatch,
    recordedGoals,
    bfvOwnGoals,
  } = props;

  const location = useLocation();
  const isSelected = location.pathname.includes(spielId);
  const parsedDate =
    kickOffDate instanceof Date ? kickOffDate : new Date(kickOffDate);

  return (
    <Link to="/spiele/$spielId" params={{ spielId }} resetScroll={false}>
      <span
        className={`flex justify-between items-center gap-2.5 transition duration-300 ease rounded-xl px-3 py-2.5 ${
          isSelected
            ? 'bg-blue-100 ring-2 ring-blue-500'
            : currentGame
              ? 'bg-amber-50/80 border-2 border-amber-400 shadow-sm ring-1 ring-amber-400/40'
              : 'hover:bg-slate-50 border border-transparent'
        }`}
      >
        <div className="">
          <img
            src={getClubLogoAPI(clubId)}
            alt={teamName}
            className="object-contain aspect-square h-10 bg-white rounded-lg shadow-xs"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            <span
              className={`font-semibold ${
                currentGame ? 'text-slate-900 font-bold' : 'text-slate-800'
              }`}
            >
              {teamName}
            </span>
          </div>
          <div className="text-slate-500 text-xs mt-0.5">
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
          <div className="font-semibold flex justify-end tabular-nums">
            {result}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 mt-1">
            {currentGame && (
              <div className="px-2.5 py-0.5 rounded-full font-bold text-xs text-white bg-amber-500 flex items-center gap-1.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span>Aktuelles Spiel</span>
              </div>
            )}
            {hasGoalMismatch && typeof bfvOwnGoals === 'number' && (
              <div
                className="px-2 py-0.5 rounded-full font-semibold text-xs text-amber-900 bg-amber-100 border border-amber-300 flex items-center gap-1 shrink-0"
                title={`Tor-Differenz: ${recordedGoals ?? 0} erfasst vs. ${bfvOwnGoals} laut BFV`}
              >
                <span>⚠️</span>
                <span>
                  {recordedGoals ?? 0}/{bfvOwnGoals} Tore
                </span>
              </div>
            )}
            <div
              className={`px-2 py-0.5 rounded-full font-semibold text-xs ${
                resultStatus === 'GEWONNEN'
                  ? 'text-green-600 bg-green-100'
                  : resultStatus === 'VERLOREN'
                    ? 'text-red-600 bg-red-100'
                    : 'text-gray-600 bg-gray-100'
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
