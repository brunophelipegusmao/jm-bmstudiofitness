interface FieldErrorProps {
  children: React.ReactNode;
}

export function FieldError({ children }: FieldErrorProps) {
  return <p className="mt-1 text-sm text-red-400">{children}</p>;
}
