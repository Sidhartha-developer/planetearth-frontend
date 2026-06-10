import React from 'react';

const DashboardFooter = () => {
  return (
    <footer className="lg:ml-20 bg-white border-t border-gray-200 py-4 px-6 lg:pl-69">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          © 2025 Assurth . All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-600">
          <button className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
          <button className="hover:text-indigo-600 transition-colors">Terms of Service</button>
          <button className="hover:text-indigo-600 transition-colors">Contact</button>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;