// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { join } = require('path');

const app = express();
app.use(cors());  // Enable CORS for your frontend

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Your React frontend URL
    methods: ["GET", "POST"]
  }
});

let games = {}
let roomCounter = 0

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("find_game", (data) =>{
    let joinedRoom = null
    let theEmail = data.email
    let theName = data.name

    // Find a room with only one player 
    for (const roomId in games){
        if(games[roomId].players.length < 2){
            joinedRoom = roomId
            break
        }
    }
    
    // If no available room, create new one
    if (!joinedRoom){
        roomCounter++
        joinedRoom = 'room-'+roomCounter
        games[joinedRoom] = {
            players: [],
            names: [],
            emails: []
        }
    }
    // Join the room
    socket.join(joinedRoom)
    socket.data.room = joinedRoom
    // Update games array
    games[joinedRoom].players.push(socket.id)
    games[joinedRoom].names.push(theName)
    games[joinedRoom].emails.push(theEmail)
    console.log("User " + theName + " joined "+ joinedRoom)

    // Notify People in Room 
    io.to(joinedRoom).emit("update_players", games[joinedRoom].players)

    // Start game if 2 players are present
    if (games[joinedRoom].players.length === 2){
        console.log("Game Starting!!")
        io.to(joinedRoom).emit('start_game', games[joinedRoom])
    }
  })

  socket.on('leaveGame', (data) =>{
    for (let room of socket.rooms){
      if (room !== socket.id){
        socket.leave(room)
        socket.to(room).emit('userLeft', {user:data.user, room: room})
        delete games[room]
      }
    }
    console.log(socket.id, "has left game.")
    console.log(games)
  })

  socket.on('move', (data) =>{
    const roomName = socket.data.room
    if (roomName){
      console.log(`Move from ${socket.id} in ${roomName}: ${data.notation}`)
      io.to(roomName).emit('move', data)
    }else{
      console.log(`Move received from ${socket.id} but no room found.`);
    }
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
