import path from "path";
import next from "next";
import express from "express";
import expressSession from "express-session";
import helmet from "helmet";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import DatetimeUtils from "@bizhermit/basic-utils/dist/datetime-utils";

const isDev = process.argv.find(arg => arg === "-dev") != null;
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
const nextConfig = require(path.join(appRoot, "src/next.config.js")) ?? {};

const nextApp = next({
    dev: isDev,
    dir: path.join(appRoot, "src"),
    conf: {
        basePath: "/__appName__",
        ...nextConfig,
    },
});
(global as any)._basePath = nextApp.options?.conf?.basePath ?? "";

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

    server.use(express.static(path.join(appRoot, "src/public")));

    const handler = nextApp.getRequestHandler();
    server.all("/api/*", (req: any, res: any) => {
        log.info("api call:", req.url);
        return handler(req, res);
    });
    server.all("*", (req: any, res: any) => {
        return handler(req, res);
    });

    const port = isDev ? 8000 : 3000;
    log.info("begin listen", String(port));
    server.listen(port, () => {
        log.info("began listen", String(port));
    });
}).catch((err: any) => {
    log.error(err);
    process.exit(1);
});