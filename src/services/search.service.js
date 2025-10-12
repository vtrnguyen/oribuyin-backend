const redis = require('../config/redis');

const GLOBAL_KEY = 'search:global';
const USER_KEY = (userId) => `search:user:${userId}`;

const MAX_USER_HISTORY = parseInt(process.env.USER_SEARCH_HISTORY_LIMIT || "50", 10);
const USER_HISTORY_TTL_SECONDS = parseInt(process.env.USER_SEARCH_HISTORY_TTL || String(60 * 60 * 24 * 30), 10); // default 30 days

const normalize = (keyword) => {
    if (!keyword) return '';
    return String(keyword).trim().toLowerCase();
};

const recordSearch = async (userId, keyword) => {
    const k = normalize(keyword);
    if (!k) return;

    try {
        await redis.zIncrBy(GLOBAL_KEY, 1, k);

        if (userId) {
            const ukey = USER_KEY(userId);
            await redis.lPush(ukey, k);
            await redis.lTrim(ukey, 0, MAX_USER_HISTORY - 1);
            if (USER_HISTORY_TTL_SECONDS > 0) {
                await redis.expire(ukey, USER_HISTORY_TTL_SECONDS);
            }
        }
    } catch (error) {
        console.error(">>> search.service.recordSearch error:", error);
    }
};

const getTopSearches = async (limit = 10) => {
    try {
        const items = await redis.zRevRangeWithScores(GLOBAL_KEY, 0, limit - 1);
        return items.map((item) => ({ keyword: item.value, count: Number(item.score) }));
    } catch (error) {
        console.log(">>> search.service.getTopSearches error:", error);
        return [];
    }
};

const getUserSearchHistory = async (userId, limit = 50) => {
    if (!userId) return [];
    try {
        const ukey = USER_KEY(userId);
        const endIdx = Math.min(limit - 1, MAX_USER_HISTORY - 1);
        const items = await redis.lRange(ukey, 0, endIdx); // newest first
        return items;
    } catch (err) {
        console.error("search.service.getUserSearchHistory error:", err);
        return [];
    }
};

const clearUserHistory = async (userId) => {
    if (!userId) return;
    try {
        const ukey = USER_KEY(userId);
        await redis.del(ukey);
    } catch (error) {
        console.error(">>> search.service.clearUserHistory error:", error);
    }
};

module.exports = {
    recordSearch,
    getTopSearches,
    getUserSearchHistory,
    clearUserHistory,
};
