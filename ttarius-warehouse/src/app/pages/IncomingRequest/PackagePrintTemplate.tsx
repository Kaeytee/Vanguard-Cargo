import React from 'react';
import type { PackageInfo } from './PackageSuccessModal';

/**
 * Company details for professional printout.
 * Update this object if company info changes.
 */
const COMPANY_DETAILS = {
  name: 'Ttarius Logistics',
  address: '123 Warehouse Ave, Accra, Ghana',
  phone: '+233 24 123 4567',
  email: 'info@ttarius.com',
  website: 'www.ttarius.com',
};

/**
 * Props for the PackagePrintTemplate component.
 */
interface PackagePrintTemplateProps {
  packageInfo: PackageInfo;
}

/**
 * Professional print template for package and company details.
 * Used for printing/sharing package receipts or documents.
 */
const PackagePrintTemplate: React.FC<PackagePrintTemplateProps> = ({ packageInfo }) => (
  <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', padding: 32, color: '#222', maxWidth: 700 }}>
    {/* Company Header */}
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, color: '#b91c1c', fontWeight: 700, fontSize: 32 }}>{COMPANY_DETAILS.name}</h1>
        <div style={{ fontSize: 16, color: '#555' }}>{COMPANY_DETAILS.address}</div>
        <div style={{ fontSize: 16, color: '#555' }}>Tel: {COMPANY_DETAILS.phone} | Email: {COMPANY_DETAILS.email}</div>
        <div style={{ fontSize: 16, color: '#555' }}>{COMPANY_DETAILS.website}</div>
      </div>
      <img src={packageInfo.barcodeImage} alt="Barcode" style={{ width: 160, height: 45, objectFit: 'contain', marginLeft: 24 }} />
    </div>
    {/* Title and Divider */}
    <h2 style={{ color: '#1e293b', fontWeight: 600, fontSize: 24, marginBottom: 8 }}>Package Details</h2>
    <hr style={{ margin: '16px 0 24px 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />
    {/* Package Info */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Request ID:</div>
        <div>{packageInfo.requestId}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Package ID:</div>
        <div>{packageInfo.packageId}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Weight:</div>
        <div>{packageInfo.weight} kg</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Dimensions:</div>
        <div>{packageInfo.dimensions}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Type:</div>
        <div>{packageInfo.type}</div>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Client:</div>
        <div>{packageInfo.client}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Destination:</div>
        <div>{packageInfo.destination}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Submitted:</div>
        <div>{packageInfo.submitted}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Description:</div>
        <div>{packageInfo.description}</div>
        <div style={{ fontWeight: 600, margin: '12px 0 6px' }}>Value:</div>
        <div>GHS {packageInfo.value}</div>
      </div>
    </div>
    {/* Barcode and Status */}
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#334155' }}>Barcode:</div>
      <div style={{ marginLeft: 12, fontSize: 18, fontWeight: 700 }}>{packageInfo.barcode}</div>
      <div style={{ marginLeft: 32, fontSize: 16, color: '#16a34a', fontWeight: 600 }}>Status: Received</div>
    </div>
    {/* Tracking Info */}
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: '12px' }}>Barcode: <strong>{packageInfo.barcode}</strong></p>
      {/*
        Info note for tracking
        Shows the user how to use the barcode or URL to view package details
      */}
      <div style={{ marginTop: 12, textAlign: 'center', background: '#f0f6ff', borderRadius: 6, padding: 10, color: '#003366', fontSize: 12 }}>
        <span>
          <strong>Tip:</strong> Scan this barcode or visit <a href={`https://www.ttariuslogistics.com/app/tracl/${packageInfo.packageId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>https://www.ttariuslogistics.com/app/tracl/{packageInfo.packageId}</a> to view package details.
        </span>
      </div>
    </div>
    {/* Footer */}
    <div style={{ marginTop: 48, color: '#64748b', fontSize: 14, textAlign: 'center' }}>
      Thank you for choosing {COMPANY_DETAILS.name} for your logistics needs.
    </div>
  </div>
);

export default PackagePrintTemplate;
