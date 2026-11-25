import { useCallback, useRef, type ReactNode } from 'react';
import { Calendar } from 'lucide-react';
import DatePickerLibrary, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  placeholder?: string;
  minDateTime?: Date;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const CustomDatePicker = ({
  selected,
  onChange,
  showTimeSelect = true,
  placeholder = 'Seleccionar fecha',
  minDateTime,
  disabled = false,
  required = false,
  className,
}: CustomDatePickerProps) => {
  const datePickerRef = useRef<DatePickerLibrary>(null);

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
        name="date_picker_field"
        autoComplete="off"
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }}
        placeholderText={placeholder}
        className={`${className ?? 'w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10'} !pl-10`}
        wrapperClassName="w-full"
        calendarContainer={calendarContainer}
        shouldCloseOnSelect={false}
        withPortal
        popperPlacement="bottom-start"
        minDate={minDateTime}
        filterTime={(time) =>
          !minDateTime || time.getTime() >= minDateTime.getTime()
        }
        disabled={disabled}
        required={required}
      />
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
};
