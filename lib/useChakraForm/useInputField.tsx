import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { FieldValues } from 'react-hook-form';
import { ZodFirstPartyTypeKind } from 'zod';
import { SupportedTypes, UseChakraFormParams } from '.';

export const useInputField = <T extends FieldValues>(
  params: UseChakraFormParams<T>,
) => {
  const { validator, form } = params;

  const {
    formState: { errors },
    register,
  } = form;

  interface IInputFieldParams {
    name: SupportedTypes<T, string | number>;
    label: string;
  }

  return {
    InputField: (props: IInputFieldParams) => {
      const { name, label } = props;

      console.log(validator);

      /* look in the zod schema to see if it is a number */
      const def = validator?.shape[name]._def;
      const isNumber =
        def.typeName === ZodFirstPartyTypeKind.ZodOptional
          ? def.innerType._def.typeName === ZodFirstPartyTypeKind.ZodNumber
          : def.typeName === ZodFirstPartyTypeKind.ZodNumber;

      return (
        <FormControl variant="floating" isInvalid={!!errors[name]}>
          <Input
            {...register(name, { valueAsNumber: isNumber })}
            type={isNumber ? 'number' : 'text'}
            variant="outline"
          />
          <FormLabel>{label}</FormLabel>
          <FormErrorMessage>
            {errors[name] && errors[name]?.message?.toString()}
          </FormErrorMessage>
        </FormControl>
      );
    },
  };
};
