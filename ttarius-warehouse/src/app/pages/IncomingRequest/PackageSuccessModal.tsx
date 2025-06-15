import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import ReactDOMServer from 'react-dom/server';

export interface PackageInfo {
  requestId: string;
  weight: number;
  type: string;
  value: number;
  dimensions: string;
  client: string;
  submitted: string;
  destination: string;
  time: string;
  description: string;
  packageId: string;
  barcode: string;
  barcodeImage: string;
}

interface PackageSuccessModalProps {
  open: boolean;
  onClose: () => void;
  packageInfo: PackageInfo | null;
}

/**
 * PackagePrintTemplate
 * Renders a professional template for printing or downloading package details.
 * @component
 * @param {PackageInfo} packageInfo
 * @returns {JSX.Element}
 */
const PackagePrintTemplate: React.FC<{ packageInfo: PackageInfo }> = ({ packageInfo }) => {
  return (
    <div style={{
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      padding: '40px',
      background: '#fff',
      width: '595px', // A4 width in points at 72dpi
      minHeight: '842px', // A4 height in points
      boxSizing: 'border-box',
      color: '#333',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#003366' }}>Package Details</h1>
        <hr style={{ border: '0.5px solid #003366', width: '50%', margin: '10px auto' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ width: '45%' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginBottom: '10px' }}>Package Information</h2>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Request ID: <strong>{packageInfo.requestId}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Weight: <strong>{packageInfo.weight}kg</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Package Type: <strong>{packageInfo.type}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Value: <strong>GHS {packageInfo.value}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Dimensions: <strong>{packageInfo.dimensions}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Status: <strong>Received</strong></p>
        </div>
        <div style={{ width: '45%' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginBottom: '10px' }}>Client & Shipping</h2>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Client: <strong>{packageInfo.client}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Submitted: <strong>{packageInfo.submitted}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Destination: <strong>{packageInfo.destination}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Time: <strong>{packageInfo.time}</strong></p>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>Description: <strong>{packageInfo.description}</strong></p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginBottom: '10px' }}>Package Barcode</h2>
        <p style={{ fontSize: '12px', marginBottom: '10px' }}>Package ID: <strong>{packageInfo.packageId}</strong></p>
        <img
          src={packageInfo.barcodeImage}
          alt="Barcode"
          style={{ width: '80%', maxWidth: '450px', height: 'auto', margin: '10px auto' }}
        />
        <p style={{ fontSize: '12px' }}>Barcode: <strong>{packageInfo.barcode}</strong></p>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10px', color: '#666' }}>
        <hr style={{ border: '0.5px solid #003366', width: '50%', margin: '10px auto' }} />
        <p>Generated on {new Date().toLocaleDateString()}</p>
        <p>Powered by TTarius Logistics</p>
      </div>
    </div>
  );
};

const PackageSuccessModal: React.FC<PackageSuccessModalProps> = ({ open, onClose, packageInfo }) => {
  if (!open || !packageInfo) return null;

  const handleDownload = async () => {
    try {
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const printDiv = document.createElement('div');
      printDiv.id = 'package-print-download-root';
      printDiv.style.position = 'absolute';
      printDiv.style.left = '-9999px';
      printDiv.style.top = '0';
      printDiv.style.width = '595px';
      printDiv.style.background = '#fff';
      printDiv.style.zIndex = '0';
      document.body.appendChild(printDiv);
      let root: Root | undefined;
      try {
        root = createRoot(printDiv);
        root.render(<PackagePrintTemplate packageInfo={packageInfo} />);
        await new Promise(resolve => setTimeout(resolve, 600));
        const canvas = await html2canvas.default(printDiv, { backgroundColor: '#fff', useCORS: true });
        if (!canvas) throw new Error('Canvas generation failed');
        const imgData = canvas.toDataURL('image/png');
        if (!imgData) throw new Error('Image data generation failed');
        const pdf = new jsPDF.default({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40;
        const imgHeight = canvas.height * (imgWidth / canvas.width);
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
        pdf.save(`${packageInfo.packageId || 'package-details'}.pdf`);
      } catch (err) {
        alert('Failed to generate PDF. Please try again.');
        console.error('Download PDF error:', err);
      } finally {
        if (root) {
          root.unmount();
        }
        printDiv.remove();
      }
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
      console.error('Download PDF error:', err);
    }
  };

  const handlePrint = async () => {
    try {
      const htmlString = ReactDOMServer.renderToString(<PackagePrintTemplate packageInfo={packageInfo} />);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Print Package Details</title>');
        printWindow.document.write('<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />');
        printWindow.document.write('</head><body style="margin:0;padding:0;background:#fff;">');
        printWindow.document.write(htmlString);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => printWindow.close(), 500);
        }, 500);
      }
    } catch (err) {
      alert('Failed to open print window. Please try again.');
      console.error('Print error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-blue-900 mb-1">Package Successfully Created</h2>
        <p className="text-gray-500 text-sm mb-8">The client has been notified. You can now assign this package to a shipment.</p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <div className="font-medium mb-1">Package Information</div>
            <div className="text-sm text-gray-700 mb-1">Request ID: <span className="font-bold">{packageInfo.requestId}</span></div>
            <div className="text-sm text-gray-700 mb-1">Weight: <span className="font-bold">{packageInfo.weight}kg</span></div>
            <div className="text-sm text-gray-700 mb-1">Package Type: <span className="font-bold">{packageInfo.type}</span></div>
            <div className="text-sm text-gray-700 mb-1">Value: <span className="font-bold">GHS {packageInfo.value}</span></div>
            <div className="text-sm text-gray-700 mb-1">Dimensions: <span className="font-bold">{packageInfo.dimensions}</span></div>
            <div className="text-sm text-gray-700 mb-1">Status: <span className="inline-flex items-center px-3 py-1 rounded-full border border-blue-300 text-blue-700 bg-blue-50 text-xs font-semibold">Received</span></div>
          </div>
          <div>
            <div className="font-medium mb-1">Client & Shipping</div>
            <div className="text-sm text-gray-700 mb-1">Client: <span className="font-bold">{packageInfo.client}</span></div>
            <div className="text-sm text-gray-700 mb-1">Submitted: <span className="font-bold">{packageInfo.submitted}</span></div>
            <div className="text-sm text-gray-700 mb-1">Destination: <span className="font-bold">{packageInfo.destination}</span></div>
            <div className="text-sm text-gray-700 mb-1">Time: <span className="font-bold">{packageInfo.time}</span></div>
            <div className="text-sm text-gray-700 mb-1">Description: <span className="font-bold">{packageInfo.description}</span></div>
          </div>
        </div>
        <div className="bg-gray-50 border rounded-lg p-5 flex flex-col items-center mb-2">
          <div className="font-medium mb-1">Package ID: <span className="font-bold">{packageInfo.packageId}</span></div>
          <img src={packageInfo.barcodeImage} alt="Barcode" className="my-2 w-56 h-14 object-contain" />
          <div className="text-sm">Barcode: <span className="font-bold">{packageInfo.barcode}</span></div>
          <div className="flex gap-2 mt-4">
            <button
              className="border border-blue-900 text-blue-900 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50"
              onClick={handleDownload}
              aria-label="Download barcode"
            >
              Download
            </button>
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold shadow"
              onClick={handlePrint}
              aria-label="Print barcode"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSuccessModal;