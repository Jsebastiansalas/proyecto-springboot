import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './context/AppContext';
import { rentaService } from './services/rentaService';
import { Tool, Category } from './types';

// Layout & Common
import { TopUtilityBar } from './components/layout/TopUtilityBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { ComparatorDock } from './components/common/ComparatorDock';

// Home
import { HomePage } from './components/home/HomePage';

// Catalog
import { CategoryFilterPills } from './components/catalog/CategoryFilterPills';
import { FilterSidebar } from './components/catalog/FilterSidebar';
import { ToolCard } from './components/catalog/ToolCard';
import { ToolDetailModal } from './components/catalog/ToolDetailModal';

// Portals
import { QuoteCartDrawer } from './components/quote/QuoteCartDrawer';
import { ClientPortal } from './components/client/ClientPortal';
import { ProviderPortal } from './components/provider/ProviderPortal';
import { AdminPortal } from './components/admin/AdminPortal';

// Auth
import { AuthModal } from './components/auth/AuthModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';

import { 
  Wrench, 
  Search, 
  ArrowUpDown, 
  SlidersHorizontal,
  XCircle,
  HardHat,
  Cpu
} from 'lucide-react';

export const App: React.FC = () => {
  const { activeView } = useApp();

  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(1500000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name'>('default');

  // Load tools and categories from API
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [toolsData, categoriesData] = await Promise.all([
          rentaService.tools.getAll(),
          rentaService.tools.getCategories()
        ]);
        setTools(toolsData);
        setCategories(categoriesData);

        // Ajustar límite de precio al máximo encontrado
        if (toolsData.length > 0) {
          const maxP = Math.max(...toolsData.map(t => t.baseDailyPrice));
          setPriceLimit(maxP);
        }
      } catch (err) {
        console.error('Error al cargar catálogo:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // Fabricantes únicos
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    tools.forEach(t => {
      if (t.brand) set.add(t.brand);
    });
    return Array.from(set).sort();
  }, [tools]);

  const maxCatalogPrice = useMemo(() => {
    if (tools.length === 0) return 1500000;
    return Math.max(...tools.map(t => t.baseDailyPrice));
  }, [tools]);

  const handleToggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSelectedBrands([]);
    setPriceLimit(maxCatalogPrice);
    setOnlyAvailable(false);
    setSortBy('default');
  };

  // Filtrado y ordenamiento de maquinaria
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Categoría
      if (selectedCategoryId !== null && tool.categoryId !== selectedCategoryId) {
        return false;
      }
      // Búsqueda por texto (nombre, modelo, sku, fabricante)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match = 
          tool.name.toLowerCase().includes(q) ||
          tool.brand.toLowerCase().includes(q) ||
          tool.model.toLowerCase().includes(q) ||
          tool.codeSku.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Marcas
      if (selectedBrands.length > 0 && !selectedBrands.includes(tool.brand)) {
        return false;
      }
      // Tarifa Diaria
      if (tool.baseDailyPrice > priceLimit) {
        return false;
      }
      // Solo disponibles
      if (onlyAvailable && tool.status !== 'DISPONIBLE') {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.baseDailyPrice - b.baseDailyPrice;
      if (sortBy === 'price_desc') return b.baseDailyPrice - a.baseDailyPrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [tools, selectedCategoryId, searchQuery, selectedBrands, priceLimit, onlyAvailable, sortBy]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Utility Announcement Bar */}
      <TopUtilityBar />

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* 1. APARTADO INICIO */}
        {activeView === 'home' && (
          <HomePage featuredTools={tools} />
        )}

        {/* 2. APARTADO CATÁLOGO (LIMPIO Y DESATURADO) */}
        {activeView === 'catalog' && (
          <div className="space-y-8 pb-16 animate-in fade-in duration-200">
            {/* Encabezado Técnico de Catálogo Espacioso y Limpio */}
            <div className="border-b border-slate-800/60 bg-gradient-to-b from-[#0e1629] via-[#090d16] to-[#090d16] py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold mb-2">
                      <HardHat className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Patio Norte Bogotá · Flota Certificada 4FN</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Catálogo de Flota & Maquinaria
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Filtra por categoría, tarifa y fabricante con inspección técnica y telemetría en vivo.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold">
                      {filteredTools.length} Equipos Listos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Section */}
            <div id="catalogo-seccion" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              
              {/* Category Filter Pills */}
              <CategoryFilterPills
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
              />

              {/* Search & Sort Controls Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c1220] border border-slate-800 glass-panel">
                
                {/* Search input with SKU & brand helper */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre, modelo, SKU o fabricante..."
                    className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown & Quick Count */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ordenar:</span>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#090d16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="default">Relevancia Industrial</option>
                    <option value="price_asc">Menor Tarifa Diaria</option>
                    <option value="price_desc">Mayor Tarifa Diaria</option>
                    <option value="name">Alfabético (A-Z)</option>
                  </select>
                </div>

              </div>

              {/* 2-Column Catalog Layout: Sidebar Filters + Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Filter Sidebar */}
                <div className="lg:col-span-1">
                  <FilterSidebar
                    brands={availableBrands}
                    selectedBrands={selectedBrands}
                    onToggleBrand={handleToggleBrand}
                    maxPrice={maxCatalogPrice}
                    priceLimit={priceLimit}
                    onPriceChange={setPriceLimit}
                    onlyAvailable={onlyAvailable}
                    onToggleOnlyAvailable={setOnlyAvailable}
                    onResetFilters={handleResetFilters}
                    totalFiltered={filteredTools.length}
                  />
                </div>

                {/* Machinery Cards Grid */}
                <div className="lg:col-span-3">
                  {loading ? (
                    <div className="p-16 rounded-2xl bg-[#0c1220] border border-slate-800 text-center space-y-3">
                      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="text-white font-semibold text-sm">Consultando catálogo técnico...</div>
                      <p className="text-xs text-slate-400">Verificando disponibilidad en patio y sensores IoT</p>
                    </div>
                  ) : filteredTools.length === 0 ? (
                    <div className="p-16 rounded-2xl bg-[#0c1220] border border-slate-800 text-center space-y-3">
                      <Wrench className="w-12 h-12 text-slate-600 mx-auto" />
                      <h3 className="text-base font-bold text-white">No se encontró maquinaria con estos criterios</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Intenta ajustar el rango de tarifa diaria, desmarcar fabricantes o limpiar los filtros aplicados.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Restablecer Filtros</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Client Portal View */}
        {activeView === 'client' && <ClientPortal />}

        {/* Provider Fleet Portal View */}
        {activeView === 'provider' && <ProviderPortal />}

        {/* Admin Center & SecOps View */}
        {activeView === 'admin' && <AdminPortal />}
      </main>

      {/* Global Interactive Overlays */}
      <ToolDetailModal />
      <QuoteCartDrawer />
      <ComparatorDock />
      <CommandPalette />
      <AuthModal />
      <ChangePasswordModal />
      <ToastContainer />

      {/* Enterprise Dark Footer */}
      <Footer />
    </div>
  );
};
