import AddCircleOutline from '@mui/icons-material/AddCircleOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ContentPaste from '@mui/icons-material/ContentPaste';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  addByPlayerListFn,
  addEinsatzFn,
  availablePlayersQueryOptions,
  einsatzListQueryOptions,
} from '@/server/functions/einsatz';
import { spielDetailQueryOptions } from '@/server/functions/spiele';
import {
  BfvCardRedIcon,
  BfvCardYellowIcon,
  BfvCardYellowRedIcon,
  BfvGoalIcon,
} from './BfvIcons';
import EditEinsatz from './EditEinsatz';

interface Props {
  spielId: string;
  open: boolean;
  handleClose: () => void;
}

interface GoalBalanceBannerProps {
  isLoading: boolean;
  bfvOwnGoals: number | null | undefined;
  recordedGoals: number;
}

const GoalBalanceBanner: React.FC<GoalBalanceBannerProps> = ({
  isLoading,
  bfvOwnGoals,
  recordedGoals,
}) => {
  if (isLoading) {
    return (
      <Skeleton
        variant="rounded"
        height={56}
        className="mb-4 rounded-xl"
        sx={{ borderRadius: 3 }}
      />
    );
  }

  if (typeof bfvOwnGoals !== 'number') {
    return null;
  }

  if (recordedGoals === bfvOwnGoals) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-900 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <CheckCircleOutline fontSize="small" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              Tore vollständig zugeordnet
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-200/80 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              {recordedGoals} {recordedGoals === 1 ? 'Tor' : 'Tore'} (BFV)
            </span>
          </div>
          <div className="text-xs text-emerald-700/90 mt-0.5">
            Alle im BFV gemeldeten Tore sind den Spielern zugewiesen.
          </div>
        </div>
      </div>
    );
  }

  if (recordedGoals < bfvOwnGoals) {
    const missingGoals = bfvOwnGoals - recordedGoals;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-amber-950 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
          <BfvGoalIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              Tor-Differenz festgestellt
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
              {recordedGoals} von {bfvOwnGoals} erfasst
            </span>
          </div>
          <div className="text-xs text-amber-800/90 mt-0.5">
            Laut BFV{' '}
            {bfvOwnGoals === 1 ? 'wurde 1 Tor' : `wurden ${bfvOwnGoals} Tore`}{' '}
            erzielt. Es{' '}
            {missingGoals === 1
              ? 'fehlt noch 1 Tor'
              : `fehlen noch ${missingGoals} Tore`}{' '}
            (oder Eigentor des Gegners).
          </div>
        </div>
      </div>
    );
  }

  const excessGoals = recordedGoals - bfvOwnGoals;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/90 p-3 text-orange-950 mb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-800">
        <BfvGoalIcon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">Zu viele Tore erfasst</span>
          <span className="inline-flex items-center rounded-full bg-orange-200 px-2 py-0.5 text-xs font-bold text-orange-900">
            +{excessGoals} {excessGoals === 1 ? 'Tor zu viel' : 'Tore zu viel'}
          </span>
        </div>
        <div className="text-xs text-orange-800/90 mt-0.5">
          Es wurden {recordedGoals} Tore bei den Spielern eingetragen, laut BFV
          wurden aber nur {bfvOwnGoals} erzielt.
        </div>
      </div>
    </div>
  );
};

const SingleMatch: React.FC<Props> = (props) => {
  const { spielId, open, handleClose } = props;

  const queryClient = useQueryClient();
  const [activeSpielerId, setActiveSpielerId] = useState<string | null>(null);

  const matchQuery = useQuery(spielDetailQueryOptions(spielId));
  const spielerQuery = useQuery(einsatzListQueryOptions(spielId));
  const availQuery = useQuery(availablePlayersQueryOptions(spielId));

  const recordedGoals =
    spielerQuery.data?.reduce((sum, item) => sum + (item.tore ?? 0), 0) ?? 0;

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
      } else {
        toast.success('Spieler erfolgreich hinzugefügt');
        setIsImportOpen(false);
      }
      setInputNames(data.unknown_players.join('\n'));
      spielerQuery.refetch();
      availQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['spiele', 'list'] });
    },
  });

  const [inputNames, setInputNames] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(true);

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
          <GoalBalanceBanner
            isLoading={matchQuery.isLoading || spielerQuery.isLoading}
            bfvOwnGoals={matchQuery.data?.bfvOwnGoals}
            recordedGoals={recordedGoals}
          />

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
              spielerQuery.data?.map((item) => (
                <ListItemButton
                  key={item.spielerId}
                  selected={item.spielerId === activeSpielerId}
                  onClick={() => setActiveSpielerId(item.spielerId)}
                >
                  <ListItemText>{item.spieler.names[0]} </ListItemText>
                  <div className="flex items-center gap-1 mr-3 text-slate-800">
                    {Array.from({ length: item.tore }).map((_, goalIdx) => (
                      <BfvGoalIcon key={goalIdx} />
                    ))}
                    {item.gelbeKarte > 0 && item.roteKarte > 0 ? (
                      <BfvCardYellowRedIcon />
                    ) : item.gelbeKarte >= 2 ? (
                      <BfvCardYellowRedIcon />
                    ) : (
                      <>
                        {item.gelbeKarte === 1 && <BfvCardYellowIcon />}
                        {item.roteKarte > 0 && <BfvCardRedIcon />}
                      </>
                    )}
                  </div>
                  <ListItemIcon sx={{ minWidth: 'auto' }}>
                    {item.bezahlt ? (
                      <CheckCircleOutline color="success" />
                    ) : (
                      <HighlightOffOutlined color="error" />
                    )}
                  </ListItemIcon>
                </ListItemButton>
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

          <Accordion
            expanded={isImportOpen}
            onChange={(_, expanded) => setIsImportOpen(expanded)}
            disableGutters
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: '16px !important',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                bgcolor: 'slate.50',
                px: 2,
                py: 0.5,
                '& .MuiAccordionSummary-content': { my: 1 },
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <PlaylistAdd fontSize="small" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    Spieler aus Text / Chat einfügen
                  </div>
                  <div className="text-xs text-slate-500">
                    Aufstellung z. B. aus WhatsApp kopieren und automatisch
                    zuordnen
                  </div>
                </div>
              </div>
            </AccordionSummary>

            <AccordionDetails
              sx={{ px: 2.5, pt: 2, pb: 2.5, bgcolor: 'background.paper' }}
            >
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                Füge hier eine Spielerliste oder Nachricht ein. Nummern und
                Aufzählungszeichen (z. B.{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-800">
                  1. Name
                </code>
                ) werden automatisch entfernt.
              </p>

              <textarea
                id="player_names_textarea"
                rows={6}
                value={inputNames}
                onChange={(e) => setInputNames(e.target.value)}
                placeholder={
                  '1. Max Mustermann\n2. Lukas Schmidt\n3. Jonas Müller'
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition font-sans resize-y"
              />

              <div className="flex items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-2">
                  {!!inputNames && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => setInputNames('')}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Leeren
                    </Button>
                  )}
                  {typeof navigator !== 'undefined' &&
                    'clipboard' in navigator && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<ContentPaste fontSize="small" />}
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text) setInputNames(text);
                          } catch {
                            // Clipboard read permission might be denied
                          }
                        }}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Einfügen
                      </Button>
                    )}
                </div>

                <Button
                  variant="contained"
                  disabled={
                    !inputNames.trim() || addPlayersFromClipboard.isPending
                  }
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
                  sx={{ textTransform: 'none', borderRadius: 2, px: 2.5 }}
                >
                  {addPlayersFromClipboard.isPending
                    ? 'Wird hinzugefügt...'
                    : 'Hinzufügen'}
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </Dialog>

      {!!activeSpielerId && (
        <EditEinsatz
          open={!!activeSpielerId}
          spielId={spielId}
          spielerId={activeSpielerId}
          handleClose={() => {
            setActiveSpielerId(null);
            spielerQuery.refetch();
            availQuery.refetch();
            queryClient.invalidateQueries({ queryKey: ['spiele', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
          }}
          key={`${spielId}-${activeSpielerId}`}
        />
      )}
    </>
  );
};

export default SingleMatch;
