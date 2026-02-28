'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Textarea, type TextareaProps } from './Textarea';

interface FormTextareaProps<T extends FieldValues> extends Omit<TextareaProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  ...props
}: FormTextareaProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Textarea {...field} {...props} error={fieldState.error?.message} />
      )}
    />
  );
}
