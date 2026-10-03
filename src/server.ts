import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { CONFIG } from "./lib/config";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = CONFIG.APP_PORT;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Delcom Posts ready on http://localhost:${port}`);
  });
});
