import { RoomInfoObj } from "../types/gameTypes";
import '../styles/GameOverBox.css';

type GameOverBoxProps = {
  roomInfo: RoomInfoObj
};

const GameOverBox: React.FC<GameOverBoxProps> = ({ roomInfo }) => {
    const playerNames = ['Black', 'White', 'Green', 'Purple', 'Other'];
    const playerColors = ['#2c3e50', '#7f8c8d', '#27ae60', '#9036b7', '#e67e22'];

    // Skip neutral territory (index 0) and map players
    const playerScores = roomInfo.territoryScores.slice(1).map((territory, index) => ({
        name: playerNames[index] || playerNames[4], // Fallback to "Other" if more than 5 players
        color: playerColors[index] || playerColors[4],
        territory,
        prisoners: roomInfo.prisoners[index],
        total: territory + roomInfo.prisoners[index]
    }));

    return (
        <div className="compact-game-over">
            <h3>Game Over</h3>
            <div className="score-list">
                {playerScores.map((player, index) => (
                    <div key={index} className="score-item">
                        <span className="player-name">
                            <div style={{color: playerColors[index]}}>{player.name}:</div>
                        </span>
                        <span className="player-score">
                            {player.total} <span className="score-details">({player.territory}+{player.prisoners})</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GameOverBox;