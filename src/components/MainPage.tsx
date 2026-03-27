import { useSpacetimeDB, useReducer, useTable } from "spacetimedb/react";
import { useEffect, useRef, useState } from "react";

import maplibregl, { MapMouseEvent, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { reducers, tables } from "../module_bindings/index.ts";
import { Rating } from "../module_bindings/types.ts";

interface RatingMarker {
  lng: number;
  lat: number;
  popup: string;
}

interface FoodMapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: RatingMarker[];
  friendMarkers?: RatingMarker[];
}

interface RatingDialogProps {
  lng: number;
  lat: number;
  onSubmit: (rating: Rating) => void;
  onCancel: () => void;
}

function RatingDialog({ lng, lat, onSubmit, onCancel }: RatingDialogProps) {
  const ratingOptions = [
    { value: Rating.One, label: "1" },
    { value: Rating.Two, label: "2" },
    { value: Rating.Three, label: "3" },
    { value: Rating.Four, label: "4" },
    { value: Rating.Five, label: "5" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
        minWidth: "200px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0" }}>Rate this location</h3>
      <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#666" }}>
        Coordinates: {lng.toFixed(4)}, {lat.toFixed(4)}
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {ratingOptions.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => onSubmit(value)}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "#f5f5f5",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={onCancel}
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: "#f5f5f5",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function FoodMap({
  center = [24.9384, 60.1699],
  zoom = 12,
  markers = [],
  friendMarkers = [],
  onMapClick,
}: FoodMapViewProps & { onMapClick?: (lng: number, lat: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [currentRatingMarker, setCurrentRatingMarker] =
    useState<RatingMarker | null>(null);
  const [addedMarker, setAddedMarker] = useState<Marker | null>(null);

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

    map.on("click", (e: MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setCurrentRatingMarker({ lng, lat, popup: "Onclick marker!" });
      onMapClick?.(lng, lat);
    });

    mapRef.current = map;
    return () => {
      map.remove();
    };
  }, []);

  // Add markers effects
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markers.forEach(({ lng, lat, popup }) => {
      const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
      if (popup) {
        marker.setPopup(new maplibregl.Popup().setText(popup));
      }
    });

    friendMarkers.forEach(({ lng, lat, popup }) => {
      const marker = new maplibregl.Marker({ color: "#f97316" })
        .setLngLat([lng, lat])
        .addTo(map);
      if (popup) {
        marker.setPopup(new maplibregl.Popup().setText(popup));
      }
    });
  }, [markers, friendMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (currentRatingMarker === null) return;

    if (addedMarker !== null) {
      addedMarker.remove();
    }

    const newMarker = new maplibregl.Marker()
      .setLngLat([currentRatingMarker.lng, currentRatingMarker.lat])
      .addTo(map);
    if (currentRatingMarker.popup) {
      newMarker.setPopup(
        new maplibregl.Popup().setText(currentRatingMarker.popup),
      );
    }
    setAddedMarker(newMarker);
  }, [currentRatingMarker]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
        borderRadius: "8px",
        position: "relative",
      }}
    ></div>
  );
}

function MainPage() {
  const { isActive: connected } = useSpacetimeDB();

  const [allRatings] = useTable(tables.all_ratings);
  const [allFriendRatings] = useTable(tables.all_friend_ratings);

  const currentUserRatingMarkers = allRatings.map((rating) => ({
    lng: rating.longitude,
    lat: rating.latitude,
    popup: rating.rating.tag,
  }));
  const friendRatingMarkers = allFriendRatings.map((rating) => ({
    lng: rating.longitude,
    lat: rating.latitude,
    popup: rating.rating.tag,
  }));

  const addNewRating = useReducer(reducers.addNewRating);
  const [pendingRating, setPendingRating] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  const handleMapClick = (lng: number, lat: number) => {
    setPendingRating({ lng, lat });
  };

  const handleRatingSubmit = (rating: Rating) => {
    if (pendingRating) {
      addNewRating({
        longitude: pendingRating.lng,
        latitude: pendingRating.lat,
        rating,
      });
      setPendingRating(null);
    }
  };

  const handleRatingCancel = () => {
    setPendingRating(null);
  };

  if (!connected) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <FoodMap
        markers={currentUserRatingMarkers}
        friendMarkers={friendRatingMarkers}
        onMapClick={handleMapClick}
      />
      {pendingRating && (
        <RatingDialog
          lng={pendingRating.lng}
          lat={pendingRating.lat}
          onSubmit={handleRatingSubmit}
          onCancel={handleRatingCancel}
        />
      )}
    </div>
  );
}

export default MainPage;
