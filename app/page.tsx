import Link from "next/link";
import {
  Shield,
  Zap,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle2,
  Mail,
  Bell,
  Database,
  CreditCard,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Noise overlay ── */}
      <div className="noise-overlay pointer-events-none fixed inset-0 z-0" />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-sm font-bold tracking-[0.1em] uppercase">
              Aegis
            </span>
          </div>
          <Link
            href="/demo"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Try Aegis Live
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center px-6 pt-24 pb-20 text-center md:pt-32 md:pb-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          AI-native refund fraud defense
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          The refund agent that{" "}
          <span className="text-destructive">defends itself</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Aegis verifies orders, checks real payment risk, refuses
          manipulation, and blocks unsafe refunds — autonomously. Every tool
          call is gated by policy.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:opacity-90"
          >
            Try Aegis Live
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="https://github.com/mannubaveja007/aegis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── Capabilities grid ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Four layers of protection
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every refund case passes through the full pipeline before any
            money moves.
          </p>
        </div>
        <div className="grid gap-px rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: CheckCircle2,
              title: "Order verification",
              desc: "Cross-references the order status with Billbee before any decision.",
            },
            {
              icon: CreditCard,
              title: "Payment risk check",
              desc: "Pulls real Stripe charge data and evaluates refund eligibility via Jev.",
            },
            {
              icon: AlertTriangle,
              title: "Injection detection",
              desc: "Catches prompt injection and social engineering in the customer message.",
            },
            {
              icon: Lock,
              title: "Policy-gated refunds",
              desc: "Jev Gate blocks refunds that fail the suspicious / matchesTicket / withinPolicy thresholds.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 bg-background p-6"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-border bg-card/50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How a case flows
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { step: "01", label: "Sanitize", desc: "Extract facts from the raw message. Flag injections." },
              { step: "02", label: "Reason", desc: "AI calls tools in sequence based on the sanitized case." },
              { step: "03", label: "Jev Gate", desc: "Policy engine scores risk. Block / Review / Approve." },
              { step: "04", label: "Execute", desc: "Stripe refund, Gmail draft, Notion log, Slack alert." },
              { step: "05", label: "Audit", desc: "Every step recorded in the Orders Ledger." },
            ].map((item) => (
              <div key={item.step} className="text-center lg:text-left">
                <span className="font-mono text-xs text-muted-foreground">
                  {item.step}
                </span>
                <h3 className="mt-1 text-sm font-semibold">{item.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Connected integrations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CreditCard, name: "Stripe", status: "Live", desc: "Charges, refunds" },
            { icon: Mail, name: "Gmail", status: "Live", desc: "Customer drafts" },
            { icon: Bell, name: "Slack", status: "Live", desc: "#aegis-ops alerts" },
            { icon: Database, name: "Notion", status: "Live", desc: "Orders Ledger" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-start gap-3 rounded-lg border border-border p-4"
            >
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border px-6 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          See it in action
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Submit a refund case and watch the agent reason, call tools, and
          enforce policy in real time.
        </p>
        <Link
          href="/demo"
          className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90"
        >
          Try Aegis Live
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            Aegis · Refund Fraud Defense
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/mannubaveja007/aegis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <Link
              href="/demo"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
