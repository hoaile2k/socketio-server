
const {Server} = require("socket.io");
const connectSocket = (server)=> {
    let mapRoomById = {};
    let mapUserInfoById = {};
    let mapSocketOnRoom = {};
    const io = new Server(server);
    io.on('connection', (socket) => {
        console.log("connection socket", socket.id);
        socket.on('disconnect', (s) => {
            console.log(`disconnect: ${socket.id}`);
        });

        socket.on("request-register", ({userId, userName})=>{
            console.log(`User ${userId} register`,socket.id);
            mapUserInfoById[userId] = {
                userId: userId,
                userName: userName,
                listFriend: [],
                listRoom: []
            }
            io.to(socket.id).emit("register-success", mapUserInfoById[userId]);
        });

        socket.on("request-login", ({userId})=>{
            console.log({userId: userId});
            console.log(`User ${userId} login`, mapUserInfoById);
            if(mapUserInfoById[userId]){
                let listRoomInfo = [];
                mapUserInfoById[userId].listRoom.forEach(roomId => listRoomInfo.push(mapRoomById[roomId]));
                mapUserInfoById[userId].listRoomInfo = listRoomInfo;
                io.to(socket.id).emit("login-success", mapUserInfoById[userId]);
            }else {
                io.to(socket.id).emit("login-failed", {
                    message: "user not found"
                });
            }
        })

        socket.on("request-create-room", ({roomId, roomName, userId})=>{
            console.log("request-create-room", {roomId, roomName, userId});
            if(mapRoomById[roomId]){
                io.to(socket.id).emit("create-room-failed", {message: "This roomId is existed"});
            }else {
                console.log("user " + mapUserInfoById[userId].userName + "create room " + roomName);
                mapRoomById[roomId] = {
                    roomId: roomId,
                    roomName: roomName,
                    listUser: [],
                    listRecentChat: [],
                    lastMsg: "N/A"
                }
                io.to(socket.id).emit("create-room-success", {
                    message: "room: " + roomName + " is created successfully",
                    newRoom: mapRoomById[roomId]
                });
            }
        })

        socket.on("request-join-room", ({roomId, userId})=>{
            console.log("user " + mapUserInfoById[userId].userName + " join room " + roomId);
            if(mapRoomById[roomId]){
                socket.join(roomId);
                if(mapUserInfoById[userId].listRoom.indexOf(roomId) === -1) {
                    mapUserInfoById[userId].listRoom.push(roomId);
                }
                if(mapRoomById[roomId].listUser.indexOf(userId) === -1) {
                    mapRoomById[roomId].listUser.push(userId);
                }
                io.to(socket.id).emit("join-room-success", {
                    roomId: roomId,
                    roomName: mapRoomById[roomId].roomName,
                    listUser: _getListUserNameByListUserId(mapRoomById[roomId].listUser),
                    listRecentChat: mapRoomById[roomId].listRecentChat
                });
                io.in(roomId).emit("new-user-join-room", mapUserInfoById[socket.id]);
                !mapSocketOnRoom[roomId] && (mapSocketOnRoom[roomId] = []);
                if(!_checkSocketExistRoom(socket.id, mapSocketOnRoom)) {
                    mapSocketOnRoom[roomId].push(socket.id);
                }
            }else {
                io.to(socket.id).emit("join-room-failed", {message: "This roomId isn't existed"});
            }

        })

        socket.on("send-chat", ({roomId, content, userId})=>{
            console.log("send-chat", roomId, mapRoomById, userId)
            const arrSocketOnRoom = mapSocketOnRoom[roomId] || [];
            const newChat = {
                userChatId: userId,
                userChat: mapUserInfoById[userId].userName,
                content: content
            }
            mapRoomById[roomId].listRecentChat.push(newChat);
            mapRoomById[roomId].lastMsg = content;
            console.log(mapSocketOnRoom, roomId, mapSocketOnRoom[roomId])
            arrSocketOnRoom.forEach(sId => {
                io.to(sId).emit("new-chat", newChat);
            })
        })
    });
    function _checkSocketExistRoom(socketId, mapSocket) {
        return Object.keys(mapSocket).indexOf(socketId) >= 0;
    }

    function _getListUserNameByListUserId(listUserId) {
        let listUserName = [];
        listUserId.forEach(userId => {
            listUserName.push(mapUserInfoById[userId].userName);
        })
        return listUserName;
    }
}
module.exports.connectSocket = connectSocket;