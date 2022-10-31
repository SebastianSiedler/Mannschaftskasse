import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { FieldValues } from 'react-hook-form';
import { SupportedTypes, UseChakraFormParams } from '.';

export const useInputField = <T extends FieldValues>(
  params: UseChakraFormParams<T>,
) => {
  const { form } = params;

  const {
    formState: { errors },
    register,
  } = form;

  interface IInputFieldParams {
    name: SupportedTypes<T, string | number>;
  }

  const InputField = (props: IInputFieldParams) => {
    const { name } = props;
    return (
      <FormControl variant="floating" isInvalid={!!errors[name]}>
        <Input
          {...register(name, { valueAsNumber: true })}
          type="number"
          variant="outline"
        />
        <FormLabel>Tore</FormLabel>
        <FormErrorMessage>
          {errors[name] && errors[name]?.message?.toString()}
        </FormErrorMessage>
      </FormControl>
    );
  };

  return { InputField };
};
