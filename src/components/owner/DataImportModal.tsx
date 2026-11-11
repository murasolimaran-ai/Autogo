/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, FileText, ArrowRight } from 'lucide-react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'bookings' | 'vehicles' | 'drivers';
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'bookings',
}) => {
  const { createBooking, addVehicle, addDriver, addToast, settings } = useApp();
  const [importType, setImportType] = useState<'bookings' | 'vehicles' | 'drivers'>(defaultType);
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sample templates for each entity type
  const sampleTemplates: Record<'bookings' | 'vehicles' | 'drivers', string> = {
    bookings: `Customer Name,Customer Phone,Pickup Location,Destination,Distance Km,Fare,Passenger Count
Anand Natarajan,9876543230,Thanipadi Bus Stand,Thandarampet Market,11.5,220,1
Meera Raghavan,9876543231,Thandarampet Market,Sathanur Dam,16.2,295,2
Siddharth V,9876543232,Thanipadi Bus Stand,Thiruvannamalai Town,28.0,490,1`,
    vehicles: `Registration Number,Model,Fuel Type,Mileage Km,Insurance Expiry,Status
TN 25 AB 5678,Bajaj Compact 4S RE,CNG,21500,2027-11-15,available
TN 25 AB 6789,Piaggio Ape City,Petrol,31000,2027-09-20,available`,
    drivers: `Full Name,Phone,License Number,Availability
Venkatesh S,9876543240,TN-25-2022-0081234,online
Murugan K,9876543241,TN-25-2021-0065432,offline`,
  };

  const handleDownloadTemplate = () => {
    const content = sampleTemplates[importType];
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autogo_${importType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Template Downloaded', `Sample ${importType} CSV template ready.`, 'info');
  };

  const handleLoadSample = () => {
    setCsvText(sampleTemplates[importType]);
    setFileName(`sample_${importType}.csv`);
    setParseError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setParseError(null);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      setParseError('Please upload a CSV file or paste valid CSV rows.');
      return;
    }

    try {
      const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setParseError('CSV must contain a header row and at least one data row.');
        return;
      }

      const rows = lines.slice(1);
      let count = 0;

      if (importType === 'bookings') {
        rows.forEach((row) => {
          const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 4) {
            const customerName = cols[0] || 'Guest Passenger';
            const customerPhone = cols[1] || '9876500000';
            const pickupLocation = cols[2] || settings.serviceAreas[0] || 'Thanipadi Bus Stand';
            const destination = cols[3] || settings.serviceAreas[1] || 'Thandarampet Market';
            const distanceKm = Number(cols[4]) || 5.0;
            const fare = Number(cols[5]) || Math.max(40, Math.round(30 + distanceKm * 15));
            const passengerCount = Number(cols[6]) || 1;

            createBooking({
              customerId: 'cust_imp_' + Math.random().toString(36).substr(2, 6),
              customerName,
              customerPhone,
              pickupLocation,
              destination,
              distanceKm,
              estimatedDurationMin: Math.round(distanceKm * 2.2),
              fare,
              passengerCount,
              pickupTime: 'Immediate',
              paymentMethod: 'cash',
            });
            count++;
          }
        });
      } else if (importType === 'vehicles') {
        rows.forEach((row) => {
          const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2) {
            const registrationNumber = cols[0];
            const model = cols[1] || 'Bajaj Compact 4S RE';
            const fuelType = (cols[2] as any) || 'CNG';
            const mileageKm = Number(cols[3]) || 25000;
            const insuranceExpiry = cols[4] || '2027-12-31';
            const status = (cols[5] as any) || 'available';

            addVehicle({
              registrationNumber,
              model,
              fuelType,
              mileageKm,
              insuranceExpiry,
              status,
              assignedDriverId: null,
              maintenanceStatus: 'good',
              location: {
                lat: 12.8285,
                lng: 80.2185,
                address: 'OMR Fleet Hub',
              },
              lastUpdate: 'Imported',
              speedKmH: 0,
            });
            count++;
          }
        });
      } else if (importType === 'drivers') {
        rows.forEach((row) => {
          const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2) {
            const fullName = cols[0];
            const phone = cols[1] || '9876500000';
            const licenseNumber = cols[2] || 'TN-21-2023-0000000';
            const availability = (cols[3] as any) || 'online';

            addDriver({
              fullName,
              phone,
              licenseNumber,
              availability,
              assignedVehicleId: null,
              status: 'active',
            });
            count++;
          }
        });
      }

      addToast(
        'Import Succeeded',
        `Successfully imported ${count} ${importType} records into the active fleet!`,
        'success'
      );
      onClose();
    } catch (err: any) {
      setParseError('Failed to parse CSV: ' + (err?.message || 'Invalid format'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border-2 border-[#171717] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center text-[#171717] font-bold">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#171717] tracking-tight">
                Import CSV Fleet Data
              </h3>
              <p className="text-xs text-neutral-500">
                Bulk upload bookings, autos, or drivers directly into AUTOGO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-[#171717] hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Entity Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            Select Data To Import
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['bookings', 'vehicles', 'drivers'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setImportType(type);
                  setCsvText('');
                  setFileName(null);
                  setParseError(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                  importType === type
                    ? 'bg-[#FFD43B] text-[#171717] border-[#171717] shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#171717]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* File Dropzone & Template Helpers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-[#171717] font-semibold underline hover:text-neutral-700 flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} />
              <span>Download {importType} CSV Template</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-neutral-600 hover:text-[#171717] font-medium bg-neutral-100 px-2 py-1 rounded-md cursor-pointer text-[11px]"
            >
              Load Sample Data
            </button>
          </div>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-neutral-300 hover:border-[#171717] rounded-2xl p-4 text-center bg-neutral-50 transition-colors">
            <input
              type="file"
              id="csvFileInput"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer block">
              <FileSpreadsheet size={28} className="mx-auto text-neutral-500 mb-1.5" />
              <div className="text-xs font-bold text-[#171717]">
                {fileName ? `Selected: ${fileName}` : 'Choose CSV File or Click to Browse'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Standard comma-separated .csv format
              </div>
            </label>
          </div>

          {/* CSV Text Input or Raw Preview */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              CSV Content (Paste or Preview)
            </label>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setParseError(null);
              }}
              placeholder={`Header row followed by data...\nCustomer Name,Customer Phone,Pickup Location,Destination...`}
              className="w-full h-24 p-3 text-xs font-mono bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] resize-none"
            />
          </div>

          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessImport}
            className="px-5 py-2.5 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Upload size={14} />
            <span>Process &amp; Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};
