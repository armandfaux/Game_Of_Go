import { Socket } from "socket.io-client";
import ConfirmMarkingBtn from "./buttons/ConfirmMarkingBtn";
import PassTurnBtn from "./buttons/PassTurnBtn";
import ResignBtn from "./buttons/ResignBtn";
import StartGameBtn from "./buttons/StartGameBtn";
import GameOverBox from "./GameOverBox";
import RoomInfoBox from "./RoomInfoBox";
import { RoomInfoObj } from "../types/gameTypes";

import '../styles/Structure.css';

type RightPanelProps = {
    socket: Socket | null,
    roomInfo: RoomInfoObj,
    isConfirmed: boolean,
};

const RightPanel: React.FC<RightPanelProps> = ({ socket, roomInfo, isConfirmed }) => {
  return (
    <aside className='right-panel'>
      {socket && roomInfo.id !== '' && (
        <div>
          <RoomInfoBox
            roomInfo={roomInfo}
            socketId={socket.id}
          />
        </div>
      )}
      {roomInfo && roomInfo.id !== '' && roomInfo.gameState === 'waiting' && (
        <div style={{ marginTop: '20px' }}>
          <StartGameBtn socket={socket} roomId={roomInfo.id} />
        </div>
      )}
      {roomInfo && roomInfo.gameState === 'playing' && (
        <div style={{ marginTop: '20px' }}>
          <PassTurnBtn socket={socket} roomId={roomInfo.id} />
          <ResignBtn socket={socket} roomId={roomInfo.id} />
        </div>
      )}
      {roomInfo && roomInfo.gameState === 'scoring' && (
        <div style={{ marginTop: '20px' }}>
          <ConfirmMarkingBtn socket={socket} roomId={roomInfo.id} isConfirmed={isConfirmed} />
        </div>
      )}
      {roomInfo && roomInfo.gameState === 'finished' && (
        <div style={{ marginTop: '20px' }}>
          <GameOverBox roomInfo={roomInfo}/>
        </div>
      )}
    </aside>
  );
}

export default RightPanel;