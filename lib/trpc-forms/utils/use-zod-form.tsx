import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormProps, useForm } from 'react-hook-form';
import { z } from 'zod';

export type UseZodFormProps<TValidator extends z.ZodType> = UseFormProps<
  z.input<TValidator>
> & {
  validator: TValidator;
};

export const useZodForm = <TValidator extends z.ZodType>(
  props: UseZodFormProps<TValidator>,
) => {
  const resolver = zodResolver(props.validator);

  const form = useForm<z.input<TValidator>>({
    resolver,
    ...props,
  });

  return {
    ...form,
    resolver,
  };
};
