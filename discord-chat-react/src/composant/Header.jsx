export default function ChatHeader({ username, channel }) {

    return (
        <div className="chatHeader">
            {username} — #{channel}
        </div>
    );

}
