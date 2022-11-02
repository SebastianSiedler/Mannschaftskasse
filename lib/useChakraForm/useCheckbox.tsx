import { updateEinsatzSchema } from '@/src/components/Spiel/EditEinsatz';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { AnyMutationProcedure } from '@trpc/server';
import { FieldValues } from 'react-hook-form';
import { SupportedTypes, UseChakraFormParams } from '.';
import { trpc } from '../trpc';
import { useTRPCForm, UseTRPCFormProps } from '../trpc-forms';

export const useCheckbox = <T extends FieldValues>(
  params: UseChakraFormParams<T>,
) => {
  const { form } = params;

  const {
    formState: { errors },
    register,
  } = form;

  interface ICheckboxParams {
    name: SupportedTypes<T, boolean>;
    label: string;
  }

  const Checkbox = (props: ICheckboxParams) => {
    const { name, label } = props;
    return (
      <FormControl isInvalid={!!errors[name]}>
        <input type="checkbox" {...register(name)} />
        <FormLabel>{label}</FormLabel>
        <FormErrorMessage>
          {errors[name] && errors[name]?.message?.toString()}
        </FormErrorMessage>
      </FormControl>
    );
  };

  return { Checkbox };
};

const useMyForm = <TProc extends AnyMutationProcedure>(
  props: UseTRPCFormProps<TProc>,
) => {
  const form = useTRPCForm(props);

  useCheckbox({ form });

  return form;
};

const ComponentX = () => {
  const form = useMyForm({
    validator: updateEinsatzSchema,
    mutation: trpc.einsatz.update,
  });
  const { Checkbox } = useCheckbox({
    form: form,
  });

  return <Checkbox name="bezahltx" label="label" />;
};
