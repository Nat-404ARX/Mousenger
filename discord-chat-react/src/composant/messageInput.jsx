import { useState, useEffect, useRef } from "react";
import envoyer from "../assets/envoyer.svg";

export default function MessageInput({ onSend, onTyping }) {
    const [text, setText] = useState("");

    const bottomRef = useRef(null);

    const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");

    if (onTyping) {
        onTyping(false);
    }
};

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    return (
        <div className="messageInputContainer">
        <input
            className="messageInput"
            placeholder="Votre Message..."
            value={text}
            onChange={(e) => {
                const value = e.target.value;
                setText(value);

                if (onTyping) {
                    onTyping(value.length > 0);
                }
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSend();
                }
            }}
        />

            <button className="EnvoyerButton" onClick={handleSend}><img src={envoyer} className="envoyerIcon"/></button>
        </div>
    );
}
