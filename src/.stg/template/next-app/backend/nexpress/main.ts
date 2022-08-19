import path from "path";
import dotenv from "dotenv";
import next from "next";
import express from "express";
import expressSession from "express-session";
import helmet from "helmet";
import cors from "cors";
import csrf from "csurf";
import cookieParser from "cookie-parser";
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

  const basePath = process.env.BASE_PATH || "";
  const port = Number(process.env.PORT || (isDev ? 8000 : 80));
  const corsOrigin = process.env.CORS_ORIGIN || undefined;
  const csrfPath = process.env.CSRF_PATH || "/csrf";

  server.use(express.static(path.join(appRoot, "__srcDir__/public")));

  server.use(expressSession({
    name: undefined,
    secret: StringUtils.generateUuidV4(),
    resave: false,
    saveUninitialized: true,
    store: undefined,
    cookie: {
      secure: !isDev,
      httpOnly: !isDev,
      maxAge: 1000 * 60 * 30,
    },
  }));

  server.use(helmet({
    contentSecurityPolicy: !isDev,
    hidePoweredBy: true,
    hsts: true,
    frameguard: true,
    xssFilter: true,
  }));

  if (!isDev) server.set("trust proxy", 1);
  server.disable("x-powered-by");


  const corsProtection = cors({
    origin: corsOrigin,
  });

  const csrfProtection = csrf({
    cookie: true,
  });
  server.use(cookieParser());

  const handler = nextApp.getRequestHandler();  

  server.get(`${basePath}${csrfPath}`, corsProtection, csrfProtection, (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    res.status(204);
    res.send();
  });

  server.all(`${basePath}/api/*`, corsProtection, csrfProtection, (req, res) => {
    log.debug("api call:", req.url);
    return handler(req, res);
  });

  server.all("*", corsProtection, csrfProtection, (req, res) => {
    return handler(req, res);
  });

  server.listen(port, () => {
    log.info(`http://localhost:${port}${basePath}`);
  });
}).catch((err: any) => {
  log.error(String(err));
  process.exit(1);
});