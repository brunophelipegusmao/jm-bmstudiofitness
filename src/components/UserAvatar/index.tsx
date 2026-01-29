"use client";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  name,
  size = "md",
  className = "",
}: UserAvatarProps) {
  // Gera as iniciais do nome (com fallback seguro)
  const getInitials = (fullName: string) => {
    const safe = (fullName ?? "").trim();
    if (!safe) return "?";

    const names = safe.split(/\s+/).filter(Boolean);
    if (names.length === 0) return "?";
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }

    const first = names[0][0] ?? "?";
    const last = names[names.length - 1][0] ?? "?";
    return (first + last).toUpperCase();
  };

  // Define os tamanhos
  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const initials = getInitials(name);

  return (
    <div
      className={` ${sizes[size]} relative flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#C2A537] to-[#D4B547] font-bold text-black shadow-lg ring-2 ring-[#C2A537]/20 ring-offset-2 ring-offset-black transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#C2A537]/40 hover:ring-[#C2A537]/50 active:scale-95 ${className} `}
      title={name}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C2A537]/30 to-[#D4B547]/30 opacity-0 transition-opacity duration-300 hover:opacity-100" />

      {/* Content */}
      <span className="relative z-10 transition-transform duration-200 select-none hover:scale-105">
        {initials}
      </span>

      {/* Subtle sparkle effect */}
      <div className="absolute inset-0 rounded-full opacity-30">
        <div className="absolute top-1/4 left-1/4 h-1 w-1 animate-pulse rounded-full bg-white" />
        <div className="absolute top-1/2 right-1/3 h-0.5 w-0.5 animate-pulse rounded-full bg-white delay-500" />
      </div>
    </div>
  );
}
