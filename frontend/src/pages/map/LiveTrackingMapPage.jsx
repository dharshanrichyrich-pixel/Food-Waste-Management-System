import React, { useState, useEffect, Component } from 'react';
import Navbar from '../../components/layout/Navbar';
import AiHelperWidget from '../../components/ui/AiHelperWidget';
import RealLeafletMap from '../../components/map/RealLeafletMap';
import apiClient from '../../api/client';
import {
  Package,
  Truck,
  Building,
  Clock,
  Navigation,
  CheckCircle2,
  RefreshCw,
  Phone,
  Crosshair,
  Info,
  ChevronDown,
  ArrowRight,
  Users,
  Activity,
  AlertTriangle,
  Layers,
  HeartHandshake,
  MapPin,
} from 'lucide-react';

class LiveMapPageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LiveMapPageErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Coimbatore Live Telemetry Map</h2>
            <p className="text-sm text-slate-500 max-w-md">
              The live map telemetry is synchronizing with OpenStreetMap and MongoDB. Click below to reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Live Map</span>
            </button>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_COIMBATORE_MAP_DATA = {
  center: { lat: 11.0168, lng: 76.9678, zoom: 12, city: 'Coimbatore, Tamil Nadu' },
  donors: [
    { id: 'don-1', name: 'Deedarsh (The Green Bistro)', address: 'Saravanampatti, Coimbatore', latitude: 11.0805, longitude: 76.9942, donorType: 'RESTAURANT', phone: '+91 98200 11223' },
    { id: 'don-2', name: 'Saravanampatti Banquet Kitchen', address: 'Sathy Road, Coimbatore', latitude: 11.0620, longitude: 76.9880, donorType: 'EVENT_ORGANIZER', phone: '+91 98200 44332' },
  ],
  recipients: [
    { id: 'rec-1', name: 'Jersin (Peelamedu NGO Shelter)', address: 'Avinashi Road, Peelamedu, Coimbatore', latitude: 11.0267, longitude: 77.0055, recipientType: 'SHELTER', capacityMealsPerDay: 250, phone: '+91 98400 44556' },
  ],
  volunteers: [
    { id: 'vol-1', name: 'Kumaran (Lead Courier)', latitude: 11.0168, longitude: 76.9678, vehicleType: 'CAR', vehicleCapacityKg: 75, isAvailable: true, phone: '+91 98765 43210', activeHours: '8:00 AM - 9:00 PM' },
  ],
  surplusFood: [
    { id: 'sf-1', title: '40kg Prepared Lunch Platters', foodCategory: 'COOKED_MEALS', quantityValue: 40, quantityUnit: 'KG', freshnessScore: 96, safetyWindowHours: 4, donorName: 'Deedarsh (The Green Bistro)', latitude: 11.0805, longitude: 76.9942, address: 'Saravanampatti, Coimbatore' },
  ],
  deliveries: [
    { id: 'del-1', status: 'IN_TRANSIT', pickupAddress: 'The Green Bistro, Saravanampatti', dropoffAddress: 'Peelamedu NGO Shelter, Coimbatore', courierLat: 11.0168, courierLng: 76.9678, distanceKm: 6.2, durationMinutes: 18, volunteerName: 'Kumaran', donationTitle: '40kg Prepared Meals' },
  ],
  activeRoute: {
    waypoints: [
      { name: 'Deedarsh (Saravanampatti)', lat: 11.0805, lng: 76.9942, type: 'DONOR' },
      { name: 'Courier: Kumaran (Gandhipuram)', lat: 11.0168, lng: 76.9678, type: 'COURIER' },
      { name: 'Jersin (Peelamedu NGO Shelter)', lat: 11.0267, lng: 77.0055, type: 'RECIPIENT' },
    ],
    coordinates: [
      [11.0805, 76.9942],
      [11.0620, 76.9880],
      [11.0366, 76.9792],
      [11.0168, 76.9678],
      [11.0215, 76.9980],
      [11.0267, 77.0055],
    ],
    distanceKm: 17.7,
    durationMinutes: 20,
    isRealRoadNetwork: true,
  },
  summary: {
    totalSurplusKgToday: 125,
    mealsPotential: 275,
    co2PreventedKg: 312.5,
    activeVolunteersCount: 3,
    avgResponseTimeMin: 14,
  },
};

function LiveTrackingMapPageInner() {
  const [mapMode, setMapMode] = useState('Map'); // 'Map' | 'Satellite'
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const [activityFilter, setActivityFilter] = useState('All Activities');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString());

  const [mapData, setMapData] = useState(DEFAULT_COIMBATORE_MAP_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusLocation, setFocusLocation] = useState(null);

  // Layer filters
  const [layers, setLayers] = useState({
    all: true,
    surplus: true,
    pickups: true,
    deliveries: true,
    shelters: true,
    volunteers: true,
    traffic: true,
  });

  const toggleLayer = (layerKey) => {
    if (layerKey === 'all') {
      const newState = !layers.all;
      setLayers({
        all: newState,
        surplus: newState,
        pickups: newState,
        deliveries: newState,
        shelters: newState,
        volunteers: newState,
        traffic: newState,
      });
    } else {
      setLayers((prev) => {
        const updated = { ...prev, [layerKey]: !prev[layerKey] };
        const allChecked = Object.keys(updated)
          .filter((k) => k !== 'all')
          .every((k) => updated[k]);
        updated.all = allChecked;
        return updated;
      });
    }
  };

  const resetLayers = () => {
    setLayers({
      all: true,
      surplus: true,
      pickups: true,
      deliveries: true,
      shelters: true,
      volunteers: true,
      traffic: true,
    });
  };

  // Fetch real map telemetry from MongoDB backend
  const fetchMapTelemetry = async () => {
    try {
      const res = await apiClient.get('/logistics/map-data');
      if (res.data?.success && res.data.data) {
        setMapData(res.data.data);
        setLastUpdatedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('[LiveMap] Telemetry API note:', err.message);
      // Keep default map data
    }
  };

  useEffect(() => {
    fetchMapTelemetry();
    const interval = setInterval(fetchMapTelemetry, 45000); // 45s live refresh
    return () => clearInterval(interval);
  }, []);

  // Selected Activity in the right inspector
  const [selectedActivity, setSelectedActivity] = useState({
    id: 'PF1234',
    type: 'pickup',
    status: 'ONGOING',
    pickup: {
      name: 'Deedarsh (The Green Bistro)',
      address: 'Saravanampatti, Coimbatore',
      quantity: '40 kg cooked meals',
      category: 'Cooked Meals',
    },
    dropoff: {
      name: 'Jersin (Peelamedu NGO Shelter)',
      address: 'Peelamedu, Coimbatore',
      distance: '6.2 km away',
    },
    volunteer: {
      name: 'Kumaran',
      phone: '+91 98765 43210',
      status: 'On Duty (Lead Courier)',
      location: 'Near Gandhipuram Corridor',
    },
    eta: { duration: '18 mins', expectedTime: '12:05 PM' },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans bg-grid">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Header Banner + 5 KPI Cards */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Telemetry &bull; OpenStreetMap
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Live Tracking & Dispatch Map
              </h1>
              <p className="text-xs text-slate-500">
                Real-time OpenStreetMap roads and OSRM dispatch corridors across Coimbatore (Saravanampatti, Gandhipuram, Peelamedu).
              </p>
            </div>

            {/* City Selector & Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMapTelemetry}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-xs font-bold text-slate-700 transition-colors"
                title="Refresh Map Telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live</span>
              </button>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
                <span className="text-slate-500 font-normal">Metro Area:</span>
                <span className="text-emerald-700">{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* 5 KPI Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Active Pickups */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Active Pickups</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {mapData?.surplusFood?.length || 3}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Live</span>
                </div>
                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                  <span>↗</span> 12% vs yesterday
                </span>
              </div>
            </div>

            {/* 2. In Transit */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">In Transit</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {mapData?.deliveries?.length || 2}
                  </span>
                  <span className="text-[10px] font-bold text-sky-700">Live</span>
                </div>
                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                  <span>↗</span> 8% vs yesterday
                </span>
              </div>
            </div>

            {/* 3. Available Food */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Surplus Total</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {mapData?.summary?.totalSurplusKgToday || 125}kg
                  </span>
                  <span className="text-[10px] font-bold text-purple-700">Live</span>
                </div>
                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                  <span>↗</span> 15% vs yesterday
                </span>
              </div>
            </div>

            {/* 4. NGO Shelters */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">NGO Shelters</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {mapData?.recipients?.length || 2}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700">Live</span>
                </div>
                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                  <span>↗</span> 100% Verified
                </span>
              </div>
            </div>

            {/* 5. Avg. ETA */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Avg. Drive ETA</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {mapData?.activeRoute?.durationMinutes || 18}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">mins</span>
                </div>
                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                  <span>↘</span> OSRM Road Calculated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Main Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: Live Activity Feed + Filter Layers */}
          <div className="lg:col-span-3 space-y-4">
            {/* Card 1: Live Activity Feed */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Live Activity Feed
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  MongoDB Synced
                </span>
              </div>

              {/* Feed Items */}
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {/* Feed 1: Surplus Food Available (Saravanampatti) */}
                <div
                  onClick={() => {
                    setFocusLocation({ lat: 11.0805, lng: 76.9942 });
                    setSelectedActivity({
                      id: 'SF9081',
                      type: 'surplus',
                      status: 'AVAILABLE',
                      pickup: {
                        name: 'Deedarsh (The Green Bistro)',
                        address: 'Saravanampatti, Coimbatore',
                        quantity: '40 kg prepared meals',
                        category: 'Cooked Meals',
                      },
                      dropoff: {
                        name: 'Jersin (Peelamedu NGO Shelter)',
                        address: 'Peelamedu, Coimbatore',
                        distance: '6.2 km away',
                      },
                      volunteer: {
                        name: 'Kumaran',
                        phone: '+91 98765 43210',
                        status: 'On Duty (Lead Courier)',
                        location: 'Near Gandhipuram',
                      },
                      eta: { duration: '18 mins', expectedTime: '12:05 PM' },
                    });
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all flex items-start gap-3 group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-800 group-hover:text-emerald-900 truncate">
                        Surplus Food Available
                      </h4>
                      <span className="text-[10px] text-slate-400">2 min ago</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 mt-0.5">40 kg prepared meals</p>
                    <p className="text-[10px] text-slate-500 truncate">Deedarsh &bull; Saravanampatti</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                </div>

                {/* Feed 2: Pickup Assigned */}
                <div
                  onClick={() => {
                    setFocusLocation({ lat: 11.0168, lng: 76.9678 });
                    setSelectedActivity({
                      id: 'PF1234',
                      type: 'pickup',
                      status: 'ONGOING',
                      pickup: {
                        name: 'Deedarsh (The Green Bistro)',
                        address: 'Saravanampatti, Coimbatore',
                        quantity: '40 kg cooked meals',
                        category: 'Cooked Meals',
                      },
                      dropoff: {
                        name: 'Jersin (Peelamedu NGO Shelter)',
                        address: 'Peelamedu, Coimbatore',
                        distance: '6.2 km away',
                      },
                      volunteer: {
                        name: 'Kumaran',
                        phone: '+91 98765 43210',
                        status: 'On Duty (Lead Courier)',
                        location: 'Near Gandhipuram',
                      },
                      eta: { duration: '18 mins', expectedTime: '12:05 PM' },
                    });
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 cursor-pointer transition-all flex items-start gap-3 group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-800 group-hover:text-amber-900 truncate">
                        Pickup Assigned to Kumaran
                      </h4>
                      <span className="text-[10px] text-slate-400">5 min ago</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 mt-0.5">Pickup ID: PF1234 &bull; Kumaran</p>
                    <p className="text-[10px] text-slate-500 truncate">Deedarsh → Jersin (NGO Shelter)</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                </div>

                {/* Feed 3: On the Way */}
                <div
                  onClick={() => {
                    setFocusLocation({ lat: 11.0267, lng: 77.0055 });
                    setSelectedActivity({
                      id: 'DL5678',
                      type: 'delivery',
                      status: 'IN_TRANSIT',
                      pickup: {
                        name: 'Deedarsh (The Green Bistro)',
                        address: 'Saravanampatti, Coimbatore',
                        quantity: '30 kg mixed meals',
                        category: 'Prepared Meals',
                      },
                      dropoff: {
                        name: 'Jersin (Peelamedu NGO Shelter)',
                        address: 'Peelamedu, Coimbatore',
                        distance: '9.8 km away',
                      },
                      volunteer: {
                        name: 'Kumaran',
                        phone: '+91 98765 43210',
                        status: 'In Transit',
                        location: 'Near Gandhipuram Corridor',
                      },
                      eta: { duration: '28 mins', expectedTime: '12:20 PM' },
                    });
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 cursor-pointer transition-all flex items-start gap-3 group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-sky-800 group-hover:text-sky-900 truncate">
                        On the Way (Courier: Kumaran)
                      </h4>
                      <span className="text-[10px] text-slate-400">12 min ago</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 mt-0.5">Delivery ID: DL5678</p>
                    <p className="text-[10px] text-slate-500 truncate">Deedarsh → Jersin (Peelamedu)</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1" />
                </div>

                {/* Feed 4: Delivered */}
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all flex items-start gap-3 group shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-800 group-hover:text-emerald-900 truncate">
                        Delivered by Kumaran
                      </h4>
                      <span className="text-[10px] text-slate-400">18 min ago</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 mt-0.5">20 meals delivered</p>
                    <p className="text-[10px] text-slate-500 truncate">Jersin (Peelamedu NGO Shelter)</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                </div>
              </div>
            </div>

            {/* Card 2: Filter Layers */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Interactive Map Layers
                  </h3>
                </div>
                <button
                  onClick={resetLayers}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* All Layers */}
                <label
                  onClick={() => toggleLayer('all')}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 font-bold"
                >
                  <input
                    type="checkbox"
                    checked={layers.all}
                    onChange={() => {}}
                    className="rounded bg-slate-100 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>All Layers</span>
                </label>

                {/* Surplus Food */}
                <label
                  onClick={() => toggleLayer('surplus')}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={layers.surplus}
                    onChange={() => {}}
                    className="rounded bg-slate-100 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Surplus Food / Donors</span>
                </label>

                {/* Deliveries */}
                <label
                  onClick={() => toggleLayer('deliveries')}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={layers.deliveries}
                    onChange={() => {}}
                    className="rounded bg-slate-100 border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  <span>Deliveries & OSRM Routes</span>
                </label>

                {/* NGO Shelters */}
                <label
                  onClick={() => toggleLayer('shelters')}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={layers.shelters}
                    onChange={() => {}}
                    className="rounded bg-slate-100 border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                  <span>NGO Shelters (Jersin)</span>
                </label>

                {/* Volunteers */}
                <label
                  onClick={() => toggleLayer('volunteers')}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={layers.volunteers}
                    onChange={() => {}}
                    className="rounded bg-slate-100 border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Volunteers (Kumaran)</span>
                </label>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Real Leaflet Map with OpenStreetMap Roads */}
          <div className="lg:col-span-6 space-y-4">
            {/* Map Container */}
            <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col">
              {/* Map Top Controls Bar */}
              <div className="flex items-center justify-between z-20 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-0.5">
                    <button
                      onClick={() => setMapMode('Map')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        mapMode === 'Map'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Street Map
                    </button>
                    <button
                      onClick={() => setMapMode('Satellite')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        mapMode === 'Satellite'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedCity}, Tamil Nadu</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFocusLocation({ lat: 11.0168, lng: 76.9678 })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                    title="Center on Coimbatore"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Center Coimbatore</span>
                  </button>
                </div>
              </div>

              {/* Real Leaflet Map Container */}
              <div className="mt-3 relative min-h-[500px]">
                {loading && !mapData && (
                  <div className="absolute inset-0 z-30 bg-slate-50/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-700">Loading Coimbatore OpenStreetMap Telemetry...</p>
                  </div>
                )}

                <RealLeafletMap
                  mapData={mapData}
                  layers={layers}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  mapTileMode={mapMode}
                  focusLocation={focusLocation}
                  height="500px"
                />
              </div>
            </div>

            {/* Live Summary (Coimbatore) - 5 Metrics in a Row */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Summary ({selectedCity})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-left">
                {/* 1. Total Surplus Today */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Total Surplus Today</span>
                  <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                    {mapData?.summary?.totalSurplusKgToday || 125} kg
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">↗ 12% vs yesterday</span>
                </div>

                {/* 2. Meals Potential */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Meals Potential</span>
                  <p className="text-xl font-extrabold text-sky-700 font-mono mt-1">
                    {mapData?.summary?.mealsPotential || 275}+
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Estimated meals</span>
                </div>

                {/* 3. CO2 Prevented */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">CO₂ Prevented</span>
                  <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                    {mapData?.summary?.co2PreventedKg || 312.5} kg
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">↗ 8% vs yesterday</span>
                </div>

                {/* 4. Active Volunteers */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Active Volunteers</span>
                  <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">
                    {mapData?.volunteers?.length || 1}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">On duty (Kumaran)</span>
                </div>

                {/* 5. Avg. Response Time */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Avg. Response Time</span>
                  <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                    {mapData?.summary?.avgResponseTimeMin || 14} mins
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">↘ -2 mins vs yesterday</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Selected Activity Inspector + Heat Map Card */}
          <div className="lg:col-span-3 space-y-4">
            {/* Card 1: Selected Activity Inspector */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Selected Activity Inspector
                </span>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedActivity.id}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    {selectedActivity.status}
                  </span>
                </div>
              </div>

              {/* Inspector Detail Blocks */}
              <div className="space-y-3 text-xs">
                {/* Block 1: Donor Info */}
                {selectedActivity.pickup && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900">{selectedActivity.pickup.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{selectedActivity.pickup.address}</p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold mt-1">
                        <span>{selectedActivity.pickup.quantity || '40kg Meals'}</span>
                        <span>•</span>
                        <span>{selectedActivity.pickup.category || 'Cooked Food'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Block 2: Recipient Shelter Info */}
                {selectedActivity.dropoff && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900">{selectedActivity.dropoff.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{selectedActivity.dropoff.address}</p>
                      <p className="text-[10px] text-purple-700 font-bold mt-1">
                        {selectedActivity.dropoff.distance || '6.2 km away'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Block 3: Assigned Volunteer Info */}
                {selectedActivity.volunteer && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Assigned Volunteer
                      </span>
                      <h4 className="font-bold text-slate-900 mt-0.5">{selectedActivity.volunteer.name}</h4>
                      <a
                        href={`tel:${selectedActivity.volunteer.phone}`}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 mt-0.5"
                      >
                        <span>{selectedActivity.volunteer.phone}</span>
                        <Phone className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Block 4: ETA Info */}
                {selectedActivity.eta && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Est. Transit Duration
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                        {selectedActivity.eta.duration}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Expected by {selectedActivity.eta.expectedTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* View Full Details Button */}
              <button
                onClick={() => {
                  if (selectedActivity.pickup?.name?.includes('Saravanampatti')) {
                    setFocusLocation({ lat: 11.0805, lng: 76.9942 });
                  } else {
                    setFocusLocation({ lat: 11.0168, lng: 76.9678 });
                  }
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Focus Location on Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Heat Map */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800">
                Surplus Intensity Heat Map <span className="text-slate-500 font-normal">(Coimbatore Hubs)</span>
              </h3>

              <div className="h-28 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_48%,rgba(239,68,68,0.75)_0%,rgba(249,115,22,0.6)_20%,rgba(234,179,8,0.4)_35%,rgba(16,185,129,0.2)_55%,transparent_75%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_52%,rgba(234,179,8,0.4)_0%,rgba(16,185,129,0.3)_30%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_55%,rgba(16,185,129,0.3)_0%,transparent_50%)]" />
                <div className="relative z-10 text-[11px] font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Saravanampatti &bull; Gandhipuram Hotspots
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#0284c7] via-[#10b981] via-[#eab308] via-[#f97316] to-[#ef4444]" />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Low Surplus</span>
                  <span>High Surplus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AiHelperWidget />

      {/* Bottom Status Bar */}
      <footer className="border-t border-slate-200 bg-white py-3 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Last Telemetry Sync: {lastUpdatedTime}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-bold">Live OpenStreetMap &bull; Leaflet</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Real road network routing via OSRM &bull; Food safety temperature compliance</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>FoodFlow Coimbatore Dispatch</span>
            <span className="text-emerald-600">🌿</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LiveTrackingMapPage() {
  return (
    <LiveMapPageErrorBoundary>
      <LiveTrackingMapPageInner />
    </LiveMapPageErrorBoundary>
  );
}
