import { Socket } from "socket.io-client";
import CreateGameBtn from "./buttons/CreateGameBtn";
import JoinGameBtn from "./buttons/JoinGameBtn";

import '../styles/Structure.css';

type LeftPanelProps = {
    socket: Socket | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ socket }) => {
    return (
        <aside className='left-panel'>
            { socket && (
                <div>
                    <CreateGameBtn socket={socket} />
                    <JoinGameBtn socket={socket} />
                </div>
            )}
        </aside>
    )
}

export default LeftPanel;