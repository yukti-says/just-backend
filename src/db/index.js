import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
         const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("Database connected successfully");
        console.log(`connection host  => ${connectionInstance.connection.host}`);
        

        
    }catch (error) {
        console.log("Error connecting to the database", error);
        process.exit(1);
    }
}

export default connectDB;