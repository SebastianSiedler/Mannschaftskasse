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

import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
} from '@chakra-ui/react';

export const updateEinsatzSchema = z.object({
  spielId: z.string(),
  spielerId: z.string(),
  tore: z.number().min(0).optional(),
  gelbeKarte: z.number().optional(),
  roteKarte: z.number().optional(),
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
      onSuccess: (data) => {
        (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
          console.log(key, data[key]);
          setValue(key, data[key]);
        });
      },
    },
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useTRPCForm({
    mutation: trpc.einsatz.update,
    validator: updateEinsatzSchema,
    mutationOptions: {
      onSuccess: (data) => {
        handleClose();
        toast.success('Erfolgreich gespeichert');
      },
      onError: (err, b) => {
        console.log(b);
        toast.error(err.message);
      },
    },
    formOptions: {},
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
          <FormControl
          // isInvalid={errors.name}
          >
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
              <Input
                {...register('tore', { valueAsNumber: true })}
                placeholder="Tore"
                type="number"
                variant="outline"
              />
              <br />
              <Input
                placeholder="Gelbe Karten"
                type="number"
                {...register('gelbeKarte', { valueAsNumber: true })}
              />
              <br />
              <Input
                placeholder="Rote Karten"
                type="number"
                {...register('roteKarte', { valueAsNumber: true })}
              />
              <br />

              <input type="checkbox" {...register('bezahlt')} />
              <span>Bezahlt?</span>
            </DialogContent>
            {/* 
            <FormErrorMessage>
              {errors.name && errors.name.message}
            </FormErrorMessage> */}
          </FormControl>

          <DialogActions>
            <Button type="submit">Speichern</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default EditEinsatz;
