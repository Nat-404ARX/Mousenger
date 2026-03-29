import { useEffect, useRef, useState } from "react";

const username = localStorage.getItem("username");

function boldMessage(text) {
  if (!text) return "";

  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export default function MessageList({
  messages,
  onDeleteMessage,
  loadMoreMessages,
  onEditMessage
}) {
  const containerRef = useRef(null);
  const shouldScrollRef = useRef(true);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (shouldScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    shouldScrollRef.current = distanceFromBottom < 120;


    if (el.scrollTop < 80) {
      loadMoreMessages();
    }
  };


  const handleRightClick = (event, msg) => {
    event.preventDefault();

    if (msg.author !== username && msg.author !== "Mouse") return;

    setContextMenu({
      x: event.pageX,
      y: event.pageY,
      message: msg,
    });
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
      {messages.map((msg) => (
        <div
          key={`${msg.id}-${msg.channelId}`}
          className={`message ${msg.type}`}
          onContextMenu={(e) => handleRightClick(e, msg)}
        >
          <img src={msg.avatar} className="avatar" />
          <div className="content">
            <b>{msg.author}</b> :{" "}
            {msg.type === "info" ? (
              <div className="userInfoCard">
                <img src={msg.avatar} className="avatarLarge" />
                <div>
                  <div>
                    <b>{msg.text}</b>
                  </div>
                  <div>{msg.bio}</div>
                </div>
              </div>
            ) : (
              <span
                dangerouslySetInnerHTML={{ __html: boldMessage(msg.text) }}
              />
            )}
            {msg.image && <img src={msg.image} className="messageImage" />}
          </div>
        </div>
      ))}

      {contextMenu && (
        <div
          className="contextMenu"
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 999,
          }}
        >
          <div onClick={deleteMessage} className="contextAction">
            Supprimer le message
          </div>
          <div
            onClick={() => {
              onEditMessage(contextMenu.message);
              setContextMenu(null);
            }}
            className="contextAction"
          >
            Modifier le message
          </div>
        </div>
      )}
    </div>
  );
}
