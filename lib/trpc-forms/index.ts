import { TRPCClientErrorLike } from '@trpc/client';
import type {
  DecorateProcedure,
  UseTRPCMutationOptions,
} from '@trpc/react-query/shared';
import type {
  AnyMutationProcedure,
  inferProcedureInput,
  inferProcedureOutput,
} from '@trpc/server';
import { z } from 'zod';
import { useZodForm } from './utils/use-zod-form';
import { FieldValues, type UseFormProps } from 'react-hook-form';

export type OmitNullish<TType> = Omit<TType, 'undefined' | 'null'>;

export type UseTRPCFormProps<
  TProcedure extends AnyMutationProcedure,
  TInput = inferProcedureInput<TProcedure>,
> = {
  mutation: DecorateProcedure<TProcedure, ''>;
  validator: z.ZodType<TInput>;
  mutationOptions?: UseTRPCMutationOptions<
    TInput,
    TRPCClientErrorLike<TProcedure>,
    inferProcedureOutput<TProcedure>
  >;
  formOptions?: UseFormProps<OmitNullish<TInput>>;
  //onSubmit?: {
  //  onValid: SubmitHandler<OmitNullish<TInput>>;
  //  onInvalid: SubmitErrorHandler<OmitNullish<TInput>>;
  //};
};

export const useTRPCForm = <TProcedure extends AnyMutationProcedure>(
  props: UseTRPCFormProps<TProcedure>,
) => {
  const { mutation, validator, mutationOptions, formOptions } = props;
  const form = useZodForm({
    validator,
    ...formOptions,
  });

  const actions = mutation.useMutation({
    ...mutationOptions,
    onError: (error, variables, context) => {
      mutationOptions?.onError?.(error, variables, context);
    },
  });

  /*   const handleSubmit: UseFormHandleSubmit<
    inferProcedureInput<TProcedure> & FieldValues
  > = (onValid, onInvalid) =>
    form.handleSubmit(async (data, e) => {
      await onValid(data, e);
      console.log(data);
      actions.mutate(form.getValues());
    }, onInvalid); */

  return {
    ...form,
    validator,
    // handleSubmit,
  };
};
