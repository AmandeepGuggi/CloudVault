import { createClient } from "redis";

const redisClient = await createClient().connect()

redisClient.on('error', (err) =>{ 
    console.log('redis client err', err)
    process.exit(1)
})

export default redisClient
// redisClient.setJSON = async function(key, value) {
//  return await this.set(key, JSON.stringify(value));
// }

// redisClient.getJSON = async function (key) {
//   const data = await redisClient.get(key);
//     return JSON.parse(data);
// }

