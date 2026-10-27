import { type FieldValues, type UseFormProps } from 'react-hook-form';
import { z } from 'zod';
import { useZodForm } from './utils/use-zod-form';

interface MutationHookOptions<
  TInput,
  TError = { message: string },
  TOutput = unknown,
> {
  onSuccess?: (data: TOutput, variables: TInput, context: unknown) => unknown;
  onError?: (error: TError, variables: TInput, context: unknown) => unknown;
}

interface TRPCMutationLike<
  TInput,
  TError = { message: string },
  TOutput = unknown,
> {
  useMutation: (opts?: MutationHookOptions<TInput, TError, TOutput>) => {
    mutate: (variables: TInput) => void;
  };
}

type UseTRPCFormProps<
  TSchema extends z.ZodType<any, any, any>,
  TInput extends FieldValues = z.input<TSchema>,
> = {
  mutation: TRPCMutationLike<TInput, any, any>;
  validator: TSchema;
  mutationOptions?: MutationHookOptions<TInput, any, any>;
  formOptions?: UseFormProps<TInput>;
};

export const useTRPCForm = <
  TSchema extends z.ZodType<any, any, any>,
  TInput extends FieldValues = z.input<TSchema>,
>({
  mutation,
  validator,
  mutationOptions,
  formOptions,
}: UseTRPCFormProps<TSchema, TInput>) => {
  const form = useZodForm({
    validator,
    ...formOptions,
  });

  const actions = mutation.useMutation({
    ...mutationOptions,
    onError: (error, variables, context) => {
      console.error('onError', error?.message);
      mutationOptions?.onError?.(error, variables, context);
    },
  });

  const handleSubmit = form.handleSubmit(() => {
    actions.mutate(form.getValues());
  });

  return {
    ...form,
    handleSubmit,
  };
};
