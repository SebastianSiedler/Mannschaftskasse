import { trpc } from '@/lib/trpc';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SingleMatch: React.FC<Props> = (props) => {
  const { handleClose, open } = props;

  const router = useRouter();
  const spielId = router.query.spielId as unknown as string;
  const spielerId = router.query.spielerId as unknown as string;

  const { refetch: refetchEinsatz } = trpc.useQuery(
    ['einsatz.detail', { spielId, spielerId }],
    {
      enabled: false,
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  const form = useEinsatzForm();

  useEffect(() => {
    refetchEinsatz().then((res) => {
      const { data } = res;
      form.setTore(data!.tore);
      form.setBezahlt(data!.bezahlt);
      form.setGelbeKarte(data!.gelbeKarte);
      form.setRoteKarte(data!.roteKarte);
    });
  }, []);

  const einsatzMutation = trpc.useMutation('einsatz.update', {
    onSuccess: () => {
      handleClose();
      toast.success('Erfolgreich gespeichert');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const removeEinsatz = trpc.useMutation('einsatz.remove', {
    onSuccess: () => {
      handleClose();
      toast.success('Erfolgreich gelöscht');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit</DialogTitle>

        <IconButton
          onClick={() => {
            removeEinsatz.mutate({ spielId, spielerId });
          }}
        >
          <DeleteIcon />
        </IconButton>

        <DialogContent>
          <TextField
            label="Tore"
            type="number"
            value={form.tore}
            onChange={(e) => form.setTore(Number(e.target.value))}
          />
          <TextField
            label="Gelbe Karten"
            value={form.gelbeKarte}
            type="number"
            onChange={(e) => form.setTore(Number(e.target.value))}
          />
          <TextField
            label="Rote Karten"
            type="number"
            value={form.roteKarte}
            onChange={(e) => form.setTore(Number(e.target.value))}
          />

          <Checkbox
            checked={form.bezahlt}
            onChange={(e) => form.setBezahlt(e.target.checked)}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              einsatzMutation.mutate({
                spielId,
                spielerId,
                roteKarte: form.roteKarte,
                gelbeKarte: form.gelbeKarte,
                bezahlt: form.bezahlt,
                tore: form.tore,
              });
            }}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SingleMatch;

const useEinsatzForm = () => {
  const [tore, setTore] = useState(0);
  const [bezahlt, setBezahlt] = useState(false);
  const [gelbeKarte, setGelbeKarte] = useState(0);
  const [roteKarte, setRoteKarte] = useState(0);

  return {
    tore,
    bezahlt,
    gelbeKarte,
    roteKarte,

    setTore,
    setBezahlt,
    setGelbeKarte,
    setRoteKarte,
  };
};
