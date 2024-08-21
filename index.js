const PORT = process.env.PORT || 5001;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {connectSocket} = require("./socket-io-server");
app.get('/', (req, res) => {
    res.send(`<h1>Socket is started on PORT: ${PORT}</h1>`);
});

connectSocket(server);

server.listen(PORT, () => {
    console.log('listening on PORT:', PORT);
});

