import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface FoodMapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: { lng: number; lat: number; popup?: string }[];
}

function FoodMap({
  center = [24.9384, 60.1699],
  zoom = 12,
  markers = [],
}: FoodMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style:
        "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
      center: center,
      zoom: zoom,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add markers
    markers.forEach(({ lng, lat, popup }) => {
      const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
      if (popup) {
        marker.setPopup(new maplibregl.Popup().setText(popup));
      }
    });

    mapRef.current = map;
    return () => map.remove();
  }, [center, zoom, markers]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "500px", borderRadius: "8px" }}
    ></div>
  );
}

export default FoodMap;
