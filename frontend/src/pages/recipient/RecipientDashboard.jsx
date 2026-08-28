import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import AiHelperWidget from '../../components/ui/AiHelperWidget';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Utensils,
  Clock,
  Filter,
  Thermometer,
  Building2,
  CheckCheck,
  Heart,
} from 'lucide-react';

export default function RecipientDashboard() {
  const { profile } = useAuth();
  const [availableDonations, setAvailableDonations] = useState([]);
  const [stats, setStats] = useState({
    dailyCapacity: 250,
    mealsReceivedToday: 85,
    pendingMatchProposals: 2,
    activeDeliveriesIncoming: 1,
    totalMealsRescuedAllTime: 1420,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [claimedMap, setClaimedMap] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, statsRes] = await Promise.all([
        apiClient.get('/recipients/available-donations'),
        apiClient.get('/recipients/stats'),
      ]);
      if (donationsRes.data?.success) setAvailableDonations(donationsRes.data.data);
      if (statsRes.data?.success) setStats(statsRes.data.data);
    } catch (err) {
      console.warn('[RecipientDashboard] Load fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimDonation = async (donationId) => {
    try {
      setClaimedMap((prev) => ({ ...prev, [donationId]: 'claiming' }));
      await apiClient.patch(`/donations/${donationId}/status`, { status: 'MATCHED' });
      setClaimedMap((prev) => ({ ...prev, [donationId]: 'claimed' }));
      setTimeout(() => {
        loadData();
      }, 1200);
    } catch (err) {
      alert('Unable to process lot claim: ' + err.message);
      setClaimedMap((prev) => ({ ...prev, [donationId]: null }));
    }
  };

  const filteredDonations = availableDonations.filter((d) => {
    if (selectedCategory === 'ALL') return true;
    return d.foodCategory === selectedCategory;
  });

  const capacityPercentage = Math.min(
    100,
    Math.round((stats.mealsReceivedToday / stats.dailyCapacity) * 100)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans bg-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Verified NGO Recipient Hub
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {profile?.organizationName || 'Jersin (Peelamedu NGO Shelter)'}
            </h1>
            <p className="text-sm text-slate-500">
              Claim fresh surplus batches verified by the autonomous FoodAgent. Matched batches are automatically assigned to nearby couriers.
            </p>
          </div>

          {/* Daily Capacity Gauge */}
          <div className="w-full md:w-80 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-bold">Today's Target:</span>
              <span className="text-emerald-700 font-bold">
                {stats.mealsReceivedToday} / {stats.dailyCapacity} portions
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 text-right">
              {capacityPercentage}% daily capacity utilized
            </p>
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" /> Category:
            </span>
            {['ALL', 'COOKED_MEALS', 'RAW_PRODUCE', 'PACKAGED_GOODS', 'BAKERY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={loadData}>
            Refresh Batches
          </Button>
        </div>

        {/* Available Batches Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">
              Live Surplus Batches ({filteredDonations.length})
            </h2>
            <Badge variant="live" size="sm">
              Real-Time Feed
            </Badge>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No surplus batches found in this category</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Check back soon or select 'ALL' to view incoming food posts from local kitchens.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((d) => {
                const donationId = d.id || d._id;
                const isClaiming = claimedMap[donationId] === 'claiming';
                const isClaimed = claimedMap[donationId] === 'claimed';

                return (
                  <Card
                    key={donationId}
                    className="flex flex-col justify-between p-5 space-y-4 bg-white border-slate-200 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                        <img
                          src={d.imageUrls?.[0] || d.foodItemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                          alt={d.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <Badge variant="live" size="sm">
                            {d.freshness?.freshnessScore || 94}% Freshness
                          </Badge>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <Badge variant="slate" size="sm">
                            {d.quantityValue} {d.quantityUnit}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{d.donorId?.organizationName || d.donor?.organizationName || 'Deedarsh (The Green Bistro)'}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">{d.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{d.description}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Safe window: <strong className="text-slate-800">{d.freshness?.safetyWindowHours || 4}h</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                          {d.storageTemp}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {isClaimed ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2 text-xs font-bold">
                          <CheckCheck className="w-4 h-4 text-emerald-600" /> Lot Claimed • Courier Dispatching
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full justify-center shadow-md shadow-emerald-500/20"
                          isLoading={isClaiming}
                          onClick={() => handleClaimDonation(donationId)}
                        >
                          Claim Batch for Shelter
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AiHelperWidget />
    </div>
  );
}
