import { Router, Request, Response, NextFunction } from "express";
import UAParser from "ua-parser-js";
import { Link } from "../models/Link";
import { ClickEvent } from "../models/ClickEvent";
import { createError } from "../middleware/errorHandler";
import { getCached, setCache } from "../utils/redirectCache";

const router = Router();

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
        return next(createError("Short link not found", 404));
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

    // 302: intentional — 301 is cached by browsers, killing analytics accuracy
    res.redirect(302, originalUrl);
  } catch (err) {
    next(err);
  }
});

export default router;
