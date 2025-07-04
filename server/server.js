import { Socket, Server } from "socket.io";
import http from "http";
import { app } from "./app.js";
import { config } from "dotenv";
import mongoose from "mongoose";
import Friend from './models/Friends.js'

config({ path: "./config.env" });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://darbaar.netlify.app",
    methods: ["GET", "POST"],
    credentials: false,
  },
});


let gamesRecord = {};
let waitingId = null;
let currentId = 1;

function findPlayerGame(socketId) {
  for (const [id, game] of Object.entries(gamesRecord)) {
    if (game.players.find(p => p.socketId === socketId)) {
      return id;
    }
  }
  return null;
}


io.on("connection", (socket) => {
  console.log('initially gamerecord: ', gamesRecord);
  console.log("USER CONNECTED:", socket.id);

  socket.on('joining', (data) => {
    const player = {
      socketId: socket.id,
      userId: data.userId,
      username: data.username,
      games: data.games,
      vote: null,
      role: null,
    };
    console.log('joining')
    console.log('waiting id: ', waitingId)

    if (waitingId === null || gamesRecord[waitingId]?.players.length === 4) {
      console.log('first player');
      waitingId = currentId++;
      const newRoomId = waitingId;

      gamesRecord[newRoomId] = {
        players: [],
        timeout: setTimeout(() => {
          gamesRecord[newRoomId]?.players.forEach(p => {
            io.to(p.socketId).emit('timeout', 'Not enough players joined in time.');
          });

          delete gamesRecord[newRoomId];

          if (waitingId === newRoomId) {
            waitingId = null;
          }

          console.log(`Room ${newRoomId} timed out and was removed.`);
        }, 30000) 
      };
    }

    gamesRecord[waitingId]?.players.push(player);
    console.log('length:', gamesRecord[waitingId]?.players.length)
  
    if (gamesRecord[waitingId]?.players.length === 4) {
      console.log('4 players added');
      clearTimeout(gamesRecord[waitingId].timeout);
      const [Badshah, Wazir, Sipahi, Chor] = gamesRecord[waitingId].players;

      const roles=['Badshah', 'Wazir', 'Sipahi', 'Chor'];
      for(let i=0;i<4;i++){
        gamesRecord[waitingId].players[i].role=roles[i];
      }

      console.log('players: ', gamesRecord[waitingId].players)
      console.log('players added 4')

      io.to(Badshah.socketId).emit('start_game', 'BadShah', [Wazir.username, Sipahi.username, Chor.username]);
      io.to(Wazir.socketId).emit('start_game', 'Wazir', [Badshah.username, Sipahi.username, Chor.username]);
      io.to(Sipahi.socketId).emit('start_game', 'Sipahi', [Badshah.username, Wazir.username, Chor.username]);
      io.to(Chor.socketId).emit('start_game', 'Chor', [Badshah.username, Wazir.username, Sipahi.username]); 
    }
  });
  
  socket.on('joining_friend', async (data) => {
    const player = {
      socketId: socket.id,
      userId: data.userId,
      username: data.username,
      games: data.games,
      vote: null,
      role: null,
    };

    let joinedRoom = null;

    for (const [roomId, room] of Object.entries(gamesRecord)) {
      if (room.players.length < 4) {
        let valid = true;

        // Await mutual friend checks
        for (const existingPlayer of room.players) {
          const [isFriend1, isFriend2] = await Promise.all([
            Friend.findOne({ user: existingPlayer.userId, friend: player.userId }),
            Friend.findOne({ user: player.userId, friend: existingPlayer.userId }),
          ]);

          if (!isFriend1 || !isFriend2) {
            valid = false;
            break;
          }
        }

        if (valid) {
          joinedRoom = room;
          room.players.push(player);
          break;  // ✅ stop checking after successful join
        }
      }
    }

    // If no valid room found, create a new one
    if (!joinedRoom) {
      const newRoomId = currentId++;
      joinedRoom = {
        players: [player],
        timeout: setTimeout(() => {
          joinedRoom.players.forEach(p => {
            io.to(p.socketId).emit('timeout', 'Not enough players joined your friends room in time.');
          });
          delete gamesRecord[newRoomId];
          console.log(`Friend room ${newRoomId} timed out.`);
        }, 30000)
      };
      gamesRecord[newRoomId] = joinedRoom;
    }

    console.log('Friend room size:', joinedRoom.players.length);

    // Start game if 4 players are present
    if (joinedRoom.players.length === 4) {
      clearTimeout(joinedRoom.timeout);

      const [Badshah, Wazir, Sipahi, Chor] = joinedRoom.players;
      const roles = ['Badshah', 'Wazir', 'Sipahi', 'Chor'];
      for (let i = 0; i < 4; i++) {
        joinedRoom.players[i].role = roles[i];
      }

      io.to(Badshah.socketId).emit('start_game', 'BadShah', [Wazir.username, Sipahi.username, Chor.username]);
      io.to(Wazir.socketId).emit('start_game', 'Wazir', [Badshah.username, Sipahi.username, Chor.username]);
      io.to(Sipahi.socketId).emit('start_game', 'Sipahi', [Badshah.username, Wazir.username, Chor.username]);
      io.to(Chor.socketId).emit('start_game', 'Chor', [Badshah.username, Wazir.username, Sipahi.username]);
    }
  });

  
  socket.on('vote', (user, voted) => {
    if (!gamesRecord[waitingId] || !gamesRecord[waitingId].players) {
      console.warn('Vote received but no active game or players.');
      return;
    }

    gamesRecord[waitingId].players.forEach(player => {
      if (player.username === user) {
        console.log('username', user);
        console.log('voted for', voted);
        player.vote = voted;
      }
    });
  });

  socket.on('guess', ()=>{
    if (!gamesRecord[waitingId] || !gamesRecord[waitingId].players) {
      console.warn('Guess received but no active game or players.');
      return;
    }

    let votes={};
    gamesRecord[waitingId].players.forEach(player => {
      votes[player.username]=player.vote;
    });

    const Badshah=gamesRecord[waitingId].players[0]
    io.to(Badshah.socketId).emit('votes', votes);

    io.to(gamesRecord[waitingId].players[1].socketId).emit('guessed');
    io.to(gamesRecord[waitingId].players[2].socketId).emit('guessed');
    io.to(gamesRecord[waitingId].players[3].socketId).emit('guessed');
  });

  socket.on('final_vote', (voteUsername) => {
    const gameId = findPlayerGame(socket.id);
    const game = gamesRecord[gameId];
    if (!game) return;

    if (!game || !game.players) {
        console.warn('Final vote received but no active game or players.');
        return;
    }


    let reveal_records={};
    gamesRecord[waitingId]?.players.forEach(player=>{
      if(player.role!='Badshah'){
        reveal_records[player.username]=player.role;
      }
    });

    const badshah = game.players.find(p => p.role === 'Badshah');
    const wazir = game.players.find(p => p.role === 'Wazir');
    const sipahi = game.players.find(p => p.role === 'Sipahi');
    const chor = game.players.find(p => p.role === 'Chor');

    const votedPlayer = game.players.find(p => p.username === voteUsername);

    io.to(badshah.socketId).emit('reveal_roles', reveal_records);

    if (!badshah || !chor || !votedPlayer) {
        console.warn('Missing Badshah, Chor, or voted player in game data.');
        return;
    }

    if (votedPlayer.role === 'Wazir') {
        console.log('CORRECTLY GUESSED');
        io.to(badshah.socketId).emit('won');
        io.to(wazir.socketId).emit('won');
        io.to(sipahi.socketId).emit('won');
        io.to(chor.socketId).emit('lost');
      } 
    else {
        console.log('WRONGLY GUESSED');
        io.to(badshah.socketId).emit('lost');
        io.to(wazir.socketId).emit('lost');
        io.to(sipahi.socketId).emit('lost');
        io.to(chor.socketId).emit('won');
      }

    delete gamesRecord[gameId];
    waitingId = null;
    console.log(`Game ${gameId} ended and cleaned up.`);
  });

  socket.on('end', ()=>{
    const gameId = findPlayerGame(socket.id);
    const game = gamesRecord[gameId];
    if (!game) return;

    const badshah=gamesRecord[waitingId].players.find(p => p.role === 'Badshah');
    const wazir=gamesRecord[waitingId].players.find(p => p.role === 'Wazir');
    const sipahi=gamesRecord[waitingId].players.find(p => p.role === 'Sipahi');
    const chor=gamesRecord[waitingId].players.find(p => p.role === 'Chor');

    let reveal_records={};
    gamesRecord[waitingId].players.forEach(player=>{
      // if(player.role!='Badshah'){
      // }
      reveal_records[player.username]=player.role;
    });

    io.to(wazir.socketId).emit('end', reveal_records);
    io.to(sipahi.socketId).emit('end', reveal_records);
    io.to(chor.socketId).emit('end', reveal_records);
    io.to(badshah.socketId).emit('end', reveal_records);

    delete gamesRecord[gameId];
    waitingId = null;
    console.log(`Game ${gameId} ended and cleaned up.`);
  });

  socket.on('message', (msg_info)=>{
    console.log('message being sent is: ', msg_info);
    const badshah=gamesRecord[waitingId].players.find(p => p.role === 'Badshah');
    const wazir=gamesRecord[waitingId].players.find(p => p.role === 'Wazir');
    const sipahi=gamesRecord[waitingId].players.find(p => p.role === 'Sipahi');
    const chor=gamesRecord[waitingId].players.find(p => p.role === 'Chor');

    io.to(wazir.socketId).emit('msg_info', msg_info);
    io.to(sipahi.socketId).emit('msg_info', msg_info);
    io.to(chor.socketId).emit('msg_info', msg_info);
    io.to(badshah.socketId).emit('msg_info', msg_info);    
  });

  socket.on('disconnect', () => {
  const gameId = findPlayerGame(socket.id);
  if (gameId) {
    delete gamesRecord[gameId];
    waitingId = null;
    console.log(`Game ${gameId} removed due to player disconnect`);
  }
});


});

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server + Socket.IO running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });