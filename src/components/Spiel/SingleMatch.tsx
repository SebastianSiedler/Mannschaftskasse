// MUI
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';

import EditEinsatz from './EditEinsatz';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { trpc } from '@/lib/trpc';

import { useRouter } from 'next/router';
import { useState } from 'react';
interface Props {
  spielId: string;
  open: boolean;
  handleClose: () => void;
}

const SingleMatch: React.FC<Props> = (props) => {
  const { spielId, open, handleClose } = props;

  const router = useRouter();

  const matchQuery = trpc.proxy.spiel.detail.useQuery(
    { spielId },
    {
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );
  const spielerQuery = trpc.proxy.einsatz.list.useQuery(
    { spielId },
    {
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );
  const availQuery = trpc.proxy.einsatz.listAvailablePlayers.useQuery(
    { spielId },
    {
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  const addPlayerMutation = trpc.proxy.einsatz.add.useMutation({
    onSuccess: () => {
      spielerQuery.refetch();
      availQuery.refetch();
      toast.success('Hinzugefügt');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const addPlayersFromClipboard =
    trpc.proxy.einsatz.addByPlayerList.useMutation({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: (data) => {
        console.log(data.unknown_players);
        if (data.unknown_players.length > 0) {
          toast.error(`${data.unknown_players.join(', ')} nicht gefunden`);
        }
        setInputNames(data.unknown_players.join('\n'));
        spielerQuery.refetch();
        availQuery.refetch();
      },
    });

  const [inputNames, setInputNames] = useState('');

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullScreen>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {matchQuery.data?.opponent.name}
            </Typography>
          </Toolbar>
        </AppBar>

        <DialogContent>
          <div className="font-semibold">{`Gespielte Spieler: ${
            spielerQuery.data?.length ?? 0
          }`}</div>
          <List>
            {spielerQuery.data?.map((item, i) => (
              <Link
                href={`/spiele/?spielId=${spielId}&spielerId=${item.spielerId}`}
                as={`/spiele/${spielId}/${item.spielerId}`}
                key={i}
              >
                <ListItemButton
                  selected={
                    spielId === router.query.spielId &&
                    item.spielerId === router.query.spielerId
                  }
                >
                  <ListItemText>{item.spieler.names[0]} </ListItemText>
                  <ListItemIcon>
                    {item.bezahlt ? (
                      <CheckCircleOutline color="success" />
                    ) : (
                      <HighlightOffOutlined color="error" />
                    )}
                  </ListItemIcon>
                </ListItemButton>
              </Link>
            ))}
          </List>

          <div className="font-semibold">Verfügbare Spieler:</div>
          <List>
            {availQuery.data?.map((item, i) => (
              <ListItemButton
                key={i}
                onClick={() => {
                  addPlayerMutation.mutate({
                    spielId: spielId,
                    spielerId: item.id,
                  });
                }}
              >
                <ListItemText>{item.names[0]}</ListItemText>
                <ListItemIcon>
                  <AddCircleOutline />
                </ListItemIcon>
              </ListItemButton>
            ))}
          </List>

          <label htmlFor="player_names_textarea" className="font-semibold">
            Nachricht:
          </label>
          <textarea
            id="player_names_textarea"
            rows={10}
            value={inputNames}
            onChange={(e) => setInputNames(e.target.value)}
            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          ></textarea>
          <button
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={() => {
              addPlayersFromClipboard.mutate({
                spielId: spielId,
                names: inputNames
                  .split('\n')
                  .map((x) => x.trim())
                  .filter((x) => !!x),
              });
            }}
          >
            Hinzufügen
          </button>
        </DialogContent>
      </Dialog>

      {!!router.query.spielId && !!router.query.spielerId && (
        <EditEinsatz
          open={!!router.query.spielId && !!router.query.spielerId}
          handleClose={() => {
            router.replace(`/spiele/?spielId=${spielId}`, `/spiele/${spielId}`);
            spielerQuery.refetch();
            availQuery.refetch();
          }}
        />
      )}
    </>
  );
};

export default SingleMatch;
