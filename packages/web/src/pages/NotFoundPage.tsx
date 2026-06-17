import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Scissors className="w-12 h-12 text-gray-300 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">
        This page or short link doesn't exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
