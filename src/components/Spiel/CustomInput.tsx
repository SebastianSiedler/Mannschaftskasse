import { useTRPCForm } from '@/lib/trpc-forms';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';

interface Props {
  form: ReturnType<typeof useTRPCForm>;
}

export const CustomInput = ({ form }: Props) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <FormControl variant="floating" isInvalid={!!errors.tore}>
      <Input
        {...register('tore', { valueAsNumber: true })}
        type="number"
        variant="outline"
      />
      <FormLabel>Tore</FormLabel>
      <FormHelperText>Keep it very short and sweet!</FormHelperText>
      <FormErrorMessage>{errors['x'] && errors['x'].message}</FormErrorMessage>
    </FormControl>
  );
};
