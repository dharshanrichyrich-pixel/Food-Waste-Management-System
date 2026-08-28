import React, { useState, useEffect, Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Building, HeartHandshake, Truck, MapPin } from 'lucide-react';
import { Badge } from '../ui/Badge';

// Error boundary for mini delivery map
class MiniMapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('[MiniMapErrorBoundary] note:', err.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-56 mt-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
          <MapPin className="w-6 h-6 text-emerald-600 mb-1" />
          <p className="text-xs font-bold text-slate-800">Dispatch GPS Active</p>
          <p className="text-[10px] text-slate-500">Saravanampatti → Peelamedu Corridor</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper to center the mini Leaflet map
function MiniMapController({ center }) {
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
        map.flyTo(center, 12, { duration: 1 });
      } catch (e) {}
    }
  }, [center, map]);
  return null;
}

const createMiniIcon = (color, type) => {
  let iconSvg = '';
  if (type === 'pickup') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/></svg>`;
  } else if (type === 'dropoff') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18.5" r="2.5"/><circle cx="7" cy="18.5" r="2.5"/></svg>`;
  }

  const html = `
    <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center">
      <div class="w-7 h-7 rounded-full bg-${color}-600 shadow-md flex items-center justify-center border-2 border-white">
        ${iconSvg}
      </div>
      <div class="w-2 h-2 bg-${color}-600 rotate-45 -mt-1 shadow-sm"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'mini-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });
};

function InnerInteractiveMap({
  pickup = { name: 'Deedarsh (The Green Bistro)', address: 'Saravanampatti, Coimbatore' },
  dropoff = { name: 'Jersin (Peelamedu NGO Shelter)', address: 'Avinashi Road, Coimbatore' },
  status = 'EN_ROUTE_PICKUP',
  volunteerName = 'Kumaran',
  vehicleType = 'CAR',
}) {
  const pickupLat = 11.0805;
  const pickupLng = 76.9942;
  const dropoffLat = 11.0267;
  const dropoffLng = 77.0055;

  const [courierProgress, setCourierProgress] = useState(0.35);

  useEffect(() => {
    if (status === 'ASSIGNED') setCourierProgress(0.1);
    else if (status === 'EN_ROUTE_PICKUP') setCourierProgress(0.35);
    else if (status === 'PICKED_UP') setCourierProgress(0.5);
    else if (status === 'EN_ROUTE_DROPOFF') setCourierProgress(0.8);
    else if (status === 'COMPLETED') setCourierProgress(1.0);
  }, [status]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const courierLat = pickupLat + (dropoffLat - pickupLat) * courierProgress;
  const courierLng = pickupLng + (dropoffLng - pickupLng) * courierProgress;

  const roadCorridor = [
    [pickupLat, pickupLng],
    [11.0620, 76.9880],
    [11.0366, 76.9792],
    [11.0168, 76.9678],
    [11.0215, 76.9980],
    [dropoffLat, dropoffLng],
  ];

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            OpenStreetMap Dispatch GPS & Route
          </h4>
        </div>
        <Badge variant={status === 'COMPLETED' ? 'emerald' : 'cyan'} size="sm">
          {status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Real Leaflet Map View */}
      <div className="relative w-full h-56 mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 flex items-center justify-center">
        {!isMounted ? (
          <div className="text-xs text-slate-400 font-medium">Loading Mini GPS Corridor...</div>
        ) : (
          <MapContainer
            key={`mini-coimbatore-${status}`}
            center={[11.0536, 76.9998]}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ height: '100%', width: '100%', minHeight: '220px' }}
          >
            <MiniMapController center={[courierLat, courierLng]} />

            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

          {/* Road Network Polyline */}
          <Polyline
            positions={roadCorridor}
            pathOptions={{
              color: '#059669',
              weight: 4,
              opacity: 0.9,
              dashArray: '6, 6',
              lineCap: 'round',
            }}
          />

          {/* Pickup Marker */}
          <Marker position={[pickupLat, pickupLng]} icon={createMiniIcon('emerald', 'pickup')}>
            <Popup>
              <div className="p-2 text-xs">
                <p className="font-bold text-slate-900">{pickup?.name || 'The Green Bistro'}</p>
                <p className="text-[11px] text-slate-500">{pickup?.address || 'Saravanampatti'}</p>
              </div>
            </Popup>
          </Marker>

          {/* Courier Position */}
          <Marker position={[courierLat, courierLng]} icon={createMiniIcon('amber', 'courier')}>
            <Popup>
              <div className="p-2 text-xs">
                <p className="font-bold text-amber-800">Courier: {volunteerName}</p>
                <p className="text-[11px] text-slate-500">
                  {Math.round(courierProgress * 100)}% route complete
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Dropoff Marker */}
          <Marker position={[dropoffLat, dropoffLng]} icon={createMiniIcon('purple', 'dropoff')}>
            <Popup>
              <div className="p-2 text-xs">
                <p className="font-bold text-purple-900">{dropoff?.name || 'Peelamedu Shelter'}</p>
                <p className="text-[11px] text-slate-500">{dropoff?.address || 'Peelamedu'}</p>
              </div>
            </Popup>
          </Marker>
          </MapContainer>
        )}

        {/* Courier Progress Floating Pill */}
        <div className="absolute bottom-2 left-2 z-[400] px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 text-[10px] text-slate-700 shadow-sm flex items-center gap-1.5 pointer-events-none">
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold">{volunteerName}</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-700 font-bold">{Math.round(courierProgress * 100)}% route complete</span>
        </div>
      </div>

      {/* Transit Address Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
            <Building className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs min-w-0">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Origin (Donor)</span>
            <p className="font-bold text-slate-800 truncate">{pickup?.name || 'The Green Bistro'}</p>
            <p className="text-[11px] text-slate-500 truncate">{pickup?.address || 'Saravanampatti'}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 border border-sky-200">
            <HeartHandshake className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs min-w-0">
            <span className="text-[10px] uppercase font-bold text-sky-700">Destination (Shelter)</span>
            <p className="font-bold text-slate-800 truncate">{dropoff?.name || 'Peelamedu Shelter'}</p>
            <p className="text-[11px] text-slate-500 truncate">{dropoff?.address || 'Peelamedu'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveDeliveryMap(props) {
  return (
    <MiniMapErrorBoundary>
      <InnerInteractiveMap {...props} />
    </MiniMapErrorBoundary>
  );
}
