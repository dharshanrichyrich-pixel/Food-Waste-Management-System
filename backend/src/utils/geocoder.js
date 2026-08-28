/**
 * Coimbatore Geocoding & OSRM Real Road Network Routing Service
 */

// Coimbatore key landmark locations directory
const COIMBATORE_LOCATIONS = {
  saravanampatti: { lat: 11.0805, lng: 76.9942, name: 'Saravanampatti, Coimbatore' },
  peelamedu: { lat: 11.0267, lng: 77.0055, name: 'Peelamedu, Coimbatore' },
  gandhipuram: { lat: 11.0168, lng: 76.9678, name: 'Gandhipuram, Coimbatore' },
  'rs puram': { lat: 11.0089, lng: 76.9457, name: 'RS Puram, Coimbatore' },
  'town hall': { lat: 10.9984, lng: 76.9629, name: 'Town Hall, Coimbatore' },
  singanallur: { lat: 10.9981, lng: 77.0258, name: 'Singanallur, Coimbatore' },
  ganapathy: { lat: 11.0366, lng: 76.9792, name: 'Ganapathy, Coimbatore' },
  'saibaba colony': { lat: 11.0298, lng: 76.9427, name: 'Saibaba Colony, Coimbatore' },
  ramanathapuram: { lat: 10.9934, lng: 76.9892, name: 'Ramanathapuram, Coimbatore' },
  'hopes college': { lat: 11.0275, lng: 77.0121, name: 'Hopes College, Coimbatore' },
  'avinashi road': { lat: 11.0215, lng: 76.9980, name: 'Avinashi Road, Coimbatore' },
  'sathy road': { lat: 11.0620, lng: 76.9880, name: 'Sathy Road, Coimbatore' },
};

/**
 * Geocode an address to [latitude, longitude]
 */
export async function geocodeAddress(address = '') {
  const normalized = address.toLowerCase();

  // 1. Check local Coimbatore locations dictionary
  for (const [key, loc] of Object.entries(COIMBATORE_LOCATIONS)) {
    if (normalized.includes(key)) {
      return {
        latitude: loc.lat,
        longitude: loc.lng,
        displayName: loc.name,
      };
    }
  }

  // 2. Query Nominatim OpenStreetMap Geocoder
  try {
    const query = encodeURIComponent(`${address}, Coimbatore, Tamil Nadu, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: { 'User-Agent': 'FoodFlow-Waste-Management/1.0' },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    }
  } catch (err) {
    console.warn('[Geocoder] Nominatim query fallback:', err.message);
  }

  // Default fallback: Gandhipuram, Coimbatore
  return {
    latitude: 11.0168,
    longitude: 76.9678,
    displayName: 'Gandhipuram, Coimbatore, Tamil Nadu',
  };
}

/**
 * Fetch real driving road route between waypoints using OSRM (Open Source Routing Machine)
 * @param {Array<{lat: number, lng: number}>} points
 */
export async function getOsrmRoadRoute(points = []) {
  if (!points || points.length < 2) {
    return {
      coordinates: [],
      distanceKm: 0,
      durationMinutes: 0,
    };
  }

  try {
    // OSRM expects coordinates in "lng,lat" format separated by semicolon
    const coordsString = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        const leafletCoords = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);

        return {
          coordinates: leafletCoords,
          distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
          durationMinutes: Math.round(route.duration / 60),
          isRealRoadNetwork: true,
        };
      }
    }
  } catch (err) {
    console.warn('[OSRM Router] Road routing API note:', err.message);
  }

  // Fallback: Generate real-looking road corridor polyline through Coimbatore
  const fallbackCoords = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    fallbackCoords.push([start.lat, start.lng]);

    // Intermediate midpoint with slight urban road inflection
    const midLat = (start.lat + end.lat) / 2 + (Math.random() * 0.004 - 0.002);
    const midLng = (start.lng + end.lng) / 2 + (Math.random() * 0.004 - 0.002);
    fallbackCoords.push([midLat, midLng]);
    fallbackCoords.push([end.lat, end.lng]);
  }

  // Calculate approximate distance
  const dx = (points[0].lat - points[points.length - 1].lat) * 111;
  const dy = (points[0].lng - points[points.length - 1].lng) * 105;
  const approxDistance = parseFloat(Math.sqrt(dx * dx + dy * dy).toFixed(1));

  return {
    coordinates: fallbackCoords,
    distanceKm: approxDistance || 6.2,
    durationMinutes: Math.round((approxDistance || 6.2) * 2.8),
    isRealRoadNetwork: false,
  };
}
