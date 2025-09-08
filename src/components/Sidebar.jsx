import React from 'react';
import { Link } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', icon: 'i-uil-home-alt', label: 'Dashboards' },
  { path: '/calendar', icon: 'i-uil-calendar', label: 'Calendar' },
  { path: '/gallery', icon: 'i-uil-image', label: 'Images Gallery' },
  // Agrega más rutas aquí
];

function Sidebar() {
  return (
    <aside
      id="app-menu"
      className="w-sidenav min-w-sidenav bg-white shadow-sm overflow-y-auto hs-overlay fixed inset-y-0 start-0 z-60 hidden border-e border-default-200 -translate-x-full transform transition-all duration-200 hs-overlay-open:translate-x-0 lg:bottom-0 lg:end-auto lg:z-30 lg:block lg:translate-x-0 rtl:translate-x-full rtl:hs-overlay-open:translate-x-0 rtl:lg:translate-x-0 print:hidden [--body-scroll:true] [--overlay-backdrop:true] lg:[--overlay-backdrop:false]"
    >
      <div className="flex flex-col h-full">
        {/* Sidenav Logo */}
        <div className="sticky top-0 flex h-topbar items-center justify-start px-6">
          <Link to="/">
            <img src="assets/images/logo-dark.png" alt="logo" className="flex h-7" />
          </Link>
        </div>

        <div className="p-4 h-[calc(100%-theme('spacing.topbar'))] flex-grow" data-simplebar>
          {/* Menu */}
          <ul className="admin-menu hs-accordion-group flex w-full flex-col gap-1">
            <li className="px-3 py-2 text-xs uppercase font-medium text-default-500">Menu</li>
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item hs-accordion">
                <Link
                  to={item.path}
                  className="hs-accordion-toggle group flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm font-medium text-default-600 transition-all hover:bg-primary/5 hs-accordion-active:bg-primary/5 hs-accordion-active:text-primary"
                  aria-label={item.label}
                >
                  <i className={`${item.icon} size-5`}></i>
                  <span className="menu-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;