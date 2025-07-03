// Mock shipment data shared between shipment history and tracking pages
export interface MockShipmentData {
  id: string;
  date: string;
  destination: string;
  recipient: string;
  type: string;
  status: string;
  origin: string;
  weight: string;
  service: string;
  recipientDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  warehouseDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  estimatedDelivery: string;
  created: string;
}

export const MOCK_SHIPMENTS: MockShipmentData[] = [
  {
    id: "SHIP2158",
    date: "Feb 18, 2025",
    destination: "Washington, DC",
    recipient: "James Simmons",
    type: "Box",
    status: "pending",
    origin: "Ghana, Accra",
    weight: "3.2 kg",
    service: "International Express",
    recipientDetails: {
      name: "James Simmons",
      phone: "+1 (202) 555-0123",
      email: "james.simmons@email.com",
      address: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Ghana",
      phone: "+233 30 123 4567",
      email: "warehouse@ttariuslogistics.com",
      address: "15 Independence Avenue, Accra, Ghana"
    },
    estimatedDelivery: "2025-02-25",
    created: "2025-02-18"
  },
  {
    id: "SHIP2159",
    date: "Feb 17, 2025",
    destination: "Philadelphia, PA",
    recipient: "Shirely Wong",
    type: "parcel",
    status: "delivered",
    origin: "Ghana, Kumasi",
    weight: "1.8 kg",
    service: "Standard International",
    recipientDetails: {
      name: "Shirely Wong",
      phone: "+1 (215) 555-0145",
      email: "shirely.wong@email.com",
      address: "1234 Market Street, Philadelphia, PA 19107, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Kumasi",
      phone: "+233 32 456 7890",
      email: "kumasi@ttariuslogistics.com",
      address: "25 Kejetia Market Road, Kumasi, Ghana"
    },
    estimatedDelivery: "2025-02-24",
    created: "2025-02-17"
  },
  {
    id: "SHIP2160",
    date: "Feb 10, 2025",
    destination: "Dallas, TX",
    recipient: "Nicholas Anderson",
    type: "Box",
    status: "transit",
    origin: "Ghana, Tema",
    weight: "4.5 kg",
    service: "International Express",
    recipientDetails: {
      name: "Nicholas Anderson",
      phone: "+1 (214) 555-0178",
      email: "nick.anderson@email.com",
      address: "500 Commerce Street, Dallas, TX 75202, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Tema Port",
      phone: "+233 30 987 6543",
      email: "tema@ttariuslogistics.com",
      address: "Port of Tema, Community 1, Tema, Ghana"
    },
    estimatedDelivery: "2025-02-17",
    created: "2025-02-10"
  },
  {
    id: "SHIP2161",
    date: "Jan 28, 2025",
    destination: "Washington, DC",
    recipient: "Joseph Smith",
    type: "parcel",
    status: "received",
    origin: "Ghana, Accra",
    weight: "2.1 kg",
    service: "Standard International",
    recipientDetails: {
      name: "Joseph Smith",
      phone: "+1 (202) 555-0195",
      email: "joseph.smith@email.com",
      address: "2000 M Street NW, Washington, DC 20036, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Ghana",
      phone: "+233 30 123 4567",
      email: "warehouse@ttariuslogistics.com",
      address: "15 Independence Avenue, Accra, Ghana"
    },
    estimatedDelivery: "2025-02-04",
    created: "2025-01-28"
  },
  {
    id: "SHIP2162",
    date: "Jan 18, 2025",
    destination: "Las Vegas, NV",
    recipient: "Dorothy Gray",
    type: "Document",
    status: "arrived",
    origin: "Ghana, Accra",
    weight: "0.5 kg",
    service: "Document Express",
    recipientDetails: {
      name: "Dorothy Gray",
      phone: "+1 (702) 555-0234",
      email: "dorothy.gray@email.com",
      address: "3770 S Las Vegas Blvd, Las Vegas, NV 89109, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Ghana",
      phone: "+233 30 123 4567",
      email: "warehouse@ttariuslogistics.com",
      address: "15 Independence Avenue, Accra, Ghana"
    },
    estimatedDelivery: "2025-01-25",
    created: "2025-01-18"
  },
  {
    id: "SHIP2163",
    date: "Dec 28, 2024",
    destination: "Minneapolis, MN",
    recipient: "Robert King",
    type: "parcel",
    status: "received",
    origin: "Ghana, Tamale",
    weight: "2.8 kg",
    service: "International Express",
    recipientDetails: {
      name: "Robert King",
      phone: "+1 (612) 555-0267",
      email: "robert.king@email.com",
      address: "800 Nicollet Mall, Minneapolis, MN 55402, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Tamale",
      phone: "+233 37 234 5678",
      email: "tamale@ttariuslogistics.com",
      address: "Central Market Area, Tamale, Ghana"
    },
    estimatedDelivery: "2025-01-04",
    created: "2024-12-28"
  },
  {
    id: "SHIP2164",
    date: "Nov 7, 2024",
    destination: "Boston, MA",
    recipient: "Kimberly Martin",
    type: "Document",
    status: "arrived",
    origin: "Ghana, Cape Coast",
    weight: "0.3 kg",
    service: "Document Express",
    recipientDetails: {
      name: "Kimberly Martin",
      phone: "+1 (617) 555-0289",
      email: "kim.martin@email.com",
      address: "100 Federal Street, Boston, MA 02110, USA"
    },
    warehouseDetails: {
      name: "Ttarius Logistics Cape Coast",
      phone: "+233 33 345 6789",
      email: "capecoast@ttariuslogistics.com",
      address: "Victoria Park, Cape Coast, Ghana"
    },
    estimatedDelivery: "2024-11-14",
    created: "2024-11-07"
  }
];

// Function to get shipment by ID
export const getShipmentById = (id: string): MockShipmentData | null => {
  return MOCK_SHIPMENTS.find(shipment => shipment.id === id) || null;
};

// Function to get all shipments (for history page)
export const getAllShipments = (): MockShipmentData[] => {
  return MOCK_SHIPMENTS;
};
