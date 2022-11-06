const io = require("socket.io")();
const socketapi = {
    io: io
};


io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg)
    })

    socket.on('typing', (data)=>{
        socket.broadcast.emit('typing', data);
    });
    
    io.on('disconnect', () => {
        console.log("User Disconnect");
    });
})
module.exports = socketapi;