import { trpc } from '@/lib/trpc';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useTRPCForm } from '@/lib/trpc-forms';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export const updateEinsatzSchema = z.object({
  spielId: z.string(),
  spielerId: z.string(),
  tore: z.number().min(0).optional(),
  gelbeKarte: z.number().min(0).optional(),
  roteKarte: z.number().min(0).optional(),
  bezahlt: z.boolean().optional(),
});

interface Props {
  open: boolean;
  handleClose: () => void;
  spielId: string;
  spielerId: string;
}

const EditEinsatz: React.FC<Props> = (props) => {
  const { handleClose, open, spielId, spielerId } = props;

  const einsatzQuery = trpc.einsatz.detail.useQuery(
    { spielId, spielerId },
    {
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useTRPCForm({
    mutation: trpc.einsatz.update,
    validator: updateEinsatzSchema,
    mutationOptions: {
      onSuccess: () => {
        handleClose();
        toast.success('Erfolgreich gespeichert');
      },
      onError: (err, b) => {
        console.log(b);
        toast.error(err.message);
      },
    },
    formOptions: {
      values: einsatzQuery.data,
    },
  });

  const removeEinsatz = trpc.einsatz.remove.useMutation({
    onSuccess: () => {
      handleClose();
      toast.success('Erfolgreich gelöscht');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    console.log({ errors });
  }, [errors]);

  useEffect(() => {
    einsatzQuery.refetch();
  });

  if (einsatzQuery.status !== 'success') return <div>Loading...</div>;

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit</DialogTitle>

          <DialogContent>
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

            <input type="checkbox" {...register('bezahlt')} />
            <span>Bezahlt?</span>
          </DialogContent>
          <DialogActions>
            <Button type="submit">Speichern</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default EditEinsatz;
