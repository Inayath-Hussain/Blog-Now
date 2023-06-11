import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid environment variable : MONGODB_URI')
}

const uri = process.env.MONGODB_URI;

let cached = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null }
}

const dbConnect = async () => {
    console.log('mongodb.js...', uri)
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false
            // bufferMaxEntries: 0,
            // useFindAndModify: true,
            // useCreateIndex: true
        }
        console.log('connection created.......')
        cached.promise = mongoose.connect(uri, opts).then(mong => {
            return mong
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}

export default dbConnect;