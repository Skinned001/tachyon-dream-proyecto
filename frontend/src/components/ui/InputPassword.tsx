import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputPasswordProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={show ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full rounded-md border bg-white px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((visible) => !visible)}
            aria-label={show ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
            aria-pressed={show}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <span id={`${inputId}-error`} className="text-sm text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  },
);

InputPassword.displayName = 'InputPassword';
