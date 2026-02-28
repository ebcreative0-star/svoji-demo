'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Select, type SelectProps } from './Select';

interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  ...props
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Select {...field} {...props} error={fieldState.error?.message} />
      )}
    />
  );
}
