import { SNIP36_LINK } from "../../lib/constants";

const STEPS = [
  {
    label: "Commit (player)",
    desc: `You pick heads or tails. Your browser generates a random nonce and computes pedersen(bet, nonce) \u2014 a cryptographic commitment that hides your bet. Only this hash is sent to the server. The server cannot see your bet.`,
  },
  {
    label: "Lock seed (server)",
    desc: `The server records the current Starknet block number as the seed. This happens after your commitment is locked, so the server cannot pick a block that favors a particular outcome \u2014 it doesn't know your bet yet.`,
  },
  {
    label: "Reveal (player)",
    desc: `Your browser sends the actual bet and nonce. The server verifies pedersen(bet, nonce) == commitment. If it doesn't match, the game is rejected \u2014 you can't change your bet after seeing the seed.`,
  },
  {
    label: "Prove in Virtual OS (server)",
    desc: `The server constructs a transaction calling play(seed, player, bet) on the CoinFlip contract. It executes this off-chain in a SNIP-36 virtual block and generates a STARK proof (via stwo prover). The outcome is pedersen(seed, player_address) % 2 \u2014 fully deterministic from public inputs.`,
  },
  {
    label: "Settlement message",
    desc: `The CoinFlip contract emits an L2\u2192L1 message with the settlement receipt: [player, seed, bet, outcome, won]. This message is part of the proven execution trace \u2014 it cannot be forged or tampered with.`,
  },
  {
    label: "Submit proof on-chain",
    desc: `The STARK proof and proof_facts are submitted as a proof-bearing transaction to Starknet. The protocol verifies the proof is valid \u2014 guaranteeing the game was played honestly. No trust required.`,
  },
];

export default function HowItWorks() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-200">How It Works</h2>
      <p className="text-sm text-gray-400">
        This game uses{" "}
        <a
          href={SNIP36_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 underline decoration-amber-400/30 hover:text-amber-300"
        >
          SNIP-36 in-protocol proof verification
        </a>{" "}
        to create a provably fair coin flip. Every step is either cryptographically committed or verified by a STARK proof.
      </p>

      <div className="space-y-2">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/8 bg-white/3 p-3"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-xs font-bold text-amber-400">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-200">
                  {step.label}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-gray-400">
                  {step.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why can't anyone cheat? */}
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
        <div className="text-sm font-semibold text-amber-400">
          Why can't anyone cheat?
        </div>
        <div className="mt-2 space-y-2 text-xs leading-relaxed text-gray-400">
          <p>
            <strong className="text-gray-300">Player</strong>: Your bet is
            committed before the seed is revealed. You cannot change it after
            seeing the outcome.
          </p>
          <p>
            <strong className="text-gray-300">Server</strong>: The seed is
            locked after your commitment. It cannot pick a favorable block.
            The STARK proof guarantees the contract was executed correctly
            &mdash; a fake outcome would produce an invalid proof.
          </p>
          <p>
            <strong className="text-gray-300">Anyone</strong>: Given the seed
            (block number) and player address, anyone can compute{" "}
            <code className="text-gray-300">pedersen(seed, player) % 2</code>{" "}
            and independently verify the result.
          </p>
        </div>
      </div>
    </div>
  );
}
