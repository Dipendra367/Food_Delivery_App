// backend/controllers/geocodingController.js
const axios = require('axios');

/**
 * Geocoding service using Nominatim (OpenStreetMap's free geocoding API)
 * No API key required, but respects usage policy (max 1 request/second)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'NepEats-FoodDelivery/1.0'; // Required by Nominatim usage policy

// Rate limiting: ensure at least 1 second between requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ensure we respect rate limits
 */
async function rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }

    lastRequestTime = Date.now();
}

/**
 * Convert address to coordinates (forward geocoding)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.forwardGeocode = async (req, res) => {
    try {
        const { street, area, city } = req.query;
        
        // Basic validation
        if (!street && !area && !city) {
            return res.status(400).json({ message: 'At least one address field (street, area, city) is required' });
        }

        await rateLimit();

        // Build search query - prioritize Nepal locations
        const searchParts = [];
        if (street) searchParts.push(street);
        if (area) searchParts.push(area);
        if (city) searchParts.push(city);
        searchParts.push('Nepal'); // Always include Nepal for better results

        const query = searchParts.join(', ');

        const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
            params: {
                q: query,
                format: 'json',
                limit: 1,
                countrycodes: 'np', // Restrict to Nepal
                addressdetails: 1
            },
            headers: {
                'User-Agent': USER_AGENT
            },
            timeout: 5000
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return res.json({
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            });
        }

        return res.status(404).json({ message: 'Location not found' });
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return res.status(500).json({ message: 'Geocoding service unavailable' });
    }
};

/**
 * Convert coordinates to address (reverse geocoding)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.reverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        await rateLimit();

        const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
            params: {
                lat,
                lon: lng,
                format: 'json',
                addressdetails: 1
            },
            headers: {
                'User-Agent': USER_AGENT
            },
            timeout: 5000
        });

        if (response.data && response.data.address) {
            const addr = response.data.address;
            return res.json({
                street: addr.road || addr.neighbourhood || '',
                area: addr.suburb || addr.neighbourhood || addr.village || '',
                city: addr.city || addr.town || addr.municipality || 'Kathmandu',
                country: addr.country || 'Nepal',
                displayName: response.data.display_name
            });
        }

        return res.status(404).json({ message: 'Address not found' });
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        return res.status(500).json({ message: 'Geocoding service unavailable' });
    }
};

/**
 * Get default coordinates for major Nepal cities
 * @param {String} city - City name
 */
exports.getDefaultCityCoordinates = (req, res) => {
    const { city } = req.params;
    
    const cityCoords = {
        'kathmandu': { lat: 27.7172, lng: 85.3240 },
        'pokhara': { lat: 28.2096, lng: 83.9856 },
        'lalitpur': { lat: 27.6667, lng: 85.3167 },
        'bhaktapur': { lat: 27.6710, lng: 85.4298 },
        'biratnagar': { lat: 26.4525, lng: 87.2718 },
        'birgunj': { lat: 27.0104, lng: 84.8767 },
        'dharan': { lat: 26.8125, lng: 87.2833 },
        'hetauda': { lat: 27.4287, lng: 85.0325 },
        'janakpur': { lat: 26.7288, lng: 85.9244 },
        'butwal': { lat: 27.7000, lng: 83.4500 }
    };

    const normalizedCity = city ? city.toLowerCase().trim() : 'kathmandu';
    const coords = cityCoords[normalizedCity] || cityCoords['kathmandu']; // Default to Kathmandu

    res.json(coords);
};
