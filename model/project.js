const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_URL);
let projectSchema = mongoose.Schema({
    projectName: String,
    description: String,
    technology: String,
    startDate: String,
    endDate: String,
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    teamMember: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    toDoTask: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board'
    }],
    inProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board'
    }],
    inReview: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board'
    }],
    done: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board'
    }],
    meeting: [{
        date: {
            type: String
        },
        month: {
            type: String
        },
        time: {
            type: String
        }
    }]
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('project', projectSchema);