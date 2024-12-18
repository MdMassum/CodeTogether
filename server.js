import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import ACTIONS from './src/Action.js'


const app = express()
const server = http.createServer(app)

const io = new Server(server);

const userSocketMap = {};

function getAllConnectedClients(roomId){
    // this will get all members from a room
    return Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    .map((socketId)=>{
        return {
            socketId,
            username : userSocketMap[socketId],
        }
    })  
}

io.on('connection',(socket)=>{
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN,({roomId, username})=>{
        userSocketMap[socket.id] = username;
        socket.join(roomId);  // this will join the current member(socket) into the room

        const clients = getAllConnectedClients(roomId);
        console.log(clients)

        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{     // inform all members that socketid with username joined room
                clients,
                username,
                socketId : socket.id
            })
        })
    })

    socket.on('disconnecting', ()=>{
        const rooms = [...socket.rooms]  // get all rooms this user is connected (usually it is 1);
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{   // inform all members that this socketid left room
                socketId : socket.id,
                username : userSocketMap[socket.id]
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
    })
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
    console.log(`Server is up and Running on Port ${PORT}`);
})