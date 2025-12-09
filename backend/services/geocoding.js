// backend/services/geocoding.js
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
 * @param {Object} address - Address object with street, city, area
 * @returns {Object} - { lat, lng } or null if not found
 */
async function geocodeAddress(address) {
    try {
        await rateLimit();

        // Build search query - prioritize Nepal locations
        const searchParts = [];
        if (address.street) searchParts.push(address.street);
        if (address.area) searchParts.push(address.area);
        if (address.city) searchParts.push(address.city);
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
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

/**
 * Convert coordinates to address (reverse geocoding)
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @returns {Object} - Address object or null if not found
 */
async function reverseGeocode(lat, lng) {
    try {
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
            return {
                street: addr.road || addr.neighbourhood || '',
                area: addr.suburb || addr.neighbourhood || addr.village || '',
                city: addr.city || addr.town || addr.municipality || 'Kathmandu',
                country: addr.country || 'Nepal',
                displayName: response.data.display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        return null;
    }
}

/**
 * Get default coordinates for major Nepal cities
 * @param {String} city - City name
 * @returns {Object} - { lat, lng }
 */
function getDefaultCityCoordinates(city) {
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

    const normalizedCity = city.toLowerCase().trim();
    return cityCoords[normalizedCity] || cityCoords['kathmandu']; // Default to Kathmandu
}

module.exports = {
    geocodeAddress,
    reverseGeocode,
    getDefaultCityCoordinates
};
