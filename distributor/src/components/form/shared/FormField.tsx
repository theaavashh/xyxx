import React from 'react';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';

// Base form field props interface
export interface BaseFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Text input field props
export interface TextInputFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'tel' | 'number';
  maxLength?: number;
  min?: number;
  max?: number;
}

// Select field props
export interface SelectFieldProps extends BaseFormFieldProps {
  options: Array<{ value: string; label: string }>;
  emptyOption?: string;
}

// Radio field props
export interface RadioFieldProps extends BaseFormFieldProps {
  options: Array<{ value: string; label: string }>;
}

// Textarea field props
export interface TextareaFieldProps extends BaseFormFieldProps {
  rows?: number;
  maxLength?: number;
}

// File upload field props
export interface FileUploadFieldProps extends BaseFormFieldProps {
  accept?: string;
  multiple?: boolean;
  onFileSelect?: (files: FileList | File | null) => void;
}

// Generic form field component props
export interface FormFieldProps<T extends Record<string, any>> extends BaseFormFieldProps {
  control: Control<T>;
  errors: FieldErrors<T>;
  render: (field: any, fieldProps: any) => React.ReactNode;
}

// Base form field component
export function FormField<T extends Record<string, any>>({
  control,
  errors,
  name,
  label,
  required = false,
  className = '',
  render
}: FormFieldProps<T>) {
  const hasError = !!errors[name];
  const errorMessage = errors[name]?.message as string;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-bold text-[#001011] absans">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name as Path<T>}
        control={control}
        render={({ field, fieldState }) => render(field, { hasError, fieldState })}
      />
      {hasError && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}

// Text input field component
export function TextInputField<T extends Record<string, any>>({
  control,
  errors,
  name,
  label,
  required = false,
  type = 'text',
  placeholder,
  className = '',
  disabled = false,
  maxLength,
  min,
  max
}: TextInputFieldProps & { control: Control<T>; errors: FieldErrors<T> }) {
  return (
    <FormField
      control={control}
      errors={errors}
      name={name}
      label={label}
      required={required}
      className={className}
      render={({ field, fieldProps }) => (
        <input
          {...field}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
            fieldProps.hasError ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
          }`}
        />
      )}
    />
  );
}

// Select field component
export function SelectField<T extends Record<string, any>>({
  control,
  errors,
  name,
  label,
  required = false,
  options,
  emptyOption = '',
  className = '',
  disabled = false
}: SelectFieldProps & { control: Control<T>; errors: FieldErrors<T> }) {
  return (
    <FormField
      control={control}
      errors={errors}
      name={name}
      label={label}
      required={required}
      className={className}
      render={({ field, fieldProps }) => (
        <select
          {...field}
          disabled={disabled}
          className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
            fieldProps.hasError ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
          }`}
        >
          {emptyOption && <option value="">{emptyOption}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    />
  );
}

// Radio field component
export function RadioField<T extends Record<string, any>>({
  control,
  errors,
  name,
  label,
  required = false,
  options,
  className = '',
  disabled = false
}: RadioFieldProps & { control: Control<T>; errors: FieldErrors<T> }) {
  return (
    <FormField
      control={control}
      errors={errors}
      name={name}
      label={label}
      required={required}
      className={className}
      render={({ field }) => (
        <div className="flex gap-4">
          {options.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                {...field}
                value={option.value}
                checked={field.value === option.value}
                disabled={disabled}
                className="mr-2"
              />
              <span className="text-sm text-[#001011] absans">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    />
  );
}

// Textarea field component
export function TextareaField<T extends Record<string, any>>({
  control,
  errors,
  name,
  label,
  required = false,
  placeholder,
  rows = 4,
  maxLength,
  className = '',
  disabled = false
}: TextareaFieldProps & { control: Control<T>; errors: FieldErrors<T> }) {
  return (
    <FormField
      control={control}
      errors={errors}
      name={name}
      label={label}
      required={required}
      className={className}
      render={({ field, fieldProps }) => (
        <textarea
          {...field}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
            fieldProps.hasError ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
          }`}
        />
      )}
    />
  );
}

// File upload field component
export function FileUploadField<T extends Record<string, any>>({
  control,
  errors,
  name,
  label,
  required = false,
  accept = '',
  multiple = false,
  onFileSelect,
  className = '',
  disabled = false
}: FileUploadFieldProps & { control: Control<T>; errors: FieldErrors<T> }) {
  return (
    <FormField
      control={control}
      errors={errors}
      name={name}
      label={label}
      required={required}
      className={className}
      render={({ field, fieldProps }) => (
        <div className="space-y-2">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => {
              const files = e.target.files;
              field.onChange(multiple ? files : files?.[0] || null);
              onFileSelect?.(multiple ? files : files?.[0] || null);
            }}
            className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
              fieldProps.hasError ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
            }`}
          />
          {field.value && (
            <div className="text-sm text-gray-600">
              {multiple 
                ? `${(field.value as FileList).length} files selected`
                : `Selected: ${(field.value as File).name}`
              }
            </div>
          )}
        </div>
      )}
    />
  );
}