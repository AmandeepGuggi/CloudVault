import React from "react";

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  fullWidth = false,
}) {
  const baseStyles =
    "px-6 py-3 text-base font-medium rounded-md transition-all outline-none font-sans";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-background text-foreground border border-border hover:bg-muted",
  };

  const disabledStyles =
    disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${widthStyles}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
