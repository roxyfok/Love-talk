import { useState, useEffect } from 'react';
import { Heart, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Fade in after mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0d15]"
      style={{
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out',
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

        {/* Bottom gradient overlay for button readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Enter button */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3">
        {/* Brand text */}
        <div className="flex items-center gap-1.5 text-white/50">
          <Heart size={10} fill="currentColor" />
          <span className="text-[10px] tracking-[0.3em] uppercase">Love Talk</span>
          <Heart size={10} fill="currentColor" />
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="group flex items-center gap-2 px-8 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white/25 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          进入网站
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>

        <p className="text-white/30 text-[10px] tracking-wider">
          点击按钮开启私密对话
        </p>
      </div>
    </div>
  );
}
