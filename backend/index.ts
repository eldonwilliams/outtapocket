import express from "express";
import { config } from "dotenv";
import { JstateInstance, createState } from "jstates";
import cookie from "cookie-parser";
import { json } from "express";
import { randomUUID } from "crypto";
import cors from "cors";
config();

type Game = {
    players: JstateInstance;
    joinable: boolean;
    scores: Record<string, number>;
    currentRound: JstateInstance;
    responses: Record<string, string>[][];
    masterPassword: string;
}

const games = createState({});

const app = express();
app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin);
    },
    credentials: true,
}));
app.use(json());
app.use(cookie());

app.post("/host", (req, res) => {
    const uuid: string = randomUUID();
    const masterPassword: string = randomUUID();
    games.setState((old: Record<string, any>) => {
        old[uuid] = {
            players: createState([]) as unknown,
            joinable: true,
            scores: {},
            currentRound: createState(0),
            responses: [],
            masterPassword,
        } as Game;
        return old;
    });

    const code = uuid.slice(0, 6);
    res.cookie("master", masterPassword, { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "none", httpOnly: true, secure: true, });
    res.cookie("session", uuid, { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "none", httpOnly: true, secure: true, });
    res.status(200).json({ code, message: "ok" });
});

app.post("/join", (req, res) => {
    const code = req.body.code;
    if (!code) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    if (!req.body.name) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    const uuid = Object.keys(games.state ?? {}).find((key) => key.startsWith(code));
    if (typeof uuid === "undefined" || !(uuid in (games.state ?? {}))) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const game = (games.state as Record<string, any>)[uuid] as Game;

    if (!game.joinable) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    game.players.setState((old: string[]) => {
        old.push(req.body.name);
        return old;
    });

    res.cookie("session", uuid, { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "none", httpOnly: true, secure: true, });
    res.status(200).json({ message: "ok" });
});

app.post("/leave", (req, res) => {
    res.clearCookie("session");
    res.clearCookie("master");
    res.status(200).json({ message: "ok" });
});

app.get("/session", (req, res) => {
    if (!req.cookies.session) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!(req.cookies.session in (games.state ?? {}))) {
        res.status(401).json({ message: "Unauthorized (DNE)" });
        return;
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const game = (games.state as Record<string, any>)[req.cookies.session] as Game;

    // inital
    res.write(`event: players_change\n`);
    res.write(`data: ${JSON.stringify({ players: game.players.state })}\n\n`);
    res.write(`event: round_change\n`);
    res.write(`data: ${JSON.stringify({ round: game.currentRound.state })}\n\n`);
    res.write(`event: master_state\n`);
    res.write(`data: ${JSON.stringify({ master: req.cookies.master === game.masterPassword })}\n\n`);

    game.players.subscribe((players: string[]) => {
        res.write(`event: players_change\n`);
        res.write(`data: ${JSON.stringify({ players })}\n\n`);
    });

    game.currentRound.subscribe((round: number) => {
        res.write(`event: round_change\n`);
        res.write(`data: ${JSON.stringify({ round })}\n\n`);
    });
});

app.listen(process.env.PORT ?? "9876", () => {
    console.log(`Server up on #${process.env.PORT ?? "9876"}`);
});