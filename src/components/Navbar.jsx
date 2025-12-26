import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-green-600 font-semibold"
      : "text-gray-600 hover:text-green-600";

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
        </div>

        <ul className="hidden md:flex items-center gap-6">
          <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
          <li><NavLink to="/addcarform" className={linkClass}>Add Car Form</NavLink></li>
          <li><NavLink to="/carsmanager" className={linkClass}>Cars Manager</NavLink></li>
          <li><NavLink to="/cars" className={linkClass}>All Products</NavLink></li>
          <li><NavLink to="/blog" className={linkClass}>Blog</NavLink></li>
          <li><NavLink to="/contact" className={linkClass}>Contact</NavLink></li>
        </ul>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? (
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <ul className="md:hidden bg-white border-t px-6 py-4 space-y-4">
          <li onClick={() => setOpen(false)}>
            <NavLink to="/" className={linkClass}>Home</NavLink>
          </li>
          <li onClick={() => setOpen(false)}>
            <NavLink to="/addcarform" className={linkClass}>Add Car Form</NavLink>
          </li>
          <li onClick={() => setOpen(false)}>
            <NavLink to="/carsmanager" className={linkClass}>Cars Manager</NavLink>
          </li>
          <li onClick={() => setOpen(false)}>
            <NavLink to="/cars" className={linkClass}>All Products</NavLink>
          </li>
          <li onClick={() => setOpen(false)}>
            <NavLink to="/blog" className={linkClass}>Blog</NavLink>
          </li>
          <li onClick={() => setOpen(false)}>
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          </li>
        </ul>
      )}
    </nav>
  );
}
