import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Mail, Lock, Building2, HeartHandshake, Truck, MapPin, Phone, User as UserIcon } from 'lucide-react';

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
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] bg-grid">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            Join the FoodFlow Network
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500">
            Select your role to configure your customized platform workspace
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-lg space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'donor'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs">Food Donor</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('recipient')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'recipient'
                  ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-5 h-5 text-amber-600" />
              <span className="text-xs">Recipient / NGO</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'volunteer'
                  ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-5 h-5 text-sky-600" />
              <span className="text-xs">Volunteer Hero</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Email Address"
                type="email"
                placeholder="contact@org.org"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98200 00000"
                icon={Phone}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            {role === 'donor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Establishment Name"
                  placeholder="e.g. Gourmet Bistro"
                  icon={Building2}
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                />
                <Select
                  label="Donor Type"
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value)}
                  options={[
                    { value: 'RESTAURANT', label: 'Restaurant / Cafe' },
                    { value: 'SUPERMARKET', label: 'Supermarket / Grocery' },
                    { value: 'EVENT_ORGANIZER', label: 'Event / Caterer' },
                    { value: 'CORPORATE', label: 'Corporate Cafeteria' },
                  ]}
                />
              </div>
            )}

            {role === 'recipient' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Shelter / NGO Name"
                  placeholder="e.g. Hope Shelter"
                  icon={HeartHandshake}
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                />
                <Select
                  label="Facility Type"
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  options={[
                    { value: 'SHELTER', label: 'Homeless / Emergency Shelter' },
                    { value: 'FOOD_BANK', label: 'Food Bank Hub' },
                    { value: 'COMMUNITY_KITCHEN', label: 'Soup Kitchen' },
                  ]}
                />
                <Input
                  label="Daily Capacity (Meals)"
                  type="number"
                  value={capacityMealsPerDay}
                  onChange={(e) => setCapacityMealsPerDay(e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            )}

            {role === 'volunteer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Full Name"
                  placeholder="e.g. Kumaran"
                  icon={UserIcon}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Select
                  label="Vehicle Type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  options={[
                    { value: 'CAR', label: 'Standard Car' },
                    { value: 'VAN', label: 'Cargo Van' },
                    { value: 'MOTORCYCLE', label: 'Motorcycle / Scooter' },
                    { value: 'BICYCLE', label: 'Bicycle / E-Bike' },
                  ]}
                />
                <Input
                  label="Vehicle Payload Capacity (KG)"
                  type="number"
                  value={vehicleCapacityKg}
                  onChange={(e) => setVehicleCapacityKg(e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            )}

            <Input
              label="Operating Base Address"
              placeholder="e.g. Saravanampatti, Coimbatore"
              icon={MapPin}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
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
              className="w-full mt-2 justify-center shadow-md shadow-emerald-500/20"
              isLoading={loading}
            >
              Complete Registration
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
