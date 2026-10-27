import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { z } from 'zod';
import { useZodForm } from '@/lib/trpc-forms/utils/use-zod-form';
import {
  einsatzDetailQueryOptions,
  type getEinsatzDetailFn,
  removeEinsatzFn,
  updateEinsatzFn,
  updateEinsatzSchema,
} from '@/server/functions/einsatz';
import { BfvCardRedIcon, BfvCardYellowIcon, BfvGoalIcon } from './BfvIcons';

export { updateEinsatzSchema };

interface Props {
  open: boolean;
  handleClose: () => void;
  spielId: string;
  spielerId: string;
}

interface StatStepperRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (next: number) => void;
}

const StatStepperRow: React.FC<StatStepperRowProps> = ({
  icon,
  label,
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
      <div className="flex items-center gap-2.5 text-slate-800">
        <span className="flex items-center justify-center w-6 h-6">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          size="small"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            width: 32,
            height: 32,
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <span className="w-7 text-center font-semibold text-base tabular-nums text-slate-900">
          {value}
        </span>

        <IconButton
          size="small"
          onClick={() => onChange(value + 1)}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            width: 32,
            height: 32,
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
};

interface EditEinsatzFormProps {
  data: Awaited<ReturnType<typeof getEinsatzDetailFn>>;
  spielId: string;
  spielerId: string;
  handleClose: () => void;
}

const EditEinsatzForm: React.FC<EditEinsatzFormProps> = ({
  data,
  spielId,
  spielerId,
  handleClose,
}) => {
  const updateMutation = useMutation({
    mutationFn: (input: z.infer<typeof updateEinsatzSchema>) =>
      updateEinsatzFn({ data: input }),
    onSuccess: () => {
      handleClose();
      toast.success('Erfolgreich gespeichert');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const {
    handleSubmit: rhfHandleSubmit,
    getValues,
    watch,
    setValue,
  } = useZodForm({
    validator: updateEinsatzSchema,
    defaultValues: data,
    values: data,
  });

  const tore = watch('tore') ?? data.tore ?? 0;
  const gelbeKarte = watch('gelbeKarte') ?? data.gelbeKarte ?? 0;
  const roteKarte = watch('roteKarte') ?? data.roteKarte ?? 0;
  const bezahlt = watch('bezahlt') ?? data.bezahlt ?? false;

  const handleSubmit = rhfHandleSubmit(() => {
    updateMutation.mutate(getValues());
  });

  const removeEinsatz = useMutation({
    mutationFn: (input: { spielId: string; spielerId: string }) =>
      removeEinsatzFn({ data: input }),
    onSuccess: () => {
      handleClose();
      toast.success('Erfolgreich gelöscht');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const playerName = data.spieler?.names?.[0] ?? 'Spieler';

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle className="flex items-center justify-between pb-1">
        <div className="min-w-0">
          <div className="text-lg font-bold text-slate-900 truncate">
            {playerName}
          </div>
          <div className="text-xs font-normal text-slate-500">
            Einsatz bearbeiten
          </div>
        </div>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Schließen"
          className="text-slate-400"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="flex flex-col gap-3 pt-3">
        <button
          type="button"
          onClick={() => setValue('bezahlt', !bezahlt, { shouldDirty: true })}
          className={`flex items-center justify-between w-full rounded-xl border px-3.5 py-3 text-left transition ${
            bezahlt
              ? 'border-green-200 bg-green-50/80 text-green-900'
              : 'border-red-200 bg-red-50/70 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bezahlt ? (
              <CheckCircleOutline color="success" />
            ) : (
              <HighlightOffOutlined color="error" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {bezahlt ? 'Bezahlt' : 'Noch offen'}
              </div>
              <div className="text-xs opacity-75">
                {bezahlt ? 'Spielgebühr beglichen' : 'Spielgebühr ausstehend'}
              </div>
            </div>
          </div>
          <Switch
            checked={bezahlt}
            color="success"
            onChange={(e) =>
              setValue('bezahlt', e.target.checked, { shouldDirty: true })
            }
            onClick={(e) => e.stopPropagation()}
          />
        </button>

        <StatStepperRow
          icon={<BfvGoalIcon />}
          label="Tore"
          value={tore}
          onChange={(next) => setValue('tore', next, { shouldDirty: true })}
        />

        <StatStepperRow
          icon={<BfvCardYellowIcon />}
          label="Gelbe Karten"
          value={gelbeKarte}
          onChange={(next) =>
            setValue('gelbeKarte', next, { shouldDirty: true })
          }
        />

        <StatStepperRow
          icon={<BfvCardRedIcon />}
          label="Rote Karten"
          value={roteKarte}
          onChange={(next) =>
            setValue('roteKarte', next, { shouldDirty: true })
          }
        />
      </DialogContent>

      <DialogActions
        sx={{ justifyContent: 'space-between', px: 3, pb: 2.5, pt: 1 }}
      >
        <Button
          type="button"
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          disabled={removeEinsatz.isPending}
          onClick={() => {
            removeEinsatz.mutate({ spielId, spielerId });
          }}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Löschen
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={updateMutation.isPending}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Speichern
        </Button>
      </DialogActions>
    </form>
  );
};

const EditEinsatz: React.FC<Props> = (props) => {
  const { handleClose, open, spielId, spielerId } = props;

  const einsatzQuery = useQuery({
    ...einsatzDetailQueryOptions(spielId, spielerId),
    refetchOnMount: 'always',
  });

  const showSkeleton =
    !einsatzQuery.isSuccess || einsatzQuery.isFetching || !einsatzQuery.data;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: 3 },
        },
      }}
    >
      {showSkeleton ? (
        <>
          <DialogTitle className="flex items-center justify-between pb-2">
            <Skeleton variant="text" width={150} height={28} />
            <Skeleton variant="circular" width={32} height={32} />
          </DialogTitle>
          <DialogContent className="flex flex-col gap-3 pt-2">
            <Skeleton variant="rounded" width="100%" height={60} />
            <Skeleton variant="rounded" width="100%" height={52} />
            <Skeleton variant="rounded" width="100%" height={52} />
            <Skeleton variant="rounded" width="100%" height={52} />
          </DialogContent>
          <DialogActions className="justify-between px-6 pb-4">
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={110} height={36} />
          </DialogActions>
        </>
      ) : (
        <EditEinsatzForm
          data={einsatzQuery.data}
          spielId={spielId}
          spielerId={spielerId}
          handleClose={handleClose}
        />
      )}
    </Dialog>
  );
};

export default EditEinsatz;
