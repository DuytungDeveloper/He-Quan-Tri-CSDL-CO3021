import mongoose from 'mongoose';


const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017';

if (!MONGO_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose as { conn: mongoose.Connection | null, promise: Promise<mongoose.Connection> | null };

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
            dbName: process.env.MONGODB_DB_NAME || 'he-quan-tri-csdl',
            authSource: process.env.MONGODB_DB_AUTHSOURCE || 'admin',
            directConnection: process.env.DIRECT_CONNECTION === 'true' ? true : false,
            ssl: process.env.SSL === 'true' ? true : false
        }).then(m => m.connection);

    }
    cached.conn = await cached.promise;
    return cached.conn;
}