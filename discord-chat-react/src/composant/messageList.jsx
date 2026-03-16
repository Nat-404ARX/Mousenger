import { useEffect, useRef, useState } from "react";
import axios from "axios";

const username = localStorage.getItem("username");

export default function MessageList({ messages, onDeleteMessage, loadMoreMessages }) {
  const containerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  // scroll automatique quand nouveaux messages
  useEffect(() => {
    
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const nearBottom = distanceFromBottom < 120;

    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // scroll en bas au premier chargement
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  }, []);
  

  const handleRightClick = (event, msg) => {
    event.preventDefault();

    if (msg.author !== username) return;

    setContextMenu({
      x: event.pageX,
      y: event.pageY,
      message: msg,
    });
  };

  const handleScroll = () => {
    const el = containerRef.current;

    if (!el) return;

    if (el.scrollTop < 80) {
      loadMoreMessages();
    }
  };

  const deleteMessage = () => {
    if (!contextMenu) return;

    onDeleteMessage(contextMenu.message.id);

    setContextMenu(null);
  };

  

  return (
    <div
      className="messageList"
      ref={containerRef}
      onScroll={handleScroll}
      onClick={() => setContextMenu(null)}
    >
      {messages.slice(-100).map((msg) => (
        <div
          key={`${msg.id}-${msg.channelId}`}
          className={`message ${msg.type}`}
          onContextMenu={(e) => handleRightClick(e, msg)}
        >
          <b>{msg.author}</b> : {msg.text}
        </div>
      ))}

      {contextMenu && (
        <div
          className="contextMenu"
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <div onClick={deleteMessage}>Supprimer le message</div>
        </div>
      )}
    </div>
  );
}
