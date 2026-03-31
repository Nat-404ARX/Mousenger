import { useEffect, useState } from "react";

export default function VoiceUserList({ channelId }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!channelId) return;

    fetch(`http://localhost:3001/voice-members/${channelId}`)
      .then((res) => res.json())
      .then(setUsers);    
  }, [channelId]);

  return (
    <div className="voiceUsers">
      {users.map((user) => (
        <div key={user.id} className="voiceUser">
          <img src={user.avatar} alt="" />
          <span>{user.username}</span>
        </div>
      ))}
    </div>
  );
}