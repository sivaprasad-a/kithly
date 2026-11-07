/** Small corner tag on Dev and QA so nobody confuses them with Prod. Hidden in Prod and locally. */
export function EnvBadge() {
  const label = process.env.NEXT_PUBLIC_ENV_LABEL;
  if (!label) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-3 right-3 z-[100] rounded-full bg-gold px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-teal shadow-lg"
    >
      {label}
    </div>
  );
}
