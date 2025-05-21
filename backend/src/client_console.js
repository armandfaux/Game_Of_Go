const io = require('socket.io-client');
const prompt = require('prompt-sync')({ sigint: true });

console.log('Starting client...');

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
  command_shell();
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});


function command_shell() {
    while(1) {
        const input = prompt("").split(' ');
        var roomId = "";
        switch(input[0]) {
            case "exit":
                socket.disconnect();
                return 0;

            case "createRoom":
                console.log(input);
                socket.emit('createRoom', 2);
                socket.on('roomCreated', (roomId) => {
                console.log("Room created with ID:", roomId);
            });
            break;
            
            case "joinRoom":
                if (input.length < 2) {
                    console.log("Please provide a room ID to join.");
                    continue;
                }
                socket.emit('joinRoom', input[1]);
                roomId = input[1];
                break;
                
                case "startGame":
            if (input.length < 2) {
                console.log("Please provide a room ID to start the game.");
                continue;
            }
            socket.emit('startGame', input[1]);
            break;

            case "makeMove":
            socket.emit('makeMove', {
                roomId: input[1],
                move: {
                    x: parseInt(input[2]),
                    y: parseInt(input[3]),
                }
            });
            break;
            
            default:
                console.log("Unknown command:", input[0]);
        }
    }
}