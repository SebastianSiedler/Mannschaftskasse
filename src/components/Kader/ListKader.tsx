import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { Spieler } from '@/lib/db';
import { spielerListQueryOptions } from '@/server/functions/spieler';
import EditPlayer from './EditPlayer';

const ListKader: React.FC = () => {
  const kaderQuery = useQuery(spielerListQueryOptions());

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    kaderQuery.refetch();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const emptyPlayer: Spieler = {
    id: '-1',
    names: [],
    active: true,
  };

  const [activePlayer, setActivePlayer] = useState<Spieler>({ ...emptyPlayer });

  return (
    <>
      {kaderQuery.isLoading && <div>Loading ...</div>}
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
