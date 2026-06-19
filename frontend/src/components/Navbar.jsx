import React, { useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FiUpload, FiTrendingUp, FiLayers, FiLoader, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

/**
 * Premium responsive navigation header.
 * Displays brand logo, and incorporates a slide-out drawer on mobile
 * for scaling settings and excel connection options.
 */
export const Navbar = ({ datasetSize, scaleDataset, uploadExcelData, isLoading, isBackgroundLoading, backgroundStatus }) => {
  const { logout } = useAuth();
  const fileInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadExcelData(file);
      setIsOpen(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-background-dark/80 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-black font-extrabold shadow-md shadow-primary/20">
              <FiTrendingUp className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-text-lightPrimary dark:text-text-darkPrimary leading-tight">
                VoltAnalytics
              </h1>
              <p className="text-[9px] text-text-lightSecondary dark:text-text-darkSecondary font-bold tracking-wider uppercase">
                Technical Assessment
              </p>
            </div>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Active records label */}
            <div className="flex items-center gap-1.5 text-[11px] bg-zinc-100 dark:bg-zinc-900 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl px-2.5 py-1.5 text-text-lightSecondary dark:text-text-darkSecondary">
              <FiLayers className="w-3.5 h-3.5 text-primary" />
              <span>Rows: </span>
              <strong className="font-bold text-text-lightPrimary dark:text-text-darkPrimary">
                {datasetSize === 99999999 ? 'Full' : new Intl.NumberFormat().format(datasetSize)}
              </strong>
            </div>

            {/* Syncing status */}
            {backgroundStatus && (
              <div className="flex items-center gap-1.5 text-[11px] bg-zinc-100 dark:bg-zinc-900 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl px-2.5 py-1.5 text-text-lightSecondary dark:text-text-darkSecondary">
                {isBackgroundLoading ? (
                  <FiLoader className="w-3.5 h-3.5 text-secondary animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
                <span className="font-semibold text-text-lightPrimary dark:text-text-darkPrimary">{backgroundStatus}</span>
              </div>
            )}

            {/* Dataset Scale Multipliers */}
            <div className="flex items-center gap-1.5">
              <select
                id="scale-select"
                value={datasetSize}
                onChange={(e) => scaleDataset(Number(e.target.value))}
                disabled={isLoading}
                className="rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard px-3 py-2 text-xs font-semibold text-text-lightPrimary dark:text-text-darkPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50"
                title="Select dataset size to test rendering speeds"
              >
                <option value={10000}>10K (Subset)</option>
                <option value={50000}>50K (Subset)</option>
                <option value={150000}>150K (Subset)</option>
                <option value={300000}>300K (Subset)</option>
                <option value={99999999}>Full Dataset</option>
              </select>
            </div>

            {/* Custom Excel Upload trigger */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button
                onClick={triggerUpload}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-3 py-2 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
                title="Upload real business excel worksheet"
              >
                <FiUpload className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Connect Excel</span>
              </button>
            </div>

            <div className="h-6 w-[1px] bg-surface-lightBorder dark:bg-surface-darkBorder" />

            <ThemeToggle />

            <div className="h-6 w-[1px] bg-surface-lightBorder dark:bg-surface-darkBorder" />

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-secondary/20 hover:border-secondary/40 bg-white dark:bg-surface-darkCard hover:bg-secondary/5 text-xs font-bold text-secondary transition-all duration-200 cursor-pointer shadow-sm px-3 py-2"
              title="Logout from system"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Navigation controls trigger + Theme toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-text-lightPrimary dark:text-text-darkPrimary hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition cursor-pointer"
              title="Open Navigation Menu"
            >
              {isOpen ? <FiX className="w-5 h-5 text-secondary" /> : <FiMenu className="w-5 h-5 text-primary" />}
            </button>
          </div>

        </div>
      </div>

      {/* Collapsible Mobile/Tablet Drawer overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-zinc-950/70 dark:bg-zinc-950/80 backdrop-blur-sm transition-all" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed top-16 right-0 bottom-0 w-[80vw] max-w-[320px] bg-white dark:bg-zinc-950 border-l border-surface-lightBorder dark:border-surface-darkBorder p-5 flex flex-col gap-4 shadow-2xl transition-transform duration-300 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
              Control Panel
            </h3>

            {/* Active records label */}
            <div className="flex items-center gap-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-3 text-text-lightSecondary dark:text-text-darkSecondary">
              <FiLayers className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-text-lightSecondary dark:text-text-darkSecondary">Seeded Rows</p>
                <p className="font-extrabold text-text-lightPrimary dark:text-text-darkPrimary mt-0.5">
                  {datasetSize === 99999999 ? 'Full' : new Intl.NumberFormat().format(datasetSize)}
                </p>
              </div>
            </div>

            {/* Syncing status */}
            {backgroundStatus && (
              <div className="flex items-center gap-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-3 text-text-lightSecondary dark:text-text-darkSecondary">
                {isBackgroundLoading ? (
                  <FiLoader className="w-4 h-4 text-secondary animate-spin shrink-0" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                )}
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-lightSecondary dark:text-text-darkSecondary">Status</p>
                  <p className="font-bold text-text-lightPrimary dark:text-text-darkPrimary mt-0.5">{backgroundStatus}</p>
                </div>
              </div>
            )}

            {/* Dataset Scale Multipliers */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="scale-select-mobile" className="text-[10px] font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
                Active Subset
              </label>
              <select
                id="scale-select-mobile"
                value={datasetSize}
                onChange={(e) => {
                  scaleDataset(Number(e.target.value));
                  setIsOpen(false);
                }}
                disabled={isLoading}
                className="w-full rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-zinc-50 dark:bg-surface-darkCard px-3 py-2.5 text-xs font-semibold text-text-lightPrimary dark:text-text-darkPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <option value={10000}>10K (Subset)</option>
                <option value={50000}>50K (Subset)</option>
                <option value={150000}>150K (Subset)</option>
                <option value={300000}>300K (Subset)</option>
                <option value={99999999}>Full Dataset</option>
              </select>
            </div>

            {/* Connect Excel upload button & Logout button */}
            <div className="mt-auto flex flex-col gap-2.5">
              <button
                onClick={triggerUpload}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4 py-3 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary transition-all cursor-pointer disabled:opacity-50 shadow-sm min-h-[44px]"
              >
                <FiUpload className="w-4 h-4 text-primary" />
                <span>Connect Excel</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 px-4 py-3 text-xs font-bold text-secondary transition-all cursor-pointer min-h-[44px]"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
