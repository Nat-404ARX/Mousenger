import { useEffect, useState } from "react";
import axios from "axios";

export default function UserList({ guildId }) {
  const [active, setActive] = useState([]);
  const [inactive, setInactive] = useState([]);

  useEffect(() => {
    if (!guildId) return;

    const loadMembers = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/members/${guildId}`);
        setActive(res.data.active);
        setInactive(res.data.inactive);
      } catch (err) {
        console.error("Erreur chargement membres:", err);
      }
    };

    loadMembers();
  }, [guildId]);

  return (
    <div className="chatRightColumn">
      <div className="userListTitle">En ligne ({active.length})</div>

      {active.map((user) => (
        <div key={user.id} className="userItem online">
          <img
            src={user.avatar}
            width="45"
            style={{ borderRadius: "50%", marginRight: 5 }}
          />
          {user.username}
        </div>
      ))}

      <div className="userListTitle">Hors ligne ({inactive.length})</div>

      {inactive.map((user) => (
        <div key={user.id} className="userItem offline">
          <img
            src={user.avatar}
            width="45"
            style={{ borderRadius: "50%", marginRight: 5 }}
          />
          {user.username}
        </div>
      ))}
    </div>
  );
}
