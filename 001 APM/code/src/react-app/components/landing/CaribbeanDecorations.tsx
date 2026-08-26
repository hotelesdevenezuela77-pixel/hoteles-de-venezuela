// Caribbean decorative SVG icons

// Real sea starfish with 5 rounded arms
export function Starfish({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M32 6c1.5 0 3 2 4 6l2 8c1 3 3 5 6 5l8 1c4 0.5 6 2 6 3.5s-2 3-5 5l-7 4c-2.5 1.5-4 4-3.5 7l2 8c0.5 4 0 6-1.5 6.5s-3.5-0.5-6-3l-5-6c-2-2.5-4.5-3-7-1.5l-7 4c-3.5 2-5.5 2.5-6.5 1s0-4 2-7l4-7c1.5-2.5 1-5.5-1-7.5l-6-5c-3-2.5-4-4.5-3.5-6s2.5-2 6-1.5l8 1c3 0.5 5.5-1 7-4l3-8c1.5-4 3-6 4.5-6z" />
      {/* Texture dots */}
      <circle cx="32" cy="28" r="2" opacity="0.3" />
      <circle cx="28" cy="34" r="1.5" opacity="0.3" />
      <circle cx="36" cy="34" r="1.5" opacity="0.3" />
    </svg>
  );
}

// Traditional boat anchor - exact silhouette from reference
export function Anchor({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor">
      {/* Ring at top with hole */}
      <circle cx="50" cy="16" r="14"/>
      <circle cx="50" cy="16" r="7" fill="white" className="fill-background"/>
      {/* Connector from ring to stock */}
      <rect x="46" y="28" width="8" height="10"/>
      {/* Stock bar with ball ends */}
      <rect x="18" y="36" width="64" height="6"/>
      <circle cx="18" cy="39" r="5"/>
      <circle cx="82" cy="39" r="5"/>
      {/* Main vertical shank */}
      <rect x="44" y="40" width="12" height="50"/>
      {/* Left curved fluke - smooth arm going out then tip UP */}
      <path d="
        M44 86 
        Q30 90 20 100 
        L8 107 
        L18 95 
        Q28 83 40 80 
        Z
      "/>
      {/* Right curved fluke - smooth arm going out then tip UP */}
      <path d="
        M56 86 
        Q70 90 80 100 
        L92 107 
        L82 95 
        Q72 83 60 80 
        Z
      "/>
      {/* Center point going down */}
      <polygon points="44,88 50,115 56,88"/>
    </svg>
  );
}

// Ship wheel / helm
export function ShipWheel({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      {/* Outer ring */}
      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="4" />
      {/* Inner ring */}
      <circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Center hub */}
      <circle cx="32" cy="32" r="4" />
      {/* Spokes with handles */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 32 + 10 * Math.cos(rad);
        const y1 = 32 + 10 * Math.sin(rad);
        const x2 = 32 + 26 * Math.cos(rad);
        const y2 = 32 + 26 * Math.sin(rad);
        const hx = 32 + 32 * Math.cos(rad);
        const hy = 32 + 32 * Math.sin(rad);
        return (
          <g key={angle}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" />
            <circle cx={hx} cy={hy} r="3" />
          </g>
        );
      })}
    </svg>
  );
}

// Tropical fish
export function TropicalFish({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      {/* Body */}
      <ellipse cx="28" cy="32" rx="18" ry="12" />
      {/* Tail */}
      <path d="M46 32l14-12v24l-14-12z" />
      {/* Dorsal fin */}
      <path d="M20 20c4-6 10-8 14-6-2 2-6 6-8 10l-6-4z" />
      {/* Bottom fin */}
      <path d="M22 44c4 4 8 6 12 4-2-2-4-5-6-8l-6 4z" />
      {/* Eye */}
      <circle cx="18" cy="30" r="4" fill="white" />
      <circle cx="17" cy="30" r="2" fill="black" />
      {/* Stripes */}
      <path d="M26 22v20M32 24v16M38 26v12" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
    </svg>
  );
}

// Spiral conch shell (caracol)
export function Conch({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      {/* Main shell body */}
      <path d="M52 42c0 12-10 18-22 18-14 0-22-10-22-22 0-16 12-30 26-32 2 0 3 1 2 3-4 8-6 16-4 22 2 8 8 12 16 10 3-0.5 4 0.5 4 1z" />
      {/* Spiral lines */}
      <path d="M18 38c2-10 10-18 18-20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M20 46c2-8 8-14 14-16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M24 52c2-6 6-10 10-12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Opening detail */}
      <ellipse cx="46" cy="44" rx="4" ry="8" opacity="0.2" />
    </svg>
  );
}

// Seahorse (caballito de mar)
export function Seahorse({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      {/* Head */}
      <path d="M36 8c6 0 10 4 10 8 0 3-2 5-4 6l-8 4c-2 1-3 3-3 5v4c0 4 2 7 4 10l2 4c1 3 0 5-2 6-3 2-6 1-8-2l-4-8c-2-4-3-8-3-12v-8c0-6 4-12 10-14l4-2c1-0.5 2-1 2-1z" />
      {/* Snout */}
      <path d="M46 14h8c2 0 3 1 3 2s-1 2-3 2h-8c-1 0-2-1-2-2s1-2 2-2z" />
      {/* Curled tail */}
      <path d="M24 48c-2 2-4 6-4 10 0 2 1 3 2 3s2-1 3-3c2-4 1-8-1-10z" />
      <path d="M22 52c-3 1-6 4-6 8 0 1 1 2 2 2s2-1 2-2c1-3 2-6 2-8z" />
      {/* Eye */}
      <circle cx="40" cy="12" r="2" fill="white" />
      <circle cx="40" cy="12" r="1" fill="black" />
      {/* Dorsal fin spikes */}
      <path d="M30 16l-2-4 2 2-2-6 3 4-2-6 4 6 1-4 2 6 2-3 1 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Body texture */}
      <path d="M32 24c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" opacity="0.3" />
      <path d="M30 32c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" opacity="0.3" />
    </svg>
  );
}

// Keep seashell as an alias for backward compatibility
export function Seashell({ className = "w-8 h-8" }: { className?: string }) {
  return <Conch className={className} />;
}

// Palm leaf (keeping for variety)
export function PalmLeaf({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M32 60c0-20-16-36-28-40 8 8 12 20 12 28 0-16 8-28 16-32-8 4-12 16-12 28 0-12 8-24 20-28-8 8-12 20-8 32 4-12 12-24 24-24-12 8-20 20-20 36h-4z" />
    </svg>
  );
}

export function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12">
        <path 
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" 
          className="fill-sky-50"
        />
        <path 
          d="M0,40 C180,55 360,25 540,40 C720,55 900,25 1080,40 C1260,55 1350,35 1440,45 L1440,60 L0,60 Z" 
          className="fill-cyan-50/50"
        />
      </svg>
    </div>
  );
}

// Floating decorative elements for sections
export function FloatingDecorations() {
  return (
    <>
      {/* Top left starfish */}
      <div className="absolute top-20 left-8 opacity-10 text-amber-500 rotate-12 animate-pulse">
        <Starfish className="w-16 h-16" />
      </div>
      
      {/* Top right anchor */}
      <div className="absolute top-32 right-12 opacity-10 text-cyan-600 -rotate-12">
        <Anchor className="w-14 h-14" />
      </div>
      
      {/* Bottom left seahorse */}
      <div className="absolute bottom-40 left-16 opacity-10 text-teal-500 rotate-6">
        <Seahorse className="w-12 h-12" />
      </div>
      
      {/* Bottom right conch */}
      <div className="absolute bottom-24 right-20 opacity-10 text-amber-400 -rotate-6">
        <Conch className="w-10 h-10" />
      </div>
    </>
  );
}

// Section header with Caribbean accent
export function CaribbeanSectionHeader({ 
  icon: Icon, 
  label, 
  title, 
  highlight, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  highlight: string;
  description: string;
}) {
  return (
    <div className="text-center mb-14 relative">
      <div className="inline-flex items-center gap-2 text-cyan-600 mb-4">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium tracking-widest uppercase">{label}</span>
        <Icon className="w-5 h-5 scale-x-[-1]" />
      </div>
      <h2 className="text-4xl md:text-5xl font-light text-foreground mb-4">
        {title}{' '}
        <span className="font-serif italic gradient-text-turquoise">{highlight}</span>
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
        {description}
      </p>
      
      {/* Decorative line */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-300" />
        <Starfish className="w-4 h-4 text-amber-400" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-300" />
      </div>
    </div>
  );
}
