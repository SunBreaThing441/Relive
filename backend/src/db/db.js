import mongoose from "mongoose";
import dns from "dns";
import { DB_NAME } from "../constants.js";

// Ensure DNS resolution for MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // fallback if custom DNS servers cannot be set
}

const connectDB = async () => {
    try {
        const uri = (process.env.MONGODB_URI || "").replace(/\/+$/, "");
        const connectionIn = await mongoose.connect(`${uri}/${DB_NAME}`);
        console.log("mongoDB connected", connectionIn.connection.host);
        return connectionIn;
    } catch (error) {
        console.log("MongoDB Failed", error?.message);
        process.exit(1);
    }
};

export default connectDB;
