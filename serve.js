#!/usr/bin/env node
/** Petit serveur statique local : node serve.js → http://localhost:8757/ */
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 8758;
const MIME = { ".html":"text/html; charset=utf-8", ".json":"application/json; charset=utf-8",
               ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".png":"image/png" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(__dirname, p);
  if (!f.startsWith(__dirname) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("404");
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`→ http://localhost:${PORT}/bracket-c3.html`));
