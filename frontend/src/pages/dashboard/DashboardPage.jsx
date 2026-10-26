import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import AiHelperWidget from '../../components/ui/AiHelperWidget';
import InteractiveDeliveryMap from '../../components/map/InteractiveDeliveryMap';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Package,
  Leaf,
  Users,
  Recycle,
  Clock,
  Truck,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Phone,
  UploadCloud,
  ClipboardList,
  MapPin,
  Timer
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeRole, setActiveRole] = useState(user?.role || 'donor');
  const [stats, setStats] = useState({
    totalDonatedKg: 25,
    foodSavedKg: 24,
    mealsHelped: 50,
    co2ReducedKg: 20,
    pendingRequests: 4,
    assignedPickups: 1,
    transitDistanceKm: 4.2,
    totalEtaMins: 14,
  });

  const [activeTask, setActiveTask] = useState({
    id: 'deliv-ff-4891',
    status: 'EN_ROUTE_PICKUP',
    pickupAddress: 'The Green Bistro, Saravanampatti, Coimbatore',
    dropoffAddress: 'Peelamedu NGO Shelter, Avinashi Road, Coimbatore',
    donation: {
      title: '40kg Prepared Lunch Platters (Cooked Meals)',
      foodCategory: 'COOKED_MEALS',
      quantityValue: 40,
      quantityUnit: 'KG',
      storageTemp: 'REFRIGERATED',
      donor: { organizationName: 'The Green Bistro (Food Donor)' },
    },
    match: {
      recipient: {
        organizationName: 'Peelamedu NGO Shelter',
        contactPhone: '+91 98400 44556',
      },
    },
  });

  const [showProofModal, setShowProofModal] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [signatureSigned, setSignatureSigned] = useState(false);

  useEffect(() => {
    if (user?.role) setActiveRole(user.role);
  }, [user]);

  const displayName =
    profile?.organizationName ||
    profile?.fullName ||
    user?.name ||
    user?.email?.split('@')[0] ||
    (user ? 'User Profile' : 'Guest Operator');
  const email = user?.email || (user ? 'authenticated@foodflow.org' : 'Guest Session');

  const advanceDeliveryStatus = (nextStatus) => {
    if (nextStatus === 'COMPLETED') {
      setShowProofModal(true);
      return;
    }
    setActiveTask((prev) => ({ ...prev, status: nextStatus }));
  };

  const submitProofOfDelivery = () => {
    setActiveTask((prev) => ({ ...prev, status: 'COMPLETED' }));
    setShowProofModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans bg-warm-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Welcome Banner */}
        <div className="rounded-2xl bg-white border border-[#E5E2DC] p-6 sm:p-8 shadow-subtle relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f3] border border-[#b9ddc8] text-[#1b4332] text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#1b4332] animate-pulse" />
              ACTIVE ROLE PORTAL — {activeRole.toUpperCase()}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-[#1b4332]">{displayName}</span>
            </h1>

            <p className="text-sm text-slate-500">
              Logged in as <span className="text-slate-700 font-medium">{email}</span>
            </p>
          </div>

          {/* Decorative City & Truck Banner */}
          <div className="hidden md:flex items-center justify-end relative w-80 h-32">
            <div className="absolute right-0 bottom-0 flex items-center gap-3">
              <div className="relative flex items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-inner">
                <Truck className="w-16 h-16 text-emerald-600" />
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  <Leaf className="w-4 h-4 fill-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KEY SYSTEM PERFORMANCE INDICATORS */}
        <div className="space-y-3">
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            KEY SYSTEM PERFORMANCE INDICATORS
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Food Donated */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.totalDonatedKg}kg
                </h3>
                <p className="text-xs font-bold text-emerald-700 mt-1">Total Food Donated</p>
                <p className="text-[11px] text-slate-500">Surplus food posted</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>↗</span> +12% this week
              </div>
            </div>

            {/* Card 2: Food Saved */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.foodSavedKg}kg
                </h3>
                <p className="text-xs font-bold text-emerald-700 mt-1">Food Saved</p>
                <p className="text-[11px] text-slate-500">Diverted from landfills</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>↗</span> +8% this week
              </div>
            </div>

            {/* Card 3: People Helped */}
            <div className="rounded-2xl bg-white border border-amber-200/80 p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.mealsHelped} meals
                </h3>
                <p className="text-xs font-bold text-amber-700 mt-1">People Helped</p>
                <p className="text-[11px] text-slate-500">Meals served to shelters</p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-100 text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                <span>↗</span> +15% this week
              </div>
            </div>

            {/* Card 4: Food Waste Reduced */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                    <Recycle className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.co2ReducedKg} kg CO₂e
                </h3>
                <p className="text-xs font-bold text-sky-700 mt-1">Food Waste Reduced</p>
                <p className="text-[11px] text-slate-500">CO2 emissions prevented</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-sky-700 flex items-center gap-1">
                <span>↗</span> +11% this week
              </div>
            </div>

            {/* Card 5: Pending Requests */}
            <div className="rounded-2xl bg-white border border-purple-200/80 p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.pendingRequests}
                </h3>
                <p className="text-xs font-bold text-purple-700 mt-1">Pending Requests</p>
                <p className="text-[11px] text-slate-500">Active matching queue</p>
              </div>
              <div className="mt-3 pt-2 border-t border-purple-100 text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                <span>↗</span> +3% this week
              </div>
            </div>
          </div>
        </div>

        {/* Section: Volunteer & Logistics Portal (Bottom Section from User Screenshot) */}
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>🚚</span> Volunteer & Logistics Portal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accept task dispatches, follow Logistics Agent routes, and record delivery proof
            </p>
          </div>

          {/* 3 Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Assigned Pickups */}
            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 block">Assigned Pickups</span>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                  {stats.assignedPickups}
                </p>
                <span className="text-[11px] text-slate-500">Pickup tasks assigned to you</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Optimized Transit Dist. */}
            <div className="rounded-2xl bg-sky-50/60 border border-sky-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 block">Optimized Transit Dist.</span>
                <p className="text-3xl font-extrabold text-sky-700 mt-1">
                  {stats.transitDistanceKm} Km
                </p>
                <span className="text-[11px] text-slate-500">Total optimized distance</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Estimated Total ETA */}
            <div className="rounded-2xl bg-purple-50/60 border border-purple-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 block">Estimated Total ETA</span>
                <p className="text-3xl font-extrabold text-purple-700 mt-1">
                  {stats.totalEtaMins} Mins
                </p>
                <span className="text-[11px] text-slate-500">Total estimated delivery time</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
                <Timer className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Active Mission Grid (Map + Step Action Stepper) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Mission Actions */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">Active Dispatch Mission</h3>
                  </div>
                  <Badge variant="cyan" size="sm" className="font-bold text-[10px]">
                    {activeTask.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{activeTask.donation.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="brand" size="sm">
                        {activeTask.donation.quantityValue} {activeTask.donation.quantityUnit}
                      </Badge>
                      <Badge variant="amber" size="sm">
                        {activeTask.donation.foodCategory}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Temp: {activeTask.donation.storageTemp}
                      </Badge>
                    </div>
                  </div>

                  {/* Step Action Stepper */}
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Mission Step Progression
                    </span>

                    <div className="space-y-2">
                      {activeTask.status === 'ASSIGNED' && (
                        <Button
                          variant="primary"
                          className="w-full justify-center"
                          icon={Navigation}
                          onClick={() => advanceDeliveryStatus('EN_ROUTE_PICKUP')}
                        >
                          Start Navigation to Donor Facility
                        </Button>
                      )}

                      {activeTask.status === 'EN_ROUTE_PICKUP' && (
                        <Button
                          variant="primary"
                          className="w-full justify-center"
                          icon={CheckCircle2}
                          onClick={() => advanceDeliveryStatus('PICKED_UP')}
                        >
                          Confirm Food Package Handover (Picked Up)
                        </Button>
                      )}

                      {activeTask.status === 'PICKED_UP' && (
                        <Button
                          variant="primary"
                          className="w-full justify-center"
                          icon={Navigation}
                          onClick={() => advanceDeliveryStatus('EN_ROUTE_DROPOFF')}
                        >
                          Start Navigation to Shelter (Peelamedu)
                        </Button>
                      )}

                      {activeTask.status === 'EN_ROUTE_DROPOFF' && (
                        <Button
                          variant="primary"
                          className="w-full justify-center"
                          icon={ShieldCheck}
                          onClick={() => advanceDeliveryStatus('COMPLETED')}
                        >
                          Arrived at Shelter • Submit Handover Proof
                        </Button>
                      )}

                      {activeTask.status === 'COMPLETED' && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1">
                          <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
                          <p className="text-xs font-bold">Delivery Handover Completed</p>
                          <p className="text-[11px] text-slate-500">
                            Digital receipt generated & chain-of-custody recorded.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shelter Contact */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700">
                        Shelter Point-of-Contact
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">
                        {activeTask.match.recipient.organizationName}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {activeTask.match.recipient.contactPhone}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" icon={Phone}>
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live GPS Route Map */}
            <div className="lg:col-span-6 space-y-4">
              <InteractiveDeliveryMap
                pickup={{
                  name: activeTask.donation.donor.organizationName,
                  address: activeTask.pickupAddress,
                }}
                dropoff={{
                  name: activeTask.match.recipient.organizationName,
                  address: activeTask.dropoffAddress,
                }}
                status={activeTask.status}
                volunteerName={displayName}
                vehicleType="CAR"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI 7-Mode Helper Widget */}
      <AiHelperWidget />

      {/* Proof of Delivery Modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] text-emerald-700 uppercase font-bold">
                Chain-of-Custody Handover
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Record Delivery Handover
              </h3>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setPhotoUploaded(!photoUploaded)}
                className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition-colors ${
                  photoUploaded
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400'
                }`}
              >
                <UploadCloud className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <p className="text-xs font-semibold">
                  {photoUploaded ? '✓ Handover Photo Attached' : 'Attach Delivery Handover Photo'}
                </p>
              </div>

              <div
                onClick={() => setSignatureSigned(!signatureSigned)}
                className={`p-4 rounded-xl border cursor-pointer text-center transition-colors ${
                  signatureSigned
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400'
                }`}
              >
                <p className="text-xs font-semibold">
                  {signatureSigned
                    ? '✓ Recipient Signature Recorded'
                    : 'Capture Recipient Official Signature'}
                </p>
                <div className="h-9 mt-2 border-b border-slate-200 flex items-center justify-center italic text-xs text-slate-400">
                  {signatureSigned ? 'Shelter Authorized Signatory: Verified' : '[ Signatory acknowledges receipt ]'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => setShowProofModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 justify-center"
                disabled={!photoUploaded && !signatureSigned}
                onClick={submitProofOfDelivery}
              >
                Confirm Handover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
