import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// configure express app here (middlewares, routes, etc.)

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,

}));

app.use(express.json({
    limit: '18kb'
})); //jab form fill tab data aaye to handle kiya

app.use(express.urlencoded({ extended: true,limit:'16kb' })); //ab url se bheje to handle kiya

app.use(express.static('public')); //to serve static files like images,css,js
app.use(cookieParser()); //to parse cookies


export default app;
// export{ app }; or this way also we can export