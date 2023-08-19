import { useEffect, useState } from 'react';
import '../App.css';

export default function Session() {
    const [players, setPlayers] = useState<string[]>([]);
    const [round, setRound] = useState<number>(0);
    const [master, setMaster] = useState<boolean>(false);

    // make a request to backend server side request /session to start session, we can assume we are logged in
    useEffect(() => {
        const eventSource = new EventSource(import.meta.env.VITE_OP_API + "/session", {
            withCredentials: true,
        });

        eventSource.onmessage = (event) => {
            if (event.type === "players_change") {
                setPlayers(JSON.parse(event.data.players));
            } else if (event.type === "round_change") {
                setRound(JSON.parse(event.data.round));
            } else if (event.type === "master_state") {
                setMaster(JSON.parse(event.data.master));
            }
        }
    }, []);

    return (
        <div className="cont">
            <div className="card">
                <h1>Session</h1>
                <h2>Players</h2>
                <ul>
                    {players.map((player, index) => {
                        return <li key={index}>{player}</li>
                    })}
                </ul>
                <h2>Round</h2>
                <p>{round}</p>
                <h2>Master</h2>
                <p>{master ? "Yes" : "No"}</p>
            </div>
        </div>
    );
}