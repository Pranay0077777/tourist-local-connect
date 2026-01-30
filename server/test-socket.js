const { io } = require('socket.io-client');

const socket = io('http://127.0.0.1:3001');

const senderId = 'tourist_1';
const receiverId = '1';
const roomId = 'room_1_tourist_1';

socket.on('connect', () => {
    console.log('Connected to server!');
    socket.emit('join_room', roomId);

    setTimeout(() => {
        console.log('Sending message...');
        socket.emit('send_message', {
            roomId,
            senderId,
            receiverId,
            text: 'Are you still there?'
        });
    }, 1000);
});

socket.on('receive_message', (data) => {
    console.log('Received message:', data.text);
    if (data.senderId === receiverId) {
        console.log('SUCCESS: AI responded!');
        setTimeout(() => process.exit(0), 1000);
    }
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    if (reason === 'transport close' || reason === 'io server disconnect') {
        console.error('SERVER RESTARTED OR DIED!');
        process.exit(1);
    }
});

setTimeout(() => {
    console.log('Timeout');
    process.exit(1);
}, 15000);
