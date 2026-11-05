import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, EmergencyAlert, LocationCoordinates, VIZAG_LOCALITIES } from '../types';
import { INITIAL_COMPLAINTS, INITIAL_EMERGENCY_ALERTS } from '../data/mockData';
import { useAuth } from './AuthContext';

interface ComplaintContextType {
  complaints: Complaint[];
  emergencyAlerts: EmergencyAlert[];
  currentLocation: LocationCoordinates;
  setCurrentLocation: (loc: LocationCoordinates) => void;
  addComplaint: (newComplaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'citizenId' | 'citizenName'>) => Promise<Complaint>;
  reopenComplaint: (complaintId: string, reason: string) => Promise<boolean>;
  confirmResolution: (complaintId: string, feedbackRating: number, feedbackNotes?: string) => Promise<boolean>;
  supportComplaint: (complaintId: string) => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: Complaint['status'], extra?: Partial<Complaint>) => Promise<void>;
  getUserComplaints: () => Complaint[];
  getNearbyComplaints: (radiusMeters?: number) => Complaint[];
  activeAlerts: EmergencyAlert[];
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('civicpulse_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_COMPLAINTS;
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);

  // Default location initialized to MVP Colony Sector 2, Vizag
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(() => {
    const defaultLoc = VIZAG_LOCALITIES[2]; // MVP Colony
    return {
      latitude: defaultLoc.lat,
      longitude: defaultLoc.lng,
      locality: defaultLoc.name,
      ward: defaultLoc.ward,
      address: 'MVP Colony, Visakhapatnam, Andhra Pradesh'
    };
  });

  useEffect(() => {
    localStorage.setItem('civicpulse_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Request browser location on mount if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If in Vizag region approx (lat ~ 17.5-17.9, lng ~ 83.1-83.4), keep coords; otherwise retain preset
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const isNearVizag = lat >= 17.0 && lat <= 18.5 && lng >= 82.5 && lng <= 84.0;
          if (isNearVizag) {
            setCurrentLocation(prev => ({
              ...prev,
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              address: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
            }));
          }
        },
        (err) => {
          console.log('Browser geolocation notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const addComplaint = async (
    data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'citizenId' | 'citizenName'>
  ): Promise<Complaint> => {
    const newId = `CP-VZ-${1000 + complaints.length + 1}`;
    const now = new Date().toISOString();

    const created: Complaint = {
      ...data,
      id: newId,
      citizenId: user?.id || 'citizen-guest',
      citizenName: user?.name || 'Vizag Citizen',
      citizenPhone: user?.phone,
      createdAt: now,
      updatedAt: now,
      slaDeadline: new Date(Date.now() + 3600000 * 48).toISOString()
    };

    setComplaints(prev => [created, ...prev]);

    // Attempt backend sync in background
    try {
      fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      }).catch(() => {
        // Handled silently for offline/fallback
      });
    } catch {
      // Offline fallback
    }

    return created;
  };

  const reopenComplaint = async (complaintId: string, reason: string): Promise<boolean> => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Reopened',
            reopenCount: (c.reopenCount || 0) + 1,
            reopenReason: reason,
            reopenAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    return true;
  };

  const confirmResolution = async (complaintId: string, _feedbackRating: number, _feedbackNotes?: string): Promise<boolean> => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Resolved',
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    return true;
  };

  const supportComplaint = async (complaintId: string): Promise<void> => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            priorityScore: Math.min(100, c.priorityScore + 5),
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
  };

  const updateComplaintStatus = async (
    complaintId: string,
    status: Complaint['status'],
    extra?: Partial<Complaint>
  ): Promise<void> => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            ...extra,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
  };

  const getUserComplaints = () => {
    if (!user) return [];
    return complaints.filter(c => c.citizenId === user.id);
  };

  const getNearbyComplaints = (_radiusMeters = 500) => {
    // Return complaints in the same locality or ward
    return complaints.filter(
      c => c.location.ward === currentLocation.ward || c.location.locality === currentLocation.locality
    );
  };

  const activeAlerts = emergencyAlerts.filter(a => a.status === 'active');

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        emergencyAlerts,
        currentLocation,
        setCurrentLocation,
        addComplaint,
        reopenComplaint,
        confirmResolution,
        supportComplaint,
        updateComplaintStatus,
        getUserComplaints,
        getNearbyComplaints,
        activeAlerts
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
