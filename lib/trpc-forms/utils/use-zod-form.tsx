import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormProps, useForm } from 'react-hook-form';
import { z } from 'zod';

type UseZodFormProps<TValidator extends z.ZodType> = UseFormProps<
  z.input<TValidator>
> & {
  validator: TValidator;
};

export const useZodForm = <TValidator extends z.ZodType>(
  props: UseZodFormProps<TValidator>,
) => {
  return useForm<z.input<TValidator>>({
    resolver: zodResolver(props.validator),
    ...props,
  });
};
