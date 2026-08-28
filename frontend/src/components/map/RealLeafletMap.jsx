import React, { useEffect, useState, Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Package,
  Building,
  HeartHandshake,
  Truck,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';

// Error Boundary to prevent Leaflet from ever crashing the React component tree
export class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[MapErrorBoundary] Leaflet render note:', error.message, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[480px] rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Coimbatore Live Telemetry Map</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Saravanampatti &bull; Gandhipuram &bull; Peelamedu Dispatch Corridors
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Leaflet View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Controller to safely move/fly camera
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (
      center &&
      Array.isArray(center) &&
      center.length === 2 &&
      typeof center[0] === 'number' &&
      typeof center[1] === 'number' &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      try {
        map.flyTo(center, zoom || 12, { duration: 1.0 });
      } catch (e) {
        // ignore map animation errors
      }
    }
  }, [center, zoom, map]);
  return null;
}

// Safe number parser
const safeNum = (val, fallback) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

// Safe string slice
const safeSlice = (val) => String(val || Math.random()).slice(-4);

// Custom HTML DivIcon Creator
const createHtmlIcon = (iconType, label, count = null) => {
  let bgColor = 'bg-emerald-600';
  let borderColor = 'border-emerald-200';
  let textColor = 'text-emerald-700';
  let bgLight = 'bg-emerald-50';
  let pulseRing = false;
  let iconSvg = '';

  switch (iconType) {
    case 'donor':
      bgColor = 'bg-emerald-600';
      borderColor = 'border-emerald-300';
      bgLight = 'bg-emerald-50';
      textColor = 'text-emerald-800';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
        </svg>`;
      break;

    case 'surplus':
      bgColor = 'bg-emerald-500';
      borderColor = 'border-emerald-200';
      bgLight = 'bg-emerald-50';
      textColor = 'text-emerald-800';
      pulseRing = true;
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>`;
      break;

    case 'shelter':
    case 'recipient':
      bgColor = 'bg-purple-600';
      borderColor = 'border-purple-300';
      bgLight = 'bg-purple-50';
      textColor = 'text-purple-800';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`;
      break;

    case 'volunteer':
    case 'courier':
      bgColor = 'bg-amber-500';
      borderColor = 'border-amber-300';
      bgLight = 'bg-amber-50';
      textColor = 'text-amber-800';
      pulseRing = true;
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18.5" r="2.5"/>
          <circle cx="7" cy="18.5" r="2.5"/>
        </svg>`;
      break;

    case 'delivery':
      bgColor = 'bg-sky-600';
      borderColor = 'border-sky-300';
      bgLight = 'bg-sky-50';
      textColor = 'text-sky-800';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>`;
      break;

    default:
      bgColor = 'bg-slate-600';
      borderColor = 'border-slate-300';
      bgLight = 'bg-slate-50';
      textColor = 'text-slate-800';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>`;
  }

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
      ${
        pulseRing
          ? `<span class="absolute -top-1 -left-1 w-10 h-10 rounded-full ${bgColor} opacity-40 animate-ping"></span>`
          : ''
      }
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} shadow-lg border-2 border-white transition-transform duration-200 group-hover:scale-110">
        ${iconSvg}
      </div>
      <div class="w-2 h-2 ${bgColor} rotate-45 -mt-1 shadow-sm"></div>
      ${
        label
          ? `<div class="mt-1 px-2 py-0.5 rounded-md ${bgLight} border ${borderColor} ${textColor} text-[10px] font-bold whitespace-nowrap shadow-sm max-w-[120px] truncate">
              ${label}
            </div>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -46],
  });
};

// Fix Leaflet Default Icon in bundlers
if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function LeafletMapInner({
  mapData = null,
  layers = {
    all: true,
    surplus: true,
    pickups: true,
    deliveries: true,
    shelters: true,
    volunteers: true,
    traffic: true,
  },
  onSelectActivity = () => {},
  mapTileMode = 'Map',
  height = '500px',
  focusLocation = null,
}) {
  const defaultCenter = [11.0168, 76.9678]; // Coimbatore, Tamil Nadu
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (focusLocation && typeof focusLocation.lat === 'number' && typeof focusLocation.lng === 'number') {
      setMapCenter([focusLocation.lat, focusLocation.lng]);
      setMapZoom(14);
    } else if (mapData?.center && typeof mapData.center.lat === 'number' && typeof mapData.center.lng === 'number') {
      setMapCenter([mapData.center.lat, mapData.center.lng]);
      setMapZoom(mapData.center.zoom || 12);
    }
  }, [focusLocation, mapData]);

  const tileLayerUrl =
    mapTileMode === 'Satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    mapTileMode === 'Satellite'
      ? '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Sanitize route coordinates
  const rawRoute = mapData?.activeRoute?.coordinates || [];
  const routeCoordinates = rawRoute.filter(
    (pt) => Array.isArray(pt) && pt.length === 2 && !isNaN(pt[0]) && !isNaN(pt[1])
  );

  if (!isMounted) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center" style={{ height }}>
        <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold">Loading Coimbatore OpenStreetMap...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        key={`osm-coimbatore-${mapTileMode}`}
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', minHeight: height }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        <TileLayer url={tileLayerUrl} attribution={tileAttribution} maxZoom={19} />

        {/* 1. Real Road Network Polyline (OSRM Highway/Street Corridor) */}
        {layers?.deliveries && routeCoordinates.length > 0 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#10B981',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#059669',
                weight: 4,
                opacity: 0.95,
                dashArray: '8, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* 2. Donors Markers */}
        {layers?.surplus &&
          (mapData?.donors || []).map((donor, idx) => {
            const lat = safeNum(donor.latitude, 11.0805 + idx * 0.005);
            const lng = safeNum(donor.longitude, 76.9942 + idx * 0.005);
            const name = donor.name || 'Food Donor Facility';
            const donorId = safeSlice(donor.id || donor._id);

            return (
              <Marker
                key={`donor-${donorId}-${idx}`}
                position={[lat, lng]}
                icon={createHtmlIcon('donor', name)}
                eventHandlers={{
                  click: () => {
                    onSelectActivity({
                      id: `DON-${donorId}`,
                      type: 'donor',
                      status: 'ACTIVE_FACILITY',
                      pickup: {
                        name,
                        address: donor.address || 'Saravanampatti, Coimbatore',
                        category: donor.donorType || 'Commercial Kitchen',
                      },
                      volunteer: {
                        name: 'Kumaran',
                        phone: '+91 98765 43210',
                        status: 'On Duty (Lead Courier)',
                        location: 'Near Gandhipuram',
                      },
                    });
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-2 min-w-[230px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase">
                        <Building className="w-3 h-3" /> Donor Facility
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Coimbatore</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{donor.address || 'Saravanampatti, Coimbatore'}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Type: {donor.donorType || 'Restaurant'} &bull; Phone: {donor.phone || '+91 98200 11223'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMapCenter([lat, lng]);
                        setMapZoom(15);
                      }}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Center on Facility
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 3. Surplus Food Batches Markers */}
        {layers?.surplus &&
          (mapData?.surplusFood || []).map((lot, idx) => {
            const lat = safeNum(lot.latitude, 11.0805 + idx * 0.002);
            const lng = safeNum(lot.longitude, 76.9942 + idx * 0.002);
            const title = lot.title || 'Prepared Meals';
            const lotId = safeSlice(lot.id || lot._id);

            return (
              <Marker
                key={`lot-${lotId}-${idx}`}
                position={[lat, lng]}
                icon={createHtmlIcon('surplus', `${lot.quantityValue || 25} ${lot.quantityUnit || 'KG'}`, lot.quantityValue)}
                eventHandlers={{
                  click: () => {
                    onSelectActivity({
                      id: `SF-${lotId}`,
                      type: 'surplus',
                      status: lot.status || 'AVAILABLE',
                      pickup: {
                        name: lot.donorName || 'Deedarsh (The Green Bistro)',
                        address: lot.address || 'Saravanampatti, Coimbatore',
                        quantity: `${lot.quantityValue || 25} ${lot.quantityUnit || 'KG'} ${title}`,
                        category: lot.foodCategory || 'Cooked Meals',
                      },
                      volunteer: {
                        name: 'Kumaran',
                        phone: '+91 98765 43210',
                        status: 'On Duty (Lead Courier)',
                        location: 'Near Gandhipuram',
                      },
                      eta: { duration: '18 mins', expectedTime: '12:05 PM' },
                    });
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-2 min-w-[240px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase">
                        <Package className="w-3 h-3" /> Surplus Food Lot
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                        {lot.freshnessScore || 96}% Fresh
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                      <p className="text-xs text-emerald-700 font-bold mt-0.5">
                        {lot.quantityValue || 25} {lot.quantityUnit || 'KG'} &bull; {(lot.foodCategory || 'COOKED_MEALS').replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">From: {lot.donorName || 'The Green Bistro'}</p>
                    </div>
                    <div className="pt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Safe Window: {lot.safetyWindowHours || 4} hours remaining
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 4. NGO Recipient Shelters Markers */}
        {layers?.shelters &&
          (mapData?.recipients || []).map((shelter, idx) => {
            const lat = safeNum(shelter.latitude, 11.0267 + idx * 0.003);
            const lng = safeNum(shelter.longitude, 77.0055 + idx * 0.003);
            const name = shelter.name || 'Jersin (Peelamedu NGO Shelter)';
            const shelterId = safeSlice(shelter.id || shelter._id);

            return (
              <Marker
                key={`shelter-${shelterId}-${idx}`}
                position={[lat, lng]}
                icon={createHtmlIcon('shelter', name)}
                eventHandlers={{
                  click: () => {
                    onSelectActivity({
                      id: `REC-${shelterId}`,
                      type: 'shelter',
                      status: 'VERIFIED_RECIPIENT',
                      dropoff: {
                        name,
                        address: shelter.address || 'Avinashi Road, Coimbatore',
                        distance: '6.2 km away',
                      },
                      volunteer: {
                        name: 'Kumaran',
                        phone: '+91 98765 43210',
                        status: 'On Duty (Lead Courier)',
                        location: 'Near Gandhipuram',
                      },
                    });
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-2 min-w-[230px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase">
                        <HeartHandshake className="w-3 h-3" /> NGO Shelter
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Verified</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{shelter.address || 'Peelamedu, Coimbatore'}</p>
                      <p className="text-[11px] text-purple-700 font-semibold mt-1">
                        Capacity: {shelter.capacityMealsPerDay || 250} meals/day &bull; POC: {shelter.phone || '+91 98400 44556'}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 5. Volunteer Couriers Markers */}
        {layers?.volunteers &&
          (mapData?.volunteers || []).map((vol, idx) => {
            const lat = safeNum(vol.latitude || vol.currentLatitude, 11.0168);
            const lng = safeNum(vol.longitude || vol.currentLongitude, 76.9678);
            const name = vol.name || vol.fullName || 'Kumaran (Lead Courier)';
            const volId = safeSlice(vol.id || vol._id);

            return (
              <Marker
                key={`vol-${volId}-${idx}`}
                position={[lat, lng]}
                icon={createHtmlIcon('volunteer', name)}
                eventHandlers={{
                  click: () => {
                    onSelectActivity({
                      id: `VOL-${volId}`,
                      type: 'volunteer',
                      status: vol.isAvailable ? 'ON_DUTY' : 'BUSY',
                      volunteer: {
                        name,
                        phone: vol.phone || vol.contactPhone || '+91 98765 43210',
                        status: vol.isAvailable ? 'On Duty (Lead Courier)' : 'In Transit',
                        location: 'Near Gandhipuram, Coimbatore',
                      },
                    });
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-2 min-w-[230px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase">
                        <Truck className="w-3 h-3" /> Courier Driver
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">● On Duty</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Vehicle: {vol.vehicleType || 'CAR'} (Payload: {vol.vehicleCapacityKg || 75}kg)
                      </p>
                      <p className="text-[11px] text-amber-700 font-semibold mt-1">
                        Phone: {vol.phone || vol.contactPhone || '+91 98765 43210'}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 6. Active Deliveries Markers */}
        {layers?.deliveries &&
          (mapData?.deliveries || []).map((del, idx) => {
            const lat = safeNum(del.courierLat, 11.0168 + idx * 0.004);
            const lng = safeNum(del.courierLng, 76.9678 + idx * 0.004);
            const volName = del.volunteerName || 'Kumaran';
            const delId = safeSlice(del.id || del._id);

            return (
              <Marker
                key={`del-${delId}-${idx}`}
                position={[lat, lng]}
                icon={createHtmlIcon('delivery', `In Transit (${volName})`)}
                eventHandlers={{
                  click: () => {
                    onSelectActivity({
                      id: `DL-${delId}`,
                      type: 'delivery',
                      status: del.status || 'IN_TRANSIT',
                      pickup: {
                        name: 'Deedarsh (The Green Bistro)',
                        address: del.pickupAddress || 'Saravanampatti, Coimbatore',
                        quantity: del.donationTitle || '40kg Prepared Meals',
                        category: 'Prepared Meals',
                      },
                      dropoff: {
                        name: 'Jersin (Peelamedu NGO Shelter)',
                        address: del.dropoffAddress || 'Peelamedu, Coimbatore',
                        distance: `${del.distanceKm || 6.2} km away`,
                      },
                      volunteer: {
                        name: volName,
                        phone: '+91 98765 43210',
                        status: 'In Transit',
                        location: 'Near Gandhipuram Corridor',
                      },
                      eta: { duration: `${del.durationMinutes || 18} mins`, expectedTime: '12:15 PM' },
                    });
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-2 min-w-[250px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase">
                        <Navigation className="w-3 h-3" /> Active Delivery Mission
                      </span>
                      <span className="text-[10px] font-bold text-sky-700">{(del.status || 'IN_TRANSIT').replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{del.donationTitle || 'Prepared Meals'}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        From: <span className="font-semibold text-slate-800">{del.pickupAddress || 'Saravanampatti'}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        To: <span className="font-semibold text-slate-800">{del.dropoffAddress || 'Peelamedu'}</span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Floating Map Watermark Badge */}
      <div className="absolute top-4 left-4 z-[400] px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 shadow-md backdrop-blur-md flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-extrabold text-slate-900">Coimbatore Live Telemetry</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
          OpenStreetMap &bull; Leaflet
        </span>
      </div>

      {/* Active Route Telemetry Overlay Card */}
      {mapData?.activeRoute && (
        <div className="absolute bottom-4 left-4 z-[400] p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-lg backdrop-blur-md max-w-sm hidden sm:block">
          <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Active Corridor Route
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              {mapData.activeRoute.isRealRoadNetwork ? 'OSRM Road Network' : 'Corridor Path'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Distance</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {mapData.activeRoute.distanceKm || 17.7} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Est. Driving Time</span>
              <span className="text-sm font-extrabold text-emerald-700 font-mono">
                {mapData.activeRoute.durationMinutes || 20} mins
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Waypoints</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {mapData.activeRoute.waypoints?.length || 3}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RealLeafletMap(props) {
  return (
    <MapErrorBoundary>
      <LeafletMapInner {...props} />
    </MapErrorBoundary>
  );
}
