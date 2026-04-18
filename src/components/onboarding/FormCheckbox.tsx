import React from 'react';

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  checked,
  onChange,
  required = false,
}) => {
  return (
    <div className="mb-6">
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-3 text-sm text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
    </div>
  );
};
