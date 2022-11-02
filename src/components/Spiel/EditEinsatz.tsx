import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  IconButton,
  FormControl,
  Button,
  ChakraProvider,
} from '@chakra-ui/react';

import { theme } from './theme';
import { DeleteIcon } from '@chakra-ui/icons';
import { useChakraTRPCForm } from '@/lib/useChakraForm';

export const updateEinsatzSchema = z.object({
  spielId: z.string(),
  spielerId: z.string(),
  tore: z.number().min(0).optional(),
  gelbeKarte: z.number().min(0).optional(),
  roteKarte: z.number().min(0).optional(),
  bezahlt: z.boolean().optional(),
});

interface Props {
  open: boolean;
  handleClose: () => void;
  spielId: string;
  spielerId: string;
}

const EditEinsatz: React.FC<Props> = (props) => {
  const { handleClose, open, spielId, spielerId } = props;

  const einsatzQuery = trpc.einsatz.detail.useQuery(
    { spielId, spielerId },
    {
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: (data) => {
        (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
          console.log(key, data[key]);
          setValue(key, data[key]);
        });
      },
    },
  );

  const {
    components: { InputField, Checkbox },
    handleSubmit,
    setValue,
  } = useChakraTRPCForm({
    mutation: trpc.einsatz.update,
    validator: updateEinsatzSchema,
    mutationOptions: {
      onSuccess: (data) => {
        handleClose();
        toast.success('Erfolgreich gespeichert');
      },
      onError: (err, b) => {
        console.log(b);
        toast.error(err.message);
      },
    },
  });

  const onSubmit = handleSubmit((data, e) => {
    return;
  });

  const removeEinsatz = trpc.einsatz.remove.useMutation({
    onSuccess: () => {
      handleClose();
      toast.success('Erfolgreich gelöscht');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    console.warn('MOUNTED');
    einsatzQuery.refetch();
  }, []);

  if (einsatzQuery.status !== 'success') return <div>Loading...</div>;

  return (
    <div>
      <ChakraProvider theme={theme}>
        <Modal isOpen={open} onClose={handleClose} autoFocus={false}>
          <ModalOverlay />
          <ModalContent>
            <form onSubmit={onSubmit}>
              <FormControl>
                <ModalHeader>Edit</ModalHeader>

                <ModalBody>
                  <div>
                    <div>
                      <IconButton
                        aria-label="remove einsatz"
                        onClick={() => {
                          removeEinsatz.mutate({ spielId, spielerId });
                        }}
                        icon={<DeleteIcon />}
                      />
                      <span>Einsatz löschen</span>
                    </div>
                    <Box p={8}>
                      <InputField name="tore" label="Tore" />
                    </Box>

                    <Box p={8}>
                      <InputField name="gelbeKarte" label="Gelbe karten" />
                    </Box>

                    <Box p={8}>
                      <InputField name="roteKarte" label="Rote Karten" />
                    </Box>

                    <Box p={8}>
                      <InputField name="spielerId" label="SpielerID" />
                    </Box>

                    <Checkbox name="bezahlt" label="Bezahlt?" />
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button type="submit">Speichern</Button>
                </ModalFooter>
              </FormControl>
            </form>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </div>
  );
};

export default EditEinsatz;
