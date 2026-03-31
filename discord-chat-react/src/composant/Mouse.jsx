import { useState, useEffect } from "react";
import mascotIdle from "../assets/MouseAnimate.gif";
import mascotReact from "../assets/MouseMailAnimate.gif";
import mascotTypping from "../assets/MouseTyppingAnimate.gif";
import mascotError from "../assets/MouseError.gif";
import mascotHover from "../assets/MouseHover.gif"

export default function Mascot({ state }) {
    let src;
    const [hover, setHover] = useState(false);

    if (hover) {
        src = mascotHover;
    } else {
        switch (state) {
            case "react":
                src = mascotReact;
                break;
            case "typing":
                src = mascotTypping;
                break;
            case "error":
                src = mascotError;
                break;
            default:
                src = mascotIdle;
        }
    }

    return (
        <div
            className="mascotContainer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <img src={src} alt="Mouse" className="mascot" />
        </div>
    );
}