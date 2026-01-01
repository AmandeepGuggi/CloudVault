import React, { useState } from "react";

export default function Input({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  error,
  autoFocus = false,
  required = false,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        required={required}
        className={`w-full px-3.5 py-3 text-base border rounded-md bg-background text-foreground transition-colors outline-none
          ${isFocused ? "border-blue-600" : "border-border"}
          ${error ? "border-red-600" : ""}
        `}
      />

      {error && (
        <span className="text-sm text-red-600 mt-0.5">{error}</span>
      )}
    </div>
  );
}
