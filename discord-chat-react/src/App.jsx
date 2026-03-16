import Chat from "./pages/Chat";
import Login from "./pages/Login";
import "./App.css";
import { useState } from "react";


function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));

  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  return <Chat username={username} />;
}

export default App;



