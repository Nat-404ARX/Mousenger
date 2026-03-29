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
        <h2 className="title">Mousenger</h2>

        <input
          id="usernameInput"
          placeholder="Ton Pseudo"
          value={name}
          className="inputPseudo"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          id="passwordInput"
          placeholder="Ton Mot de Passe"
          className="inputPseudo"
          type="password"
        />

        <button onClick={handleLogin} className="submit">
          Login
        </button>
      </div>
    );
}
