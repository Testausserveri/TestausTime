import mongoose from 'mongoose';

const user = new mongoose.Schema({
    discordId: {
        type: String,
        unique: true,
    },
    apiKey: String,
    editedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectEdit',
    }],
});

export default mongoose.model('User', user);
