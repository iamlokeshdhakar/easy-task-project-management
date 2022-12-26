const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_URL);

let userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    password: String,
    designation: String,
    profilePic: {
        type: String,
        default: 'default-dp.png'
    },
    updates:{
        toDoTask: {
            type: Number,
            default: 0,
        },
        inProgress: {
            type: Number,
            default: 0,
        },
        inReview:{
            type: Number,
            default: 0,
        },
        done:{
            type: Number,
            default: 0,
        },
    },
    projectDetails: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project'
        }
    ]

},
    {
        timestamps: true,
    }
);

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);