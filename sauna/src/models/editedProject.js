import mongoose from 'mongoose';

const projectEdit = new mongoose.Schema({
    day: String,
    project: String,
    editors: [String],
    hours: [{
        type: Number,
        min: 0,
        max: 23,
    }],
    totalTime: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

export default mongoose.model('ProjectEdit', projectEdit);
