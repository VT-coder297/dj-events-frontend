import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function EventMap({ coords }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // If coordinates are missing or map container isn't ready, do nothing
    if (!coords || !mapContainer.current || mapInstance.current) return;

    // THE ABSOLUTE FULL SECURE VECTOR STYLE ENDPOINT STRING
    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [coords.lng, coords.lat], // Longitude first in MapLibre
      zoom: 14,
    });

    mapInstance.current.addControl(
      new maplibregl.NavigationControl(),
      'top-right',
    );

    // Create custom pin marker
    const markerEl = document.createElement('div');
    markerEl.style.width = '30px';
    markerEl.style.height = '30px';
    markerEl.style.backgroundImage = "url('/images/pin.svg')";
    markerEl.style.backgroundSize = 'cover';
    markerEl.style.cursor = 'pointer';

    new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coords]);

  if (!coords || !coords.lat || !coords.lng) {
    return (
      <p style={{ padding: '20px', color: 'red', fontWeight: 'bold' }}>
        Location coordinates unavailable for this address.
      </p>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}
    />
  );
}
