import path from "path";
import dotenv from "dotenv";
import next from "next";
import express from "express";
import expressSession from "express-session";
import helmet from "helmet";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import DatetimeUtils from "@bizhermit/basic-utils/dist/datetime-utils";

const isDev = process.argv.includes("-d");
dotenv.config({
  debug: isDev,
});

const logFormat = (...contents: Array<string>) => `${DatetimeUtils.format(new Date(), "yyyy-MM-ddThh:mm:ss.SSS")} ${StringUtils.join(" ", ...contents)}\n`;
const log = {
  debug: (...contents: Array<string>) => {
    if (!isDev) return;
    process.stdout.write(logFormat(...contents));
  },
  info: (...contents: Array<string>) => {
    process.stdout.write(logFormat(...contents));
  },
  error: (...contents: Array<string>) => {
    process.stderr.write(logFormat(...contents));
  },
};

log.info(`::: __appName__ :::${isDev ? " [dev]" : ""}`);

const appRoot = path.join(__dirname, "../");
const nextApp = next({
  dev: isDev,
  dir: appRoot,
});
log.debug("app root: ", appRoot);

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

  server.use(express.static(path.join(appRoot, "next/public")));

  const handler = nextApp.getRequestHandler();
  const basePath = process.env.API_BASE_PATH || "";
  server.all(`${basePath}/api/*`, (req, res) => {
    log.debug("api call:", req.url);
    return handler(req, res);
  });
  server.all("*", (req, res) => {
    return handler(req, res);
  });

  const port = Number(process.env.API_PORT || (isDev ? 8000 : 80));
  server.listen(port, () => {
    log.info(`http://localhost:${port}${basePath}`);
  });
}).catch((err: any) => {
  log.error(String(err));
  process.exit(1);
});