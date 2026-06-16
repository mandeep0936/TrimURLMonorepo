/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API origin, e.g. https://trimurlmonorepo.onrender.com (empty in dev to use the Vite proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
