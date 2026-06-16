import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import type { LinkItem } from "../types";

interface Props {
  link: LinkItem;
  onDismiss: () => void;
}

export function CreatedLinkBanner({ link, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-green-700 font-medium mb-0.5">Link created!</p>
        <p className="font-mono text-green-900 truncate text-sm">{link.shortUrl}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-medium rounded-lg transition-colors"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={onDismiss}
        className="shrink-0 text-green-400 hover:text-green-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
