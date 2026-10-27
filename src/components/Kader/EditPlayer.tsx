import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Spieler } from '@/lib/db';
import { upsertSpielerFn } from '@/server/functions/spieler';

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
      if (curr.trim() === '') {
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

  const upsertPlayer = useMutation({
    mutationFn: (input: {
      names: string[];
      active: boolean;
      spielerId?: string;
    }) => upsertSpielerFn({ data: input }),
    onSuccess: () => {
      handleClose();
      toast.success('gespeichert');
    },
    onError: (err: Error) => {
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
                  const next = [...names];
                  next[i] = e.target.value;
                  return next;
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
              names: names.filter((n) => !!n).map((n) => n.trim()),
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
