import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URL;

export default async () => {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
        .then(console.log('Connected to MongoDB database.'))
        .catch((e) => {
            console.log('Could not connect to MongoDB database: ', e);
            process.exit();
        });
};
