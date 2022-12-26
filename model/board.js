const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_URL);

let boardSchema = mongoose.Schema({
    subject: String,
    description: String,
    attachment: [{
        type: String,
    }],
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('board', boardSchema);