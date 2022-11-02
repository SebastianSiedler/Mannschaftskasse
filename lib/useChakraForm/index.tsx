import { AnyMutationProcedure } from '@trpc/server';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useTRPCForm, UseTRPCFormProps } from '../trpc-forms';
import { useCheckbox } from './useCheckbox';
import { useInputField } from './useInputField';

export type UseChakraFormParams<T extends FieldValues> = {
  form: UseFormReturn<T>;
  validator?: z.ZodType<T>;
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

export const useChakraTRPCForm = <TProcedure extends AnyMutationProcedure>(
  props: UseTRPCFormProps<TProcedure>,
) => {
  const { validator, ...form } = useTRPCForm(props);
  const { InputField } = useInputField({ form, validator });
  const { Checkbox } = useCheckbox({ form });

  const components = {
    InputField,
    Checkbox,
  };

  return {
    ...form,
    components,
  };
};

// const Page = () => {
//   const { components } = useChakraTRPCForm({
//     validator: updateEinsatzSchema,
//     mutation: trpc.einsatz.update,
//   });
//   const { InputField, Checkbox } = components;

//   return (
//     <div>
//       <InputField name="wrongKey" label="" />
//       <InputField name="gelbeKarte" label="" />
//       <InputField name="tore" label="" />
//       <InputField name="bezahlt" label="" />
//       <Checkbox name="bezahlt" label="" />
//       <Checkbox name="tore" label="" />
//       <Checkbox name="" label="" />
//     </div>
//   );
// };

/**
 * How i want to use it:
 * @example
 * const useMyField = useCustomField<{
 *   supportedTypes: string|number,
 *   props: {label:string}
 * }>({validator, form}) => {
 *  ...
 *
 *  return (
 *    <>
 *      <span>{label}</span>
 *      <input {...form.register()} />
 *    </>
 * )
 * }
 */
const useCustomField = <
  TInputObj extends FieldValues,
  TReturnComp extends {
    [componentName: string]: (params: {
      name: SupportedTypes<TInputObj, number>;
      [key: string]: any;
    }) => JSX.Element;
  },
>(
  fn: (params: UseChakraFormParams<TInputObj>) => TReturnComp,
) => fn;
