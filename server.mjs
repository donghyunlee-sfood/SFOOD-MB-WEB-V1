import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";

const PORT = Number(process.env.PORT || 4173);
const API_HOST = process.env.API_HOST || "localhost";
const API_PORT = Number(process.env.API_PORT || 8080);
const ROOT = process.cwd();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer((request, response) => {
  if ((request.url || "").startsWith("/api/")) {
    const proxyRequest = http.request(
      {
        hostname: API_HOST,
        port: API_PORT,
        path: request.url,
        method: request.method,
        headers: {
          ...request.headers,
          host: `${API_HOST}:${API_PORT}`
        }
      },
      (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
        proxyResponse.pipe(response);
      }
    );

    proxyRequest.on("error", (error) => {
      response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ message: `API proxy error: ${error.message}` }));
    });

    request.pipe(proxyRequest);
    return;
  }

  const rawPath = request.url === "/" ? "/index.html" : request.url || "/index.html";
  const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(ROOT, safePath);

  if (!existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  const ext = extname(filePath);
  response.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
});

server.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}`);
});
