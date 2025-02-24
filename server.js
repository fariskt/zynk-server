import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import http from 'http'
import cors from 'cors'
import cookieParser from "cookie-parser";
import connectDB from './config/db.js'

const app = express();
const server = http.createServer(app)
const port = process.env.PORT || 5000;

import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import postRoute from './routes/postRoute.js';
import commentRoute from './routes/commentRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import chatRoute from './routes/chatRoute.js';
import { Server } from "socket.io";
import {chatSocket} from './sockets/chatSocket.js';
import {notificationSocket} from './sockets/notificationSocket.js';

connectDB();

app.use(cors({
    origin: ["http://localhost:3000","https://zynk-social-media.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//add io connection all requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);
app.use("/api/post/comment", commentRoute);
app.use("/api/chat", chatRoute);
app.use("/api/user/notification", notificationRoute);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000","https://zynk-social-media.vercel.app"],
        methods: ["GET", "POST"]
    }
});

chatSocket(io)
notificationSocket(io)


server.listen(port, () => {
    console.log(`Server connected to port ${port} successfully`);
});
