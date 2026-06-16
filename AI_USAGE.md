# AI Usage

**Tools used:** Claude Code (claude-sonnet-4-6)

---

**Where it helped most:**

- Scaffolding the monorepo boilerplate (turbo.json, pnpm-workspace.yaml, tsconfig targets) — tedious but mechanical; the agent got it right first try.
- Recharts `AreaChart` + `PieChart` composition — I described the data shape and it produced correct chart bindings without me having to look up the Recharts v2 API.
- MongoDB aggregation pipeline for time-series bucketing (`$dateToString` + `$group`) — correct on first pass, which saved reading docs.

---

**Where it got things wrong / where I had to correct it:**

- Initially suggested `express-async-errors` for async error propagation in Express 5, but Express 5 natively handles async errors — the package is only needed for Express 4. Caught this while reviewing the imports and removed the unnecessary dependency.
- Generated a `UA-parser-js` import as a default import (`import UAParser from 'ua-parser-js'`), which is correct for v1 but not for the ESM v2 API. Verified the installed version (^1.0.40) matched the import style before shipping.

---

**One thing I deliberately did NOT delegate to the agent, and why:**

The **301 vs 302 redirect decision** and its analytics implications. This is the kind of reasoning the reviewers specifically called out as a design decision they care about. I wanted to think through browser caching semantics, analytics accuracy trade-offs, and CDN behavior myself — not just accept a confident-sounding answer. The agent would have given a reasonable answer, but I needed to own the reasoning for the live walkthrough.
