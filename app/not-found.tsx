import { SiteHeader } from "@/components/Brand";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <EmptyState
        title="Page not found"
        body="That URL is not part of Sahayatri. Head back to the planner or a demo commute."
        actionHref="/#presets"
        actionLabel="Try a demo commute"
      />
    </main>
  );
}