import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  Mail,
  Lock,
  Building2,
  HeartHandshake,
  Truck,
  MapPin,
  Phone,
  User as UserIcon,
  Leaf,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [donorType, setDonorType] = useState('RESTAURANT');
  const [recipientType, setRecipientType] = useState('SHELTER');
  const [capacityMealsPerDay, setCapacityMealsPerDay] = useState('150');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [vehicleCapacityKg, setVehicleCapacityKg] = useState('60');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    const profileData = {
      organizationName: role === 'volunteer' ? undefined : organizationName,
      fullName: role === 'volunteer' ? fullName : undefined,
      contactPhone,
      address: address || 'Saravanampatti, Coimbatore',
      latitude: 11.0805,
      longitude: 76.9942,
      donorType: role === 'donor' ? donorType : undefined,
      recipientType: role === 'recipient' ? recipientType : undefined,
      capacityMealsPerDay: role === 'recipient' ? parseInt(capacityMealsPerDay, 10) : undefined,
      vehicleType: role === 'volunteer' ? vehicleType : undefined,
      vehicleCapacityKg: role === 'volunteer' ? parseFloat(vehicleCapacityKg) : undefined,
    };

    const res = await register({
      email,
      password,
      role,
      profileData,
    });

    setLoading(false);

    if (res.success) {
      const destination =
        role === 'donor'
          ? '/donor'
          : role === 'recipient'
          ? '/recipient'
          : role === 'volunteer'
          ? '/volunteer'
          : '/dashboard';
      navigate(destination);
    } else {
      setError(res.error || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-[#FAF8F5] bg-warm-grid text-slate-800">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-[#1b4332] text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 fill-white stroke-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#1b4332]">FoodFlow</span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="forest" size="sm" dot>
              JOIN THE RESCUE FLEET
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Create an Organization Account
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Connect directly with donors, food banks, shelters, and volunteer logistics.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E5E2DC] p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Your Operational Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] ${
                  role === 'donor'
                    ? 'bg-[#f0f7f3] border-[#1b4332] text-[#1b4332] font-bold shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E5E2DC] text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-5 h-5 text-[#1b4332]" />
                <span className="text-xs">Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('recipient')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] ${
                  role === 'recipient'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E5E2DC] text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-5 h-5 text-amber-700" />
                <span className="text-xs">Recipient / NGO</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] ${
                  role === 'volunteer'
                    ? 'bg-sky-50 border-sky-600 text-sky-900 font-bold shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E5E2DC] text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-5 h-5 text-sky-700" />
                <span className="text-xs">Volunteer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Email Address"
                type="email"
                placeholder="contact@facility.org"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                icon={Phone}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>

            {role === 'volunteer' ? (
              <Input
                label="Full Name"
                placeholder="e.g. Priya Sundaram"
                icon={UserIcon}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            ) : (
              <Input
                label="Organization / Facility Name"
                placeholder={role === 'donor' ? 'e.g. Green Meadow Kitchen' : 'e.g. Hope Shelter Coimbatore'}
                icon={Building2}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />
            )}

            <Input
              label="Operating Address / City"
              placeholder="e.g. Sathy Road, Saravanampatti, Coimbatore"
              icon={MapPin}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            {role === 'donor' && (
              <Select
                label="Donor Category"
                value={donorType}
                onChange={(e) => setDonorType(e.target.value)}
                options={[
                  { value: 'RESTAURANT', label: 'Commercial Restaurant / Bistro' },
                  { value: 'GROCERY_STORE', label: 'Supermarket / Grocery Retailer' },
                  { value: 'HOTEL', label: 'Hotel & Hospitality Dining' },
                  { value: 'EVENT_ORGANIZER', label: 'Catering & Event Venue' },
                  { value: 'CORPORATE_CAFETERIA', label: 'Corporate Office Cafeteria' },
                  { value: 'INDIVIDUAL', label: 'Individual / Community Kitchen' },
                ]}
              />
            )}

            {role === 'recipient' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label="Shelter Facility Type"
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  options={[
                    { value: 'SHELTER', label: 'Emergency Night Shelter' },
                    { value: 'FOOD_BANK', label: 'Central Food Distribution Bank' },
                    { value: 'SOUP_KITCHEN', label: 'Daily Free Meal Soup Kitchen' },
                    { value: 'COMMUNITY_CENTER', label: 'Local Community Welfare Center' },
                    { value: 'ORPHANAGE', label: 'Child Welfare Home / Orphanage' },
                    { value: 'OLD_AGE_HOME', label: 'Senior Care Facility' },
                  ]}
                />

                <Input
                  label="Meal Intake Capacity (per day)"
                  type="number"
                  min="10"
                  max="5000"
                  value={capacityMealsPerDay}
                  onChange={(e) => setCapacityMealsPerDay(e.target.value)}
                  required
                />
              </div>
            )}

            {role === 'volunteer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label="Vehicle Type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  options={[
                    { value: 'BIKE', label: 'Motorcycle / Scooter (Up to 25kg)' },
                    { value: 'CAR', label: 'Standard Passenger Car (Up to 80kg)' },
                    { value: 'VAN', label: 'Delivery Cargo Van (Up to 350kg)' },
                    { value: 'TRUCK', label: 'Heavy Transport Truck (500kg+)' },
                  ]}
                />

                <Input
                  label="Payload Capacity (kg)"
                  type="number"
                  min="5"
                  max="2000"
                  value={vehicleCapacityKg}
                  onChange={(e) => setVehicleCapacityKg(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Create Password"
                type="password"
                placeholder="At least 6 characters"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 justify-center"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-[#E5E2DC]">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#1b4332] hover:text-[#143527] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
