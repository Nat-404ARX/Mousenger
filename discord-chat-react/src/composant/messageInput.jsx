import { useState, useEffect, useRef } from "react";
import envoyer from "../assets/envoyer.svg";

export default function MessageInput({ onSend }) {
    const [text, setText] = useState("");

    const bottomRef = useRef(null);

    const handleSend = () => {
        if (!text.trim()) return;

        onSend(text);
        setText("");
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    return (
        <div className="messageInputContainer">
            <input
                className="messageInput"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    handleSend();
                    }
                }}
                placeholder="Écrire un message..."
            />

            <button className="EnvoyerButton" onClick={handleSend}><img src={envoyer} className="envoyerIcon"/></button>
        </div>
    );
}

