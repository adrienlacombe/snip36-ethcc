export default function ArchitectureDiagram() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">
        Architecture: SNIP-36 Proving Pipeline
      </h3>
      <div className="overflow-x-auto rounded-xl border border-white/8 bg-white/3 p-4">
        <svg
          viewBox="0 0 800 200"
          className="mx-auto w-full max-w-[700px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Browser */}
          <rect x="10" y="70" width="110" height="60" rx="10" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="65" y="96" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">Browser</text>
          <text x="65" y="114" textAnchor="middle" fill="#9ca3af" fontSize="9">bet + nonce</text>

          {/* Arrow 1 */}
          <line x1="120" y1="100" x2="170" y2="100" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="145" y="92" textAnchor="middle" fill="#6b7280" fontSize="8">commit</text>

          {/* Backend */}
          <rect x="170" y="70" width="110" height="60" rx="10" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="225" y="96" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">Backend</text>
          <text x="225" y="114" textAnchor="middle" fill="#9ca3af" fontSize="9">lock seed</text>

          {/* Arrow 2 */}
          <line x1="280" y1="100" x2="330" y2="100" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="305" y="92" textAnchor="middle" fill="#6b7280" fontSize="8">execute</text>

          {/* Virtual OS */}
          <rect x="330" y="70" width="110" height="60" rx="10" fill="#1e293b" stroke="#a78bfa" strokeWidth="1.5" />
          <text x="385" y="96" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">Virtual OS</text>
          <text x="385" y="114" textAnchor="middle" fill="#9ca3af" fontSize="9">off-chain exec</text>

          {/* Arrow 3 */}
          <line x1="440" y1="100" x2="490" y2="100" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="465" y="92" textAnchor="middle" fill="#6b7280" fontSize="8">PIE</text>

          {/* stwo Prover */}
          <rect x="490" y="70" width="110" height="60" rx="10" fill="#1e293b" stroke="#f472b6" strokeWidth="1.5" />
          <text x="545" y="96" textAnchor="middle" fill="#f472b6" fontSize="11" fontWeight="600">stwo Prover</text>
          <text x="545" y="114" textAnchor="middle" fill="#9ca3af" fontSize="9">STARK proof</text>

          {/* Arrow 4 */}
          <line x1="600" y1="100" x2="650" y2="100" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="625" y="92" textAnchor="middle" fill="#6b7280" fontSize="8">proof</text>

          {/* Starknet */}
          <rect x="650" y="70" width="120" height="60" rx="10" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
          <text x="710" y="96" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="600">Starknet</text>
          <text x="710" y="114" textAnchor="middle" fill="#9ca3af" fontSize="9">verify on-chain</text>

          {/* Settlement message - curved arrow from Virtual OS down and right to Starknet */}
          <path d="M 385 130 Q 385 170 545 170 Q 710 170 710 130" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arrow-gold)" />
          <text x="545" y="186" textAnchor="middle" fill="#fbbf24" fontSize="8">L2-to-L1 settlement message (proven)</text>

          {/* Arrow marker */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
            </marker>
            <marker id="arrow-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
            </marker>
          </defs>
        </svg>
      </div>
      <p className="text-center text-xs text-gray-500">
        The coin flip runs off-chain in a virtual block, is proven by the stwo STARK prover,
        and the proof is verified by Starknet's protocol layer.
      </p>
    </div>
  );
}
