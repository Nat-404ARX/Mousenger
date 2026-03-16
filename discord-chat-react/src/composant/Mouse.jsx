import mascot from "../assets/svg/Mouse/Mouse.svg";


export default function Mascot() {
    return (
        <div className="mascotContainer">
        <img src={mascot} alt="mascotte" className="mascot" />
        </div>
    );
}
