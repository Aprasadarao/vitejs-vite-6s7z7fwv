// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-gray-800">
            CarApp
          </span>
        </div>

        {/* Right - Nav Links */}
        <ul className="flex items-center gap-6">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-600 hover:text-green-600"
              }
            >
              Home
            </NavLink>
          </li>

         

          <li>
            <NavLink
              to="/addcarform"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-600 hover:text-green-600"
              }
            >
              Add Car Form
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/carsmanager"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-600 hover:text-green-600"
              }
            >
              Cars Manager
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
