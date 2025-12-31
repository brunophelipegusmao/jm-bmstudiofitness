import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Blog movido para Eventos | JM Fitness Studio",
};

interface Props {
  params: { slug: string };
}

export default function BlogSlugRedirect({ params }: Props) {
  const { slug } = params;
  redirect(`/events/${slug}`);
}
