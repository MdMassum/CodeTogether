import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import ACTIONS from './src/Action.js'
import path from 'path'
import { fileURLToPath } from 'url';


const app = express()
const server = http.createServer(app)
const io = new Server(server);

// for deployment  
// since file are ES module so we need to get __filename and __dirname manually else in commonjs not required
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('dist'));
app.use((req, res, next) => {
    console.log(path.join(__dirname,'dist', 'index.html'));
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const userSocketMap = {};

function getAllConnectedClients(roomId){

    // this will get all members from a room
    const room = io.sockets.adapter.rooms.get(roomId) || new Set();
    return Array.from(room).map((socketId) =>{ return{
        socketId,
        username: userSocketMap[socketId],
    }});
}

// event listeners for socket.io
io.on('connection',(socket)=>{
    console.log(`Socket connected: ${socket.id}`);

    // Handle JOIN event
    socket.on(ACTIONS.JOIN,({roomId, username})=>{

        if (!roomId || !username) {
            console.error('Invalid roomId or username');
            return;
        }

        userSocketMap[socket.id] = username;
        socket.join(roomId);  // this will join the current member(socket) into the room

        // Get the updated list of connected clients
        const clients = getAllConnectedClients(roomId);
        console.log(`Room ${roomId} clients:`, clients);

        // Notify all clients in the room about the new user
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    })

    // code change event
    socket.on(ACTIONS.CODE_CHANGE,({roomId, code})=>{
        // io.to(roomId).emit(ACTIONS.CODE_CHANGE, { code }); // io.to sends message to everyone
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code})  // this will send message to all other except oneself
    })
    // code sync event (when new user joins then pass current code)
    socket.on(ACTIONS.SYNC_CODE,({socketId, code})=>{
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code}) // send the code to new user
    })

    // Handle disconnecting
    socket.on('disconnecting', ()=>{

        const rooms = [...socket.rooms]  // get all rooms this user is connected (usually it is 1);

        rooms.forEach((roomId) => {
            // Notify other clients in the room
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });

        // Remove the user from the map
        delete userSocketMap[socket.id];
        socket.leave();
    })

    // Handle disconnection cleanup
    // socket.on('disconnect', () => {
    //     console.log(`Socket disconnected: ${socket.id}`);
    // });
})

// Start the server with error handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
});