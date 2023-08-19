import { useEffect, useState } from 'react';
import '../App.css';
import { redirect } from 'react-router';

export default function Join() {
    const [code, setCode] = useState<string>("");

    useEffect(() => {
        if (code.includes(" ")) {
            setCode(code.replace(" ", ""));
        }

        if (code.length > 6) {
            setCode(code.substring(0, 6));
        }
    }, [code]);

    const join = () => {
        fetch(import.meta.env.VITE_OP_API + "/join", {
            method: "POST",
            credentials: "include",
            cache: "no-cache",
        }).then((res) => {
            if (res.status === 200) {
                redirect("/session");
            }
        });
    }

    return (
        <div className="cont">
            <div className="card">
                <h1>Join</h1>
                <input
                    placeholder="Enter a session code."
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                />
                <button onClick={join}>Join</button>
            </div>
        </div>
    );
}