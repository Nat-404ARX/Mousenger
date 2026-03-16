/*import { useEffect, useRef } from "react"

const username = localStorage.getItem("username");

export default function MessageList({ messages }) {

    const containerRef = useRef(null);

    useEffect(() => {

        const el = containerRef.current;

        const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;

        const nearBottom = distanceFromBottom < 100;

        if (nearBottom) {
            el.scrollTop = el.scrollHeight;
        }

    }, [messages]);


    return (
        <div className="messageList" ref={containerRef}>
            {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
                <b>{msg.author}</b> : {msg.text}
            </div>
            ))}
        </div>
    );
}
*/
import { useEffect, useRef, useState } from "react";

const username = localStorage.getItem("username");

export default function MessageList({ messages, onDeleteMessage }) {
  const containerRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const el = containerRef.current;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const nearBottom = distanceFromBottom < 100;

    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleRightClick = (event, msg) => {
    event.preventDefault();

    setContextMenu({
      x: event.pageX,
      y: event.pageY,
      message: msg,
    });
  };

  const deleteMessage = () => {
    if (contextMenu) {
      onDeleteMessage(contextMenu.message.id);
      setContextMenu(null);
    }
  };

  return (
    <div
      className="messageList"
      ref={containerRef}
      onClick={() => setContextMenu(null)}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
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
