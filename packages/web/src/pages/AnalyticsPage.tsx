import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, MousePointerClick } from "lucide-react";
import { useAnalytics } from "../hooks/useLinks";
import { AnalyticsCharts } from "../components/AnalyticsCharts";

export function AnalyticsPage() {
  const { code } = useParams<{ code: string }>();
  const { data, isLoading, error } = useAnalytics(code ?? "");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All links
      </Link>

      {isLoading && (
        <p className="text-gray-400 text-sm py-16 text-center">Loading analytics…</p>
      )}

      {error && (
        <p className="text-red-500 text-sm py-16 text-center">{error.message}</p>
      )}

      {data && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-brand-600 text-lg font-semibold">
                    {data.shortUrl}
                  </span>
                </div>
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors truncate"
                >
                  <span className="truncate">{data.originalUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="shrink-0 flex items-center gap-2 bg-brand-50 text-brand-700 rounded-xl px-4 py-2">
                <MousePointerClick className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {data.totalClicks.toLocaleString()}
                  </p>
                  <p className="text-xs text-brand-500">total clicks</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Created {new Date(data.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <AnalyticsCharts analytics={data} />
        </>
      )}
    </div>
  );
}
