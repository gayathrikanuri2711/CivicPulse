import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation keys used across the app
export interface Translations {
  // Header
  headerSubtitle: string;
  logout: string;
  // Citizen Home
  welcomeBack: string;
  reportNewIssue: string;
  myComplaints: string;
  totalSubmitted: string;
  resolved: string;
  pending: string;
  recentComplaints: string;
  viewAll: string;
  noComplaints: string;
  reportFirst: string;
  nearbyReports: string;
  communityProposals: string;
  upvote: string;
  // Report Issue
  reportCivicIssue: string;
  reportSubtitle: string;
  issuePhoto: string;
  takePhotoOrUpload: string;
  photoHelp: string;
  voiceComplaint: string;
  textDescription: string;
  textPlaceholder: string;
  aiClassification: string;
  aiClassificationDesc: string;
  analyzeReview: string;
  analyzingAi: string;
  aiVerification: string;
  correctBeforeSending: string;
  generatedTitle: string;
  issueCategory: string;
  severityLevel: string;
  severityScale: string;
  safetyRisk: string;
  safetyRiskDesc: string;
  submitComplaint: string;
  submittingGvmc: string;
  transparencyNote: string;
  remove: string;
  // General
  submit: string;
  cancel: string;
  approve: string;
  loading: string;
  success: string;
  error: string;
  complaintSubmitted: string;
  trackingId: string;
  trackComplaints: string;
  reportAnother: string;
  // Citizen Home - additional
  namaskaram: string;
  homeSubtitle: string;
  reportAnIssue: string;
  allSubmissions: string;
  inProgressPending: string;
  activeResolution: string;
  verifiedRepairs: string;
  nearbyCivicReports: string;
  nearbySubtitle: string;
  communityWardPolls: string;
  communityPollsSubtitle: string;
  myRecentComplaints: string;
  trackStatus: string;
  noComplaintsYet: string;
  noComplaintsDesc: string;
  nearbyReportsTitle: string;
  nearbyReportsSubtitle: string;
  supportPriority: string;
  wardProposals: string;
  wardProposalsSubtitle: string;
  proposedBy: string;
  voted: string;
  close: string;
  emergencyAdvisory: string;
  affecting: string;
  safetyRiskLabel: string;
  // My Complaints page
  myCivicComplaints: string;
  complaintsPageSubtitle: string;
  reportNewIssueBtn: string;
  searchPlaceholder: string;
  noComplaintsFound: string;
  noComplaintsStatus: string;
  viewTimeline: string;
  currentStatus: string;
  location: string;
  citizenReportDesc: string;
  department: string;
  assignedContractor: string;
  underReviewGvmc: string;
  pendingWorkOrder: string;
  resolutionEvidence: string;
  beforeRepair: string;
  afterRepair: string;
  contractorNotes: string;
  aiAuditAssessment: string;
  confidence: string;
  issueNotFixed: string;
  confirmRepair: string;
  requestReopening: string;
  reopenSubtitle: string;
  reasonForReopening: string;
  confirmReopen: string;
  confirmRepairTitle: string;
  rateRepair: string;
  notNow: string;
  confirmCloseComplaint: string;
  submitting: string;
  reopened: string;
  noPhoto: string;
  slaTarget: string;
  // Citizen Profile page
  citizenProfile: string;
  profileSubtitle: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  phoneHelp: string;
  preferredLanguage: string;
  homeWard: string;
  savePreferences: string;
  savedSuccess: string;
  offlinePwaStatus: string;
  networkConnection: string;
  onlineActive: string;
  offlineQueue: string;
  pendingSync: string;
  serviceWorker: string;
  activeCache: string;
  resetDemoData: string;
  resetDemoDesc: string;
  resetState: string;
  resetConfirm: string;
  // Bottom Nav
  home: string;
  complaints: string;
  report: string;
  profile: string;
  // Contractor Portal
  contractorHeader: string;
  contractorPortalTitle: string;
  contractorSubtitle: string;
  qualityRating: string;
  repairsVerified: string;
  assignedWorkOrders: string;
  sortedBySla: string;
  allJobsCompleted: string;
  newWorkOrders: string;
  startRepair: string;
  uploadEvidence: string;
  originalIssuePhoto: string;
  uploadCompletionPhoto: string;
  captureRepaired: string;
  geminiCompares: string;
  fieldRepairNotes: string;
  runAiAudit: string;
  runningAiAuditor: string;
  evidenceSubmitted: string;
  change: string;
  noPhotoProvided: string;
}

const EN: Translations = {
  headerSubtitle: 'Visakhapatnam (GVMC) • Better Cities. Together.',
  logout: 'Log out',
  welcomeBack: 'Welcome back',
  reportNewIssue: 'Report New Issue',
  myComplaints: 'My Complaints',
  totalSubmitted: 'Total Submitted',
  resolved: 'Resolved',
  pending: 'Pending',
  recentComplaints: 'Recent Complaints',
  viewAll: 'View All',
  noComplaints: 'No complaints filed yet.',
  reportFirst: 'Report your first civic issue to get started.',
  nearbyReports: 'Nearby Reports',
  communityProposals: 'Community Proposals',
  upvote: 'Upvote',
  reportCivicIssue: 'Report a Civic Issue',
  reportSubtitle: 'Provide a photo, voice recording in Telugu/English, or text. Gemini AI will categorize and route it directly to the responsible GVMC department.',
  issuePhoto: '1. Issue Photograph (Recommended)',
  takePhotoOrUpload: 'Take photo with camera or tap to upload',
  photoHelp: 'Clear photos help Gemini AI assess potholes, silt, or garbage depth',
  voiceComplaint: 'Telugu / English Voice Complaint',
  textDescription: '3. Text Description (English or Telugu)',
  textPlaceholder: "Describe what you see, e.g.: 'Severe road crater causing vehicle damage' or 'డ్రైనేజీ పూడికతో నిండిపోయింది'",
  aiClassification: 'Gemini AI Auto-Classification',
  aiClassificationDesc: 'Analyze photo and voice to detect GVMC category, severity score, and check 50m duplicates.',
  analyzeReview: 'Analyze & Review',
  analyzingAi: 'Analyzing with AI...',
  aiVerification: 'AI Verification & Review',
  correctBeforeSending: 'You may correct any item before sending',
  generatedTitle: 'Generated Complaint Title',
  issueCategory: 'Civic Issue Category',
  severityLevel: 'Estimated Severity Level',
  severityScale: '(1 = Minor, 5 = Critical Emergency)',
  safetyRisk: 'Immediate Safety Risk',
  safetyRiskDesc: 'E.g., high-voltage hazard, deep uncovered drain',
  submitComplaint: 'Confirm & Submit Complaint',
  submittingGvmc: 'Submitting to GVMC...',
  transparencyNote: 'CivicPulse AI uses multimodal intelligence for fast routing. If offline, reports are securely stored locally on your device and synchronized as soon as your internet connectivity returns.',
  remove: 'Remove',
  submit: 'Submit',
  cancel: 'Cancel',
  approve: 'Approve',
  loading: 'Loading...',
  success: 'Success',
  error: 'Error',
  complaintSubmitted: 'Complaint Submitted Successfully!',
  trackingId: 'Complaint Tracking ID',
  trackComplaints: 'Track in My Complaints',
  reportAnother: 'Report Another Issue',
  // Citizen Home - additional
  namaskaram: 'Namaskaram',
  homeSubtitle: 'Report civic issues in your neighbourhood. AI-powered classification and automated resolution verification ensure every complaint reaches GVMC officers.',
  reportAnIssue: 'Report an Issue',
  allSubmissions: 'All submissions',
  inProgressPending: 'In Progress / Pending',
  activeResolution: 'Active resolution',
  verifiedRepairs: 'Verified repairs',
  nearbyCivicReports: 'Nearby Civic Reports',
  nearbySubtitle: 'View & support complaints reported around',
  communityWardPolls: 'Community Ward Polls',
  communityPollsSubtitle: 'Vote on municipal improvement proposals for',
  myRecentComplaints: 'My Recent Complaints',
  trackStatus: 'Track status updates and departmental actions',
  noComplaintsYet: 'No complaints submitted yet',
  noComplaintsDesc: 'See a pothole, open garbage, or broken streetlight? Report it in seconds with a photo or voice note.',
  nearbyReportsTitle: 'Nearby Reports in Vizag',
  nearbyReportsSubtitle: 'Supporting complaints increases municipal priority score',
  supportPriority: 'Support (+5 priority)',
  wardProposals: 'Ward Improvement Proposals',
  wardProposalsSubtitle: 'Cast your citizen vote for neighborhood capital projects',
  proposedBy: 'Proposed by',
  voted: 'Voted',
  close: 'Close',
  emergencyAdvisory: 'Civic Emergency Advisory',
  affecting: 'Affecting',
  safetyRiskLabel: 'Safety Risk',
  // My Complaints page
  myCivicComplaints: 'My Civic Complaints',
  complaintsPageSubtitle: 'Track live municipal SLA timelines, contractor progress, and resolution audit evidence.',
  reportNewIssueBtn: 'Report New Issue',
  searchPlaceholder: 'Search by ID (e.g. CP-VZ-1001), keyword, or locality...',
  noComplaintsFound: 'No complaints found',
  noComplaintsStatus: 'No complaints matching the status',
  viewTimeline: 'View Timeline',
  currentStatus: 'Current Status',
  location: 'Location',
  citizenReportDesc: 'Citizen Report Description',
  department: 'Department',
  assignedContractor: 'Assigned Contractor',
  underReviewGvmc: 'Under Review by GVMC Works Wing',
  pendingWorkOrder: 'Pending Work Order Dispatch',
  resolutionEvidence: 'Contractor Resolution Evidence & AI Audit',
  beforeRepair: 'Before Repair (Citizen)',
  afterRepair: 'After Repair (Contractor)',
  contractorNotes: 'Contractor Notes',
  aiAuditAssessment: 'Gemini Vision Audit Assessment',
  confidence: 'Confidence',
  issueNotFixed: 'Issue Not Fixed? Request Reopen',
  confirmRepair: 'Confirm Repair Completed',
  requestReopening: 'Request Complaint Reopening',
  reopenSubtitle: 'If the reported issue has not been properly resolved or has resurfaced, submit your reason. This will be escalated directly to the GVMC Executive Engineer.',
  reasonForReopening: 'Reason for Reopening',
  confirmReopen: 'Confirm Reopen',
  confirmRepairTitle: 'Confirm Repair Completion',
  rateRepair: 'Rate your satisfaction with this GVMC municipal repair',
  notNow: 'Not Now',
  confirmCloseComplaint: 'Confirm & Close Complaint',
  submitting: 'Submitting...',
  reopened: 'Reopened',
  noPhoto: 'No Photo',
  slaTarget: 'SLA Target',
  // Citizen Profile page
  citizenProfile: 'Citizen Profile',
  profileSubtitle: 'Manage your contact information, preferred language, and municipal ward settings.',
  fullName: 'Full Name',
  emailAddress: 'Email Address',
  phoneNumber: 'Phone Number',
  phoneHelp: 'Phone Number (for SMS & WhatsApp SLA alerts)',
  preferredLanguage: 'Preferred Language',
  homeWard: 'Home Ward & Locality (Visakhapatnam)',
  savePreferences: 'Save Preferences',
  savedSuccess: 'Saved successfully!',
  offlinePwaStatus: 'Offline-First PWA Status',
  networkConnection: 'Network Connection',
  onlineActive: 'Online (Active)',
  offlineQueue: 'Offline Complaint Queue',
  pendingSync: '0 pending sync',
  serviceWorker: 'Municipal Service Worker',
  activeCache: 'Active Cache',
  resetDemoData: 'Reset Demo Data',
  resetDemoDesc: 'Restore default Visakhapatnam complaint records',
  resetState: 'Reset State',
  resetConfirm: 'Reset demo state to initial Visakhapatnam complaints?',
  // Bottom Nav
  home: 'Home',
  complaints: 'Complaints',
  report: 'Report',
  profile: 'Profile',
  // Contractor Portal
  contractorHeader: 'GVMC Authorized Field Contractor',
  contractorPortalTitle: 'Contractor Dispatch & Verification Portal',
  contractorSubtitle: 'Access assigned civic repair orders, submit before/after photographic proof, and review automated AI resolution audits.',
  qualityRating: 'Quality Rating',
  repairsVerified: 'repairs verified',
  assignedWorkOrders: 'Assigned Work Orders',
  sortedBySla: 'Sorted by SLA deadline',
  allJobsCompleted: 'All assigned jobs completed!',
  newWorkOrders: 'New work orders from GVMC will appear here upon dispatch.',
  startRepair: 'Start Repair',
  uploadEvidence: 'Upload Evidence →',
  originalIssuePhoto: 'Original Issue Photo (Reported by Citizen)',
  uploadCompletionPhoto: 'Upload Completion Photograph (For Gemini AI Verification)',
  captureRepaired: 'Capture or upload repaired site photo',
  geminiCompares: 'Gemini compares before-and-after features',
  fieldRepairNotes: 'Field Repair Notes',
  runAiAudit: 'Run AI Audit & Submit',
  runningAiAuditor: 'Running AI Resolution Auditor...',
  evidenceSubmitted: 'Evidence submitted and verified by Gemini AI! Sent to GVMC for final closure.',
  change: 'Change',
  noPhotoProvided: 'No photo provided',
};

const TE: Translations = {
  headerSubtitle: 'విశాఖపట్నం (GVMC) • మెరుగైన నగరాలు. కలిసి.',
  logout: 'లాగ్ అవుట్',
  welcomeBack: 'తిరిగి స్వాగతం',
  reportNewIssue: 'కొత్త సమస్య నివేదించండి',
  myComplaints: 'నా ఫిర్యాదులు',
  totalSubmitted: 'మొత్తం సమర్పించినవి',
  resolved: 'పరిష్కరించినవి',
  pending: 'పెండింగ్‌లో',
  recentComplaints: 'ఇటీవలి ఫిర్యాదులు',
  viewAll: 'అన్నీ చూడండి',
  noComplaints: 'ఇంకా ఫిర్యాదులు దాఖలు చేయలేదు.',
  reportFirst: 'ప్రారంభించడానికి మీ మొదటి పౌర సమస్యను నివేదించండి.',
  nearbyReports: 'సమీపంలోని నివేదికలు',
  communityProposals: 'కమ్యూనిటీ ప్రతిపాదనలు',
  upvote: 'అప్‌వోట్',
  reportCivicIssue: 'సమస్యను నివేదించండి',
  reportSubtitle: 'ఫోటో, తెలుగు/ఇంగ్లీష్‌లో వాయిస్ రికార్డింగ్ లేదా టెక్స్ట్ అందించండి. Gemini AI ఫిర్యాదును వర్గీకరించి, బాధ్యత కలిగిన GVMC విభాగానికి పంపుతుంది.',
  issuePhoto: '1. సమస్య ఫోటో (సిఫార్సు చేయబడింది)',
  takePhotoOrUpload: 'కెమెరాతో ఫోటో తీయండి లేదా అప్‌లోడ్ చేయడానికి నొక్కండి',
  photoHelp: 'స్పష్టమైన ఫోటోలు AI కి గుంతలు, మట్టి లేదా చెత్త లోతును అంచనా వేయడంలో సహాయపడతాయి',
  voiceComplaint: 'తెలుగు / ఇంగ్లీష్ వాయిస్ ఫిర్యాదు',
  textDescription: '3. సమస్య వివరణ (తెలుగు లేదా ఇంగ్లీష్)',
  textPlaceholder: "మీరు చూసిన సమస్యను వివరించండి, ఉదా: 'డ్రైనేజీ పూడికతో నిండిపోయింది' లేదా 'Severe road crater causing vehicle damage'",
  aiClassification: 'Gemini AI స్వయంచాలక వర్గీకరణ',
  aiClassificationDesc: 'ఫోటో & వాయిస్ విశ్లేషించి, GVMC వర్గం, తీవ్రత స్కోర్ గుర్తించి, 50m నకిలీలు తనిఖీ చేస్తుంది.',
  analyzeReview: 'విశ్లేషించి సమీక్షించండి',
  analyzingAi: 'AI తో విశ్లేషిస్తోంది...',
  aiVerification: 'AI ధృవీకరణ & సమీక్ష',
  correctBeforeSending: 'పంపే ముందు ఏదైనా అంశాన్ని సరిచేయవచ్చు',
  generatedTitle: 'రూపొందించిన ఫిర్యాదు శీర్షిక',
  issueCategory: 'పౌర సమస్య వర్గం',
  severityLevel: 'అంచనా తీవ్రత స్థాయి',
  severityScale: '(1 = తక్కువ, 5 = అత్యవసర పరిస్థితి)',
  safetyRisk: 'తక్షణ భద్రతా ప్రమాదం',
  safetyRiskDesc: 'ఉదా: హైవోల్టేజ్ ప్రమాదం, లోతైన మూసివేయని డ్రెయిన్',
  submitComplaint: 'నిర్ధారించి ఫిర్యాదు సమర్పించండి',
  submittingGvmc: 'GVMC కి సమర్పిస్తోంది...',
  transparencyNote: 'CivicPulse AI వేగవంతమైన రూటింగ్ కోసం మల్టీమోడల్ ఇంటెలిజెన్స్ ఉపయోగిస్తుంది. ఆఫ్‌లైన్‌లో ఉంటే, రిపోర్ట్‌లు మీ పరికరంలో సురక్షితంగా నిల్వ చేయబడతాయి.',
  remove: 'తొలగించు',
  submit: 'సమర్పించు',
  cancel: 'రద్దు',
  approve: 'ఆమోదించు',
  loading: 'లోడ్ అవుతోంది...',
  success: 'విజయం',
  error: 'లోపం',
  complaintSubmitted: 'ఫిర్యాదు విజయవంతంగా సమర్పించబడింది!',
  trackingId: 'ఫిర్యాదు ట్రాకింగ్ ID',
  trackComplaints: 'నా ఫిర్యాదులలో ట్రాక్ చేయండి',
  reportAnother: 'మరొక సమస్య నివేదించండి',
  // Citizen Home - additional
  namaskaram: 'నమస్కారం',
  homeSubtitle: 'మీ పరిసరాల్లో పౌర సమస్యలను నివేదించండి. AI-ఆధారిత వర్గీకరణ మరియు స్వయంచాలక పరిష్కార ధృవీకరణ ప్రతి ఫిర్యాదు GVMC అధికారులకు చేరుతుంది.',
  reportAnIssue: 'సమస్యను నివేదించండి',
  allSubmissions: 'అన్ని సమర్పణలు',
  inProgressPending: 'ప్రగతిలో / పెండింగ్',
  activeResolution: 'చురుకైన పరిష్కారం',
  verifiedRepairs: 'ధృవీకరించిన మరమ్మతులు',
  nearbyCivicReports: 'సమీపంలోని పౌర నివేదికలు',
  nearbySubtitle: 'చుట్టుపక్కల నివేదించిన ఫిర్యాదులను చూడండి & మద్దతు ఇవ్వండి',
  communityWardPolls: 'కమ్యూనిటీ వార్డ్ పోల్స్',
  communityPollsSubtitle: 'మున్సిపల్ మెరుగుదల ప్రతిపాదనలపై ఓటు వేయండి',
  myRecentComplaints: 'నా ఇటీవలి ఫిర్యాదులు',
  trackStatus: 'స్థితి అప్‌డేట్‌లు మరియు విభాగ చర్యలను ట్రాక్ చేయండి',
  noComplaintsYet: 'ఇంకా ఫిర్యాదులు సమర్పించలేదు',
  noComplaintsDesc: 'గుంత, తెరిచిన చెత్త, లేదా పాడైన వీధి దీపం కనిపించిందా? ఫోటో లేదా వాయిస్ నోట్‌తో సెకన్లలో నివేదించండి.',
  nearbyReportsTitle: 'విజాగ్‌లో సమీప నివేదికలు',
  nearbyReportsSubtitle: 'ఫిర్యాదులకు మద్దతు ఇస్తే మున్సిపల్ ప్రాధాన్యత స్కోరు పెరుగుతుంది',
  supportPriority: 'మద్దతు (+5 ప్రాధాన్యత)',
  wardProposals: 'వార్డ్ మెరుగుదల ప్రతిపాదనలు',
  wardProposalsSubtitle: 'పరిసరాల మూలధన ప్రాజెక్ట్‌లకు మీ పౌర ఓటు వేయండి',
  proposedBy: 'ప్రతిపాదించినవారు',
  voted: 'ఓటు వేసారు',
  close: 'మూసివేయి',
  emergencyAdvisory: 'పౌర అత్యవసర సలహా',
  affecting: 'ప్రభావిత ప్రాంతం',
  safetyRiskLabel: 'భద్రతా ప్రమాదం',
  // My Complaints page
  myCivicComplaints: 'నా పౌర ఫిర్యాదులు',
  complaintsPageSubtitle: 'మున్సిపల్ SLA సమయరేఖలు, కాంట్రాక్టర్ ప్రగతి, మరియు పరిష్కార ఆడిట్ ఆధారాలను ట్రాక్ చేయండి.',
  reportNewIssueBtn: 'కొత్త సమస్య నివేదించండి',
  searchPlaceholder: 'ID (ఉదా: CP-VZ-1001), కీవర్డ్, లేదా ప్రాంతం ద్వారా వెతకండి...',
  noComplaintsFound: 'ఫిర్యాదులు కనుగొనబడలేదు',
  noComplaintsStatus: 'ఈ స్థితితో సరిపోలిన ఫిర్యాదులు లేవు',
  viewTimeline: 'టైమ్‌లైన్ చూడండి',
  currentStatus: 'ప్రస్తుత స్థితి',
  location: 'స్థానం',
  citizenReportDesc: 'పౌరుడి నివేదిక వివరణ',
  department: 'విభాగం',
  assignedContractor: 'నియమించిన కాంట్రాక్టర్',
  underReviewGvmc: 'GVMC వర్క్స్ వింగ్ ద్వారా సమీక్షలో',
  pendingWorkOrder: 'వర్క్ ఆర్డర్ పంపింపు పెండింగ్',
  resolutionEvidence: 'కాంట్రాక్టర్ పరిష్కార ఆధారాలు & AI ఆడిట్',
  beforeRepair: 'మరమ్మతుకు ముందు (పౌరుడు)',
  afterRepair: 'మరమ్మతు తర్వాత (కాంట్రాక్టర్)',
  contractorNotes: 'కాంట్రాక్టర్ నోట్స్',
  aiAuditAssessment: 'Gemini Vision ఆడిట్ అంచనా',
  confidence: 'నమ్మకం',
  issueNotFixed: 'సమస్య పరిష్కారం కాలేదా? తిరిగి తెరవమని అభ్యర్థించండి',
  confirmRepair: 'మరమ్మతు పూర్తయినట్లు నిర్ధారించండి',
  requestReopening: 'ఫిర్యాదు తిరిగి తెరవడానికి అభ్యర్థన',
  reopenSubtitle: 'నివేదించిన సమస్య సరిగ్గా పరిష్కారం కాకపోతే లేదా తిరిగి వచ్చినట్లయితే, మీ కారణం సమర్పించండి. ఇది GVMC ఎగ్జిక్యూటివ్ ఇంజనీర్‌కు నేరుగా పంపబడుతుంది.',
  reasonForReopening: 'తిరిగి తెరవడానికి కారణం',
  confirmReopen: 'తిరిగి తెరవడం నిర్ధారించండి',
  confirmRepairTitle: 'మరమ్మతు పూర్తి నిర్ధారణ',
  rateRepair: 'ఈ GVMC మున్సిపల్ మరమ్మతుపై మీ సంతృప్తిని రేట్ చేయండి',
  notNow: 'ఇప్పుడు కాదు',
  confirmCloseComplaint: 'నిర్ధారించి & ఫిర్యాదు మూసివేయి',
  submitting: 'సమర్పిస్తోంది...',
  reopened: 'తిరిగి తెరవబడింది',
  noPhoto: 'ఫోటో లేదు',
  slaTarget: 'SLA లక్ష్యం',
  // Citizen Profile page
  citizenProfile: 'పౌరుడి ప్రొఫైల్',
  profileSubtitle: 'మీ సంప్రదింపు సమాచారం, ఇష్టపడే భాష మరియు మున్సిపల్ వార్డ్ సెట్టింగ్‌లను నిర్వహించండి.',
  fullName: 'పూర్తి పేరు',
  emailAddress: 'ఇమెయిల్ చిరునామా',
  phoneNumber: 'ఫోన్ నంబర్',
  phoneHelp: 'ఫోన్ నంబర్ (SMS & WhatsApp SLA హెచ్చరికల కోసం)',
  preferredLanguage: 'ఇష్టపడే భాష',
  homeWard: 'హోమ్ వార్డ్ & ప్రాంతం (విశాఖపట్నం)',
  savePreferences: 'ఆదేశాలు సేవ్ చేయండి',
  savedSuccess: 'విజయవంతంగా సేవ్ చేయబడింది!',
  offlinePwaStatus: 'ఆఫ్‌లైన్-ఫస్ట్ PWA స్థితి',
  networkConnection: 'నెట్‌వర్క్ కనెక్షన్',
  onlineActive: 'ఆన్‌లైన్ (యాక్టివ్)',
  offlineQueue: 'ఆఫ్‌లైన్ ఫిర్యాదు క్యూ',
  pendingSync: '0 సింక్ పెండింగ్',
  serviceWorker: 'మున్సిపల్ సర్వీస్ వర్కర్',
  activeCache: 'యాక్టివ్ కాష్',
  resetDemoData: 'డెమో డేటా రీసెట్',
  resetDemoDesc: 'డిఫాల్ట్ విశాఖపట్నం ఫిర్యాదు రికార్డులను పునరుద్ధరించండి',
  resetState: 'రీసెట్ స్టేట్',
  resetConfirm: 'విశాఖపట్నం ఫిర్యాదుల ప్రారంభ డెమో స్థితికి రీసెట్ చేయాలా?',
  // Bottom Nav
  home: 'హోమ్',
  complaints: 'ఫిర్యాదులు',
  report: 'నివేదిక',
  profile: 'ప్రొఫైల్',
  // Contractor Portal
  contractorHeader: 'GVMC అధికృత ఫీల్డ్ కాంట్రాక్టర్',
  contractorPortalTitle: 'కాంట్రాక్టర్ డిస్పాచ్ & ధృవీకరణ పోర్టల్',
  contractorSubtitle: 'నియమించిన పౌర మరమ్మతు ఆర్డర్‌లను యాక్సెస్ చేయండి, ముందు/తర్వాత ఫోటో ఆధారాలు సమర్పించండి, మరియు స్వయంచాలక AI పరిష్కార ఆడిట్‌లను సమీక్షించండి.',
  qualityRating: 'నాణ్యత రేటింగ్',
  repairsVerified: 'మరమ్మతులు ధృవీకరించబడ్డాయి',
  assignedWorkOrders: 'నియమించిన వర్క్ ఆర్డర్‌లు',
  sortedBySla: 'SLA గడువు ప్రకారం క్రమబద్ధీకరించబడింది',
  allJobsCompleted: 'నియమించిన అన్ని పనులు పూర్తయ్యాయి!',
  newWorkOrders: 'GVMC నుండి కొత్త వర్క్ ఆర్డర్‌లు డిస్పాచ్ తర్వాత ఇక్కడ కనిపిస్తాయి.',
  startRepair: 'మరమ్మతు ప్రారంభించండి',
  uploadEvidence: 'ఆధారాలు అప్‌లోడ్ →',
  originalIssuePhoto: 'అసలు సమస్య ఫోటో (పౌరుడు నివేదించినది)',
  uploadCompletionPhoto: 'పూర్తి ఫోటో అప్‌లోడ్ (Gemini AI ధృవీకరణ కోసం)',
  captureRepaired: 'మరమ్మతు చేసిన ప్రదేశ ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
  geminiCompares: 'Gemini ముందు-తర్వాత ఫీచర్లను పోల్చుతుంది',
  fieldRepairNotes: 'ఫీల్డ్ మరమ్మతు నోట్స్',
  runAiAudit: 'AI ఆడిట్ & సమర్పించు',
  runningAiAuditor: 'AI రిజల్యూషన్ ఆడిటర్ నడుస్తోంది...',
  evidenceSubmitted: 'Gemini AI ద్వారా ఆధారాలు సమర్పించబడ్డాయి మరియు ధృవీకరించబడ్డాయి! తుది మూసివేత కోసం GVMC కి పంపబడింది.',
  change: 'మార్చు',
  noPhotoProvided: 'ఫోటో అందించబడలేదు',
};

interface LanguageContextType {
  language: 'en' | 'te';
  setLanguage: (lang: 'en' | 'te') => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'te'>(() => {
    const saved = localStorage.getItem('civicpulse_lang');
    return (saved === 'te' ? 'te' : 'en');
  });

  useEffect(() => {
    localStorage.setItem('civicpulse_lang', language);
  }, [language]);

  const t = language === 'te' ? TE : EN;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

