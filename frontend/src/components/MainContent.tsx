import { Socket } from "socket.io-client";
import CreateGameBtn from "./buttons/CreateGameBtn";
import JoinGameBtn from "./buttons/JoinGameBtn";
import { RoomInfoObj } from "../types/gameTypes";
import Goban from "./Goban";

import '../styles/Structure.css';

type MainContentProps = {
    socket: Socket | null;
    roomInfo: RoomInfoObj
}

const MainContent: React.FC<MainContentProps> = ({ socket, roomInfo }) => {
    return (
        <div className='main-panel'>
            {socket && roomInfo.gameState !== 'waiting' && (
                <div style={{margin: '35px'}}>
                    <Goban
                        socket={socket}
                        roomInfo={roomInfo}
                    />
                </div>
            )}
        </div>
    )
}

export default MainContent;