import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Home from "./pages/home";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000); 

    return () => clearTimeout(timer);
  }, []);

  if (!username) {
    return <Login onLogin={setUsername} />;
  }


  if (loading) {
    return <Home />;
  }

  return <Chat username={username} />;
}

export default App;