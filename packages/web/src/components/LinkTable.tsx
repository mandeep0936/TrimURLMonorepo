import { useState } from "react";
import { Copy, Check, BarChart2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { LinkItem } from "../types";

interface Props {
  links: LinkItem[];
}

export function LinkTable({ links }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No links yet — trim one above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-left">
            <th className="px-4 py-3 font-medium">Original URL</th>
            <th className="px-4 py-3 font-medium">Short Link</th>
            <th className="px-4 py-3 font-medium text-right">Clicks</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {links.map((link) => (
            <tr key={link.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 max-w-xs">
                <a
                  href={link.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-700 hover:text-brand-600 truncate"
                  title={link.originalUrl}
                >
                  <span className="truncate">{link.originalUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-brand-600">{link.shortUrl}</span>
                  <button
                    onClick={() => copyToClipboard(link.shortUrl, link.id)}
                    className="text-gray-400 hover:text-brand-600 transition-colors"
                    title="Copy short link"
                  >
                    {copiedId === link.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>

              <td className="px-4 py-3 text-right font-semibold text-gray-700">
                {link.clickCount.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-gray-400">
                {new Date(link.createdAt).toLocaleDateString()}
              </td>

              <td className="px-4 py-3">
                <Link
                  to={`/analytics/${link.code}`}
                  className="flex items-center gap-1 text-gray-400 hover:text-brand-600 transition-colors text-xs"
                >
                  <BarChart2 className="w-4 h-4" />
                  Stats
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
