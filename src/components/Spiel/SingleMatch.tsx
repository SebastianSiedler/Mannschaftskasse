import { trpc } from '@/lib/trpc';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ListItemIcon from '@mui/material/ListItemIcon';
import EditEinsatz from './EditEinsatz';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Props {
  spielId: string;
  open: boolean;
  handleClose: () => void;
}

const SingleMatch: React.FC<Props> = (props) => {
  const { spielId, open, handleClose } = props;

  const router = useRouter();

  const matchQuery = trpc.useQuery(['spiel.detail', { spielId }]);
  const spielerQuery = trpc.useQuery(['einsatz.list', { spielId }]);
  const availQuery = trpc.useQuery([
    'einsatz.list.availablePlayers',
    { spielId },
  ]);

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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{matchQuery.data?.title}</DialogTitle>

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
                  <ListItemText>{item.spieler.name} </ListItemText>
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
                <ListItemText>{item.name}</ListItemText>
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
