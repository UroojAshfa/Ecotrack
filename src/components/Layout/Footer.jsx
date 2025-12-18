

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-4">EcoTrack</h4>
            <p className="text-gray-400 text-sm">
              Helping individuals and businesses track and reduce their environmental impact since 2023.
            </p>
          </div>

          {/* rest of the footer content from index.html */}
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2023 EcoTrack. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;