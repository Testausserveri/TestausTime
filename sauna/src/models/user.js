import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const user = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true,
    },
    apiKey: {
        type: String,
        required: true,
    },
    editedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectEdit',
        required: true,
    }],
});

user.plugin(uniqueValidator);

export default mongoose.model('User', user);
