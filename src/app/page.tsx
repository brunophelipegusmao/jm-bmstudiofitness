import SectionFeatured from "@/components/SectionFeatured";
import SectionHistory from "@/components/SectionHistory";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center">
      <SectionFeatured />
      <SectionHistory />
    </main>
  );
}
