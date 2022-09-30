import { Spieler } from '@prisma/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditPlayer from './EditPlayer';
import toast from 'react-hot-toast';

const ListKader: React.FC = () => {
  const kaderQuery = trpc.spieler.list.useQuery(undefined, {
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    kaderQuery.refetch();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const emptyPlayer = {
    id: '-1',
    names: [],
    active: true,
  };

  const [activePlayer, setActivePlayer] = useState<Spieler>({ ...emptyPlayer });

  return (
    <>
      {kaderQuery.status === 'loading' && <div>Loading ...</div>}
      <List>
        {kaderQuery.data?.map((item, i) => (
          <ListItemButton
            key={i}
            onClick={() => {
              setActivePlayer(item);
              handleOpen();
            }}
          >
            {item.names[0]}
          </ListItemButton>
        ))}
      </List>

      <EditPlayer open={open} handleClose={handleClose} player={activePlayer} />

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 64, right: 16 }}
        onClick={() => {
          setActivePlayer(emptyPlayer);
          setOpen(true);
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default ListKader;
