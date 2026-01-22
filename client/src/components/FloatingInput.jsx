import { useState } from "react";

export default function FloatingInput({ name, value, onChange, label, type = "text", icon }) {
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative mb-6 w-full">
      <label
        className={`absolute transition-all duration-200 pointer-events-none 
        ${focus || value?.length > 0  ? "-top-3 text-sm text-gray-500" : "top-3 text-base text-gray-400"}`}
      >
        {label}
      </label>

      <input
      name={name}
      value={value}
      onChange={onChange}
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={(e) => e.target.value === "" && setFocus(false)}
        className="w-full border-b-[1.5px] border-gray-300 focus:border-black outline-none py-3 text-gray-800 pr-8"
      />

      {icon && <span className="absolute right-0 top-3">{icon}</span>}
    </div>
  );
}
