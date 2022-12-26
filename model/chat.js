const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_URL);

let chatSchema = mongoose.Schema({
    message: String,
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('chat', chatSchema);