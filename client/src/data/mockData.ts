import { Complaint, Department, Contractor, EmergencyAlert, InfrastructureAsset, CommunityProposal, CivicServiceStatus } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-roads',
    name: 'Roads & Engineering Department',
    code: 'GVMC-ENG',
    categoriesCovered: ['Potholes and road damage', 'Public infrastructure damage'],
    headOfficialName: 'K. Ramana Murthy, SE (Works)',
    phone: '+91 891 2746123',
    email: 'roads@gvmc.gov.in',
    activeWorkload: 14,
    slaHoursDefault: 48
  },
  {
    id: 'dept-sanitation',
    name: 'Public Health & Sanitation',
    code: 'GVMC-SAN',
    categoriesCovered: ['Garbage accumulation'],
    headOfficialName: 'Dr. V. Sujatha, CMOH',
    phone: '+91 891 2746124',
    email: 'sanitation@gvmc.gov.in',
    activeWorkload: 8,
    slaHoursDefault: 24
  },
  {
    id: 'dept-drainage',
    name: 'Underground Drainage & Stormwater',
    code: 'GVMC-DRN',
    categoriesCovered: ['Drainage blockage', 'Flooding and waterlogging'],
    headOfficialName: 'S. Trinadh Rao, EE (Drainage)',
    phone: '+91 891 2746125',
    email: 'drainage@gvmc.gov.in',
    activeWorkload: 11,
    slaHoursDefault: 36
  },
  {
    id: 'dept-water',
    name: 'Water Supply & Distribution',
    code: 'GVMC-WAT',
    categoriesCovered: ['Water leakage', 'Water supply disruption'],
    headOfficialName: 'P. Anjaneyulu, EE (Water)',
    phone: '+91 891 2746126',
    email: 'watersupply@gvmc.gov.in',
    activeWorkload: 6,
    slaHoursDefault: 24
  },
  {
    id: 'dept-electrical',
    name: 'Electrical & Street Lighting',
    code: 'GVMC-ELE',
    categoriesCovered: ['Streetlight failure'],
    headOfficialName: 'M. Appala Raju, DEE (Electrical)',
    phone: '+91 891 2746127',
    email: 'streetlights@gvmc.gov.in',
    activeWorkload: 5,
    slaHoursDefault: 24
  },
  {
    id: 'dept-horticulture',
    name: 'Horticulture & Disaster Tree Cell',
    code: 'GVMC-HOR',
    categoriesCovered: ['Fallen trees'],
    headOfficialName: 'B. Jagannadha Rao, Asst. Director',
    phone: '+91 891 2746128',
    email: 'horticulture@gvmc.gov.in',
    activeWorkload: 3,
    slaHoursDefault: 12
  }
];

export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'cont-1',
    name: 'Rao Infrastructure Works',
    companyName: 'Rao Infra Projects Pvt Ltd',
    speciality: 'Asphalt paving & road repairs',
    phone: '+91 98480 12345',
    rating: 4.8,
    completedJobs: 142,
    activeJobs: 3,
    assignedWards: ['Ward 16', 'Ward 18', 'Ward 21']
  },
  {
    id: 'cont-2',
    name: 'Vizag Cleantech Services',
    companyName: 'Vizag Eco Solutions',
    speciality: 'Solid waste management & bulk clearance',
    phone: '+91 94401 56789',
    rating: 4.5,
    completedJobs: 98,
    activeJobs: 2,
    assignedWards: ['Ward 21', 'Ward 25', 'Ward 29']
  },
  {
    id: 'cont-3',
    name: 'Eastern Coastal Drain Services',
    companyName: 'ECDS Infrastructure',
    speciality: 'Desilting & underground pipe repairs',
    phone: '+91 99890 23456',
    rating: 4.6,
    completedJobs: 110,
    activeJobs: 4,
    assignedWards: ['Ward 18', 'Ward 65', 'Ward 5']
  }
];

export const INITIAL_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'alert-1',
    title: 'Monsoon High Tide & Beach Road Waterlogging Alert',
    type: 'flash_flood',
    severity: 'high',
    locality: 'Beach Road (Near Submarine Museum)',
    location: {
      latitude: 17.7142,
      longitude: 83.3235,
      locality: 'Beach Road',
      ward: 'Ward 18'
    },
    description: 'High tides coinciding with localized stormwater discharge. Citizens are advised to exercise caution near low-lying sections of RK Beach promenade.',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    syncStatus: 'synced'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CP-VZ-1001',
    citizenId: 'citizen-praveen',
    citizenName: 'Praveen Varma',
    citizenPhone: '+91 98480 98765',
    title: 'Deep Hazardous Pothole near MVP Sector 2 Circle',
    description: 'Major asphalt depression approx 1.5 ft wide near the vegetable market roundabout. Causes severe bike skidding, especially after evening showers.',
    category: 'Potholes and road damage',
    severity: 4,
    priorityScore: 78,
    status: 'In Progress',
    location: {
      latitude: 17.7424,
      longitude: 83.3377,
      locality: 'MVP Colony Sector 2',
      ward: 'Ward 21',
      address: 'Near Sector 2 Rythu Bazar, MVP Colony, Visakhapatnam'
    },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    detectedLanguage: 'en',
    safetyRiskAlert: true,
    safetyRiskNotes: 'Risk of two-wheeler tipping during peak market hours.',
    departmentId: 'dept-roads',
    departmentName: 'Roads & Engineering Department',
    contractorId: 'cont-1',
    contractorName: 'Rao Infrastructure Works',
    slaDeadline: new Date(Date.now() + 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'CP-VZ-1002',
    citizenId: 'citizen-praveen',
    citizenName: 'Praveen Varma',
    citizenPhone: '+91 98480 98765',
    title: 'Garbage Dump Overflow on Siripuram Crossroad',
    description: 'Open municipal bin overflowing for over 3 days. Stray cattle and dogs scattering waste onto the pedestrian walkway.',
    category: 'Garbage accumulation',
    severity: 3,
    priorityScore: 62,
    status: 'Resolved',
    location: {
      latitude: 17.7214,
      longitude: 83.3155,
      locality: 'Siripuram Junction',
      ward: 'Ward 16',
      address: 'Opposite All India Radio Station, Siripuram'
    },
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    detectedLanguage: 'en',
    departmentId: 'dept-sanitation',
    departmentName: 'Public Health & Sanitation',
    contractorId: 'cont-2',
    contractorName: 'Vizag Cleantech Services',
    slaDeadline: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    completionPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    completionNotes: 'Area cleared with mechanical sweeper and sanitized with bleaching powder. Waste transferred to Kapuluppada yard.',
    aiVerification: {
      status: 'likely_completed',
      confidence: 0.94,
      explanation: 'Comparison shows waste completely removed, ground sanitized, and pedestrian walkway clear.',
      detectedImprovements: ['Overflowing garbage mound cleared', 'Ground sanitized with lime/bleaching', 'Walkway unobstructed'],
      remainingConcerns: [],
      requiresHumanInspection: false,
      verifiedAt: new Date(Date.now() - 3600000 * 9).toISOString()
    }
  },
  {
    id: 'CP-VZ-1003',
    citizenId: 'citizen-2',
    citizenName: 'K. Sanyasi Rao',
    citizenPhone: '+91 94411 22334',
    title: 'Stormwater Drain Blockage Causing Water Stagnation',
    description: 'డ్రైనేజీ పూడికతో నిండిపోయింది. మురుగునీరు రోడ్డుపైకి ప్రవహిస్తోంది. దుర్వాసన వస్తోంది (Drainage choked with silt, blackwater spilling onto road).',
    category: 'Drainage blockage',
    severity: 4,
    priorityScore: 75,
    status: 'Assigned',
    location: {
      latitude: 17.7126,
      longitude: 83.3182,
      locality: 'Beach Road (Pandurangapuram)',
      ward: 'Ward 18',
      address: 'Pandurangapuram 2nd Lane, near RK Beach'
    },
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    detectedLanguage: 'te',
    transcription: 'డ్రైనేజీ పూడికతో నిండిపోయింది. మురుగునీరు రోడ్డుపైకి ప్రవహిస్తోంది.',
    translatedText: 'The drain is filled with silt. Sewage water is flowing onto the road with bad foul odor.',
    departmentId: 'dept-drainage',
    departmentName: 'Underground Drainage & Stormwater',
    slaDeadline: new Date(Date.now() + 3600000 * 30).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'CP-VZ-1004',
    citizenId: 'citizen-3',
    citizenName: 'B. Anuradha',
    citizenPhone: '+91 98492 44556',
    title: 'Non-functional Streetlights along Madhurawada Main Corridor',
    description: '3 consecutive pole lamps flickering and off for past 4 nights. Dark stretch creates safety risk for women returning from IT SEZ.',
    category: 'Streetlight failure',
    severity: 3,
    priorityScore: 65,
    status: 'Submitted',
    location: {
      latitude: 17.8184,
      longitude: 83.3512,
      locality: 'Madhurawada IT SEZ Road',
      ward: 'Ward 5',
      address: 'Madhurawada IT Hill 2 approach road'
    },
    detectedLanguage: 'en',
    safetyRiskAlert: true,
    safetyRiskNotes: 'Night commute safety risk for IT corridor workers.',
    departmentId: 'dept-electrical',
    departmentName: 'Electrical & Street Lighting',
    slaDeadline: new Date(Date.now() + 3600000 * 20).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export const INITIAL_COMMUNITY_PROPOSALS: CommunityProposal[] = [
  {
    id: 'prop-1',
    title: 'Install Rainwater Infiltration Trenches along MVP Main Drain',
    description: 'Constructing gravel-filled infiltration trenches along Sector 1 stormwater drains to prevent recurring monsoonal waterlogging and replenish local groundwater.',
    ward: 'Ward 21',
    locality: 'MVP Colony',
    category: 'Drainage & Ecology',
    upvotes: 84,
    status: 'under_review',
    proposedBy: 'MVP Colony Resident Welfare Association',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: 'prop-2',
    title: 'Solar LED Lighting & Women Safety SOS Kiosks on Beach Road',
    description: 'Upgrade 2 km stretch from Submarine Museum to Kali Temple with high-illumination solar fixtures and emergency response call boxes.',
    ward: 'Ward 18',
    locality: 'Beach Road',
    category: 'Safety & Street Lighting',
    upvotes: 142,
    status: 'budget_approved',
    proposedBy: 'Vizag Citizens Forum',
    createdAt: new Date(Date.now() - 3600000 * 200).toISOString()
  }
];

export const INITIAL_SERVICE_STATUS: CivicServiceStatus[] = [
  {
    service: 'Water Supply',
    status: 'Normal',
    affectedAreas: ['Thatipudi line operational', 'Raiwada reservoir supply normal'],
    source: 'admin_verified',
    lastUpdated: 'Today, 08:30 AM',
    details: 'Daily 2-hour morning cycle completed across all central wards.'
  },
  {
    service: 'Drainage & Sewage',
    status: 'Partial Disruption',
    affectedAreas: ['Ward 18 Pandurangapuram', 'Gajuwaka Industrial corridor'],
    source: 'ai_inferred',
    lastUpdated: 'Today, 11:15 AM',
    details: 'Heavy silt accumulation detected in 3 interconnected culverts.'
  },
  {
    service: 'Street Lighting',
    status: 'Normal',
    affectedAreas: ['Ward 5 (isolated 3 poles under repair)'],
    source: 'admin_verified',
    lastUpdated: 'Yesterday, 07:00 PM',
    details: 'Central SCADA feeder operational for 98.4% of municipal streetlights.'
  },
  {
    service: 'Garbage Collection',
    status: 'Normal',
    affectedAreas: ['Door-to-door green vehicle coverage: 94%'],
    source: 'admin_verified',
    lastUpdated: 'Today, 10:00 AM',
    details: 'Primary morning segregation rounds completed.'
  },
  {
    service: 'Road Network',
    status: 'Partial Disruption',
    affectedAreas: ['MVP Sector 2 Roundabout (pothole caution)'],
    source: 'citizen_reported',
    lastUpdated: 'Today, 01:20 PM',
    details: 'Road works scheduled for nighttime asphalt laying.'
  }
];

export const INITIAL_INFRASTRUCTURE: InfrastructureAsset[] = [
  {
    id: 'INF-VZ-RD-042',
    name: 'MVP Colony Sector 2 Main Arterial Road',
    category: 'roads',
    location: {
      latitude: 17.7424,
      longitude: 83.3377,
      locality: 'MVP Colony',
      ward: 'Ward 21'
    },
    ward: 'Ward 21',
    condition: 'Fair',
    installedYear: 2021,
    lastInspectionDate: '2024-08-15',
    complaintHistoryCount: 7,
    notes: 'Heavy monsoon runoff from Kailasagiri foothills causes asphalt stripping.'
  },
  {
    id: 'INF-VZ-DR-019',
    name: 'Pandurangapuram Beach Outfall Stormwater Culvert',
    category: 'drainage',
    location: {
      latitude: 17.7126,
      longitude: 83.3182,
      locality: 'Beach Road',
      ward: 'Ward 18'
    },
    ward: 'Ward 18',
    condition: 'Critical',
    installedYear: 2018,
    lastInspectionDate: '2024-10-02',
    complaintHistoryCount: 12,
    notes: 'Requires automated desilting mechanism before northeast monsoon peak.'
  },
  {
    id: 'INF-VZ-EL-105',
    name: 'Madhurawada IT Corridor High-Mast Lighting System',
    category: 'streetlights',
    location: {
      latitude: 17.8184,
      longitude: 83.3512,
      locality: 'Madhurawada',
      ward: 'Ward 5'
    },
    ward: 'Ward 5',
    condition: 'Fair',
    installedYear: 2022,
    lastInspectionDate: '2024-09-20',
    complaintHistoryCount: 4,
    notes: 'Underground cabling junction box needs waterproofing.'
  }
];
