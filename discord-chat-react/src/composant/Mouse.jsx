import mascotIdle from "../assets/svg/Mouse/Mouse.svg";
import mascotReact from "../assets/svg/MouseMail.svg";

export default function Mascot({ state }) {
    let src = mascotIdle;

    if (state === "react") {
        src = mascotReact;
    }

    return (
        <div className="mascotContainer">
        <img src={src} alt="Mouse" className="mascot" />
        </div>
    );
}