import { Link } from "@tanstack/react-router";

import { useState } from "react";
import { Home, Menu, X, BarChart3 } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="p-4 flex items-center bg-white text-gray-900 shadow-md border-b border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          <Link
            to="/"
            className="text-brand hover:text-brand-dark transition-colors"
          >
            심터 (Shimter)
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white text-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-brand/10 to-transparent">
          <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2 text-gray-700"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors mb-2",
            }}
          >
            <Home size={20} />
            <span className="font-medium">홈</span>
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2 text-gray-700"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors mb-2",
            }}
          >
            <BarChart3 size={20} />
            <span className="font-medium">대시보드</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
