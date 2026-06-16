import { useState } from "react";
import { Scissors } from "lucide-react";
import { CreateLinkForm } from "../components/CreateLinkForm";
import { LinkTable } from "../components/LinkTable";
import { CreatedLinkBanner } from "../components/CreatedLinkBanner";
import { useLinks } from "../hooks/useLinks";
import type { LinkItem } from "../types";

export function HomePage() {
  const { data: links, isLoading, error } = useLinks();
  const [lastCreated, setLastCreated] = useState<LinkItem | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <header className="flex items-center gap-3 mb-8">
        <div className="bg-brand-600 text-white rounded-xl p-2">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trim</h1>
          <p className="text-sm text-gray-500">Short links, real analytics</p>
        </div>
      </header>

      <CreateLinkForm onCreated={setLastCreated} />

      {lastCreated && (
        <CreatedLinkBanner link={lastCreated} onDismiss={() => setLastCreated(null)} />
      )}

      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Your links</h2>
        {isLoading && (
          <p className="text-gray-400 text-sm py-8 text-center">Loading…</p>
        )}
        {error && (
          <p className="text-red-500 text-sm py-8 text-center">{error.message}</p>
        )}
        {links && <LinkTable links={links} />}
      </section>
    </div>
  );
}
