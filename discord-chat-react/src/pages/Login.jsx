import { useState } from "react";
import "../styles/Login.css";

export default function Login({ onLogin }) {
    const [name, setName] = useState("");

    const handleLogin = () => {
        if (!name.trim()) return;
        localStorage.setItem("username", name);
        onLogin(name);
    };

    return (
        <div className="login">
        <h2>Mousenger</h2>

        <input
            placeholder="Ton pseudo"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />

        <button onClick={handleLogin}>Entrer</button>
        </div>
    );
}
