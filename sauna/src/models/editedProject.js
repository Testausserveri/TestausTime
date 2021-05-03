import mongoose from 'mongoose';

const projectEdit = new mongoose.Schema({
    day: {
        type: String,
        required: true,
    },
    project: {
        type: String,
        required: true,
    },
    editors: {
        type: [String],
        required: true,
    },
    hours: [{
        type: Number,
        min: 0,
        max: 23,
        required: true,
    }],
    totalTime: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

export default mongoose.model('ProjectEdit', projectEdit);
