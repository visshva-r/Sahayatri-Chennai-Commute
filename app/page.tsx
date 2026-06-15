import { SiteHeader } from "@/components/Brand";
import { JourneyForm } from "@/components/JourneyForm";
import { AssistantBox } from "@/components/AssistantBox";
import { ShieldIcon, ClockIcon, ShareIcon, TransferIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: <TransferIcon className="w-5 h-5" />,
    title: "One journey, every mode",
    body: "Metro, MRTS rail, MTC bus, walk and last-mile auto stitched into a single plan, not five separate apps.",
  },
  {
    icon: <ShieldIcon className="w-5 h-5" />,
    title: "Safe-Route Score",
    body: "Each route gets a 0-100 safety score from lighting, CCTV, footfall, help points and women feedback, adjusted for the time you travel.",
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    title: "Compare what matters",
    body: "Rank options by time, cost, comfort or safety, and see the CO2 saved versus a car on every route.",
  },
  {
    icon: <ShareIcon className="w-5 h-5" />,
    title: "Companion Mode",
    body: "Share a live trip with a trusted contact and get an alert if you drift off the planned route.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_80%_-10%,#4D8DFF_0%,transparent_60%),radial-gradient(50%_50%_at_0%_110%,#12B786_0%,transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              Reimagining urban mobility in India
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Plan the whole commute. <br />
              <span className="text-teal">Pick the safest way home.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/75 sm:text-base">
              Sahayatri turns Chennai&apos;s metro, buses and last-mile rides into one journey,
              then scores every route for safety so you choose with confidence, especially after dark.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <Stat value="5" label="modes combined" />
              <Stat value="0-100" label="Safe-Route Score" />
              <Stat value="Live" label="Companion Mode" />
            </div>
          </div>
          <div>
            <AssistantBox />
            <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-wide text-white/40">
              <span className="h-px flex-1 bg-white/15" />
              or plan it yourself
              <span className="h-px flex-1 bg-white/15" />
            </div>
            <JourneyForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                {f.icon}
              </div>
              <h3 className="mt-3 font-semibold text-navy">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-muted">
        Sahayatri - Built by Visshva R
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
