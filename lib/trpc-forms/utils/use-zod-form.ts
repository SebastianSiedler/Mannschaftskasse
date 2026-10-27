import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldValues, type UseFormProps, useForm } from 'react-hook-form';
import { z } from 'zod';

export function useZodForm<
  TValidator extends z.ZodType<any, any, any>,
  TInput extends FieldValues = z.input<TValidator>,
>(
  props: UseFormProps<TInput> & {
    validator: TValidator;
  },
) {
  return useForm<TInput>({
    resolver: zodResolver(props.validator) as any,
    ...props,
  });
}
