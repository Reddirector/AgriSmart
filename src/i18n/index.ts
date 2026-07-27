// ============================================================
// AgriSmart — Internationalization (next-intl pattern)
// 12 Indian languages: en, hi, bn, te, mr, ta, gu, kn, ml, pa, or, as
// ============================================================
import type { Locale } from '@/types';

export const locales: { code: Locale; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
];

type Dict = Record<string, string>;
type Translations = Record<Locale, Dict>;

// ── Translation keys ───────────────────────────────────────
const en: Dict = {
  // Navigation
  'nav.home': 'Home', 'nav.howItWorks': 'How It Works', 'nav.farmerSolutions': 'Farmer Solutions',
  'nav.buyerSolutions': 'Buyer Solutions', 'nav.iotMonitoring': 'IoT Monitoring', 'nav.securePayments': 'Secure Payments',
  'nav.identityVerification': 'Identity Verification', 'nav.trustValidation': 'Trust & Data Validation',
  'nav.languages': 'Supported Languages', 'nav.pricing': 'Pricing', 'nav.about': 'About', 'nav.contact': 'Contact',
  'nav.privacy': 'Privacy Policy', 'nav.terms': 'Terms of Service', 'nav.login': 'Login', 'nav.register': 'Register',
  'nav.dashboard': 'Dashboard', 'nav.marketplace': 'Marketplace', 'nav.iot': 'IoT Dashboard', 'nav.cropHealth': 'Crop Health Scanner', 'nav.drones': 'Drone Operations', 'nav.agreements': 'Agreements',
  'nav.payments': 'Payments', 'nav.offers': 'Offers', 'nav.alerts': 'Alerts', 'nav.verification': 'Verification',
  'nav.farms': 'Farms', 'nav.crops': 'Crops', 'nav.inspections': 'Inspections', 'nav.disputes': 'Disputes',
  'nav.users': 'Users', 'nav.systemHealth': 'System Health', 'nav.auditLogs': 'Audit Logs', 'nav.settings': 'Settings',
  'nav.notifications': 'Notifications', 'nav.profile': 'Profile', 'nav.logout': 'Logout',

  // Hero
  'hero.headline': 'Verified farms. Secure agreements. Reliable payments.',
  'hero.subhead': 'AgriSmart connects farmers, buyers, verified agricultural data, and enforceable trade agreements through one accessible platform.',
  'hero.ctaPrimary': 'Register as a Farmer', 'hero.ctaSecondary': 'Explore the Platform',

  // Common
  'common.loading': 'Loading…', 'common.error': 'Something went wrong', 'common.retry': 'Retry',
  'common.save': 'Save', 'common.cancel': 'Cancel', 'common.submit': 'Submit', 'common.next': 'Next',
  'common.back': 'Back', 'common.finish': 'Finish', 'common.search': 'Search', 'common.filter': 'Filter',
  'common.all': 'All', 'common.viewAll': 'View all', 'common.viewDetails': 'View details',
  'common.verified': 'Verified', 'common.pending': 'Pending', 'common.unverified': 'Unverified',
  'common.rejected': 'Rejected', 'common.active': 'Active', 'common.completed': 'Completed',
  'common.cancelled': 'Cancelled', 'common.disputed': 'Disputed', 'common.draft': 'Draft',
  'common.sandbox': 'Sandbox', 'common.demoMode': 'Demo Mode', 'common.online': 'Online',
  'common.offline': 'Offline', 'common.degraded': 'Degraded', 'common.yes': 'Yes', 'common.no': 'No',
  'common.export': 'Export', 'common.download': 'Download', 'common.close': 'Close',
  'common.confirm': 'Confirm', 'common.delete': 'Delete', 'common.edit': 'Edit', 'common.add': 'Add',
  'common.today': 'Today', 'common.yesterday': 'Yesterday', 'common.thisWeek': 'This Week',
  'common.thisMonth': 'This Month', 'common.noData': 'No data available', 'common.optional': 'Optional',

  // Dashboard labels
  'dash.greeting': 'Welcome back', 'dash.farmHealth': 'Farm Health Score', 'dash.soilMoisture': 'Soil Moisture',
  'dash.temperature': 'Temperature', 'dash.humidity': 'Humidity', 'dash.rainfall': 'Rainfall',
  'dash.irrigation': 'Irrigation Status', 'dash.waterLevel': 'Water Level', 'dash.sensorHealth': 'Sensor Health',
  'dash.weatherForecast': 'Weather Forecast', 'dash.activeAlerts': 'Active Alerts', 'dash.buyerOffers': 'Buyer Offers',
  'dash.activeContracts': 'Active Contracts', 'dash.pendingDeliveries': 'Pending Deliveries',
  'dash.pendingPayments': 'Pending Payments', 'dash.completedPayments': 'Completed Payments',
  'dash.kccStatus': 'KCC Verification', 'dash.farmDocuments': 'Farm Documents', 'dash.recentActivity': 'Recent Activity',
  'dash.recommendedActions': 'Recommended Actions', 'dash.trustScore': 'Farm Data Reliability',
  'dash.cropCycle': 'Current Crop Cycle', 'dash.verificationStatus': 'Verification Status',

  // Quick actions
  'action.addCrop': 'Add Crop', 'action.addFarm': 'Add Farm', 'action.connectSensor': 'Connect Sensor',
  'action.createListing': 'Create Sale Listing', 'action.reviewOffer': 'Review Buyer Offer',
  'action.createAgreement': 'Create Agreement', 'action.uploadDocument': 'Upload Document',
  'action.requestVerification': 'Request Field Verification', 'action.reportProblem': 'Report a Problem',

  // Auth
  'auth.login': 'Login to AgriSmart', 'auth.phoneLogin': 'Login with Phone', 'auth.emailLogin': 'Login with Email',
  'auth.otp': 'Enter OTP', 'auth.password': 'Password', 'auth.sendOtp': 'Send OTP', 'auth.verifyOtp': 'Verify OTP',
  'auth.phone': 'Phone Number', 'auth.email': 'Email Address', 'auth.selectRole': 'Select Your Role',
  'auth.farmer': 'Farmer', 'auth.buyer': 'Buyer', 'auth.verifier': 'Field Verifier', 'auth.admin': 'Administrator',
  'auth.noAccount': "Don't have an account?", 'auth.createAccount': 'Create Account',
  'auth.forgotPassword': 'Forgot Password?', 'auth.rememberDevice': 'Remember this device',
  'auth.demoAccounts': 'Demo Accounts (Sandbox)', 'auth.loginAs': 'Login as',

  // Onboarding
  'onboarding.title': 'Farmer Onboarding', 'onboarding.step': 'Step', 'onboarding.of': 'of',
  'onboarding.selectLanguage': 'Select Preferred Language', 'onboarding.enterPhone': 'Enter Phone Number',
  'onboarding.verifyOtp': 'Verify OTP', 'onboarding.personalDetails': 'Personal Details',
  'onboarding.selectState': 'Select State and District', 'onboarding.farmLocation': 'Add Farm Location',
  'onboarding.landDetails': 'Add Land Details', 'onboarding.cropDetails': 'Add Crop Details',
  'onboarding.bankDetails': 'Add Bank or Payment Details', 'onboarding.identityVerification': 'Complete Identity Verification',
  'onboarding.kccVerification': 'Complete KCC Status Verification', 'onboarding.connectIot': 'Connect IoT Device or Select Demo Mode',
  'onboarding.review': 'Review Information', 'onboarding.submit': 'Submit Profile',
  'onboarding.saveContinue': 'Save and Continue Later', 'onboarding.progressSaved': 'Progress saved automatically',

  // IoT
  'iot.realtime': 'Real-time', 'iot.historical': 'Historical', 'iot.sensorTypes': 'Sensor Types',
  'iot.deviceStatus': 'Device Status', 'iot.lastSeen': 'Last Seen', 'iot.confidenceScore': 'Confidence Score',
  'iot.validationStatus': 'Validation Status', 'iot.thresholds': 'Threshold Configuration',
  'iot.alertRules': 'Alert Rules', 'iot.calibration': 'Calibration', 'iot.exportCsv': 'Export to CSV',
  'iot.farmMap': 'Farm Map', 'iot.irrigationControl': 'Irrigation Controls (Simulation)',
  'iot.deviceRegistration': 'Register Device', 'iot.simulator': 'IoT Simulator',

  // Marketplace
  'market.title': 'Agricultural Marketplace', 'market.searchPlaceholder': 'Search crops, farmers, locations…',
  'market.filterCrop': 'Crop', 'market.filterState': 'State', 'market.filterGrade': 'Quality Grade',
  'market.filterPrice': 'Price Range', 'market.filterVerified': 'Verified Only',
  'market.listingQuantity': 'Quantity', 'market.listingMinPrice': 'Minimum Price',
  'market.listingHarvest': 'Expected Harvest', 'market.listingGrade': 'Quality Grade',
  'market.makeOffer': 'Make Offer', 'market.saveListing': 'Save Listing', 'market.createListing': 'Create Listing',
  'market.sensorSupported': 'Sensor-Supported Data', 'market.noResults': 'No listings found matching your filters.',

  // Agreement
  'agreement.builder': 'Agreement Builder', 'agreement.farmer': 'Farmer', 'agreement.buyer': 'Buyer',
  'agreement.crop': 'Crop', 'agreement.variety': 'Variety', 'agreement.quantity': 'Quantity',
  'agreement.unit': 'Unit', 'agreement.pricePerUnit': 'Price per Unit', 'agreement.totalValue': 'Total Value',
  'agreement.qualityConditions': 'Quality Conditions', 'agreement.deliveryLocation': 'Delivery Location',
  'agreement.deliveryDate': 'Delivery Date', 'agreement.inspectionProcess': 'Inspection Process',
  'agreement.dataRequirements': 'Data Requirements', 'agreement.paymentSchedule': 'Payment Schedule',
  'agreement.advancePayment': 'Advance Payment (%)', 'agreement.escrowRequirement': 'Escrow Requirement',
  'agreement.cancellationTerms': 'Cancellation Terms', 'agreement.penaltyTerms': 'Penalty Terms',
  'agreement.disputeProcess': 'Dispute Process', 'agreement.requiredVerifier': 'Required Verifier',
  'agreement.expiration': 'Agreement Expiration', 'agreement.timeline': 'Agreement Lifecycle',
  'agreement.createDraft': 'Create Draft', 'agreement.sendForReview': 'Send for Review',
  'agreement.blockchainHash': 'Agreement Hash (On-Chain)', 'agreement.txHash': 'Transaction Hash',
  'agreement.milestones': 'Milestones', 'agreement.state': 'Current State',

  // Verification
  'verify.title': 'Identity Verification', 'verify.aadhaar': 'Aadhaar Verification (Sandbox)',
  'verify.kcc': 'Kisan Credit Card Verification (Sandbox)', 'verify.farmOwnership': 'Farm Ownership Verification',
  'verify.businessRegistration': 'Business Registration', 'verify.bankAccount': 'Bank Account Verification',
  'verify.verifierApproval': 'Field Verifier Approval', 'verify.consent': 'I consent to identity verification',
  'verify.sandboxNotice': 'This is sandbox simulation data. Not connected to UIDAI, banks, or government systems.',
  'verify.masked': 'Masked for privacy', 'verify.tokenOnly': 'Only verification tokens are stored.',

  // Trust
  'trust.title': 'Data Trust & Oracle-Risk Mitigation', 'trust.score': 'Farm Data Reliability Score',
  'trust.deviceIdentity': 'Device Identity', 'trust.signedMessages': 'Signed Sensor Messages',
  'trust.certificates': 'Device Certificates', 'trust.timestamp': 'Timestamp Validation',
  'trust.duplicateDetection': 'Duplicate Detection', 'trust.calibrationRecords': 'Calibration Records',
  'trust.tamperAlerts': 'Tamper Alerts', 'trust.multiSensor': 'Multi-Sensor Comparison',
  'trust.weatherComparison': 'Weather Data Comparison', 'trust.satelliteIntegration': 'Satellite Data Integration',
  'trust.verifierAttestation': 'Field Verifier Attestations', 'trust.farmerEvidence': 'Farmer-Submitted Evidence',
  'trust.buyerEvidence': 'Buyer Inspection Evidence', 'trust.anomalyDetection': 'Anomaly Detection',
  'trust.confidenceScoring': 'Data Confidence Scoring', 'trust.disputeResolution': 'Dispute Resolution',
  'trust.releaseRule': 'Payment Release Rules',

  // Footer
  'footer.product': 'Product', 'footer.company': 'Company', 'footer.legal': 'Legal',
  'footer.resources': 'Resources', 'footer.rights': 'All rights reserved.', 'footer.sandboxDisclaimer': 'Sandbox demo — not a live financial or government service.',

  // Accessibility
  'a11y.languageSelect': 'Select language', 'a11y.toggleMenu': 'Toggle menu', 'a11y.toggleTheme': 'Toggle accessibility mode',
  'a11y.closeDialog': 'Close dialog', 'a11y.nextSlide': 'Next', 'a11y.prevSlide': 'Previous',
  'a11y.lowBandwidth': 'Low bandwidth mode', 'a11y.reducedMotion': 'Reduced motion',
  'a11y.highContrast': 'High contrast', 'a11y.largeText': 'Large text',
};

// ── Hindi translations (subset for core UI) ────────────────
const hi: Dict = {
  'nav.home': 'होम', 'nav.howItWorks': 'कैसे काम करता है', 'nav.farmerSolutions': 'किसान समाधान',
  'nav.buyerSolutions': 'खरीदार समाधान', 'nav.iotMonitoring': 'IoT निगरानी', 'nav.securePayments': 'सुरक्षित भुगतान',
  'nav.identityVerification': 'पहचान सत्यापन', 'nav.trustValidation': 'ट्रस्ट और डेटा सत्यापन',
  'nav.languages': 'समर्थित भाषाएँ', 'nav.pricing': 'मूल्य निर्धारण', 'nav.about': 'हमारे बारे में', 'nav.contact': 'संपर्क',
  'nav.privacy': 'गोपनीयता नीति', 'nav.terms': 'सेवा की शर्तें', 'nav.login': 'लॉगिन', 'nav.register': 'रजिस्टर करें',
  'nav.dashboard': 'डैशबोर्ड', 'nav.marketplace': 'बाज़ार', 'nav.iot': 'IoT डैशबोर्ड', 'nav.drones': 'ड्रोन संचालन', 'nav.agreements': 'अनुबंध',
  'nav.payments': 'भुगतान', 'nav.offers': 'ऑफर', 'nav.alerts': 'अलर्ट', 'nav.verification': 'सत्यापन',
  'nav.farms': 'खेत', 'nav.crops': 'फसलें', 'nav.inspections': 'निरीक्षण', 'nav.disputes': 'विवाद',
  'nav.users': 'उपयोगकर्ता', 'nav.systemHealth': 'सिस्टम स्थिति', 'nav.auditLogs': 'ऑडिट लॉग', 'nav.settings': 'सेटिंग्स',
  'nav.notifications': 'सूचनाएँ', 'nav.profile': 'प्रोफ़ाइल', 'nav.logout': 'लॉगआउट',
  'hero.headline': 'सत्यापित खेत। सुरक्षित अनुबंध। विश्वसनीय भुगतान।',
  'hero.subhead': 'किसानट्रस्ट किसानों, खरीदारों, सत्यापित कृषि डेटा और लागू करने योग्य व्यापार अनुबंधों को एक ही सुलभ प्लेटफ़ॉर्म से जोड़ता है।',
  'hero.ctaPrimary': 'किसान के रूप में रजिस्टर करें', 'hero.ctaSecondary': 'प्लेटफ़ॉर्म देखें',
  'common.loading': 'लोड हो रहा है…', 'common.error': 'कुछ गलत हुआ', 'common.retry': 'पुनः प्रयास करें',
  'common.save': 'सहेजें', 'common.cancel': 'रद्द करें', 'common.submit': 'जमा करें', 'common.next': 'अगला',
  'common.back': 'वापस', 'common.finish': 'पूरा करें', 'common.search': 'खोजें', 'common.filter': 'फ़िल्टर',
  'common.all': 'सभी', 'common.viewAll': 'सभी देखें', 'common.viewDetails': 'विवरण देखें',
  'common.verified': 'सत्यापित', 'common.pending': 'लंबित', 'common.unverified': 'असत्यापित',
  'common.rejected': 'अस्वीकृत', 'common.active': 'सक्रिय', 'common.completed': 'पूर्ण', 'common.cancelled': 'रद्द',
  'common.disputed': 'विवादित', 'common.draft': 'ड्राफ्ट', 'common.sandbox': 'सैंडबॉक्स', 'common.demoMode': 'डेमो मोड',
  'common.online': 'ऑनलाइन', 'common.offline': 'ऑफ़लाइन', 'common.degraded': 'क्षीण', 'common.export': 'निर्यात',
  'common.download': 'डाउनलोड', 'common.close': 'बंद करें', 'common.confirm': 'पुष्टि करें', 'common.edit': 'संपादित करें',
  'common.add': 'जोड़ें', 'common.today': 'आज', 'common.noData': 'कोई डेटा उपलब्ध नहीं', 'common.optional': 'वैकल्पिक',
  'dash.greeting': 'वापसी पर स्वागत है', 'dash.farmHealth': 'खेत स्वास्थ्य स्कोर', 'dash.soilMoisture': 'मिट्टी की नमी',
  'dash.temperature': 'तापमान', 'dash.humidity': 'आर्द्रता', 'dash.rainfall': 'वर्षा',
  'dash.irrigation': 'सिंचाई स्थिति', 'dash.waterLevel': 'जल स्तर', 'dash.sensorHealth': 'सेंसर स्वास्थ्य',
  'dash.weatherForecast': 'मौसम पूर्वानुमान', 'dash.activeAlerts': 'सक्रिय अलर्ट', 'dash.buyerOffers': 'खरीदार ऑफर',
  'dash.activeContracts': 'सक्रिय अनुबंध', 'dash.pendingDeliveries': 'लंबित डिलीवरी', 'dash.pendingPayments': 'लंबित भुगतान',
  'dash.completedPayments': 'पूर्ण भुगतान', 'dash.kccStatus': 'KCC सत्यापन', 'dash.trustScore': 'फार्म डेटा विश्वसनीयता',
  'dash.cropCycle': 'वर्तमान फसल चक्र', 'dash.verificationStatus': 'सत्यापन स्थिति',
  'auth.login': 'किसानट्रस्ट में लॉगिन करें', 'auth.phoneLogin': 'फ़ोन से लॉगिन', 'auth.emailLogin': 'ईमेल से लॉगिन',
  'auth.otp': 'OTP दर्ज करें', 'auth.password': 'पासवर्ड', 'auth.sendOtp': 'OTP भेजें', 'auth.verifyOtp': 'OTP सत्यापित करें',
  'auth.phone': 'फ़ोन नंबर', 'auth.email': 'ईमेल पता', 'auth.selectRole': 'अपनी भूमिका चुनें',
  'auth.farmer': 'किसान', 'auth.buyer': 'खरीदार', 'auth.verifier': 'क्षेत्र सत्यापक', 'auth.admin': 'व्यवस्थापक',
  'auth.demoAccounts': 'डेमो खाते (सैंडबॉक्स)', 'auth.loginAs': 'इस रूप में लॉगिन करें',
  'footer.sandboxDisclaimer': 'सैंडबॉक्स डेमो — यह वास्तविक वित्तीय या सरकारी सेवा नहीं है।',
  'a11y.languageSelect': 'भाषा चुनें', 'a11y.lowBandwidth': 'कम बैंडविड्थ मोड', 'a11y.reducedMotion': 'कम गति',
  'a11y.highContrast': 'उच्च कंट्रास्ट', 'a11y.largeText': 'बड़ा टेक्स्ट',
  'market.title': 'कृषि बाज़ार', 'market.searchPlaceholder': 'फसल, किसान, स्थान खोजें…',
  'agreement.builder': 'अनुबंध निर्माता', 'agreement.timeline': 'अनुबंध जीवनचक्र',
  'iot.realtime': 'वास्तविक समय', 'iot.historical': 'ऐतिहासिक', 'iot.farmMap': 'खेत का नक्शा',
  'trust.title': 'डेटा ट्रस्ट और ओरेकल-जोखिम शमन', 'trust.score': 'खेत डेटा ट्रस्ट स्कोर',
  'verify.title': 'पहचान सत्यापन', 'verify.sandboxNotice': 'यह सैंडबॉक्स सिमुलेशन डेटा है। UIDAI, बैंकों या सरकारी प्रणालियों से जुड़ा नहीं है।',
};

// ── Other languages fall back to English for keys not yet translated ─
const bn: Dict = { ...en, 'hero.headline': 'যাচাইকৃত খামার। নিরাপদ চুক্তি। নির্ভরযোগ্য অর্থপ্রদান।', 'nav.home': 'হোম', 'nav.login': 'লগইন', 'nav.dashboard': 'ড্যাশবোর্ড', 'auth.farmer': 'কৃষক', 'auth.buyer': 'ক্রেতা', 'dash.greeting': 'ফিরে আসায় স্বাগতম', 'dash.farmHealth': 'খামার স্বাস্থ্য স্কোর' };
const te: Dict = { ...en, 'hero.headline': 'ధృవీకరించబడిన పొలాలు. సురక్షిత ఒప్పందాలు. నమ్మకమైన చెల్లింపులు.', 'nav.home': 'హోమ్', 'nav.login': 'లాగిన్', 'nav.dashboard': 'డాష్‌బోర్డ్', 'auth.farmer': 'రైతు', 'auth.buyer': 'కొనుగోలుదారు', 'dash.greeting': 'తిరిగి స్వాగతం', 'dash.farmHealth': 'పొల ఆరోగ్య స్కోర్' };
const mr: Dict = { ...en, 'hero.headline': 'पडताळमूलक शेती. सुरक्षित करार. विश्वासार्ह पेमेंट.', 'nav.home': 'होम', 'nav.login': 'लॉगिन', 'nav.dashboard': 'डॅशबोर्ड', 'auth.farmer': 'शेतकरी', 'auth.buyer': 'खरेदीदार', 'dash.greeting': 'परत स्वागत आहे', 'dash.farmHealth': 'शेत आरोग्य गुण' };
const ta: Dict = { ...en, 'hero.headline': 'சரிபார்க்கப்பட்ட பண்ணைகள். பாதுகாப்பான ஒப்பந்தங்கள். நம்பகமான கட்டணங்கள்.', 'nav.home': 'முகப்பு', 'nav.login': 'உள்நுழை', 'nav.dashboard': 'டாஷ்போர்டு', 'auth.farmer': 'விவசாயி', 'auth.buyer': 'வாங்குபவர்', 'dash.greeting': 'மீண்டும் வரவேற்கிறோம்', 'dash.farmHealth': 'பண்ணை ஆரோக்கிய மதிப்பெண்' };
const gu: Dict = { ...en, 'hero.headline': 'ચકાસાયેલ ખેતરો. સુરક્ષિત કરારો. વિશ્વસનીય ચુકવણી.', 'nav.home': 'હોમ', 'nav.login': 'લોગિન', 'nav.dashboard': 'ડેશબોર્ડ', 'auth.farmer': 'ખેડૂત', 'auth.buyer': 'ખરીદનાર', 'dash.greeting': 'પાછા સ્વાગત છે', 'dash.farmHealth': 'ખેતર આરોગ્ય સ્કોર' };
const kn: Dict = { ...en, 'hero.headline': 'ಪರಿಶೀಲಿಸಲಾದ ಫಾರ್ಮ್‌ಗಳು. ಸುರಕ್ಷಿತ ಒಪ್ಪಂದಗಳು. ವಿಶ್ವಾಸಾರ್ಹ ಪಾವತಿಗಳು.', 'nav.home': 'ಮುಖಪುಟ', 'nav.login': 'ಲಾಗಿನ್', 'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'auth.farmer': 'ರೈತ', 'auth.buyer': 'ಖರೀದಿದಾರ', 'dash.greeting': 'ಮರಳಿ ಸ್ವಾಗತ', 'dash.farmHealth': 'ಫಾರ್ಮ್ ಆರೋಗ್ಯ ಅಂಕ' };
const ml: Dict = { ...en, 'hero.headline': 'പരിശോധിക്കപ്പെട്ട ഫാമുകൾ. സുരക്ഷിത കരാറുകൾ. വിശ്വസനീയമായ പേയ്മെന്റുകൾ.', 'nav.home': 'ഹോം', 'nav.login': 'ലോഗിൻ', 'nav.dashboard': 'ഡാഷ്‌ബോർഡ്', 'auth.farmer': 'കർഷകൻ', 'auth.buyer': 'വാങ്ങുന്നയാൾ', 'dash.greeting': 'തിരികെ സ്വാഗതം', 'dash.farmHealth': 'ഫാം ആരോഗ്യ സ്കോർ' };
const pa: Dict = { ...en, 'hero.headline': 'ਜਾਂਚੀਆਂ ਖੇਤਰੀ। ਸੁਰੱਖਿਅਤ ਸਮਝੌਤੇ। ਭਰੋਸੇਯੋਗ ਭੁਗਤਾਨ।', 'nav.home': 'ਹੋਮ', 'nav.login': 'ਲਾਗਇਨ', 'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ', 'auth.farmer': 'ਕਿਸਾਨ', 'auth.buyer': 'ਖਰੀਦਦਾਰ', 'dash.greeting': 'ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ', 'dash.farmHealth': 'ਖੇਤ ਸਿਹਤ ਸਕੋਰ' };
const or: Dict = { ...en, 'hero.headline': 'ଯାଞ୍ଚିତ ଖଣ୍ଡ। ସୁରକ୍ଷିତ ଚୁକ୍ତି। ବିଶ୍ୱସ୍ତ ପ୍ରଦାନ।', 'nav.home': 'ହୋମ୍', 'nav.login': 'ଲଗଇନ୍', 'nav.dashboard': 'ଡ୍ୟାସବୋର୍ଡ', 'auth.farmer': 'କିସାନ', 'auth.buyer': 'କ୍ରେତା', 'dash.greeting': 'ଫେରି ସ୍ୱାଗତ', 'dash.farmHealth': 'ଖଣ୍ଡ ସ୍ୱାସ୍ଥ୍ୟ ସ୍କୋର୍' };
const as: Dict = { ...en, 'hero.headline': 'প্ৰমাণিত খেত। সুৰক্ষিত চুক্তি। বিশ্বাসযোগ্য পৰিশোধ।', 'nav.home': 'ঘৰ', 'nav.login': 'লগইন', 'nav.dashboard': 'ডেশবোৰ্ড', 'auth.farmer': 'কৃষক', 'auth.buyer': 'ক্ৰেতা', 'dash.greeting': 'উভতি আহিছাৰ স্বাগতম', 'dash.farmHealth': 'খেত স্বাস্থ্য স্কোৰ' };

export const translations: Translations = { en, hi, bn, te, mr, ta, gu, kn, ml, pa, or, as };

export function translate(key: string, locale: Locale = 'en', params?: Record<string, string | number>): string {
  const dict = translations[locale] || translations.en;
  let str = dict[key] || translations.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => { str = str.replace(`{${k}}`, String(v)); });
  }
  return str;
}

const intlLocaleMap: Record<Locale, string> = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', ta: 'ta-IN',
  gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN',
};

export function formatDate(date: string | Date, locale: Locale = 'en'): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable';
  return parsed.toLocaleDateString(intlLocaleMap[locale], { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatCurrency(amount: number, locale: Locale = 'en'): string {
  if (!Number.isFinite(amount)) return '₹0';
  return new Intl.NumberFormat(intlLocaleMap[locale], { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}

export function formatNumber(n: number, locale: Locale = 'en'): string {
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat(intlLocaleMap[locale]).format(n);
}
