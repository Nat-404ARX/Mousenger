import { useState, useEffect, useRef } from "react";
import ChatHeader from "../composant/Header";
import MessageList from "../composant/messageList";
import MessageInput from "../composant/messageInput";
import Mascot from "../composant/Mouse";
import UserList from "../composant/userList";
import "../styles/Chat.css";
import axios from "axios";
import { io } from "socket.io-client";
import { playSound } from "../services/sonnerie";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [serverStructure, setServerStructure] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [guildId, setGuildId] = useState(null);
  const [mascotState, setMascotState] = useState("idle");

  const socketRef = useRef(null);

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!currentChannel || !socketRef.current) return;

    socketRef.current.emit("joinChannel", currentChannel);
    setMessages([]);
  }, [currentChannel]);

  useEffect(() => {
    if (!currentChannel) return;

    axios
      .get(`http://localhost:3001/messages/${currentChannel}`)
      .then((res) => {
        setMessages(
          res.data.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i),
        );
      });
  }, [currentChannel]);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    return () => {
      socketRef.current.disconnect();
    };
  }, []);


  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleNewMessage = (msg) => {
      if (msg.channelId !== currentChannel) return;

      if (msg.author === username) {
        msg.type = "user";
      }

      let invalide = false;
      const filtre = ["@","|","/"];

      filtre.forEach(element => {
        if (msg.text.includes(element)) {
          invalide = true;
        }
      });

      if (invalide) {
        console.log("Message Intercepté : ", msg.text);
      } else {
        setMessages((prev) => addMessageSafe(prev, msg));

        if (msg.author !== username && msg.author !== "Mouse" && msg.type !== "bot") {
          playSound("squeak.mp3");

          setMascotState("react");

          setTimeout(() => {
            setMascotState("idle");
          }, 5000);
        }
      }
    };

    const handleDelete = (messageId) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("deleteMessage", handleDelete);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("deleteMessage", handleDelete);
    };
  }, [currentChannel]);


  useEffect(() => {
    axios.get("http://localhost:3001/channel-info").then((res) => {
      setChannelName(res.data.name);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/server-structure").then((res) => {
      setServerStructure(res.data);

      if (res.data.length > 0) {
        setGuildId(res.data[0].guildId); 

        if (res.data[0].channels.length > 0) {
          setCurrentChannel(res.data[0].channels[0].id);
          setChannelName(res.data[0].channels[0].name);
        }
      }
    });
  }, []);


  // const sendMessage = async (text) => {
  //   await axios.post(`http://localhost:3001/send-message/${currentChannel}`, {
  //     message: text,
  //     author: username,
  //   });
  // };

  const sendMessage = async (text) => {
    try {
      await axios.post(`http://localhost:3001/send-message/${currentChannel}`, {
        message: text,
        author: username,
      });
    } catch (err) {
      setMascotState("error");

      setTimeout(() => {
        setMascotState("idle");
      }, 4000);
    }
  };

  const deleteMessage = async (messageId) => {
    await fetch(
      `http://localhost:3001/deleteMessage/${currentChannel}/${messageId}`,
      { method: "DELETE" },
    );

  };

  const loadMoreMessages = async () => {
    if (messages.length === 0) return;

    const oldest = messages[0].id;

    const res = await axios.get(
      `http://localhost:3001/messages/${currentChannel}?before=${oldest}`,
    );

    if (res.data.length === 0) return;

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));

      const newMessages = res.data.filter((m) => !existingIds.has(m.id));

      return [...newMessages, ...prev];
    });

  };

  function logout() {
    localStorage.removeItem("username");
    window.location.href = "/";
  }

  function addMessageSafe(prev, msg) {
    if (prev.some((m) => m.id === msg.id)) {
      return prev;
    }
    return [...prev, msg];
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
                <div
                  key={channel.id}
                  className={`salonItem ${currentChannel === channel.id ? "active" : ""}`}
                  onClick={() => {
                    setCurrentChannel(channel.id);
                    setChannelName(channel.name);
                  }}
                >
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
          <MessageList
            messages={messages}
            onDeleteMessage={deleteMessage}
            loadMoreMessages={loadMoreMessages}
          />
        </div>

        <div className="chatFooter">
          <MessageInput
            onSend={sendMessage}
            onTyping={(isTyping) => {
              if (mascotState === "idle" || mascotState === "typing") {
                setMascotState(isTyping ? "typing" : "idle");
              }
            }}
          />
          <Mascot state={mascotState} />
        </div>
      </div>

      {guildId && <UserList guildId={guildId} />}
    </div>
  );
};

