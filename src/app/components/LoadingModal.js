'use client';
import { FaSpinner, FaFileUpload } from 'react-icons/fa';

export default function LoadingModal({ isOpen, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <FaFileUpload className="text-blue-600 text-5xl mb-2" />
            <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl animate-spin" />
          </div>
          <p className="text-gray-700 text-lg font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
