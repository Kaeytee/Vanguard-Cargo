import React from 'react';
import { FiPackage, FiMapPin, FiCalendar, FiUser, FiTruck } from 'react-icons/fi';

/**
 * CreateShipment Component
 * 
 * This component provides a form interface for creating new shipments in the logistics system.
 * It includes form fields for shipment details, origin, destination, and scheduling.
 * 
 * @returns {React.ReactElement} The CreateShipment component
 */
const CreateShipment: React.FC = () => {
  /**
   * Handle form submission
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement form submission logic here
    console.log('Shipment creation form submitted');
  };

  /**
   * Form section component
   * 
   * @param {Object} props - Component props
   * @param {string} props.title - Section title
   * @param {React.ReactNode} props.icon - Icon component
   * @param {React.ReactNode} props.children - Section content
   * @returns {React.ReactElement} Form section component
   */
  const FormSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-md text-blue-600 mr-3">
          {icon}
        </div>
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create Shipment</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to create a new shipment
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Shipment details section */}
        <FormSection title="Shipment Details" icon={<FiPackage size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Shipment Type
              </label>
              <select
                id="shipmentType"
                name="shipmentType"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option>Standard</option>
                <option>Express</option>
                <option>Priority</option>
                <option>Economy</option>
              </select>
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions (cm)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="length"
                  placeholder="L"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="number"
                  name="width"
                  placeholder="W"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="number"
                  name="height"
                  placeholder="H"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contents" className="block text-sm font-medium text-gray-700 mb-1">
                Contents Description
              </label>
              <input
                type="text"
                id="contents"
                name="contents"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Brief description of contents"
              />
            </div>
          </div>
        </FormSection>

        {/* Origin and destination section */}
        <FormSection title="Origin & Destination" icon={<FiMapPin size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Origin</h3>
              <div>
                <label htmlFor="originAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="originAddress"
                  name="originAddress"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="originCity" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="originCity"
                    name="originCity"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="originPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="originPostalCode"
                    name="originPostalCode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Destination</h3>
              <div>
                <label htmlFor="destAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="destAddress"
                  name="destAddress"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="destCity" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="destCity"
                    name="destCity"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="destPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="destPostalCode"
                    name="destPostalCode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Schedule section */}
        <FormSection title="Schedule" icon={<FiCalendar size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </FormSection>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Shipment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
