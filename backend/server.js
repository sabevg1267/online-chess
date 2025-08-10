// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const ChessValidator = require('./chess-validator');

const app = express();
app.use(cors());  // Enable CORS for your frontend

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",  // Your React frontend URL
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,  // 60 seconds
  pingInterval: 25000  // 25 seconds
});

// Game management
let games = {}
let roomCounter = 0

// Input sanitization helper
function sanitizeInput(input, maxLength = 100) {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove any HTML/script tags and limit length
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, maxLength);
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Clean up game room
function cleanupGameRoom(roomId) {
  if (games[roomId]) {
    // Clean up chess validator
    if (games[roomId].validator) {
      delete games[roomId].validator;
    }
    delete games[roomId];
    console.log(`Room ${roomId} cleaned up`);
  }
}

// Find player's current room
function findPlayerRoom(socketId) {
  for (const roomId in games) {
    if (games[roomId].players.includes(socketId)) {
      return roomId;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("find_game", (data) => {
    try {
      // Sanitize and validate inputs
      const theEmail = sanitizeInput(data.email, 254); // Max email length
      const theName = sanitizeInput(data.name, 50);
      
      // Validate email format
      if (!isValidEmail(theEmail)) {
        socket.emit('error', { message: 'Invalid email format' });
        return;
      }

      // Check if user is already in a room
      const existingRoom = findPlayerRoom(socket.id);
      if (existingRoom) {
        socket.emit('error', { message: 'Already in a game' });
        return;
      }

      let joinedRoom = null;

      // Find a room with only one player 
      for (const roomId in games) {
        if (games[roomId].players.length < 2 && games[roomId].status === 'waiting') {
          joinedRoom = roomId;
          break;
        }
      }
      
      // If no available room, create new one
      if (!joinedRoom) {
        roomCounter++;
        joinedRoom = 'room-' + roomCounter;
        games[joinedRoom] = {
          players: [],
          names: [],
          emails: [],
          status: 'waiting',
          validator: new ChessValidator(),
          turn: 'white'
        };
      }

      // Join the room
      socket.join(joinedRoom);
      socket.data.room = joinedRoom;
      socket.data.email = theEmail;
      socket.data.name = theName;
      
      // Update games array
      games[joinedRoom].players.push(socket.id);
      games[joinedRoom].names.push(theName);
      games[joinedRoom].emails.push(theEmail);
      console.log("User " + theName + " joined " + joinedRoom);

      // Notify people in room 
      io.to(joinedRoom).emit("update_players", {
        players: games[joinedRoom].players,
        names: games[joinedRoom].names
      });

      // Start game if 2 players are present
      if (games[joinedRoom].players.length === 2) {
        games[joinedRoom].status = 'active';
        console.log("Game Starting in " + joinedRoom);
        io.to(joinedRoom).emit('start_game', {
          players: games[joinedRoom].players,
          names: games[joinedRoom].names,
          emails: games[joinedRoom].emails
        });
      }
    } catch (error) {
      console.error('Error in find_game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  socket.on('leaveGame', (data) => {
    try {
      const roomName = socket.data.room;
      if (!roomName || !games[roomName]) {
        return;
      }

      // Notify other player
      socket.to(roomName).emit('userLeft', {
        user: socket.data.name || 'Player',
        room: roomName
      });

      // Leave the room
      socket.leave(roomName);
      
      // Remove from game data
      const playerIndex = games[roomName].players.indexOf(socket.id);
      if (playerIndex > -1) {
        games[roomName].players.splice(playerIndex, 1);
        games[roomName].names.splice(playerIndex, 1);
        games[roomName].emails.splice(playerIndex, 1);
      }

      // Clean up room if empty
      if (games[roomName].players.length === 0) {
        cleanupGameRoom(roomName);
      } else {
        games[roomName].status = 'abandoned';
      }

      // Clear socket data
      delete socket.data.room;
      delete socket.data.email;
      delete socket.data.name;

      console.log(socket.id + " has left game " + roomName);
    } catch (error) {
      console.error('Error in leaveGame:', error);
    }
  });

  socket.on('move', (data) => {
    try {
      const roomName = socket.data.room;
      if (!roomName || !games[roomName]) {
        socket.emit('error', { message: 'Not in a game' });
        return;
      }

      const game = games[roomName];
      
      // Check if it's the player's turn
      const playerIndex = game.players.indexOf(socket.id);
      const playerColor = playerIndex === 0 ? 'white' : 'black';
      
      if (game.validator.currentTurn !== playerColor) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // Validate the move
      const moveResult = game.validator.makeMove(data.notation);
      
      if (!moveResult.valid) {
        socket.emit('invalid_move', { 
          reason: moveResult.reason,
          notation: data.notation 
        });
        return;
      }

      // Broadcast valid move to all players in the room
      io.to(roomName).emit('move', {
        notation: data.notation,
        from: data.from,
        to: data.to,
        piece: data.piece,
        captured: data.captured,
        gameState: game.validator.getGameState()
      });

      console.log(`Valid move from ${socket.id} in ${roomName}: ${data.notation}`);
    } catch (error) {
      console.error('Error processing move:', error);
      socket.emit('error', { message: 'Failed to process move' });
    }
  });

  socket.on('disconnect', () => {
    try {
      console.log(`User disconnected: ${socket.id}`);
      
      const roomName = socket.data.room;
      if (roomName && games[roomName]) {
        // Notify other player about disconnection
        socket.to(roomName).emit('playerDisconnected', {
          user: socket.data.name || 'Player',
          message: 'Your opponent has disconnected. They have 30 seconds to reconnect.'
        });

        // Mark player as disconnected but keep room alive for 30 seconds
        const playerIndex = games[roomName].players.indexOf(socket.id);
        if (playerIndex > -1) {
          games[roomName].disconnectedPlayers = games[roomName].disconnectedPlayers || {};
          games[roomName].disconnectedPlayers[socket.id] = {
            name: socket.data.name,
            email: socket.data.email,
            timestamp: Date.now()
          };

          // Set timeout to clean up if player doesn't reconnect
          setTimeout(() => {
            if (games[roomName] && games[roomName].disconnectedPlayers && 
                games[roomName].disconnectedPlayers[socket.id]) {
              
              // Player didn't reconnect, remove them
              socket.to(roomName).emit('userLeft', {
                user: socket.data.name || 'Player',
                room: roomName
              });

              // Remove from game
              const idx = games[roomName].players.indexOf(socket.id);
              if (idx > -1) {
                games[roomName].players.splice(idx, 1);
                games[roomName].names.splice(idx, 1);
                games[roomName].emails.splice(idx, 1);
              }

              // Clean up room if empty
              if (games[roomName].players.length === 0) {
                cleanupGameRoom(roomName);
              } else {
                games[roomName].status = 'abandoned';
              }
            }
          }, 30000); // 30 seconds timeout
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle reconnection
  socket.on('reconnect', (data) => {
    try {
      const email = sanitizeInput(data.email, 254);
      const name = sanitizeInput(data.name, 50);
      
      // Find room with this player's email
      for (const roomId in games) {
        if (games[roomId].disconnectedPlayers) {
          for (const disconnectedId in games[roomId].disconnectedPlayers) {
            const disconnectedPlayer = games[roomId].disconnectedPlayers[disconnectedId];
            if (disconnectedPlayer.email === email) {
              // Reconnect player
              socket.join(roomId);
              socket.data.room = roomId;
              socket.data.email = email;
              socket.data.name = name;

              // Update game data
              const oldIndex = games[roomId].players.indexOf(disconnectedId);
              if (oldIndex > -1) {
                games[roomId].players[oldIndex] = socket.id;
              }

              // Remove from disconnected list
              delete games[roomId].disconnectedPlayers[disconnectedId];

              // Notify room
              io.to(roomId).emit('playerReconnected', {
                user: name,
                gameState: games[roomId].validator.getGameState()
              });

              console.log(`Player ${name} reconnected to ${roomId}`);
              return;
            }
          }
        }
      }

      socket.emit('error', { message: 'No game found to reconnect' });
    } catch (error) {
      console.error('Error in reconnect:', error);
      socket.emit('error', { message: 'Failed to reconnect' });
    }
  });
});

// Periodic cleanup of abandoned games
setInterval(() => {
  const now = Date.now();
  for (const roomId in games) {
    if (games[roomId].status === 'abandoned' || 
        (games[roomId].players.length === 0 && now - games[roomId].createdAt > 300000)) {
      cleanupGameRoom(roomId);
    }
  }
}, 60000); // Check every minute

server.listen(3001, () => {
  console.log('Server running on port 3001');
  console.log('Environment:', process.env.NODE_ENV || 'development');
});