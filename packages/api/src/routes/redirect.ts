import { Router, Request, Response, NextFunction } from "express";
import UAParser from "ua-parser-js";
import { Link } from "../models/Link";
import { ClickEvent } from "../models/ClickEvent";
import { createError } from "../middleware/errorHandler";
import { getCached, setCache } from "../utils/redirectCache";

const router = Router();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Redirect to the target via an HTML body (meta refresh + JS) instead of a 302
// Location header. Behind IIS/ARR, a server 302's Location host gets rewritten
// to our own domain (stripping the real target host); sending the target in the
// body bypasses that. The "click" is still recorded server-side before this runs,
// so analytics stay accurate.
function sendHtmlRedirect(res: Response, target: string): void {
  const safe = escapeHtml(target);
  res
    .status(200)
    .set("Content-Type", "text/html; charset=utf-8")
    .set("Cache-Control", "no-store")
    .send(
      `<!DOCTYPE html><html><head><meta charset="utf-8">` +
        `<meta http-equiv="refresh" content="0; url=${safe}">` +
        `<script>window.location.replace(${JSON.stringify(target)})</script>` +
        `<title>Redirecting…</title></head>` +
        `<body>Redirecting to <a href="${safe}">${safe}</a>…</body></html>`
    );
}

// Graceful 404 for an unknown short code.
// Browsers are redirected to the React app's /not-found page (consistent UI);
// API clients (Accept: application/json) get the consistent JSON error shape.
function respondNotFound(req: Request, res: Response, next: NextFunction): void {
  if (req.accepts(["html", "json"]) === "html") {
    const clientUrl = process.env.CLIENT_URL ?? "";
    return res.redirect(302, `${clientUrl}/not-found`);
  }
  next(createError("Short link not found", 404));
}

router.get("/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.params["code"] as string;

    // Try in-memory cache first
    let originalUrl = getCached(code);

    const rawReferer = req.headers.referer ?? req.headers.referrer;
    const referrerHeader = Array.isArray(rawReferer) ? rawReferer[0] : rawReferer;
    const referrer =
      typeof referrerHeader === "string" && referrerHeader
        ? new URL(referrerHeader).hostname
        : "direct";
    const rawUa = req.headers["user-agent"];
    const uaString = Array.isArray(rawUa) ? rawUa[0] : (rawUa ?? "");

    if (!originalUrl) {
      const link = await Link.findOne({ code });
      if (!link) {
        return respondNotFound(req, res, next);
      }
      originalUrl = link.originalUrl;
      setCache(code, originalUrl);

      // Fire-and-forget analytics write — don't block the redirect
      const ua = new UAParser(uaString);

      Link.findOneAndUpdate({ code }, { $inc: { clickCount: 1 } }).exec();
      ClickEvent.create({
        linkId: link._id,
        referrer,
        userAgent: uaString,
        deviceType: ua.getDevice().type ?? "desktop",
        browser: ua.getBrowser().name ?? "unknown",
        os: ua.getOS().name ?? "unknown",
      });
    } else {
      // Cache hit — still record the click asynchronously
      const link = await Link.findOne({ code }, "_id").lean();
      if (link) {
        const ua = new UAParser(uaString);

        Link.findOneAndUpdate({ code }, { $inc: { clickCount: 1 } }).exec();
        ClickEvent.create({
          linkId: link._id,
          referrer,
          userAgent: uaString,
          deviceType: ua.getDevice().type ?? "desktop",
          browser: ua.getBrowser().name ?? "unknown",
          os: ua.getOS().name ?? "unknown",
        });
      }
    }

    // HTML-body redirect (not a 302) so IIS/ARR can't rewrite the target host.
    sendHtmlRedirect(res, originalUrl);
  } catch (err) {
    next(err);
  }
});

export default router;
