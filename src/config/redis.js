const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL;
const client = REDIS_URL
    ? createClient({ url: REDIS_URL })
    : createClient({
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
        },
        password: process.env.REDIS_PASSWORD || undefined,
    });

client.on("error", (error) => {
    console.error(">>> redis client error:", error);
});

(async () => {
    try {
        await client.connect();
        console.log("Redis client has connected...");
    } catch (error) {
        console.error(">>> failed to connect to redis:", error);
    }
})();

module.exports = client;