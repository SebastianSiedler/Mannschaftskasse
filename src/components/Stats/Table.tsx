import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import Close from '@mui/icons-material/Close';
import Download from '@mui/icons-material/Download';
import North from '@mui/icons-material/North';
import PaidOutlined from '@mui/icons-material/PaidOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import South from '@mui/icons-material/South';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  createSortedRowModel,
  flexRender,
  rowSortingFeature,
  type SortingState,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { clearDebtsFn, type StatsListOutput } from '@/server/functions/stats';
import { fontArial } from './Arial-normal';

type Data = StatsListOutput[number]['saison_stats'][number];

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

const columnHelper = createColumnHelper<typeof features, Data>();

interface Props {
  data: Data[];
  saisonName: string;
}

interface SettleModalState {
  playerId: string;
  name: string;
  schulden: number;
  unpaidGames: Array<{ opponent: string }>;
}

const formatSaisonName = (raw: string) => {
  if (/^\d{4}$/.test(raw)) {
    return `Saison 20${raw.slice(0, 2)}/${raw.slice(2)}`;
  }
  return `Saison ${raw}`;
};

const StatsTable: React.FC<Props> = ({ data, saisonName }) => {
  const queryClient = useQueryClient();
  const [selectedPlayerForSettle, setSelectedPlayerForSettle] =
    useState<SettleModalState | null>(null);

  const schuldenBegleichen = useMutation({
    mutationFn: (input: { spielerId: string }) => clearDebtsFn({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stats', 'list'] });
      toast.success('Schulden beglichen');
      setSelectedPlayerForSettle(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const totalDebts = useMemo(
    () => data.reduce((sum, item) => sum + item.schulden, 0),
    [data],
  );
  const totalGoals = useMemo(
    () => data.reduce((sum, item) => sum + item.tore, 0),
    [data],
  );
  const totalPlayers = data.length;

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('name', {
          header: () => <span>Spieler</span>,
          cell: (info) => {
            const name = info.getValue() ?? 'Unbekannt';
            return (
              <div
                className="font-semibold text-slate-900 truncate"
                title={name}
              >
                {name}
              </div>
            );
          },
        }),
        columnHelper.accessor('anz_spiele', {
          header: () => <span>Spiele</span>,
          cell: (info) => (
            <span className="font-medium text-slate-700 tabular-nums">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor('tore', {
          header: () => <span>Tore</span>,
          cell: (info) => {
            const tore = info.getValue() ?? 0;
            return (
              <span
                className={`font-semibold tabular-nums ${
                  tore > 0 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {tore}
              </span>
            );
          },
        }),
        columnHelper.accessor('schulden', {
          header: () => <span>Schulden</span>,
          cell: (info) => {
            const { schulden, name, playerId, spielereinsaetze } =
              info.row.original;

            if (schulden === 0) {
              return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                  <CheckCircleOutlined sx={{ fontSize: 13 }} />
                  <span>0 €</span>
                </span>
              );
            }

            return (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  setSelectedPlayerForSettle({
                    playerId,
                    name,
                    schulden,
                    unpaidGames: spielereinsaetze
                      .filter((x) => !x.bezahlt)
                      .map((x) => ({
                        opponent: x.Spiel.opponent.name,
                      })),
                  });
                }}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 0.25,
                  px: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  bgcolor: 'error.50',
                  borderColor: 'error.light',
                  '&:hover': {
                    bgcolor: 'error.100',
                    borderColor: 'error.main',
                  },
                }}
              >
                <span>{schulden} €</span>
                <span className="hidden sm:inline">&nbsp;begleichen</span>
              </Button>
            );
          },
        }),
      ]),
    [],
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'schulden', desc: true },
    { id: 'anz_spiele', desc: true },
    { id: 'tore', desc: true },
  ]);

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const TABLE_NAME = `saison-table-${saisonName}`;

  const exportPDF = () => {
    const doc = new jsPDF('portrait', 'pt', 'A4');

    doc.addFileToVFS('Arial-normal.ttf', fontArial);
    doc.addFont('Arial-normal.ttf', 'Arial', 'normal');
    doc.setFont('Arial');

    autoTable(doc, {
      head: [['Spieler', 'Spiele', 'Tore', 'Schulden']],
      body: data.map((row) => [
        row.name,
        row.anz_spiele.toString(),
        (row.tore || 0).toString(),
        `${row.schulden} €`,
      ]),
      styles: {
        font: 'Arial',
      },
      headStyles: {
        fillColor: [30, 41, 59],
      },
    });

    doc.save(`${TABLE_NAME}.pdf`);
  };

  return (
    <div className="mb-8">
      {/* Season Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs mb-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {formatSaisonName(saisonName)}
            </h2>
            <p className="text-xs text-slate-500">
              Statistiken & Mannschaftskasse
            </p>
          </div>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<Download fontSize="small" />}
            onClick={exportPDF}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: 'divider',
              fontSize: '0.8125rem',
            }}
          >
            PDF Export
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-3">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-800 mb-0.5">
              <PaidOutlined sx={{ fontSize: 16 }} />
              <span className="text-xs font-medium">Offen</span>
            </div>
            <div className="text-base font-bold text-amber-950 tabular-nums">
              {totalDebts} €
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-800 mb-0.5">
              <SportsSoccer sx={{ fontSize: 16 }} />
              <span className="text-xs font-medium">Tore</span>
            </div>
            <div className="text-base font-bold text-emerald-950 tabular-nums">
              {totalGoals}
            </div>
          </div>

          <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-800 mb-0.5">
              <PeopleOutlined sx={{ fontSize: 16 }} />
              <span className="text-xs font-medium">Spieler</span>
            </div>
            <div className="text-base font-bold text-blue-950 tabular-nums">
              {totalPlayers}
            </div>
          </div>
        </div>
      </div>

      {/* Styled Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table
          className="w-full table-fixed text-left border-collapse"
          id={TABLE_NAME}
        >
          <colgroup>
            <col className="w-auto" />
            <col className="w-14 sm:w-16" />
            <col className="w-14 sm:w-16" />
            <col className="w-20 sm:w-32" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-200 bg-slate-50/80"
              >
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const isNumeric = header.id !== 'name';
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`py-2.5 px-2.5 sm:px-3 text-xs font-semibold text-slate-600 select-none ${
                        isNumeric ? 'text-right' : 'text-left'
                      } ${
                        header.column.getCanSort()
                          ? 'cursor-pointer hover:bg-slate-100/70 transition'
                          : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          isNumeric ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {isSorted === 'asc' && (
                          <North
                            sx={{ fontSize: 13 }}
                            className="text-blue-600 shrink-0"
                          />
                        )}
                        {isSorted === 'desc' && (
                          <South
                            sx={{ fontSize: 13 }}
                            className="text-blue-600 shrink-0"
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 transition even:bg-slate-50/30"
              >
                {row.getAllCells().map((cell) => {
                  const isNumeric = cell.column.id !== 'name';
                  return (
                    <td
                      key={cell.id}
                      className={`py-2.5 px-2.5 sm:px-3 text-sm ${
                        isNumeric ? 'text-right' : 'text-left min-w-0'
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settle Debt Dialog */}
      <Dialog
        open={Boolean(selectedPlayerForSettle)}
        onClose={() => setSelectedPlayerForSettle(null)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 0.5 },
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between pb-1">
          <div className="min-w-0">
            <div className="text-base font-bold text-slate-900">
              Schulden begleichen
            </div>
            <div className="text-xs text-slate-500">
              {selectedPlayerForSettle?.name}
            </div>
          </div>
          <IconButton
            size="small"
            onClick={() => setSelectedPlayerForSettle(null)}
            aria-label="Schließen"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="pt-2">
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Möchtest du die ausstehenden Beiträge für folgende Spiele als
            beglichen markieren?
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {selectedPlayerForSettle?.unpaidGames.map((game, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs text-slate-700 bg-white rounded-lg p-2 border border-slate-100 shadow-2xs"
              >
                <span className="font-medium truncate mr-2">
                  {game.opponent}
                </span>
                <span className="shrink-0 font-bold text-red-600">5 €</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 px-1 text-sm font-semibold text-slate-900">
            <span>Gesamtbetrag:</span>
            <span className="text-base font-bold text-emerald-700">
              {selectedPlayerForSettle?.schulden} €
            </span>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            color="inherit"
            onClick={() => setSelectedPlayerForSettle(null)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={schuldenBegleichen.isPending}
            onClick={() => {
              if (selectedPlayerForSettle) {
                schuldenBegleichen.mutate({
                  spielerId: selectedPlayerForSettle.playerId,
                });
              }
            }}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2.5 }}
          >
            {schuldenBegleichen.isPending
              ? 'Wird beglichen...'
              : 'Als bezahlt markieren'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StatsTable;
