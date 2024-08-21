const PORT = process.env.PORT || 5001;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});


io.on('connection', (socket) => {
    let ctxSocketId = null;
    let mapListChatOnRoom = {};
    let mapListUserOnRoom = {};
    socket.on('disconnect', (s) => {
        console.log(`disconnect: ${socket.id}`);
    });
    socket.on("join", ({username, roomId, userId}) => {
        if (!mapListUserOnRoom[roomId]) {
            mapListUserOnRoom[roomId] = [];
        }
        const path = "room_" + roomId;
        console.log("user " + userId);
        //Join room
        socket.join(path);
        //Send private message when join success
        const userInfo = {
            username: username,
            avatar: 0,
            userId: userId,
        }
        console.log("userInfo", userInfo)
        io.to(socket.id).emit("join-room-success", {
            roomId: roomId,
            listUserOnRoom: mapListUserOnRoom[roomId],
            userInfo: userInfo
        });
        //Send present message user join room
        io.in(path).emit("user-join-room", userInfo);
        mapListUserOnRoom[roomId].push(userInfo);
        ctxSocketId = userId;
    })
    socket.on("send-chat", ({username, content, roomId, userId}) => {
        if (!mapListChatOnRoom[roomId]) {
            mapListChatOnRoom[roomId] = [];
        }
        const path = "room_" + roomId;
        console.log()
        const chatInfo = {
            username: username,
            content: content,
            userId: userId
        }
        mapListChatOnRoom[roomId].push(chatInfo);
        socket.in(path).emit("chat-message", mapListChatOnRoom[roomId]);
    })
});






server.listen(PORT, () => {
    console.log('listening on PORT:', PORT);
});