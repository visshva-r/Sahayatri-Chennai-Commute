import { SiteHeader } from "@/components/Brand";
import { JourneyForm } from "@/components/JourneyForm";
import { AssistantBox } from "@/components/AssistantBox";
import { DemoPresets } from "@/components/DemoPresets";
import { ShieldIcon, ClockIcon, ShareIcon, TransferIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: <TransferIcon className="w-5 h-5" />,
    title: "One journey, every mode",
    body: "Metro, MRTS, suburban rail, MTC bus, walk and last-mile auto in a single plan — including short walks to the nearest station.",
  },
  {
    icon: <ShieldIcon className="w-5 h-5" />,
    title: "Explainable Safe-Route Score",
    body: "A 0-100 score with factor cards and evidence: lighting, CCTV, footfall, help points and women-safety feedback.",
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    title: "Compare the tradeoffs",
    body: "Rank by time, cost, comfort or safety. See door-to-door ETA, waits, transfers and CO2 saved versus a car.",
  },
  {
    icon: <ShareIcon className="w-5 h-5" />,
    title: "Shareable status + safety kit",
    body: "Copy or share a trip summary, run a demo companion walkthrough, and keep a checklist — no fake live GPS.",
  },
];

const STEPS = [
  { n: "1", t: "Pick origin and destination", d: "Use a demo commute, the form, or plain language." },
  { n: "2", t: "We build multi-modal plans", d: "Transfer-aware routing across metro, rail, bus, walk and auto." },
  { n: "3", t: "Every route is scored", d: "Safety, comfort and CO2 — then ranked by what you asked for." },
  { n: "4", t: "Compare, share, go", d: "Read why the score is X, share the itinerary, follow the steps." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_80%_-10%,#4D8DFF_0%,transparent_60%),radial-gradient(50%_50%_at_0%_110%,#12B786_0%,transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              Chennai multi-modal commute planner
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Plan the whole commute. <br />
              <span className="text-teal">Pick the safest way home.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/75 sm:text-base">
              Sahayatri stitches Chennai&apos;s metro, suburban rail, buses and last-mile rides into one
              journey, then explains every Safe-Route Score so you choose with evidence — especially after dark.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <Stat value="5" label="modes combined" />
              <Stat value="0-100" label="explainable score" />
              <Stat value="4" label="demo commutes" />
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

      <DemoPresets />

      <section id="how" className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-lg font-semibold text-navy">How a plan is built</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 p-4">
                <span className="text-xs font-semibold text-teal">{s.n}</span>
                <h3 className="mt-1 font-semibold text-navy">{s.t}</h3>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
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
        Sahayatri — Built by Visshva R
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
