// MUI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Spieler } from '@prisma/client';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import toast from 'react-hot-toast';

interface Props {
  player: Spieler;
  open: boolean;
  handleClose: () => void;
}

const EditPlayer: React.FC<Props> = ({ player, open, handleClose }) => {
  const [names, setNames] = useState(player.names);
  const [active, setActive] = useState(player.active);

  useEffect(() => {
    setNames(player.names);
    setActive(player.active);
  }, [player]);

  /**
   * Die Textfelder immer so machen, dass ganz unten ein
   * leeres ist aber sonst die leeren weggelöscht werden.
   */
  useEffect(() => {
    const anz_empty_fields = names.reduce((prev, curr) => {
      if (curr.trim() == '') {
        prev += 1;
      }
      return prev;
    }, 0);

    if (!names.some((n) => n.trim() === '') || anz_empty_fields > 1) {
      setNames((names) => {
        return names.filter((n) => !!n).concat(['']);
      });
    }
  }, [names]);

  const upsertPlayer = trpc.proxy.spieler.upsert.useMutation({
    onSuccess: () => {
      handleClose();
      toast.success('gespeichert');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {player.id === '-1' ? 'Neu erstellen' : 'Bearbeiten'}
      </DialogTitle>
      <DialogContent>
        {names.map((name, i) => (
          <div key={i}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) =>
                setNames((names) => {
                  names[i] = e.target.value;
                  return [...names];
                })
              }
            />
          </div>
        ))}

        <FormControlLabel
          control={
            <Checkbox
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          }
          label="Active"
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            upsertPlayer.mutate({
              names: names.filter((n) => !!n),
              active,
              spielerId: player.id,
            });
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPlayer;
