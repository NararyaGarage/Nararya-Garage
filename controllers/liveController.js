const fetchData = require('../utils/fetchData');
const { uniqueBy } = require('../utils/arrayUtils');

const getJKT48Lives = async (req, res) => {
    try {
        const data = await fetchData('https://www.showroom-live.com/api/live/onlives');
        
        // Filter for rooms starting with either 'JKT48' or 'officialJKT48'
        const jkt48Lives = uniqueBy(data.onlives.flatMap((genre) =>
            genre.lives.filter((live) => 
                live.room_url_key && 
                (live.room_url_key.startsWith('JKT48') || live.room_url_key.startsWith('officialJKT48'))
            )
        ), 'live_id');
        
        // If there are no JKT48 live streams, return an empty array
        if (jkt48Lives.length === 0) {
            return res.status(200).json([]);
        }

        res.json(jkt48Lives);
    } catch (error) {
        console.error('Error fetching live data:', error);
        res.status(500).json({ error: 'Failed to fetch live data' });
    }
};

module.exports = {
    getJKT48Lives
};
