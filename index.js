const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    forceNew: true
});

let mapListChatOnRoom = {};
let mapListUserOnRoom = {};

io.on("connection", (socket) => {
    let ctxSocketId = null;
    mapListChatOnRoom = {};
    mapListUserOnRoom = {};
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

httpServer.listen(3000);