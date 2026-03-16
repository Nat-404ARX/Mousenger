import { useEffect, useState } from "react";
import axios from "axios";

export default function UserList({ guildId }) {
  const [active, setActive] = useState([]);
  const [inactive, setInactive] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      const res = await axios.get(`http://localhost:3001/members/${guildId}`);

      setActive(res.data.active);
      setInactive(res.data.inactive);
    };

    loadMembers();
  }, [guildId]);

  return (
    <div className="chatRightColumn">
      <div className="userListTitle">
        Utilisateurs connectés ({active.length})
      </div>

      {active.map((user) => (
        <div key={user.id} className="userItem online">
          {user.username}
        </div>
      ))}

      <div className="userListTitle">Hors ligne ({inactive.length})</div>

      {inactive.map((user) => (
        <div key={user.id} className="userItem offline">
          {user.username}
        </div>
      ))}
    </div>
  );
}
