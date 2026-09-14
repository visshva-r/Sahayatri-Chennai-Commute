import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref = "/",
  actionLabel = "Back to planner",
  children,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-lg font-semibold text-navy">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
      {children ? <div className="mt-6 text-left">{children}</div> : null}
      <Link
        href={actionHref}
        className="mt-6 inline-block rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
