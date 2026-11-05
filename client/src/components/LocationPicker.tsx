import React, { useState } from 'react';
import { LocationCoordinates, VIZAG_LOCALITIES } from '../types';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';

interface LocationPickerProps {
  value: LocationCoordinates;
  onChange: (location: LocationCoordinates) => void;
  compact?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  compact = false
}) => {
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetecting(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        // Find closest Vizag locality if near
        let closest = VIZAG_LOCALITIES[0];
        let minDist = 999999;
        VIZAG_LOCALITIES.forEach((loc) => {
          const d = Math.hypot(loc.lat - lat, loc.lng - lng);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        });

        onChange({
          latitude: lat,
          longitude: lng,
          locality: minDist < 0.1 ? closest.name : 'Visakhapatnam City',
          ward: minDist < 0.1 ? closest.ward : 'GVMC Central',
          address: `GPS Pin: ${lat}, ${lng} (Near ${closest.name})`
        });
      },
      (error) => {
        setDetecting(false);
        setGeoError(`GPS detection unavailable: ${error.message}. Please select your locality below.`);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = VIZAG_LOCALITIES.find((l) => l.name === e.target.value);
    if (selected) {
      onChange({
        latitude: selected.lat,
        longitude: selected.lng,
        locality: selected.name,
        ward: selected.ward,
        address: `${selected.name}, ${selected.ward}, Visakhapatnam`
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
        <MapPin size={14} className="text-teal-600 shrink-0" />
        <span className="font-medium truncate">{value.locality || 'Select Locality'}</span>
        {value.ward && (
          <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
            {value.ward}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <MapPin size={16} className="text-teal-600" />
          Issue Location (Visakhapatnam)
        </label>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={detecting}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Navigation size={12} className={detecting ? 'animate-spin' : ''} />
          {detecting ? 'Locating...' : 'Detect GPS'}
        </button>
      </div>

      {geoError && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Preset Vizag Locality Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Select GVMC Locality / Ward
        </label>
        <select
          value={value.locality || ''}
          onChange={handleSelectPreset}
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
        >
          <option value="" disabled>
            Choose a Vizag locality...
          </option>
          {VIZAG_LOCALITIES.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name} ({loc.ward})
            </option>
          ))}
        </select>
      </div>

      {/* Manual landmark / address detail */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Specific Street / Landmark Details
        </label>
        <input
          type="text"
          value={value.address || ''}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="e.g. Near Sector 2 Rythu Bazar, Opp. State Bank"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
        />
      </div>

      {/* Coordinates pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span className="font-mono">
          Lat: {value.latitude.toFixed(4)}, Lng: {value.longitude.toFixed(4)}
        </span>
        {value.ward && (
          <span className="inline-flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
            <Check size={10} />
            {value.ward}
          </span>
        )}
      </div>
    </div>
  );
};
