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
  }

  const Checkbox = (props: ICheckboxParams) => {
    const { name } = props;
    return (
      <input type="checkbox" {...register(name, { valueAsNumber: true })} />
    );
  };

  return { Checkbox };
};
