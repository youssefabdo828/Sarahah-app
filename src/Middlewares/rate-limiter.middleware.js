import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { TooManyRequestsException } from "../Utils/Errors/exception.error.js"
import axios from "axios"
import RedisStore from "rate-limit-redis"
import { redisClient } from "../common/Clients/redis.client.js"

function getIPDetails (ip){
    return axios.get(`http://ip-api.com/json/${ip}`)
}


export const createRateLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit:async(req)=>{
        const {data:{countryCode}} = await getIPDetails(req.headers['x-forwareded-for'])
        
        let max ;
        switch (countryCode) {
                case 'EG':
                    max = 100
                    break;
                case 'US':
                    max = 4
                    break;
                default:
                    max = 30;
            }
            return max
        
    }, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers)
  // message : new TooManyRequestsException('Many Requests' , null , 'RATE_LIMITET'),
  requestPropertyName:'rateLimiterInfo',
  skipFailedRequests:true,
  handler : (req,res,next)=>{
    next(new TooManyRequestsException('Many Requests' , null , 'RATE_LIMITET'))
  },
    keyGenerator: (req, res) => {
        const ip = ipKeyGenerator(req.headers['x-forwareded-for'])
        
    return `${ip}_${req.url}`
  },
  store : new RedisStore({
    sendCommand:async(...args)=>{
        const data = await redisClient.sendCommand(args)
        return data
    }
  }),
  })