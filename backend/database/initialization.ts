import mongoose from "mongoose";

export async function initializeDatabase(): Promise<void> {
    const mongourl = process.env.MONGO_URI;
    if (!mongourl) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    try {
        console.log("Connecting to MongoDB" );
        await mongoose.connect(mongourl );
        console.log("Connected to MongoDB" );
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }

    const gracefulExit = async () => {
        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB");
        } finally {
            process.exit(0);
        }
    };

    process.on("SIGINT", gracefulExit);
    process.on("SIGTERM", gracefulExit);
}

export default initializeDatabase;