import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
      {...props}
    />
  );
}
