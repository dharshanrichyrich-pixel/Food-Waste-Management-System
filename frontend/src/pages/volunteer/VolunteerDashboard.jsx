import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import AiHelperWidget from '../../components/ui/AiHelperWidget';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import InteractiveDeliveryMap from '../../components/map/InteractiveDeliveryMap';
import {
  Truck,
  CheckCircle2,
  Package,
  Phone,
  Power,
  ShieldCheck,
  UploadCloud,
  Navigation,
  ClipboardList,
  MapPin,
  Timer,
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: 'Kumaran',
    vehicleType: 'CAR',
    vehicleCapacityKg: 75,
    isAvailable: true,
    activeHours: '08:00 - 20:00',
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [signatureSigned, setSignatureSigned] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  useEffect(() => {
    fetchProfileAndTasks();
  }, [user]);

  const fetchProfileAndTasks = async () => {
    setLoading(true);
    try {
      const [profRes, tasksRes] = await Promise.all([
        api.get(`/volunteers/profile?userId=${user?.id || 'demo'}`),
        api.get(`/volunteers/tasks?volunteerId=${user?.id || 'vol-demo'}`),
      ]);

      if (profRes.data?.success) setProfile(profRes.data.data);
      if (tasksRes.data?.success && tasksRes.data.data.length > 0) {
        setTasks(tasksRes.data.data);
        setActiveTask(tasksRes.data.data[0]);
      } else {
        const demoTask = {
          id: 'deliv-ff-4891',
          status: 'EN_ROUTE_PICKUP',
          pickupAddress: 'The Green Bistro, Sathy Road, Saravanampatti, Coimbatore',
          dropoffAddress: 'Peelamedu NGO Shelter, Avinashi Road, Coimbatore',
          donation: {
            title: '40kg Prepared Lunch Platters (Cooked Meals)',
            foodCategory: 'COOKED_MEALS',
            quantityValue: 40,
            quantityUnit: 'KG',
            storageTemp: 'REFRIGERATED',
            donor: { organizationName: 'Deedarsh (The Green Bistro)' },
          },
          match: {
            recipient: {
              organizationName: 'Jersin (Peelamedu NGO Shelter)',
              contactPhone: '+91 98400 44556',
            },
          },
        };
        setTasks([demoTask]);
        setActiveTask(demoTask);
      }
    } catch (err) {
      console.warn('Using local volunteer fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !profile.isAvailable;
    setProfile((prev) => ({ ...prev, isAvailable: newStatus }));
    try {
      await api.patch('/volunteers/availability', { isAvailable: newStatus, userId: user?.id });
    } catch (e) {
      // ignore
    }
  };

  const advanceDeliveryStatus = async (nextStatus) => {
    if (!activeTask) return;

    if (nextStatus === 'COMPLETED') {
      setShowProofModal(true);
      return;
    }

    try {
      await api.patch(`/deliveries/${activeTask.id}/status`, { status: nextStatus });
    } catch (e) {
      // fallback
    }

    setActiveTask((prev) => ({ ...prev, status: nextStatus }));
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: nextStatus } : t))
    );
  };

  const submitProofOfDelivery = async () => {
    try {
      await api.post(`/deliveries/${activeTask.id}/proof`, {
        proofPhotoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433',
        recipientSignatureUrl: 'data:image/svg+xml;utf8,<svg>SignatureVerified</svg>',
      });
    } catch (e) {
      // ignore
    }

    setActiveTask((prev) => ({ ...prev, status: 'COMPLETED' }));
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: 'COMPLETED' } : t))
    );
    setShowProofModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans bg-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {profile.fullName || user?.email}
                </h1>
                <Badge variant={profile.isAvailable ? 'live' : 'slate'} size="sm">
                  {profile.isAvailable ? 'ACTIVE ON DISPATCH' : 'OFFLINE'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vehicle: <span className="font-bold text-slate-800">{profile.vehicleType}</span> (Capacity: {profile.vehicleCapacityKg}kg) • Shift: {profile.activeHours}
              </p>
            </div>
          </div>

          <Button
            variant={profile.isAvailable ? 'secondary' : 'primary'}
            size="md"
            icon={Power}
            onClick={toggleAvailability}
          >
            {profile.isAvailable ? 'Go Offline' : 'Go Online (Accept Dispatches)'}
          </Button>
        </div>

        {/* 3 Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block">Assigned Pickups</span>
              <p className="text-3xl font-extrabold text-emerald-700 mt-1">1</p>
              <span className="text-[11px] text-slate-500">Active dispatches</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-sky-50/60 border border-sky-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block">Optimized Transit Dist.</span>
              <p className="text-3xl font-extrabold text-sky-700 mt-1">4.2 Km</p>
              <span className="text-[11px] text-slate-500">Coimbatore corridor</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-purple-50/60 border border-purple-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block">Estimated Total ETA</span>
              <p className="text-3xl font-extrabold text-purple-700 mt-1">14 Mins</p>
              <span className="text-[11px] text-slate-500">Traffic-adjusted</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
              <Timer className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 space-y-5 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Current Assigned Delivery Task
                  </h2>
                </div>
                {activeTask && (
                  <Badge variant="cyan" size="sm" className="font-bold text-[10px]">
                    {activeTask.status.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>

              {activeTask ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeTask.donation?.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="brand" size="sm">
                        {activeTask.donation?.quantityValue} {activeTask.donation?.quantityUnit}
                      </Badge>
                      <Badge variant="amber" size="sm">
                        {activeTask.donation?.foodCategory}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Holding: {activeTask.donation?.storageTemp}
                      </Badge>
                    </div>
                  </div>

                  {/* Step Action Stepper */}
                  <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Mission Progression Action
                    </span>

                    <div className="space-y-2">
                      {activeTask.status === 'ASSIGNED' && (
                        <Button
                          variant="primary"
                          className="w-full justify-center"
                          icon={Navigation}
                          onClick={() => advanceDeliveryStatus('EN_ROUTE_PICKUP')}
                        >
                          Start Navigation to Donor Facility (Saravanampatti)
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

                  {/* Recipient Shelter Contacts */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700">
                        Shelter Point-of-Contact
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {activeTask.match?.recipient?.organizationName || 'jersin (Peelamedu NGO Shelter)'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {activeTask.match?.recipient?.contactPhone || '+91 98400 44556'}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" icon={Phone}>
                      Call
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>No active delivery mission assigned.</p>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {activeTask && (
              <InteractiveDeliveryMap
                pickup={{
                  name: activeTask.donation?.donor?.organizationName || 'Deedarsh (The Green Bistro)',
                  address: activeTask.pickupAddress,
                }}
                dropoff={{
                  name: activeTask.match?.recipient?.organizationName || 'Jersin (Peelamedu NGO Shelter)',
                  address: activeTask.dropoffAddress,
                }}
                status={activeTask.status}
                volunteerName={profile.fullName}
                vehicleType={profile.vehicleType}
              />
            )}
          </div>
        </div>
      </main>

      <AiHelperWidget />

      {/* Proof of Delivery Modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">
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
