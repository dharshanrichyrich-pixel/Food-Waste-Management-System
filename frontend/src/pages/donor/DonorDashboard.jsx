import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import AiHelperWidget from '../../components/ui/AiHelperWidget';
import CameraCaptureModal from '../../components/camera/CameraCaptureModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  PlusCircle,
  Package,
  Leaf,
  Users,
  Clock,
  Layers,
  Thermometer,
  Eye,
  Trash2,
  Sparkles,
  Camera,
  UploadCloud,
} from 'lucide-react';

export default function DonorDashboard() {
  const { user, profile } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    totalQuantityKg: 0,
    estimatedMealsRescued: 0,
    co2AvoidedKg: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [foodCategory, setFoodCategory] = useState('COOKED_MEALS');
  const [quantityValue, setQuantityValue] = useState('35');
  const [quantityUnit, setQuantityUnit] = useState('KG');
  const [storageTemp, setStorageTemp] = useState('REFRIGERATED');
  const [attachedImage, setAttachedImage] = useState(null);
  const [items, setItems] = useState([
    { name: 'Prepared Lunch Platters', quantity: '20', unit: 'KG' },
    { name: 'Fresh Salad & Fruit Bowls', quantity: '15', unit: 'KG' },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, statsRes] = await Promise.all([
        apiClient.get('/donors/donations'),
        apiClient.get('/donors/stats'),
      ]);
      if (donationsRes.data?.success) setDonations(donationsRes.data.data);
      if (statsRes.data?.success) setStats(statsRes.data.data);
    } catch (err) {
      console.warn('[DonorDashboard] Load fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '1', unit: 'KG' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formattedItems = items
        .filter((it) => it.name && it.name.trim())
        .map((it) => ({
          name: it.name.trim(),
          quantity: parseFloat(it.quantity) || 1,
          unit: it.unit || quantityUnit || 'KG',
        }));

      const res = await apiClient.post('/donations', {
        title: title.trim(),
        description: description?.trim() || '',
        foodCategory,
        quantityValue: parseFloat(quantityValue) || 10,
        quantityUnit,
        storageTemp,
        items: formattedItems.length > 0 ? formattedItems : [{ name: title, quantity: parseFloat(quantityValue) || 10, unit: quantityUnit }],
        imageUrls: attachedImage ? [attachedImage] : [],
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setAttachedImage(null);
        await loadData();
      }
    } catch (err) {
      console.error('[DonorDashboard] Donation submit error:', err);
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to post surplus donation';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_ANALYSIS':
        return <Badge variant="amber" dot>AI Freshness Assessing</Badge>;
      case 'ANALYZED':
        return <Badge variant="brand" dot>Freshness Cleared</Badge>;
      case 'MATCH_PROPOSED':
        return <Badge variant="amber" dot>NGO Match Proposed</Badge>;
      case 'MATCHED':
        return <Badge variant="cyan" dot>Volunteer Assigned</Badge>;
      case 'PICKED_UP':
        return <Badge variant="cyan" dot>In Transit</Badge>;
      case 'DELIVERED':
        return <Badge variant="brand" dot>Delivered & Rescued</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans bg-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Donor Banner */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Donor Facility Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {profile?.organizationName || 'Deedarsh (The Green Bistro)'}
            </h1>
            <p className="text-sm text-slate-500">
              Submit surplus food batches. The FoodAgent evaluates food freshness, detects visual quality factors, calculates shelf life, and dispatches to certified local shelters.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={PlusCircle}
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap shadow-md shadow-emerald-500/20"
          >
            Post Surplus Food Batch
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Donated</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalQuantityKg || '45'} <span className="text-xs font-normal text-slate-400">kg</span>
              </h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">People Fed</p>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-0.5">
                {stats.estimatedMealsRescued || '99'} <span className="text-xs font-normal text-slate-400">meals</span>
              </h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">CO₂ Avoided</p>
              <h3 className="text-2xl font-extrabold text-sky-700 mt-0.5">
                {stats.co2AvoidedKg || '112.5'} <span className="text-xs font-normal text-slate-400">kg</span>
              </h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Batches</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {stats.activeDonations || '1'}
              </h3>
            </div>
          </div>
        </div>

        {/* Donation Manifest Table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Donation Batches</h2>
              <p className="text-xs text-slate-500">Real-time status and autonomous AI freshness evaluations</p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadData}>
              Refresh
            </Button>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No donations submitted yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have surplus food from today's service? Click below to post a batch with AI quality camera scan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Title & ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4">Storage Temp</th>
                    <th className="py-3 px-4">Freshness Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {donations.map((d) => (
                    <tr key={d.id || d._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.title}</div>
                        <span className="text-[10px] text-slate-400">ID: {(d.id || d._id || '').substring(0, 12)}...</span>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">
                        {d.foodCategory?.replace('_', ' ').toLowerCase()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {d.quantityValue} {d.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                          {d.storageTemp}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {d.freshness ? (
                          <div className="text-emerald-700 font-bold">
                            {d.freshness.freshnessScore}% <span className="text-[10px] text-slate-400 font-normal">({d.freshness.safetyWindowHours}h window)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Assessing...</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(d.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedDonation(d)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AiHelperWidget />

      {/* Live Camera Scanner Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imgData) => setAttachedImage(imgData)}
      />

      {/* Modal: Post Surplus Food Batch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  FOODAGENT ANALYZED
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Post Surplus Food Batch
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg font-mono transition-colors"
              >
                ✕
              </button>
            </div>

            {/* UPLOAD FOOD IMAGE FOR AI ANALYSIS SECTION */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  UPLOAD FOOD IMAGE FOR AI ANALYSIS
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload or capture a clear image of the food to help AI assess freshness and quality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Column: Upload / Take Photo Box */}
                <div className="md:col-span-7 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-5 text-center flex flex-col items-center justify-center transition-colors hover:border-emerald-300 relative overflow-hidden">
                  {attachedImage ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                      <img src={attachedImage} alt="Uploaded food preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" /> Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachedImage(null)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                        ✓ Quality Image Attached
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2 shadow-sm">
                        <Camera className="w-6 h-6 stroke-[2]" />
                      </div>

                      <h4 className="text-sm font-bold text-slate-800">Upload Food Image</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (Max 5MB)</p>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" /> Take Photo
                        </button>

                        <label className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs cursor-pointer transition-colors flex items-center gap-1 shadow-sm">
                          <UploadCloud className="w-3.5 h-3.5" /> Browse
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                        </label>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column: AI Will Analyze List */}
                <div className="md:col-span-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-center space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    AI will analyze:
                  </span>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>🌿</span>
                      <span className="font-medium">Food freshness score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span className="font-medium">Quality assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span className="font-medium">Spoilage risk analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span className="font-medium">Estimated safe window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span className="font-medium">Safety recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Batch Form */}
            <form onSubmit={handleSubmitDonation} className="space-y-4">
              <Input
                label="DONATION BATCH TITLE"
                placeholder="e.g. 40kg Prepared Hot Lunch Platters"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="CATEGORY"
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  options={[
                    { value: 'COOKED_MEALS', label: 'Cooked Meals' },
                    { value: 'BAKERY', label: 'Bakery & Bread' },
                    { value: 'PRODUCE', label: 'Fresh Produce' },
                    { value: 'DAIRY', label: 'Dairy & Eggs' },
                    { value: 'PACKAGED', label: 'Packaged Shelf-Stable' },
                  ]}
                />
                <Input
                  label="TOTAL WEIGHT"
                  type="number"
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                  required
                />
                <Select
                  label="UNIT"
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  options={[
                    { value: 'KG', label: 'Kilograms (KG)' },
                    { value: 'MEALS', label: 'Portions / Meals' },
                    { value: 'BOXES', label: 'Boxes / Trays' },
                    { value: 'LITERS', label: 'Liters' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="STORAGE TEMPERATURE"
                  value={storageTemp}
                  onChange={(e) => setStorageTemp(e.target.value)}
                  options={[
                    { value: 'REFRIGERATED', label: 'Refrigerated (2°C - 4°C)' },
                    { value: 'WARM', label: 'Warm (Insulated Hot Boxes)' },
                    { value: 'FROZEN', label: 'Frozen (-18°C)' },
                    { value: 'ROOM_TEMP', label: 'Room Temperature' },
                  ]}
                />
                <Input
                  label="NOTES / DESCRIPTION"
                  placeholder="e.g. Vegetarian, includes paneer & dal"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" /> ITEM BREAKDOWN
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    + Add Item Line
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={it.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  className="px-6 py-2.5 shadow-md shadow-emerald-500/20"
                >
                  Submit for AI Freshness Verification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspection Details */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">AI Freshness Assessment</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedDonation.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="text-slate-400 hover:text-slate-700 font-mono"
              >
                ✕
              </button>
            </div>

            {selectedDonation.freshness && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Freshness Score</span>
                  <span className="text-base font-bold text-emerald-700">{selectedDonation.freshness.freshnessScore}%</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Safe Consumption Window:</span>
                  <span className="font-bold text-slate-800">{selectedDonation.freshness.safetyWindowHours} hours</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Recommendation:</span>
                  <span className="font-semibold text-emerald-700">{selectedDonation.freshness.recommendation}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Breakdown</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                {selectedDonation.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{it.name}</span>
                    <span className="font-bold text-emerald-700">{it.quantity} {it.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="secondary" size="md" className="w-full" onClick={() => setSelectedDonation(null)}>
              Close Inspector
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
