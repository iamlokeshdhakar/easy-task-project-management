const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/easytask');

let chatSchema = mongoose.Schema({
    message: String,
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('chat', chatSchema);