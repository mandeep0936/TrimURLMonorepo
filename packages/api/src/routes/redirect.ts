import { Router, Request, Response, NextFunction } from "express";
import UAParser from "ua-parser-js";
import { Link } from "../models/Link";
import { ClickEvent } from "../models/ClickEvent";
import { createError } from "../middleware/errorHandler";
import { getCached, setCache } from "../utils/redirectCache";

const router = Router();

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

    // 302 (Found), not 301: a 301 is cached permanently by browsers, so repeat
    // visits skip the server and the click is never recorded. 302 keeps analytics accurate.
    res.redirect(302, originalUrl);
  } catch (err) {
    next(err);
  }
});

export default router;
