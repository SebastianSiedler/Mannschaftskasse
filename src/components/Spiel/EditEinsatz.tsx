import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useTRPCForm } from '@/lib/trpc-forms';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormHelperText,
  Box,
  IconButton,
} from '@chakra-ui/react';

import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  ChakraProvider,
} from '@chakra-ui/react';
import { theme } from './theme';
import { DeleteIcon } from '@chakra-ui/icons';

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

  const form = useTRPCForm({
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
    formOptions: {
      shouldFocusError: false,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = form;

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
    console.log({ errors });
  }, [errors]);

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
            <form onSubmit={handleSubmit}>
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
                      <FormControl variant="floating" isInvalid={!!errors.tore}>
                        <Input
                          {...register('tore', { valueAsNumber: true })}
                          type="number"
                          variant="outline"
                        />
                        <FormLabel>Tore</FormLabel>
                        <FormErrorMessage>
                          {errors.tore && errors.tore.message}
                        </FormErrorMessage>
                      </FormControl>
                    </Box>

                    <Box p={8}>
                      <FormControl
                        variant="floating"
                        isInvalid={!!errors.gelbeKarte}
                      >
                        <Input
                          {...register('gelbeKarte', { valueAsNumber: true })}
                          type="number"
                          variant="outline"
                        />
                        <FormLabel>Gelbe Karten</FormLabel>
                        <FormErrorMessage>
                          {errors.gelbeKarte && errors.gelbeKarte.message}
                        </FormErrorMessage>
                      </FormControl>
                    </Box>

                    <Box p={8}>
                      <FormControl
                        variant="floating"
                        isInvalid={!!errors.roteKarte}
                      >
                        <Input
                          {...register('roteKarte', { valueAsNumber: true })}
                          type="number"
                          variant="outline"
                        />
                        <FormLabel>Rote Karten</FormLabel>
                        <FormErrorMessage>
                          {errors.roteKarte && errors.roteKarte.message}
                        </FormErrorMessage>
                      </FormControl>
                    </Box>

                    <input type="checkbox" {...register('bezahlt')} />
                    <span>Bezahlt?</span>
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
