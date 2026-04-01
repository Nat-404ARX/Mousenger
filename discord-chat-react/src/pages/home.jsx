import { useState, useEffect } from "react";
import "../styles/home.css";

import mouseRun from "../assets/MouseMove.gif"; 
import hole from "../assets/hole.svg";
import logo from "../assets/favicon.png";

export default function Home() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
      <div className="home">
        <div className="loadingContainer">
          <img src={logo} alt="Mousenger" className="logo" />
          <div className="progress">
            <img src={hole} className="hole" />
            <div className="progressBar">
              <div className="progressFill" style={{ width: `${progress}%` }} />

              <img
                src={mouseRun}
                alt="Mouse"
                className="mouse"
                style={{ left: `${Math.max(progress - 20, 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
}