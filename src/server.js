import './Config/env.config.js'
import express from "express";
import authcontroller from "./modules/Auth/auth.controller.js";
import userController from "./modules/User/user.controller.js";
import messageController from "./modules/Message/message.controller.js";
import requestController from "./modules/Request/request.controller.js";
import conversationController from "./modules/Conversation/conversation.controller.js";
import  connectDB  from "./DB/connection.js";
import globalErrorHandler from './Middlewares/global-error-handler.middleware.js';
import cors from 'cors'
import { redisConnection } from './common/Clients/redis.client.js';
import { emailTransporter } from './common/Clients/email.client.js';
import { sendEmail } from './common/Services/email.service.js';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import { TooManyRequestsException } from './Utils/Errors/exception.error.js';
import { createRateLimiter } from './Middlewares/rate-limiter.middleware.js';
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

await connectDB();
await redisConnection();

app.use(cors() , helmet(), createRateLimiter() , express.json());
app.use('/uploads', express.static('uploads'))




app.use("/auth", authcontroller);
app.use("/user", userController);
app.use("/messages", messageController);
app.use("/requests", requestController);
app.use("/conversations", conversationController);



app.all("/*dummy", (req, res) => {
    return res.status(404).json({
        message: "Route not found"
    });
});



app.use(globalErrorHandler);


const PORT = process.env.PORT || 3000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

startServer();
