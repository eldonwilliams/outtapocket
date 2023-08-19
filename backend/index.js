"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const jstates_1 = require("jstates");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_2 = require("express");
const crypto_1 = require("crypto");
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
const games = (0, jstates_1.createState)({});
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        callback(null, origin);
    },
    credentials: true,
}));
app.use((0, express_2.json)());
app.use((0, cookie_parser_1.default)());
app.post("/host", (req, res) => {
    const uuid = (0, crypto_1.randomUUID)();
    const masterPassword = (0, crypto_1.randomUUID)();
    games.setState((old) => {
        old[uuid] = {
            players: (0, jstates_1.createState)([]),
            joinable: true,
            scores: {},
            currentRound: (0, jstates_1.createState)(0),
            responses: [],
            masterPassword,
        };
        return old;
    });
    const code = uuid.slice(0, 6);
    res.cookie("master", masterPassword, { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "none", httpOnly: true });
    res.cookie("session", uuid, { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "none", httpOnly: true });
    res.status(200).json({ code, message: "ok" });
});
app.post("/join", (req, res) => {
    var _a, _b;
    const code = req.body.code;
    if (!code) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }
    if (!req.body.name) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }
    const uuid = Object.keys((_a = games.state) !== null && _a !== void 0 ? _a : {}).find((key) => key.startsWith(code));
    if (typeof uuid === "undefined" || !(uuid in ((_b = games.state) !== null && _b !== void 0 ? _b : {}))) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const game = games.state[uuid];
    if (!game.joinable) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    game.players.setState((old) => {
        old.push(req.body.name);
        return old;
    });
    res.cookie("session", uuid, { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "none", httpOnly: true });
    res.status(200).json({ message: "ok" });
});
app.post("/leave", (req, res) => {
    res.clearCookie("session");
    res.clearCookie("master");
    res.status(200).json({ message: "ok" });
});
app.get("/session", (req, res) => {
    var _a;
    if (!req.cookies.session) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!(req.cookies.session in ((_a = games.state) !== null && _a !== void 0 ? _a : {}))) {
        res.status(401).json({ message: "Unauthorized (DNE)" });
        return;
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const game = games.state[req.cookies.session];
    // inital
    res.write(`event: players_change\n`);
    res.write(`data: ${JSON.stringify({ players: game.players.state })}\n\n`);
    res.write(`event: round_change\n`);
    res.write(`data: ${JSON.stringify({ round: game.currentRound.state })}\n\n`);
    res.write(`event: master_state\n`);
    res.write(`data: ${JSON.stringify({ master: req.cookies.master === game.masterPassword })}\n\n`);
    game.players.subscribe((players) => {
        res.write(`event: players_change\n`);
        res.write(`data: ${JSON.stringify({ players })}\n\n`);
    });
    game.currentRound.subscribe((round) => {
        res.write(`event: round_change\n`);
        res.write(`data: ${JSON.stringify({ round })}\n\n`);
    });
});
app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "9876", () => {
    var _a;
    console.log(`Server up on #${(_a = process.env.PORT) !== null && _a !== void 0 ? _a : "9876"}`);
});
