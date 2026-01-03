import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

interface UserNavigationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  colorClass?: string;
}

export function UserNavigationCard({
  icon: Icon,
  title,
  description,
  href,
  colorClass,
}: UserNavigationCardProps) {
  const content = (
    <Card
      className={`h-full border-2 border-transparent bg-white/5 text-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${colorClass || ""}`}
    >
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
