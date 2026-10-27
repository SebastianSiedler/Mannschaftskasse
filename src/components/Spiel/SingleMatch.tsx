import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  addByPlayerListFn,
  addEinsatzFn,
  availablePlayersQueryOptions,
  einsatzListQueryOptions,
} from '@/server/functions/einsatz';
import { spielDetailQueryOptions } from '@/server/functions/spiele';
import EditEinsatz from './EditEinsatz';

interface Props {
  spielId: string;
  spielerId?: string;
  open: boolean;
  handleClose: () => void;
}

const SingleMatch: React.FC<Props> = (props) => {
  const { spielId, spielerId, open, handleClose } = props;

  const navigate = useNavigate();

  const matchQuery = useQuery(spielDetailQueryOptions(spielId));
  const spielerQuery = useQuery(einsatzListQueryOptions(spielId));
  const availQuery = useQuery(availablePlayersQueryOptions(spielId));

  const addPlayerMutation = useMutation({
    mutationFn: (input: { spielId: string; spielerId: string }) =>
      addEinsatzFn({ data: input }),
    onSuccess: () => {
      spielerQuery.refetch();
      availQuery.refetch();
      toast.success('Hinzugefügt');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const addPlayersFromClipboard = useMutation({
    mutationFn: (input: { spielId: string; names: string[] }) =>
      addByPlayerListFn({ data: input }),
    onError: (err: Error) => {
      toast.error(err.message);
    },
    onSuccess: (data) => {
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
            <Typography
              sx={{ ml: 2, flex: 1, minWidth: 0 }}
              variant="h6"
              component="div"
              noWrap
            >
              {matchQuery.isLoading ? (
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }}
                />
              ) : (
                matchQuery.data?.opponent.name
              )}
            </Typography>
          </Toolbar>
        </AppBar>

        <DialogContent>
          <div className="font-semibold">{`Gespielte Spieler: ${
            spielerQuery.data?.length ?? 0
          }`}</div>
          <List>
            {spielerQuery.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <ListItem key={i} disablePadding className="py-2 px-4">
                  <ListItemText
                    primary={
                      <Skeleton variant="text" width="45%" height={24} />
                    }
                  />
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                  </ListItemIcon>
                </ListItem>
              ))}
            {spielerQuery.isSuccess &&
              spielerQuery.data?.map((item, i) => (
                <Link
                  to="/spiele/$spielId/$spielerId"
                  params={{ spielId, spielerId: item.spielerId }}
                  key={i}
                >
                  <ListItemButton selected={item.spielerId === spielerId}>
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
            {availQuery.isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <ListItem key={i} disablePadding className="py-2 px-4">
                  <ListItemText
                    primary={
                      <Skeleton variant="text" width="50%" height={24} />
                    }
                  />
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                  </ListItemIcon>
                </ListItem>
              ))}
            {availQuery.isSuccess &&
              availQuery.data?.map((item, i) => (
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
                  .replaceAll(/[0-9.]+/g, '')
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

      {!!spielerId && (
        <EditEinsatz
          open={!!spielerId}
          spielId={spielId}
          spielerId={spielerId}
          handleClose={() => {
            navigate({
              to: '/spiele/$spielId',
              params: { spielId },
              replace: true,
            });
            spielerQuery.refetch();
            availQuery.refetch();
          }}
          key={`${spielId}-${spielerId}`}
        />
      )}
    </>
  );
};

export default SingleMatch;
