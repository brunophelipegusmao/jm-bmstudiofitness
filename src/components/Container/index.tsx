type ContainerProps = {
  children: React.ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen text-[#C0A231]">
      <div className="mx-auto max-w-screen-lg px-8">{children}</div>
    </div>
  );
}
