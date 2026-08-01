// Reusable katana SVG. `animate` triggers the unsheath + shine draw.
// `glow` adds a soft crimson drop-shadow so it reads as a deliberate accent (not a smudge) at low opacity or against a light background.
// `variant="hilt"` crops to just the guard + handle (a squarer, icon-friendly crop) for small inline/sidebar use —
// the full blade's 800:90 aspect ratio renders as an near-invisible sliver at icon sizes.
export function Katana({ className = '', animate = false, glow = false, variant = 'full' }: {
  className?: string; animate?: boolean; glow?: boolean; variant?: 'full' | 'hilt';
}) {
  return (
    <svg
      viewBox={variant === 'hilt' ? '26 16 154 60' : '0 0 800 90'}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={glow ? { filter: 'drop-shadow(0 0 5px rgb(var(--glow) / 0.6)) drop-shadow(0 0 14px rgb(var(--glow) / 0.35))' } : undefined}
    >
      <defs>
        {/* theme-aware: bright silver in dark mode, dark steel/gunmetal in light mode (see --katana-blade-* in index.css) */}
        <linearGradient id="blade-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'rgb(var(--katana-blade-1))' }} />
          <stop offset="0.5" style={{ stopColor: 'rgb(var(--katana-blade-2))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--katana-blade-3))' }} />
        </linearGradient>
      </defs>
      {/* blade */}
      <path d="M120 46 Q400 30 700 42 Q712 44 700 48 Q400 44 120 52 Z" fill="url(#blade-grad)" />
      {/* tip */}
      <path d="M700 42 L742 45 L700 48 Z" fill="url(#blade-grad)" />
      {/* shine line — stays white; reads as a highlight glint on both a bright and a dark blade */}
      <path d="M130 47 Q400 34 695 44" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"
        style={animate ? { strokeDasharray: 1400, strokeDashoffset: 1400, animation: 'blade-draw 1.8s ease-out .3s forwards' } : undefined} />
      {/* guard / tsuba */}
      <rect x="108" y="34" width="10" height="24" rx="3" style={{ fill: 'rgb(var(--katana-guard))' }} />
      <circle cx="113" cy="46" r="13" fill="none" style={{ stroke: 'rgb(var(--crimson))' }} strokeWidth="3" opacity="0.9" />
      {/* handle / tsuka */}
      <rect x="40" y="40" width="70" height="12" rx="6" style={{ fill: 'rgb(var(--katana-handle))' }} />
      <path d="M46 40 l10 12 M56 40 l10 12 M66 40 l10 12 M76 40 l10 12 M86 40 l10 12 M96 40 l10 12"
        style={{ stroke: 'rgb(var(--crimson) / 0.5)' }} strokeWidth="1.5" />
      <circle cx="42" cy="46" r="6" style={{ fill: 'rgb(var(--katana-guard))' }} />
      {animate && <style>{`@keyframes blade-draw{to{stroke-dashoffset:0}}`}</style>}
    </svg>
  );
}
