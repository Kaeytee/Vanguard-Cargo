/**
 * [2025-05-26] Updated PackageForm to restrict delivery type to Air only
 * as per admin requirements. All other delivery types are disabled.
 * -- Cascade AI
 */

import React, { useEffect } from "react";
import { FaPlane } from "react-icons/fa";

// Import constants from centralized location to ensure alignment with warehouse system
import { DELIVERY_TYPES, PACKAGE_TYPES } from "../lib/constants";

// Define the structure for package category options, including color for UI
interface PackageCategoryOption {
  id: string;
  label: string;
  description: string;
  color: string; // Tailwind or hex color class
}

// Professional package categories with color and description
const PACKAGE_CATEGORIES: PackageCategoryOption[] = [
  {
    id: "fragile",
    label: "Fragile",
    description: "Items that require careful handling, such as glassware, electronics, or ceramics.",
    color: "bg-pink-100 border-pink-400 text-pink-900",
  },
  {
    id: "perishable",
    label: "Perishable",
    description: "Goods that can spoil or decay, including food, flowers, and pharmaceuticals.",
    color: "bg-green-100 border-green-400 text-green-900",
  },
  {
    id: "hazardous",
    label: "Hazardous",
    description: "Materials that are flammable, toxic, or otherwise dangerous, such as chemicals or batteries.",
    color: "bg-yellow-100 border-yellow-400 text-yellow-900",
  },
  {
    id: "oversized",
    label: "Oversized",
    description: "Large or heavy items that require special handling, like furniture or machinery.",
    color: "bg-blue-100 border-blue-400 text-blue-900",
  },
  {
    id: "standard",
    label: "Standard",
    description: "Regular packages that do not require special handling.",
    color: "bg-gray-100 border-gray-400 text-gray-900",
  },
];

// Interface for the form data in PackageForm
interface PackageFormProps {
  // Replaced 'any' with explicit types and used Record<string, string> for flexible fields
  formData: Record<string, string>;
  onInputChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

/**
 * PackageForm component for package details
 * Air delivery is the only available option and is set as default
 */
const PackageForm: React.FC<PackageFormProps> = ({
  formData,
  onInputChange,
}) => {
  // Auto-select Air delivery type if none is selected (align with warehouse system)
  useEffect(() => {
    // If freightType is not set or not 'air', set it to 'air' (only available delivery type)
    if (!formData.freightType || formData.freightType !== 'air') {
      const fakeEvent = {
        target: {
          name: 'freightType',
          value: 'air'
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onInputChange(fakeEvent);
    }
  }, [formData.freightType, onInputChange]);
  
  // Find the selected category object for display
  const selectedCategory = PACKAGE_CATEGORIES.find(
    (cat) => cat.id === formData.packageCategory
  );  return (
    <div data-testid="package-form">
      <div><div className="flex items-center mb-6">
        <h2 className="text-2xl text-[#1A2B6D] font-bold">Package Details</h2>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>            <div className="space-y-2 mb-2">
              <label htmlFor="freightType" className="font-semibold flex items-center">
                Delivery Type <span className="text-primary text-lg">*</span>
                <FaPlane className="ml-2 text-blue-500" />
              </label>
              
              {/* Delivery Type Selector - Air Only (aligned with warehouse system) */}
              <div className="relative">
                <select
                  id="freightType"
                  name="freightType"
                  value="air"
                  onChange={onInputChange}
                  className="w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-200 transition-all"
                  required
                  disabled
                >
                  {DELIVERY_TYPES.map(type => (
                    <option 
                      key={type.id} 
                      value={type.id} 
                      disabled={type.disabled}
                    >
                      {type.label} {type.primary && '(Primary)'}
                    </option>
                  ))}
                </select>
                
                {/* Overlay to indicate Air is the only option */}                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Air Only
                  </span>
                </div>
              </div>
                {/* Info text */}
              <p className="text-xs text-gray-500 mt-1">
                Currently only Air delivery is available for this route
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="packageType" className="font-semibold">
                Package Type <span className="text-primary text-lg">*</span>
              </label>              <select
                id="packageType"
                name="packageType"
                value={formData.packageType || ""}
                onChange={onInputChange}
                className="w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-200 transition-all placeholder-gray-400"
                required
              >
                {/* Package Type - Must align with warehouse system (DOCUMENT/NON_DOCUMENT only) */}
                <option value="">Select package type</option>
                {PACKAGE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                    {type.description && ` - ${type.description}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Package Category Dropdown */}
            <div className="space-y-2">
              <label htmlFor="packageCategory" className="font-semibold">
                Package Category <span className="text-primary text-lg">*</span>
              </label>              <select
                id="packageCategory"
                name="packageCategory"
                value={formData.packageCategory || ""}
                onChange={onInputChange}
                className="w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-200 transition-all placeholder-gray-400"
                required
              >
                <option value="">Select package category</option>
                {PACKAGE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Category Detail Card */}
            {selectedCategory && (
              <div
                className={`mt-3 border-l-4 p-4 rounded-lg shadow-sm ${selectedCategory.color}`}
                aria-live="polite"
                data-testid="package-category-detail"
              >
                <div className="font-semibold text-base mb-1">
                  {selectedCategory.label}
                </div>
                <div className="text-sm">
                  {selectedCategory.description}
                </div>
              </div>
            )}

          </div>
          <div className="space-y-2 row-span-2">
            <label htmlFor="packageDescription" className="font-semibold">
              Package Description <span className="text-primary text-lg">*</span>
            </label>            <textarea
              id="packageDescription"
              name="packageDescription"
              value={formData.packageDescription || ""}
              onChange={onInputChange}
              className="w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-200 transition-all placeholder-gray-400"
              placeholder="What is inside the package"
              rows={4}
              required
            /></div>
        </div>
      </div>
    </div>
  );
};

export default PackageForm;