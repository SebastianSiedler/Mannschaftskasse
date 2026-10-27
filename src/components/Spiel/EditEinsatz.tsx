import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import type { z } from 'zod';
import { useZodForm } from '@/lib/trpc-forms/utils/use-zod-form';
import {
  einsatzDetailQueryOptions,
  removeEinsatzFn,
  updateEinsatzFn,
  updateEinsatzSchema,
} from '@/server/functions/einsatz';

export { updateEinsatzSchema };

interface Props {
  open: boolean;
  handleClose: () => void;
  spielId: string;
  spielerId: string;
}

const EditEinsatz: React.FC<Props> = (props) => {
  const { handleClose, open, spielId, spielerId } = props;

  const einsatzQuery = useQuery(einsatzDetailQueryOptions(spielId, spielerId));

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
    register,
    handleSubmit: rhfHandleSubmit,
    getValues,
    formState: { errors },
  } = useZodForm({
    validator: updateEinsatzSchema,
    values: einsatzQuery.data,
  });

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

  useEffect(() => {
    einsatzQuery.refetch();
  }, [einsatzQuery.refetch]);

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        {!einsatzQuery.isSuccess ? (
          <>
            <DialogTitle>Edit</DialogTitle>
            <DialogContent className="flex flex-col gap-3 min-w-[260px]">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="text" width={120} height={24} />
              </div>
              <Skeleton variant="rounded" width="100%" height={56} />
              <Skeleton variant="rounded" width="100%" height={56} />
              <Skeleton variant="rounded" width="100%" height={56} />
              <div className="flex items-center gap-2">
                <Skeleton variant="rectangular" width={18} height={18} />
                <Skeleton variant="text" width={80} height={24} />
              </div>
            </DialogContent>
            <DialogActions>
              <Skeleton variant="rounded" width={90} height={36} />
            </DialogActions>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Edit</DialogTitle>

            <DialogContent className="flex flex-col gap-1">
              <div>
                <IconButton
                  onClick={() => {
                    removeEinsatz.mutate({ spielId, spielerId });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <span>Einsatz löschen</span>
              </div>
              <TextField
                {...register('tore', { valueAsNumber: true })}
                label="Tore"
                type="number"
                error={!!errors.tore}
                helperText={errors.tore?.message}
              />
              <br />
              <TextField
                label="Gelbe Karten"
                type="number"
                {...register('gelbeKarte', { valueAsNumber: true })}
                error={!!errors.gelbeKarte}
                helperText={errors.gelbeKarte?.message}
              />
              <br />
              <TextField
                label="Rote Karten"
                type="number"
                {...register('roteKarte', { valueAsNumber: true })}
                error={!!errors.roteKarte}
                helperText={errors.roteKarte?.message}
              />
              <br />

              <div>
                <input type="checkbox" {...register('bezahlt')} />
                <span>Bezahlt?</span>
              </div>
            </DialogContent>
            <DialogActions>
              <Button type="submit">Speichern</Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </div>
  );
};

export default EditEinsatz;
