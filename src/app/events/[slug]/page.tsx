import { redirect } from "next/navigation";

interface Props {
  params: { slug: string };
}

export default function LegacyEventRedirect({ params }: Props) {
  redirect(`/events/event/${params.slug}`);
}
