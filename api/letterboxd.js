export default async function handler(req, res) {
    const { user } = req.query;
    const username = user || 'asad_k';
    
    try {
        const response = await fetch(`https://letterboxd.com/${username}/rss/`);
        
        if (!response.ok) {
            throw new Error(`Letterboxd responded with ${response.status}`);
        }
        
        const xml = await response.text();
        
        // Add CORS headers so we can access it from the frontend
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
        
        res.status(200).send(xml);
    } catch (error) {
        console.error('Letterboxd API Error:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
}
