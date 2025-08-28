// import mongoose, { mongo } from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();

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