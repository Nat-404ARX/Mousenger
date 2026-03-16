import { useState, useEffect, useRef } from "react";
import ChatHeader from "../composant/Header";
import MessageList from "../composant/messageList";
import MessageInput from "../composant/messageInput";
import Mascot from "../composant/Mouse";
import "../styles/Chat.css";
import axios from "axios";
import { io } from "socket.io-client";
import { playSound } from "../services/sonnerie";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [serverStructure, setServerStructure] = useState([]);

    const socketRef = useRef(null);

    const username = localStorage.getItem("username");


    console.log("Connecté en tant que", username);

    useEffect(() => {
        socketRef.current = io("http://localhost:3001");

        socketRef.current.on("newMessage", (msg) => {
          if (msg.text.includes("@","/","|")) {
            console.log("Message Intercepté : ", msg.text);
          } else {
            setMessages((prev) => [...prev, msg]);
            playSound("squeak.mp3");
          }
        });
        return () => {
        socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        axios.get("http://localhost:3001/messages").then((res) => {
        setMessages(res.data.sort((a, b) => a.id - b.id));
        });
    }, []);

    useEffect(() => {
        axios.get("http://localhost:3001/channel-info").then((res) => {
        setChannelName(res.data.name);
        });
    }, []);

    useEffect(() => {
        axios.get("http://localhost:3001/server-structure").then((res) => {
            setServerStructure(res.data);
        });
    }, []);

    const sendMessage = async (text) => {
        const newMessage = {
        id: Date.now(),
        author: username,
        text,
        type: "user",
        };

        setMessages((prev) => [...prev, newMessage]);

        await axios.post("http://localhost:3001/send-message", {
        message: text,
        author: username,
        type: "user",
        });
    };

    const deleteMessage = async (messageId) => {
        await fetch(`http://localhost:3001/deleteMessage/${messageId}`, {
            method: "DELETE",
        });

        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    function logout() {
        localStorage.removeItem("username");
        window.location.href = "/";
    }

    return (
      <div className="chatContainer">
        <div className="chatLeftColumn">
          <button className="Btn" onClick={logout}>
            Logout
          </button>
          <div className="salonList">
            {serverStructure.map((category) => (
              <div key={category.id} className="salonCategory">
                <div className="salonCategoryTitle">{category.name}</div>

                {category.channels.map((channel) => (
                  <div key={channel.id} className="salonItem">
                    # {channel.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="chatMain">
          <ChatHeader username={username} channel={channelName} />

          <div className="chatBody">
            <MessageList messages={messages} onDeleteMessage={deleteMessage} />
          </div>

          <div className="chatFooter">
            <MessageInput onSend={sendMessage} />
            <Mascot />
          </div>
        </div>

        <div className="chatRightColumn">
          <div className="userListTitle">Utilisateurs connectés</div>

          <div className="userItem">{username}</div>
        </div>
      </div>
    );
}