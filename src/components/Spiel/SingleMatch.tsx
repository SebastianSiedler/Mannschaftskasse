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
interface Props {
  spielId: string;
  open: boolean;
  handleClose: () => void;
}

const SingleMatch: React.FC<Props> = (props) => {
  const { spielId, open, handleClose } = props;

  const router = useRouter();

  const matchQuery = trpc.useQuery(['spiel.detail', { spielId }], {
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const spielerQuery = trpc.useQuery(['einsatz.list', { spielId }], {
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const availQuery = trpc.useQuery(
    ['einsatz.list.availablePlayers', { spielId }],
    {
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  const addPlayerMutation = trpc.useMutation('einsatz.add', {
    onSuccess: () => {
      spielerQuery.refetch();
      availQuery.refetch();
      toast.success('Hinzugefügt');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

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
          <div>Gespielte Spieler:</div>
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

          <div>Verfügbare Spieler:</div>
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
