// frontend/src/components/AddressMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Read-only map component for displaying a saved address
 * @param {Object} props
 * @param {Object} props.coordinates - Location to display {lat, lng}
 * @param {String} props.address - Address text for popup
 * @param {String} props.height - Map container height (default: 200px)
 */
const AddressMap = ({ coordinates, address, height = '200px' }) => {
    // If no coordinates provided, don't render the map
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
        return (
            <div
                style={{ height }}
                className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300"
            >
                <p className="text-gray-500 text-sm">No location data available</p>
            </div>
        );
    }

    return (
        <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={15}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coordinates.lat, coordinates.lng]}>
                    {address && (
                        <Popup>
                            <div className="text-sm">
                                <strong>Delivery Location</strong>
                                <br />
                                {address}
                            </div>
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
        </div>
    );
};

export default AddressMap;
