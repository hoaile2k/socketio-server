
const {Server} = require("socket.io");
const connectSocket = (server)=> {

    let mapUserInfoUserId = {};

    const io = new Server(server);
    io.on('connection', (socket) => {
        console.log("connection socket", socket.id);
        let mapListChatOnRoom = {};
        let mapListUserOnRoom = {};
        socket.on('disconnect', (s) => {
            console.log(`disconnect: ${socket.id}`);
        });

        socket.on("request-register", ({userId, userName})=>{
            console.log(`User ${userId} register`);
            mapUserInfoUserId[userId] = {
                userId: userId,
                userName: userName
            }
        });

        socket.on("request-login", ({userId})=>{
            console.log(`User ${userId} login`, mapUserInfoUserId);
            if(mapUserInfoUserId[userId]){
                socket.emit("login-success", mapUserInfoUserId[userId]);
            }
        })


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
}
module.exports.connectSocket = connectSocket;