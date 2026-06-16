export interface LinkItem {
  id: string;
  code: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface ReferrerPoint {
  referrer: string;
  count: number;
}

export interface DevicePoint {
  device: string;
  count: number;
}

export interface LinkAnalytics extends LinkItem {
  totalClicks: number;
  timeSeries: TimeSeriesPoint[];
  referrerBreakdown: ReferrerPoint[];
  deviceBreakdown: DevicePoint[];
}

export interface CreateLinkPayload {
  url: string;
  alias?: string;
}
