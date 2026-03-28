import { useState } from "react";

interface TechCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function TechCard({
  title,
  children,
  defaultOpen = false,
}: TechCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-300 transition hover:bg-white/5"
      >
        {title}
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-gray-400">
          {children}
        </div>
      )}
    </div>
  );
}
