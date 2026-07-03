import { activeChain, explorerAddressUrl } from "@/lib/chains"
import { REGISTRY_ADDRESS } from "@/lib/registry"

export function Footer() {
  return (
    <footer className="border-t border-z-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-z-text-dim sm:flex-row sm:justify-between">
        <span>Zoetra &middot; the first permissionless SLA layer for DePIN</span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/mystiquemide/zoetra"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-z-text"
          >
            GitHub
          </a>
          <a
            href={explorerAddressUrl(REGISTRY_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-z-text"
          >
            Contract on {activeChain.blockExplorers.default.name}
          </a>
          <a
            href="https://dev-docs.botchain.ai/docs/Developers/quick-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-z-text"
          >
            BOT Chain docs
          </a>
          <a
            href="https://x.com/BOTChain_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-z-text"
          >
            @BOTChain_ai
          </a>
        </div>
      </div>
    </footer>
  )
}
