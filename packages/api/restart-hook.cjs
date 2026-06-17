// Restart hook — lets you restart the API by hitting a secret URL through IIS.
//
// Why a separate process: it runs `pm2 restart trim-api --update-env`, so it
// must NOT be part of trim-api (that would kill the thing issuing the restart).
// Run it as its own PM2 process:
//   pm2 start restart-hook.cjs --name deploy-hook --update-env
//   pm2 save
//
// Set a secret first (admin PowerShell, persists across reboots):
//   setx HOOK_TOKEN "your-long-random-secret" /M
// then start/restart the hook so it picks up the env var.
//
// Trigger (POST only):
//   curl -X POST "https://linkshortner.microlent.com/__restart?token=your-long-random-secret"

const http = require("http");
const { exec } = require("child_process");

const PORT = process.env.HOOK_PORT || 4002;
const TOKEN = process.env.HOOK_TOKEN || "change-me-please";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  const ok =
    req.method === "POST" &&
    url.pathname === "/restart" &&
    url.searchParams.get("token") === TOKEN;

  if (!ok) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  exec("pm2 restart trim-api --update-env", (err, stdout, stderr) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: stderr || err.message }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, output: stdout.trim() }));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Restart hook listening on http://127.0.0.1:${PORT}`);
});
