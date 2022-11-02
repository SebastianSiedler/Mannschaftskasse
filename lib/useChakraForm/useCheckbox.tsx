import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { FieldValues } from 'react-hook-form';
import { SupportedTypes, UseChakraFormParams } from '.';

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
