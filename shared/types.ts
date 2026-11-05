// CivicPulse AI - Shared Domain Types and Interfaces

export type UserRole = 'citizen' | 'admin' | 'contractor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  ward?: string;
  locality?: string;
  preferredLanguage?: 'en' | 'te';
  createdAt?: string;
  contractorId?: string;
  departmentId?: string;
}

export type ComplaintCategory =
  | 'Potholes and road damage'
  | 'Garbage accumulation'
  | 'Drainage blockage'
  | 'Water leakage'
  | 'Water supply disruption'
  | 'Streetlight failure'
  | 'Fallen trees'
  | 'Flooding and waterlogging'
  | 'Public infrastructure damage'
  | 'Other civic issues';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Verification Pending'
  | 'Resolved'
  | 'Reopened'
  | 'Rejected';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  locality?: string;
  ward?: string;
  address?: string;
  landmark?: string;
}

export interface Complaint {
  id: string;
  incidentId?: string; // Parent incident if merged/clustered
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  severity: number; // 1 (Minor) to 5 (Critical Emergency)
  priorityScore: number; // 0 to 100 calculated
  status: ComplaintStatus;
  location: LocationCoordinates;
  photoUrl?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  transcription?: string;
  detectedLanguage?: 'en' | 'te' | 'other';
  translatedText?: string;
  safetyRiskAlert?: boolean;
  safetyRiskNotes?: string;
  isDuplicate?: boolean;
  parentIncidentId?: string;
  departmentId?: string;
  departmentName?: string;
  contractorId?: string;
  contractorName?: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reopenCount?: number;
  reopenReason?: string;
  reopenAt?: string;
  completionPhotoUrl?: string;
  completionNotes?: string;
  aiVerification?: AIVerificationSummary;
}

export interface Incident {
  id: string;
  title: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  severity: number;
  priorityScore: number;
  location: LocationCoordinates;
  primaryPhotoUrl?: string;
  complaintIds: string[];
  supporterCount: number;
  departmentId?: string;
  departmentName?: string;
  contractorId?: string;
  contractorName?: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  isRecurring?: boolean;
  recurrenceCount?: number;
  workOrderId?: string;
}

export interface WorkOrder {
  id: string;
  incidentId: string;
  incidentTitle: string;
  category: ComplaintCategory;
  severity: number;
  location: LocationCoordinates;
  departmentId: string;
  contractorId: string;
  contractorName: string;
  status: 'Assigned' | 'In Progress' | 'Evidence Submitted' | 'Verified' | 'Rejected' | 'Closed';
  instructions?: string;
  originalPhotoUrl?: string;
  completionPhotoUrl?: string;
  completionNotes?: string;
  submittedAt?: string;
  submissionLocation?: LocationCoordinates;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  verificationAssessment?: AIVerificationSummary;
  contractorResponse?: string;
}

export interface AIVerificationSummary {
  status: 'likely_completed' | 'incomplete' | 'insufficient_evidence' | 'inspection_required';
  confidence: number; // 0.0 - 1.0
  explanation: string;
  detectedImprovements: string[];
  remainingConcerns: string[];
  requiresHumanInspection: boolean;
  verifiedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  categoriesCovered: ComplaintCategory[];
  headOfficialName: string;
  phone: string;
  email: string;
  activeWorkload: number;
  slaHoursDefault: number;
}

export interface Contractor {
  id: string;
  name: string;
  companyName: string;
  speciality: string;
  phone: string;
  rating: number; // 1.0 to 5.0
  completedJobs: number;
  activeJobs: number;
  assignedWards: string[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category: 'roads' | 'drainage' | 'streetlights' | 'water_pipelines' | 'garbage_points' | 'public_facilities';
  location: LocationCoordinates;
  ward: string;
  condition: 'Good' | 'Fair' | 'Critical' | 'Under Maintenance';
  installedYear?: number;
  lastInspectionDate: string;
  complaintHistoryCount: number;
  notes?: string;
}

export interface CommunityProposal {
  id: string;
  title: string;
  description: string;
  ward: string;
  locality: string;
  category: string;
  upvotes: number;
  status: 'open' | 'under_review' | 'budget_approved' | 'in_progress' | 'completed';
  proposedBy: string;
  createdAt: string;
  userHasVoted?: boolean;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  type: 'cyclone' | 'flash_flood' | 'tree_fall' | 'structural_hazard' | 'power_hazard';
  severity: 'critical' | 'high' | 'moderate';
  locality: string;
  location: LocationCoordinates;
  description: string;
  status: 'active' | 'resolved';
  createdAt: string;
  syncStatus?: 'queued_local' | 'synced';
}

export interface ResourceRecommendation {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  ward: string;
  locality: string;
  priorityScore: number;
  reason: string;
  suggestedAction: string;
  estimatedUrgency: 'immediate' | 'high' | 'routine';
  impactedCitizensEstimate?: number;
  createdAt: string;
}

export interface CivicServiceStatus {
  service: 'Water Supply' | 'Drainage & Sewage' | 'Street Lighting' | 'Garbage Collection' | 'Road Network';
  status: 'Normal' | 'Partial Disruption' | 'Critical Interruption';
  affectedAreas: string[];
  source: 'citizen_reported' | 'ai_inferred' | 'admin_verified';
  lastUpdated: string;
  details: string;
}

// Preset Vizag Localities for consistent demo/geocoding accuracy
export const VIZAG_LOCALITIES: { name: string; ward: string; lat: number; lng: number }[] = [
  { name: 'Beach Road (RK Beach)', ward: 'Ward 18', lat: 17.7126, lng: 83.3182 },
  { name: 'Siripuram Junction', ward: 'Ward 16', lat: 17.7214, lng: 83.3155 },
  { name: 'MVP Colony Sector 1-4', ward: 'Ward 21', lat: 17.7424, lng: 83.3377 },
  { name: 'Gajuwaka Main Road', ward: 'Ward 65', lat: 17.6908, lng: 83.2085 },
  { name: 'Madhurawada IT SEZ', ward: 'Ward 5', lat: 17.8184, lng: 83.3512 },
  { name: 'Dwaraka Nagar (RTC Complex)', ward: 'Ward 25', lat: 17.7289, lng: 83.3039 },
  { name: 'Jagadamba Centre', ward: 'Ward 29', lat: 17.7118, lng: 83.3006 },
  { name: 'Rushikonda Hills', ward: 'Ward 8', lat: 17.7818, lng: 83.3853 }
];

