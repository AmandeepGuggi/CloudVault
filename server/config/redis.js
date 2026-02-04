import { createClient } from "redis";

const redisClient = await createClient().connect()

redisClient.on('error', (err) =>{ 
    console.log('redis client err', err)
    process.exit(1)
})

export default redisClient


