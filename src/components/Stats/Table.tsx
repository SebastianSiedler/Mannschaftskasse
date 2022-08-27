import toast from 'react-hot-toast';
import { AppRouter } from '@/server/routers/_app';
import Button from '@mui/material/Button';
import { trpc } from '@/lib/trpc';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { inferProcedureOutput } from '@trpc/server';
import { useState } from 'react';

type Data = inferProcedureOutput<
  AppRouter['stats']['list']
>[number]['saison_stats'][number];

const columnHelper = createColumnHelper<Data>();

interface Props {
  data: Data[];
  saisonName: string;
}

const StatsTable: React.FC<Props> = ({ data, saisonName }) => {
  const columns = [
    columnHelper.accessor('name', {
      header: () => <span>Name</span>,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('anz_spiele', {
      header: () => <span>Spiele</span>,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('tore', {
      header: () => <span>Tore</span>,
      cell: (info) => info.getValue() || '',
    }),

    columnHelper.accessor('schulden', {
      header: () => <span>Schulden</span>,
      cell: (info) => {
        const { schulden, name, playerId } = info.row.original;

        return (
          <span>
            {schulden > 0 && (
              <Button
                onClick={() => {
                  if (
                    window.confirm(`Schulden von ${name} wirklich begleichen?`)
                  ) {
                    schuldenBegleichen.mutate({
                      spielerId: playerId,
                    });
                  }
                }}
              >
                {`${schulden}€ begleichen?`}
              </Button>
            )}
          </span>
        );
      },
    }),
  ];

  const utils = trpc.proxy.useContext();

  const schuldenBegleichen = trpc.proxy.stats.clearDebts.useMutation({
    onSuccess: async () => {
      await utils.stats.list.invalidate();
      toast.success('Schulden beglichen');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'schulden', desc: true },
    { id: 'anz_spiele', desc: true },
    { id: 'tore', desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <table className="relative w-full border">
      <thead className="sticky top-0 bg-slate-300">
        <tr>
          <td>{`Saison: ${saisonName}`}</td>
        </tr>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : '',
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row, i) => (
          <tr
            key={row.id}
            className={(i % 2 == 0 ? 'bg-gray-100' : '') + ' min-h-[300px]'}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="text-center">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatsTable;
