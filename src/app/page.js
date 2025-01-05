'use client';
import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="w-screen min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">
          Mustafa Trading Company
        </h1>
        
        <div className="flex flex-col gap-4 mx-auto px-4">
          <Link 
            href="/payments"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out w-full inline-block"
          >
            Payment Collection
          </Link>
          
          <Link 
            href="/sales"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out w-full inline-block"
          >
            Sales Information
          </Link>

          <Link 
            href="/performance"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out w-full inline-block"
          >
            Sales Performance
          </Link>
        </div>
      </div>
    </main>
  );
}
