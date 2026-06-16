import { useState } from "react";
import { Link2, Scissors, ChevronDown, ChevronUp } from "lucide-react";
import { useCreateLink } from "../hooks/useLinks";
import type { LinkItem } from "../types";

interface Props {
  onCreated: (link: LinkItem) => void;
}

export function CreateLinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);

  const { mutate, isPending, error } = useCreateLink();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    mutate(
      { url: url.trim(), alias: alias.trim() || undefined },
      {
        onSuccess: (link) => {
          onCreated(link);
          setUrl("");
          setAlias("");
        },
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Scissors className="w-5 h-5 text-brand-600" />
        <h2 className="text-lg font-semibold">Shorten a URL</h2>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPending ? "Trimming…" : "Trim it"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAlias((v) => !v)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showAlias ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Custom alias (optional)
      </button>

      {showAlias && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 shrink-0">trim/</span>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="my-alias"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error.message}
        </p>
      )}
    </form>
  );
}
