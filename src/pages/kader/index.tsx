import { InferQueryOutput, trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import toast from 'react-hot-toast';

const KaderHome: NextPageWithAuthAndLayout = () => {
  return (
    <div>
      <ListKader />
    </div>
  );
};

KaderHome.auth = true;
KaderHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default KaderHome;

import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const ListKader: React.FC = () => {
  const kaderQuery = trpc.useQuery(['spieler.list']);

  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const handleClose = () => {
    setOpen(false);
    kaderQuery.refetch();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const [activePlayer, setActivePlayer] = useState({
    id: '-1',
    name: '',
    active: true,
  });

  return (
    <>
      <List>
        {kaderQuery.data?.map((item, i) => (
          <ListItemButton
            key={i}
            onClick={() => {
              setActivePlayer(item);
              handleOpen();
            }}
          >
            {item.name}
          </ListItemButton>
        ))}
      </List>

      <EditPlayer open={open} handleClose={handleClose} player={activePlayer} />

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'absolute', bottom: 64, right: 16 }}
        onClick={() => {
          setOpenAdd(true);
        }}
      >
        <AddIcon />
      </Fab>
      <AddPlayer
        open={openAdd}
        handleClose={() => {
          kaderQuery.refetch();
          setOpenAdd(false);
        }}
      />

      <UserManagement />
    </>
  );
};

interface Props {
  handleClose: () => void;
  open: boolean;
  player: {
    id: string;
    name: string;
    active: boolean;
  };
}

const EditPlayer: React.FC<Props> = ({ open, handleClose, player }) => {
  const updatePlayer = trpc.useMutation('spieler.update', {
    onSuccess: () => {
      handleClose();
      toast.success('gespeichert');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const form = useEditPlayer();

  useEffect(() => {
    form.setName(player.name);
    form.setId(player.id);
    form.setActive(player.active);
  }, [player]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{`Edit ${form.name}`}</DialogTitle>
      <DialogContent>
        <TextField
          value={form.name}
          label="Name"
          onChange={(e) => form.setName(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) => form.setActive(e.target.checked)}
            />
          }
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            updatePlayer.mutate({
              spielerId: form.id,
              name: form.name,
              active: form.active,
            });
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useEditPlayer = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [active, setActive] = useState(false);

  return {
    id,
    name,
    active,

    setId,
    setName,
    setActive,
  };
};

const AddPlayer: React.FC<{ open: boolean; handleClose: () => void }> = ({
  open,
  handleClose,
}) => {
  const createPlayer = trpc.useMutation('spieler.add', {
    onSuccess: (res) => {
      handleClose();
      setName('');
      toast.success(`${res.name} hinzugefügt`);
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [name, setName] = useState('');

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Neu erstellen</DialogTitle>
      <DialogContent>
        <TextField
          value={name}
          label="Name"
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            createPlayer.mutate({ name: name });
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { useSession } from 'next-auth/react';
import Image from 'next/image';

const UserManagement: React.FC = () => {
  const { data } = useSession();
  console.log(data?.user.role === 'ADMIN');

  const allUsersQuery = trpc.useQuery(['user.list']);

  const changeUserPermission = trpc.useMutation('user.changeRole', {
    onSuccess: () => {
      allUsersQuery.refetch();
      toast.success('Rolle geändert');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      {allUsersQuery.data?.map((item) => (
        <div
          key={item.id}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              style={{
                aspectRatio: '1/1',
                width: 50,
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              {item.image ? (
                <Image src={item.image} layout="fill" />
              ) : (
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'gray',
                  }}
                ></div>
              )}
            </div>
            <div>
              <div>{item.name}</div>
              <div>{item.email}</div>
            </div>
          </div>

          <div>
            <Button
              onClick={() => {
                if (
                  window.confirm(
                    `${item.name} Rolle wirklich zu ${
                      item.role === 'USER' ? 'Admin' : 'User'
                    } ändern? `,
                  )
                ) {
                  changeUserPermission.mutate({
                    userId: item.id,
                    admin: item.role === 'USER',
                  });
                }
              }}
            >
              {item.role === 'USER' ? 'Zu Admin' : 'Zu User'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
