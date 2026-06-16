import axios from "axios";
import type { LinkItem, LinkAnalytics, CreateLinkPayload } from "../types";

// In dev, VITE_API_URL is unset and requests hit "/api" via the Vite proxy.
// In production (Vercel), set VITE_API_URL to the Render backend origin.
const API_ORIGIN = import.meta.env.VITE_API_URL ?? "";

const http = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error?.message ?? err.message ?? "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  createLink: async (payload: CreateLinkPayload): Promise<LinkItem> => {
    const { data } = await http.post<LinkItem>("/links", payload);
    return data;
  },

  getLinks: async (): Promise<LinkItem[]> => {
    const { data } = await http.get<LinkItem[]>("/links");
    return data;
  },

  getAnalytics: async (code: string): Promise<LinkAnalytics> => {
    const { data } = await http.get<LinkAnalytics>(`/links/${code}/analytics`);
    return data;
  },
};
