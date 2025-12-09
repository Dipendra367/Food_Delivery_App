// frontend/src/components/MapPicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend(e) {
                    setPosition(e.target.getLatLng());
                },
            }}
        />
    );
}

// Component to recenter map when position changes (e.g. from search)
function MapRecenter({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15); // Zoom in closer on search result
        }
    }, [position, map]);
    return null;
}

/**
 * Interactive map component for selecting delivery locations
 * @param {Object} props
 * @param {Object} props.initialPosition - Starting coordinates {lat, lng}
 * @param {Function} props.onLocationSelect - Callback with selected coordinates
 * @param {String} props.height - Map container height (default: 400px)
 */
const MapPicker = ({ initialPosition, onLocationSelect, height = '400px' }) => {
    // Default to Kathmandu, Nepal if no initial position
    const defaultCenter = initialPosition || { lat: 27.7172, lng: 85.3240 };
    const [position, setPosition] = useState(defaultCenter);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    // Update position when initialPosition changes (for editing)
    useEffect(() => {
        if (initialPosition && initialPosition.lat && initialPosition.lng) {
            setPosition(initialPosition);
        }
    }, [initialPosition?.lat, initialPosition?.lng]);

    // Notify parent component when position changes - use ref to avoid infinite loop
    useEffect(() => {
        if (position && onLocationSelect) {
            onLocationSelect(position);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position.lat, position.lng]); // Only depend on actual coordinates

    // Handle search
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            // Use Nominatim for geocoding
            // Append Nepal context and use countrycodes=np for stricter filtering
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=np`,
                {
                    headers: {
                        'User-Agent': 'NepEats-FoodDelivery/1.0'
                    }
                }
            );

            const data = await response.json();
            if (data && data.length > 0) {
                const newPos = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                setPosition(newPos);
            } else {
                alert('Location not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search location. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="w-full">
            {/* Search Box */}
            <div className="mb-3 flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search location (e.g., Thamel, Kathmandu)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Instructions */}
            <p className="text-sm text-gray-600 mb-2">
                Click on the map or drag the marker to select your exact location
            </p>

            {/* Map Container */}
            <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                    center={[defaultCenter.lat, defaultCenter.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                    <MapRecenter position={position} />
                </MapContainer>
            </div>

            {/* Selected Coordinates Display */}
            {position && (
                <div className="mt-2 text-sm text-gray-600">
                    Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
};

export default MapPicker;
