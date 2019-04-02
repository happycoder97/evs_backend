import express from "express";
import mongodb from "mongodb";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { Saved, Official, ShopOwner, CollectedWaste, Persistence } from "./persistence";
import { PersistenceMongo, IdType } from "./persistence_mongo";
import https from "https";
import fs from "fs";
import cookie_session from "cookie-session";
import body_parser from "body-parser";
import multer from "multer";

import hb from "express-handlebars";
dotenv.config();

declare global {
    namespace Express {
        export interface Request {
            user: { val: (ShopOwner | Official) & Saved<IdType>, is_official: boolean } | undefined;
        }
    }
}

async function main() {
    const app = express();
    const port = 3000;
    const db_client = await mongodb.connect(process.env.DB_URL);
    const db = db_client.db(process.env.DB_NAME);
    const persistence: Persistence<IdType> = new PersistenceMongo(db);

    const cookie_keys = ["kingdom phylum class and order family genus species"];

    const private_key = fs.readFileSync("./sslcert/server.key", "utf8");
    const certificate = fs.readFileSync("./sslcert/server.crt", "utf8");
    const credentials = { key: private_key, cert: certificate };

    const upload = multer({ dest: "uploads/" });

    app.engine("handlebars", hb());

    app.set('view engine', 'handlebars');
    app.set('views', __dirname + '/public'); // you can change '/views' to '/public',


    app.use(body_parser.json());
    app.use(body_parser.urlencoded({ extended: true }));

    app.use(express.static("public"));

    app.set("trust proxy", 1); // trust first proxy

    app.use(cookie_session({
        name: "session",
        keys: cookie_keys,
        maxAge: 1000 * 60 * 60 * 24,
        // signed: true,
    }));

    app.use(async (req, res, next) => {
        if (req.session.username) {
            const shop_owner = await persistence.shop_owner_get(req.session.username);
            if (shop_owner) {
                req.user = { val: shop_owner, is_official: false };
                next();
                return;
            }

            const official = await persistence.official_get(req.session.username);
            if (official) {
                req.user = { val: official, is_official: true };
            }
        }
        next();
    });

    app.get("/", (req, res) => {
        if (req.user) {
            res.redirect("/wastes");
        } else {
            res.redirect("/login.html");
        }
    });

    app.get("/wastes", async (req, res) => {
        const wastes = await persistence.collected_waste_get_all(undefined);
        console.log(wastes);
        res.render("wastes", { user: req.user.val.name, wastes });
    });

    app.get("/api", (req: Request, res: Response) => {
        req.session.username = "admin1";
        res.send("EVS Project Backend REST API");
    });

    app.post("/api/login", async (req: Request, res: Response) => {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            res.status(400).send({
                err: "Expected `username` and `password`",
            });
            return;
        }

        console.log(username);

        const shop_owner = await persistence.shop_owner_get(username);
        if (shop_owner && shop_owner.password === password) {
            req.session.username = username;
            res.status(200).send({
                msg: `Logged in as shop owner.`,
            });
            return;
        }

        console.log(username);
        const official = await persistence.official_get(username);
        if (official && official.password === password) {
            req.session.username = username;
            res.status(200).send({
                msg: `Logged in as official.`,
            });
        }
        res.redirect("/login.html");

    });

    app.post("/api/signup", async (req: Request, res: Response) => {
        const type = req.body.type;
        console.log(req.body);
        if (!type || (type !== "official" && type !== "shop_owner")) {
            res.status(400).send({
                err: "Expected type = \"official\" | \"shop_owner\"",
            });
            return;
        }

        if (type === "official") {
            const { username, password, name } = req.body;
            if (!username || !password || !name) {
                res.status(400).send({
                    err: "Expected username, password and name",
                });
                return;
            }

            await persistence.official_signup({ username, password, name });
            req.session.username = username;

        } else if (type === "shop_owner") {
            const { username, password, name, address } = req.body;
            if (!username || !password || !name || !address) {
                res.status(400).send({
                    err: "Expected username, password, name and address",
                });
                return;
            }

            await persistence.shop_owner_signup({ username, password, name, address });
            req.session.username = username;
        }
        res.status(200).send({
            msg: "Success",
        });
    });

    app.get("/api/get_wastes/", async (req: Request, res: Response) => {
        console.log(req.user);
        if (!req.user) {
            res.status(403).send({ err: "Please login to view this page." });
            return;
        }
        let wastes: Array<CollectedWaste & Saved<IdType>> = [];
        if (req.user.is_official) {
            wastes = await persistence.collected_waste_get_all(undefined);
        } else {
            wastes = await persistence.collected_waste_get_all(req.user.val);
        }

        res.status(200).send({
            msg: "Success",
            wastes:
                wastes.map((w) => ({ id: w.id.toHexString(), mrp: w.mrp, refunded: w.refunded })),

        });
    });

    app.post("/api/wastes", async (req: Request, res: Response) => {
        if (!req.user) {
            res.status(403).send({ err: "Please login to view this page." });
            return;
        }

        // if (req.user.is_official) {
        //     res.status(403).send({ err: "Only shop owners can submit wastes." });
        //     return;
        // }


        const { title, mrp, refunded } = req.body;
        if (!mrp || !refunded) {
            res.status(400).send({
                err: "Expected mrp, refunded",
            });
            return;
        }

        const saved = await persistence.collected_waste_save(req.user.val, { title, mrp, refunded });

        res.redirect("/wastes");
    });

    const https_server = https.createServer(credentials, app);
    https_server.listen(port, () => console.log(`EVS Project Backend REST API on port ${port}!`));
}

main().catch((err) => {
    console.log("::MAIN ERR::");
    console.log(err);
});

