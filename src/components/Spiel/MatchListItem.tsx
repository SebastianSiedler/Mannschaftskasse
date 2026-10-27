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
        <div className="flex flex-col items-end shrink-0 gap-1">
          {resultStatus === 'GEWONNEN' && (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg font-bold text-xs tabular-nums tracking-wide text-emerald-800 bg-emerald-100 border border-emerald-300">
              {result?.replace(':', ' : ') ?? 'Sieg'}
            </div>
          )}
          {resultStatus === 'VERLOREN' && (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg font-bold text-xs tabular-nums tracking-wide text-rose-800 bg-rose-100 border border-rose-300">
              {result?.replace(':', ' : ') ?? 'Niederlage'}
            </div>
          )}
          {resultStatus === 'UNENTSCHIEDEN' && (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg font-bold text-xs tabular-nums tracking-wide text-slate-700 bg-slate-100 border border-slate-300">
              {result?.replace(':', ' : ') ?? 'Unentschieden'}
            </div>
          )}
          {resultStatus === 'AUSSTEHEND' && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-lg font-medium text-xs tabular-nums text-slate-400 bg-slate-100/80 border border-slate-200">
              - : -
            </div>
          )}
          {resultStatus === 'NICHT_ANGETRETEN' && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-lg font-semibold text-xs text-amber-800 bg-amber-100 border border-amber-300">
              n. an.
            </div>
          )}
          {resultStatus === 'NICHT_ANGETRETEN_GEGNER' && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-lg font-semibold text-xs text-amber-800 bg-amber-100 border border-amber-300">
              Gegner n.an.
            </div>
          )}

          {(currentGame ||
            (hasGoalMismatch && typeof bfvOwnGoals === 'number')) && (
            <div className="flex flex-wrap items-center justify-end gap-1 mt-0.5">
              {currentGame && (
                <div className="px-2 py-0.5 rounded-full font-bold text-[11px] text-white bg-amber-500 flex items-center gap-1 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  <span>Aktuelles Spiel</span>
                </div>
              )}
              {hasGoalMismatch && typeof bfvOwnGoals === 'number' && (
                <div
                  className="px-2 py-0.5 rounded-full font-semibold text-[11px] text-amber-900 bg-amber-100 border border-amber-300 flex items-center gap-1 shrink-0"
                  title={`Tor-Differenz: ${recordedGoals ?? 0} erfasst vs. ${bfvOwnGoals} laut BFV`}
                >
                  <span>⚠️</span>
                  <span>
                    {recordedGoals ?? 0}/{bfvOwnGoals} Tore
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </span>
    </Link>
  );
};

export default NewMatchListItem;
