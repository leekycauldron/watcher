import { useEffect, useRef, useState } from "react";

interface GlassSliderProps {
  items: { key: string; label: string }[];
  activeKey: string;
}

export default function GlassSlider({ items, activeKey }: GlassSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [hoverPill, setHoverPill] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = itemRefs.current.get(activeKey);
    const container = containerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setPill({ left: eRect.left - cRect.left, width: eRect.width });
    }
  }, [activeKey]);

  const handleHover = (key: string | null) => {
    if (!key || key === activeKey) {
      setHoverPill(null);
      return;
    }
    const el = itemRefs.current.get(key);
    const container = containerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setHoverPill({ left: eRect.left - cRect.left, width: eRect.width });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Active pill */}
      <div
        className="absolute top-0 h-full rounded-lg pointer-events-none"
        style={{
          left: pill.left,
          width: pill.width,
          backdropFilter: "blur(16px) saturate(180%)",
          background: "rgba(0, 240, 255, 0.08)",
          border: "1px solid rgba(0, 240, 255, 0.25)",
          transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      {/* Hover ghost */}
      {hoverPill && (
        <div
          className="absolute top-0 h-full rounded-lg pointer-events-none"
          style={{
            left: hoverPill.left,
            width: hoverPill.width,
            background: "rgba(0, 240, 255, 0.04)",
            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: 0.5,
          }}
        />
      )}
      {/* Items container */}
      <div className="relative flex">
        {items.map((item) => (
          <div
            key={item.key}
            ref={(el) => {
              if (el) itemRefs.current.set(item.key, el);
            }}
            onMouseEnter={() => handleHover(item.key)}
            onMouseLeave={() => handleHover(null)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
