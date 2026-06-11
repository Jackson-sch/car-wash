"use client";

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function InputField({
  id, label, type = "text", required, placeholder,
  value, onChange, disabled,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-10 px-3.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
