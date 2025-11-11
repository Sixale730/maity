import { Label } from '@/ui/components/ui/label';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@maity/shared';

interface PhoneInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PhoneInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
}: PhoneInputProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Label htmlFor={id} className="text-lg font-medium">
        {label}
      </Label>
      <PhoneInputWithCountry
        international
        defaultCountry="MX"
        value={value}
        onChange={(val) => onChange(val || '')}
        placeholder={placeholder}
        className="phone-input-custom"
        numberInputProps={{
          id,
          className: 'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          autoFocus: true,
        }}
      />
    </div>
  );
}
