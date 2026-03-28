import { useState } from "react";
import { EXPLORER_BASE } from "../../lib/constants";

interface TruncatedHashProps {
  hash: string;
  chars?: number;
  explorer?: boolean;
}

export default function TruncatedHash({
  hash: txHash,
  chars = 8,
  explorer = true,
}: TruncatedHashProps) {
  const [copied, setCopied] = useState(false);

  const truncated =
    txHash.length > chars * 2 + 4
      ? `${txHash.slice(0, chars + 2)}...${txHash.slice(-chars)}`
      : txHash;

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      {explorer ? (
        <a
          href={`${EXPLORER_BASE}${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400/80 underline decoration-amber-400/30 transition hover:text-amber-300"
        >
          {truncated}
        </a>
      ) : (
        <span className="text-gray-400">{truncated}</span>
      )}
      <button
        onClick={handleCopy}
        className="text-gray-500 transition hover:text-gray-300"
        title="Copy full hash"
      >
        {copied ? (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </span>
  );
}
