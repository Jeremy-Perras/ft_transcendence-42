const Express = require("express")();
const Http= require("http").Server(Express);
// const Socketio=require("socket.io")(Http);
const Socketio = require("socket.io")(Http, {

    cors: {
      origin: "http://127.0.0.1:3000",
      methods: ["GET", "POST"]
    }

});


Socketio.on('connection', client => {
    socket.emit('init',{data: 'hello wolrd'});
});

Http.listen(3000, () => {
    console.log("Listening at:3000...");
});

