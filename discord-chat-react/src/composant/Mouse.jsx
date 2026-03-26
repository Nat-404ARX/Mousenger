import mascotIdle from "../assets/MouseAnimate.gif";
import mascotReact from "../assets/MouseMailAnimate.gif";
import mascotTypping from "../assets/MouseTyppingAnimate.gif";
import mascotError from "../assets/MouseError.gif";

export default function Mascot({ state }) {
    let src;

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

    return (
        <div className="mascotContainer">
            <img src={src} alt="Mouse" className="mascot" />
        </div>
    );
}