'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input, type InputProps } from './Input';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input {...field} {...props} error={fieldState.error?.message} />
      )}
    />
  );
}
