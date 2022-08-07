import path from "path";
import dotenv from "dotenv";
import next from "next";
import express from "express";
import expressSession from "express-session";
import helmet from "helmet";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";

const isDev = process.argv.includes("--dev");
dotenv.config({
  debug: isDev,
});

const nextApp = next({
  dev: isDev,
  dir: path.join(__dirname, "../../next"),
});

nextApp.prepare().then(async () => {
  const server = express();

  server.use(expressSession({
    name: undefined,
    secret: StringUtils.generateUuidV4(),
    resave: false,
    saveUninitialized: true,
    store: undefined,
    cookie: {
      secure: !isDev,
      httpOnly: !isDev,
      domain: "example.com",
      maxAge: 1000 * 60 * 30,
    },
  }));
  if (!isDev) {
    server.set("trust proxy", 1);
  }

  server.use(helmet({
    contentSecurityPolicy: !isDev,
    hidePoweredBy: true,
    hsts: true,
    frameguard: true,
    xssFilter: true,
  }));
  server.disable("x-powered-by");

  const handler = nextApp.getRequestHandler();
  const basePath = process.env.API_BASE_PATH || "";
  server.all(`${basePath}/api/*`, (req, res) => {
    return handler(req, res);
  });
  server.all("*", (req, res) => {
    return handler(req, res);
  });

  const port = Number(process.env.API_PORT || 8000);
  server.listen(port, () => {
    process.stdout.write(`server: http://localhost:${port}${basePath}\n`);
  });
}).catch((err: any) => {
  process.stderr.write(String(err));
  process.exit(1);
});