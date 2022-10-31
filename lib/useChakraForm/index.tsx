import { updateEinsatzSchema } from '@/src/components/Spiel/EditEinsatz';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useZodForm } from '../trpc-forms/utils/use-zod-form';
import { useCheckbox } from './useCheckbox';
import { useInputField } from './useInputField';

export type UseChakraFormParams<T extends FieldValues> = {
  form: UseFormReturn<T>;
};

/**
 * get all keys, that have a given type
 * e.g.
 * FilterKeys<{s:string, b:boolean, n:number}, string|boolean>
 * -> ["s", "b"]
 */
type FilterKeys<TObj extends Record<string, unknown>, TFilter> = {
  [K in keyof TObj]-?: TObj[K] extends TFilter | undefined ? K : never;
}[keyof TObj];

/* Same as above, but for react-hook-forms field values*/
export type SupportedTypes<TObj extends FieldValues, Filter> = FilterKeys<
  TObj,
  Filter
> &
  Path<TObj>;

const useChakraForm = <T extends FieldValues>(
  params: UseChakraFormParams<T>,
) => {
  const { form } = params;

  const { InputField } = useInputField({ form });
  const { Checkbox } = useCheckbox({ form });

  const components = {
    InputField,
    Checkbox,
  };

  return { components };
};

const Page = () => {
  const form = useZodForm({ validator: updateEinsatzSchema });
  const { components } = useChakraForm({ form });
  const { InputField, Checkbox } = components;

  return (
    <div>
      {/* <InputField name="wrongKey" /> */}
      <InputField name="gelbeKarte" />
      <InputField name="tore" />
      {/* <InputField name="bezahlt" /> */}
      <Checkbox name="bezahlt" />
      {/* <Checkbox name="tore" />
      <Checkbox name="" /> */}
    </div>
  );
};
