import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

function IPMap({ lat, lon }) {
    return (
        <MapContainer center={[lat, lon]} zoom={13} style={{ height: '12rem', width: '100%', borderRadius: 'var(--container-border-radius)', border: 'var(--container-border-color)' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
            />
            <Marker position={[lat, lon]}>
                <Popup>Ваше примерное положение</Popup>
            </Marker>
        </MapContainer>
    );
}

export default IPMap;