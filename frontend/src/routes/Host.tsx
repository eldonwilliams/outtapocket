import { redirect } from 'react-router';
import '../App.css';

export default function Host() {
    const host = () => {
        fetch(import.meta.env.VITE_OP_API + "/host", {
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
                <h1>Host</h1>
                <button onClick={host}>Start a new game.</button>
            </div>
        </div>
    );
}