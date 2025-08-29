// import mongoose, { mongo } from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();
// require('dotenv').config();


// (async() => {
//     try {
//         await mongoose.connect(`{process.env.MONGO_URI}/${DB_NAME}`)
//         app.on('Error', (err) => {
//             console.log(err);
//         });
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });

        
//     }
//     catch (Error) {
//         console.log(Error);
//     }
// })()
import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3000;

connectDB()
.then(() => {
    app .listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }); 
    
})
    .catch((err) => {
        console.log("Error connecting to the database", err);
        
    });
