import React from 'react';

function Topbar() {
  return (
    <div
      id="topbar"
      className="app-header min-h-topbar flex items-center sticky top-0 z-50 bg-white shadow-sm"
    >
      <div className="container flex items-center">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Sidenav Menu Toggle Button */}
            <button
              className="flex items-center text-default-500 rounded-lg cursor-pointer p-2 bg-white border border-default-200 hover:bg-primary/15 hover:text-primary hover:border-primary/5 transition-all"
              data-hs-overlay="#app-menu"
              aria-label="Toggle navigation"
            >
              <i className="i-lucide-align-left text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;