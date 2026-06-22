import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'done'>('in');

  useEffect(() => {
    // Phase 1: fade in (0ms - 600ms)
    const holdTimer = setTimeout(() => setPhase('hold'), 600);
    // Phase 2: hold for 3 seconds then fade out
    const outTimer = setTimeout(() => setPhase('out'), 3600);
    // Phase 3: complete
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  const opacity = phase === 'in' ? 0 : phase === 'hold' ? 1 : 0;
  const visibility = phase === 'out' ? 'hidden' : 'visible';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1a2e]"
      style={{
        opacity,
        visibility,
        transition: 'opacity 0.6s ease-in-out, visibility 0.6s ease-in-out',
      }}
    >
      {/* Poster image */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src="/images/splash.png"
          alt="LOVE TALK"
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Loading progress bar at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48">
        <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/80 rounded-full"
            style={{
              width: phase === 'in' ? '0%' : phase === 'hold' ? '100%' : '100%',
              transition: phase === 'hold' ? 'width 3s linear' : 'none',
            }}
          />
        </div>
        <p className="text-center text-white/50 text-[10px] mt-2 tracking-widest uppercase">
          LOVE TALK
        </p>
      </div>
    </div>
  );
}
