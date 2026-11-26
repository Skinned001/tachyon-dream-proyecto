import {
  forwardRef,
  useCallback,
  useRef,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from 'react';
import { Calendar, X } from 'lucide-react';
import DatePickerLibrary, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);

const defaultTriggerClassName =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  placeholder?: string;
  minDateTime?: Date;
  maxDateTime?: Date;
  isClearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

interface DatePickerTriggerProps {
  id?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onClick?: () => void;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  'aria-required'?: boolean | 'true' | 'false';
}

const DatePickerTrigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  (
    {
      id,
      value,
      placeholder,
      disabled,
      required,
      className = '',
      onClick,
      onBlur,
      onKeyDown,
      'aria-required': ariaRequired,
    },
    ref,
  ) => (
    <button
      ref={ref}
      id={id}
      type="button"
      onClick={onClick}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-required={ariaRequired ?? required}
      className={`flex items-center text-left ${className}`.trim()}
    >
      <span className={value ? 'truncate' : 'truncate text-slate-400'}>
        {value || placeholder}
      </span>
    </button>
  ),
);

DatePickerTrigger.displayName = 'DatePickerTrigger';

export const CustomDatePicker = ({
  selected,
  onChange,
  showTimeSelect = true,
  placeholder = 'Seleccionar fecha',
  minDateTime,
  maxDateTime,
  isClearable = false,
  disabled = false,
  required = false,
  className,
}: CustomDatePickerProps) => {
  const datePickerRef = useRef<DatePickerLibrary>(null);
  const showClearButton = isClearable && selected !== null && !disabled;

  const calendarContainer = useCallback(
    ({
      className: calendarClassName,
      children,
    }: { className?: string; children?: ReactNode }) => (
      <div
        className={calendarClassName}
        role="dialog"
        aria-modal="true"
        translate="no"
      >
        {children}
        <div className="datepicker-footer">
          <button
            type="button"
            onClick={() => datePickerRef.current?.setOpen(false)}
            className="datepicker-done"
          >
            Listo
          </button>
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className="relative w-full">
      <DatePickerLibrary
        ref={datePickerRef}
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat={showTimeSelect ? 'dd/MM/yyyy, HH:mm' : 'dd/MM/yyyy'}
        locale="es"
        customInput={<DatePickerTrigger />}
        preventOpenOnFocus
        placeholderText={placeholder}
        className={`${defaultTriggerClassName} ${className ?? ''} !pl-10 ${showClearButton ? '!pr-9' : ''}`.trim()}
        wrapperClassName="w-full"
        calendarContainer={calendarContainer}
        shouldCloseOnSelect={false}
        withPortal
        popperPlacement="bottom-start"
        minDate={minDateTime}
        maxDate={maxDateTime}
        filterTime={(time) =>
          (!minDateTime || time.getTime() >= minDateTime.getTime()) &&
          (!maxDateTime || time.getTime() <= maxDateTime.getTime())
        }
        disabled={disabled}
        required={required}
      />
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      {showClearButton && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange(null);
          }}
          aria-label="Limpiar fecha"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
