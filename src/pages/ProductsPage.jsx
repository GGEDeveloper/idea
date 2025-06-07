import React, { useState, useEffect } from 'react';
import { drillData } from '../data/drillData';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Componente para um item de filtro (checkbox)
const FilterCheckbox = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input 
      id={id} 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
    <label htmlFor={id} className="ml-2 text-sm text-gray-700 hover:text-indigo-600 cursor-pointer">{label}</label>
  </div>
);

// Componente para uma seção de filtro
const FilterSection = ({ title, children }) => (
  <div className="py-6 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const ProductsPage = () => {
  const [filteredDrills, setFilteredDrills] = useState(drillData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const uniqueBrands = [...new Set(drillData.map(drill => drill.brand))];
  const uniqueVoltages = [...new Set(drillData.map(drill => drill.voltage === null ? 'Com Fio' : `${drill.voltage}V`))].sort((a, b) => {
    if (a === 'Com Fio') return 1;
    if (b === 'Com Fio') return -1;
    return parseFloat(a) - parseFloat(b);
  });

  const initialBrandFilters = uniqueBrands.reduce((acc, brand) => ({ ...acc, [brand]: false }), {});
  const initialVoltageFilters = uniqueVoltages.reduce((acc, voltage) => ({ ...acc, [voltage]: false }), {});

  const [filters, setFilters] = useState({
    brands: initialBrandFilters,
    voltages: initialVoltageFilters,
    // ... outros filtros aqui (preco, etc.)
  });

  const handleBrandChange = (brandName) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      brands: { ...prevFilters.brands, [brandName]: !prevFilters.brands[brandName] },
    }));
  };

  const handleVoltageChange = (voltageValue) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      voltages: { ...prevFilters.voltages, [voltageValue]: !prevFilters.voltages[voltageValue] },
    }));
  };

  useEffect(() => {
    let currentDrills = [...drillData];

    const selectedBrands = Object.keys(filters.brands).filter(brand => filters.brands[brand]);
    if (selectedBrands.length > 0) {
      currentDrills = currentDrills.filter(drill => selectedBrands.includes(drill.brand));
    }

    const selectedVoltages = Object.keys(filters.voltages).filter(voltage => filters.voltages[voltage]);
    if (selectedVoltages.length > 0) {
      currentDrills = currentDrills.filter(drill => {
        const drillVoltageStr = drill.voltage === null ? 'Com Fio' : `${drill.voltage}V`;
        return selectedVoltages.includes(drillVoltageStr);
      });
    }

    // TODO: Adicionar lógica para outros filtros (características, preço, etc.) aqui

    setFilteredDrills(currentDrills);
  }, [filters, drillData]);

  const SidebarContent = () => (
    <aside className="w-full md:w-72 lg:w-80 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-28">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Filtros</h2>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      <FilterSection title="Marca">
        {uniqueBrands.map(brand => (
          <FilterCheckbox 
            key={brand} 
            id={`brand-${brand}`} 
            label={brand} 
            checked={filters.brands[brand] || false} 
            onChange={() => handleBrandChange(brand)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Voltagem">
        {uniqueVoltages.map(voltage => (
          <FilterCheckbox 
            key={voltage} 
            id={`voltage-${voltage.replace(' ', '-')}`} 
            label={voltage} 
            checked={filters.voltages[voltage] || false} 
            onChange={() => handleVoltageChange(voltage)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Características">
        {/* Placeholder para filtros de características */}
        <p className="text-sm text-gray-500">Em breve...</p>
      </FilterSection>

      <FilterSection title="Preço">
        {/* Placeholder para filtro de preço */}
        <p className="text-sm text-gray-500">Em breve...</p>
      </FilterSection>

      <div className="mt-8">
        {/* O botão Aplicar Filtros pode ser removido se a filtragem for instantânea */}
        {/* <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
          Aplicar Filtros
        </button> */}
        <button 
          onClick={() => {
            setFilters({
              brands: initialBrandFilters,
              voltages: initialVoltageFilters,
              // Adicionar outros filtros resetados aqui quando forem implementados
            });
          }}
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-all duration-300"
        >
          Limpar Filtros
        </button>
      </div>
    </aside>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Nossos Berbequins</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.</p>
        </header>

        {/* Botão para abrir sidebar em mobile */}
        <div className="md:hidden mb-6 text-right">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Layout Principal: Sidebar + Conteúdo */}
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Sidebar (Mobile - Drawer) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsSidebarOpen(false)}></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span className="sr-only">Fechar sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <SidebarContent />
                </div>
              </div>
            </div>
          )}

          {/* Sidebar (Desktop - Fixa) */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/6">
             <div className="md:w-72 lg:w-full">
                <SidebarContent />
             </div>
          </div>

          {/* Conteúdo Principal (Grade de Produtos) */}
          <main className="flex-1 md:w-3/4 lg:w-4/5 xl:w-5/6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
              {filteredDrills.map((drill) => (
                <div 
                  key={drill.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <img 
                      src={drill.imageUrl} 
                      alt={drill.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {drill.features.includes('Brushless') && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">BRUSHLESS</span>
                    )}
                    {drill.features.includes('Impacto') && !drill.features.includes('Brushless') && (
                        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">IMPACTO</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors truncate h-12 leading-tight" title={drill.name}>
                      {drill.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">{drill.brand}</p>
                    <p className="text-xs text-gray-600 mb-3 h-10 overflow-hidden">
                      {drill.description_short}
                    </p>
                    
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-5 w-5 ${i < Math.floor(drill.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-2 text-xs text-gray-500">({drill.rating.toFixed(1)})</span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                            {drill.voltage && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-1">{drill.voltage}V</span>}
                            {drill.batteryType && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{drill.batteryType}</span>}
                            {!drill.voltage && drill.features.includes('Com Fio') && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">COM FIO</span>}
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">
                          €{drill.price.toFixed(2)}
                        </p>
                      </div>
                      <Link to={`/produto/${drill.id}`} className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
