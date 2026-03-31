import { useState, useEffect, useRef } from "react";
import envoyer from "../assets/envoyer.svg";
import EmojiPicker from "./emojiPicker";

export default function MessageInput({ onSend, onTyping, editText, clearEdit, channelId }) {
    const [text, setText] = useState("");

    const bottomRef = useRef(null);

    const fileRef = useRef(null);

    const [showEmoji, setShowEmoji] = useState(false);

    const addEmoji = (emoji) => {
        setText((prev) => prev + emoji);
    };

    const handleSend = () => {
        if (!text.trim()) return;

            onSend(text);
            setText("");

        if (clearEdit) clearEdit();

        if (onTyping) {
            onTyping(false);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (editText) {
            setText(editText);
        }
    }, [editText]);

    
    useEffect(() => {
        const handleClick = () => setShowEmoji(false);
        window.addEventListener("click", handleClick);

        return () => window.removeEventListener("click", handleClick);
    }, []);
    

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            await fetch(`http://localhost:3001/send-image/${channelId}`, {
            method: "POST",
            body: formData,
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="messageInputContainer">
            <div className="messageInputInfo">
                <div className="boutonsInput">
                    <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={handleFile}
                    />

                    <button
                    className="FileButton"
                    onClick={() => fileRef.current.click()}
                    >
                    📎
                    </button>

                    <button
                    className="EmojiButton"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowEmoji(!showEmoji);
                    }}
                    >
                    😀​
                    </button>
                    {showEmoji && (
                    <EmojiPicker onSelect={addEmoji} />
                    )}
            </div>
            {editText && <div className="editBanner">Modification en cours</div>}
            <input
                id="messageInput"
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
            </div>

            <button className="EnvoyerButton" onClick={handleSend}>
            <img src={envoyer} className="envoyerIcon" />
            </button>
        </div>
    );
}
