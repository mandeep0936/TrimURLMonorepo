import { Router, Request, Response, NextFunction } from "express";
import { Link } from "../models/Link";
import { ClickEvent } from "../models/ClickEvent";
import { generateUniqueCode, isSafeUrl } from "../utils/shortCode";
import { createError } from "../middleware/errorHandler";

const router = Router();

// POST /api/links — create a short link
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, alias } = req.body as { url?: string; alias?: string };

    if (!url || typeof url !== "string" || url.trim() === "") {
      return next(createError("url is required", 400));
    }

    const trimmedUrl = url.trim();

    if (!isSafeUrl(trimmedUrl)) {
      return next(
        createError(
          "Only http:// and https:// URLs are allowed",
          422
        )
      );
    }

    let code: string;

    if (alias) {
      const safeAlias = alias.trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,30}$/.test(safeAlias)) {
        return next(
          createError(
            "Alias must be 3–30 characters: letters, numbers, hyphens, underscores",
            422
          )
        );
      }
      const taken = await Link.exists({ code: safeAlias });
      if (taken) {
        return next(createError(`Alias "${safeAlias}" is already taken`, 409));
      }
      code = safeAlias;
    } else {
      code = await generateUniqueCode();
    }

    const link = await Link.create({ originalUrl: trimmedUrl, code, alias: alias?.trim() });

    const baseUrl = process.env.BASE_URL ?? "http://localhost:4000";

    res.status(201).json({
      id: link._id,
      code: link.code,
      originalUrl: link.originalUrl,
      shortUrl: `${baseUrl}/${link.code}`,
      clickCount: link.clickCount,
      createdAt: link.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/links — list all links
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 }).lean();
    const baseUrl = process.env.BASE_URL ?? "http://localhost:4000";

    res.json(
      links.map((l) => ({
        id: l._id,
        code: l.code,
        originalUrl: l.originalUrl,
        shortUrl: `${baseUrl}/${l.code}`,
        clickCount: l.clickCount,
        createdAt: l.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/links/:code/analytics — per-link analytics
router.get("/:code/analytics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link = await Link.findOne({ code: req.params.code }).lean();
    if (!link) return next(createError("Link not found", 404));

    // Time series: clicks grouped by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [timeSeries, referrerBreakdown, deviceBreakdown] = await Promise.all([
      ClickEvent.aggregate([
        {
          $match: {
            linkId: link._id,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } },
      ]),

      ClickEvent.aggregate([
        { $match: { linkId: link._id } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { referrer: "$_id", count: 1, _id: 0 } },
      ]),

      ClickEvent.aggregate([
        { $match: { linkId: link._id } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { device: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    const baseUrl = process.env.BASE_URL ?? "http://localhost:4000";

    res.json({
      id: link._id,
      code: link.code,
      originalUrl: link.originalUrl,
      shortUrl: `${baseUrl}/${link.code}`,
      totalClicks: link.clickCount,
      createdAt: link.createdAt,
      timeSeries,
      referrerBreakdown,
      deviceBreakdown,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
