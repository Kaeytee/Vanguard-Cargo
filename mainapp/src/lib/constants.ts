 import {DUMMY_USER} from "../app/app-config";

export const DELIVERY_TYPES = [
	{ id: "air", label: "Air Freight (Primary)", primary: true, description: "International air freight - fast, reliable cross-border shipping" },
	{ id: "ground", label: "Ground (Future)", disabled: true, description: "Cross-border ground transportation (coming soon)" },
	{ id: "sea", label: "Sea Freight (Future)", disabled: true, description: "International sea freight for large shipments (coming soon)" },
	{ id: "express", label: "Express (Future)", disabled: true, description: "Premium express international service (coming soon)" }
];

// CRITICAL: Only 2 package types exist in the entire Ttarius Logistics system
export const PACKAGE_TYPES = [
	{ id: "DOCUMENT", label: "Document", description: "Legal documents, contracts, certificates, official papers" },
	{ id: "NON_DOCUMENT", label: "Non-Document", description: "Everything else - goods, products, personal items, equipment" }
];

/**
 * [2025-05-26] Updated initialFormData to support the simplified shipment request flow.
 * Added client and origin fields, removed sender fields as per admin requirements.
 * The new flow focuses only on package details and origin, not sender information.
 * -- Cascade AI
 */
export const initialFormData = {
	// Client information (person requesting the shipment)
	clientName: DUMMY_USER.fullName,
	clientEmail: DUMMY_USER.email,
	clientPhone: DUMMY_USER.phone,
	clientAddress: DUMMY_USER.address,
	clientCity: DUMMY_USER.city,
	clientState: DUMMY_USER.state,
	clientZip: DUMMY_USER.zip,
	clientCountry: DUMMY_USER.country,
	
	// Package origin information
	originCountry: "",
	originCity: "",
	originAddress: "",
	originState: "",
	originContactName: "",
	
	// Legacy fields kept for backward compatibility
	senderName: DUMMY_USER.fullName,
	senderAddress: DUMMY_USER.address,
	senderContact: DUMMY_USER.email,
	senderEmail: DUMMY_USER.email,
	phoneNumber: DUMMY_USER.phone,
	senderCity: DUMMY_USER.city,
	senderState: DUMMY_USER.state,
	senderZip: DUMMY_USER.zip,
	senderCountry: DUMMY_USER.country,
	senderLandmark: "",
	recipientName: DUMMY_USER.fullName,
	recipientAddress: DUMMY_USER.address,
	recipientContact: DUMMY_USER.email,
	recipientEmail: DUMMY_USER.email,
	recipientPhone: DUMMY_USER.phone,
	recipientCity: DUMMY_USER.city,
	recipientState: DUMMY_USER.state,
	recipientZip: DUMMY_USER.zip,
	recipientKnowsId: false,
	recipientCountry: "",
	
	// Package information
	freightType: "",
	packageType: "",
	packageCategory: "",
	packageDescription: "",
	packageNote: "", 
	packageValue: "",
	packageWeight: "",
	
	// System fields
	recipientPhoneCountryCode: "",
	recipientId: "",
};

export const initialUserData = {
	senderName: DUMMY_USER.fullName,
	senderAddress: DUMMY_USER.address,
	// senderContact represents the primary contact method (e.g., phone number)
	senderContact: DUMMY_USER.phone,
	// senderEmail represents the email address of the sender
	senderEmail: DUMMY_USER.email,
	phoneNumber: DUMMY_USER.phone,
	senderCity: DUMMY_USER.city,
	senderState: DUMMY_USER.state,
	senderZip: DUMMY_USER.zip,
	senderCountry: DUMMY_USER.country,
}

// CRITICAL BUSINESS RULE: International Logistics Only
// Origin country MUST be different from client country
export const SUPPORTED_COUNTRIES = [
	{ code: "GH", name: "Ghana", flag: "🇬🇭" },
	{ code: "US", name: "United States", flag: "🇺🇸" }
];

// Country validation logic for international requests
export const getAvailableOriginCountries = (clientCountry: string) => {
	return SUPPORTED_COUNTRIES.filter(country => country.code !== clientCountry);
};

// Validate international request
export const validateInternationalRequest = (clientCountry: string, originCountry: string) => {
	const errors = [];
	
	if (!clientCountry) {
		errors.push("Client country is required");
	}
	
	if (!originCountry) {
		errors.push("Origin country is required");
	}
	
	if (clientCountry === originCountry) {
		errors.push("Origin country must be different from your country (international logistics only)");
	}
	
	const supportedCountries = SUPPORTED_COUNTRIES.map(c => c.code);
	if (clientCountry && !supportedCountries.includes(clientCountry)) {
		errors.push("Client country not supported");
	}
	
	if (originCountry && !supportedCountries.includes(originCountry)) {
		errors.push("Origin country not supported");
	}
	
	return {
		isValid: errors.length === 0,
		errors
	};
};

// Generate tracking number (warehouse format: TT + 12 digits)
export const generateTrackingNumber = () => {
	const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
	return `TT${randomDigits}`;
};

// Package status mapping (client simplified view)
export const CLIENT_STATUS = {
	SUBMITTED: 'SUBMITTED',
	UNDER_REVIEW: 'UNDER_REVIEW', 
	PROCESSING: 'PROCESSING',
	READY_FOR_PICKUP: 'READY_FOR_PICKUP',
	COMPLETED: 'COMPLETED'
} as const;

export const STATUS_LABELS = {
	[CLIENT_STATUS.SUBMITTED]: 'Request Submitted',
	[CLIENT_STATUS.UNDER_REVIEW]: 'Under Review',
	[CLIENT_STATUS.PROCESSING]: 'Processing',
	[CLIENT_STATUS.READY_FOR_PICKUP]: 'Ready for Pickup',
	[CLIENT_STATUS.COMPLETED]: 'Completed'
};