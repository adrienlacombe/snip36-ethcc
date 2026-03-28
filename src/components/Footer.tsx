import { SNIP36_LINK } from "../lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 pt-6 pb-8 text-center text-xs text-gray-600">
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={SNIP36_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-gray-400"
        >
          SNIP-36 Specification
        </a>
        <span>&middot;</span>
        <a
          href="https://www.starknet.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-gray-400"
        >
          Starknet
        </a>
      </div>
      <div className="mt-3 text-gray-700">
        Built with SNIP-36 virtual blocks &middot; In-protocol proof verification on Starknet
      </div>
    </footer>
  );
}
