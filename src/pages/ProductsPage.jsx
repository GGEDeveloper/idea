import React, { useState, useEffect } from 'react';
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
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    console.log('[FRONT] Buscando produtos da API...');
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar produtos');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
        console.log(`[FRONT] Produtos carregados com sucesso. Total: ${data.length}`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error('[FRONT] Erro ao buscar produtos:', err);
      });
  }, []);

  // Filtros podem ser reimplementados com base nos campos reais dos produtos
  // ...

  // Extrair marcas e voltagens únicas dos produtos
const uniqueBrands = Array.from(new Set(products.map(p => p.producer).filter(Boolean)));
const uniqueVoltages = Array.from(new Set(products.map(p => p.voltage).filter(Boolean)));

// Estados e helpers para filtros
const initialBrandFilters = uniqueBrands.reduce((acc, brand) => { acc[brand] = false; return acc; }, {});
const initialVoltageFilters = uniqueVoltages.reduce((acc, voltage) => { acc[voltage] = false; return acc; }, {});

const [filters, setFilters] = useState({ brands: initialBrandFilters, voltages: initialVoltageFilters });

// Atualiza filtros quando produtos mudam
useEffect(() => {
  setFilters({ brands: initialBrandFilters, voltages: initialVoltageFilters });
}, [products.length]);

const handleBrandChange = (brand) => {
  setFilters(prev => {
    const newBrands = { ...prev.brands, [brand]: !prev.brands[brand] };
    console.log(`[FRONT] Filtro de marca alterado: ${brand} -> ${!prev.brands[brand]}`);
    return { ...prev, brands: newBrands };
  });
};
const handleVoltageChange = (voltage) => {
  setFilters(prev => {
    const newVoltages = { ...prev.voltages, [voltage]: !prev.voltages[voltage] };
    console.log(`[FRONT] Filtro de voltagem alterado: ${voltage} -> ${!prev.voltages[voltage]}`);
    return { ...prev, voltages: newVoltages };
  });
};

// Filtragem dos produtos
useEffect(() => {
  let filtered = products;
  const activeBrands = Object.entries(filters.brands).filter(([k, v]) => v).map(([k]) => k);
  const activeVoltages = Object.entries(filters.voltages).filter(([k, v]) => v).map(([k]) => k);
  if (activeBrands.length > 0) {
    filtered = filtered.filter(p => activeBrands.includes(p.producer));
  }
  if (activeVoltages.length > 0) {
    filtered = filtered.filter(p => activeVoltages.includes(p.voltage));
  }
  setFilteredProducts(filtered);
}, [filters, products]);

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
              {loading && <div className="col-span-full text-center text-lg py-10">A carregar produtos...</div>}
              {error && <div className="col-span-full text-center text-red-600 py-10">{error}</div>}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">Nenhum produto encontrado.</div>
              )}
              {/* Renderização robusta: fallbacks para todos os campos que podem vir em branco/null */}
              {!loading && !error && filteredProducts.map((product) => {
                // Nome do produto: fallback amigável
                const nome = product.name && product.name.trim() !== '' ? product.name : 'Produto sem nome';
                // Preço: aceita string ou número, mostra fallback se vazio/null
                let preco = 'Preço indisponível';
                if (product.price !== undefined && product.price !== null && product.price !== '') {
                  const precoNum = Number(product.price);
                  preco = !isNaN(precoNum) ? `€ ${precoNum.toFixed(2)}` : product.price;
                }
                // Descrição: tenta short_desc, depois long_desc, senão fallback
                const descricao = (product.short_desc && product.short_desc.trim() !== '')
                  ? product.short_desc
                  : (product.long_desc && product.long_desc.trim() !== '')
                    ? product.long_desc
                    : 'Sem descrição disponível.';
                // EAN: mostra apenas se existir
                const ean = product.ean && product.ean.trim() !== '' ? product.ean : null;
                // Imagem: fallback para placeholder se vazio/null
                const imagem = product.image_url && product.image_url.trim() !== '' ? product.image_url : '/placeholder.png';
                return (
                  <Link
                    to={ean ? `/produtos/${ean}` : '#'}
                    key={product.productid || product.ean || product.sku}
                    className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    tabIndex={ean ? 0 : -1}
                    aria-disabled={!ean}
                    style={{ pointerEvents: ean ? 'auto' : 'none' }}
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img 
                        src={imagem}
                        alt={nome}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors truncate h-12 leading-tight" title={nome}>
                        {nome}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 h-10 overflow-hidden">
                        {descricao}
                      </p>
                      <div className="mt-auto flex flex-col gap-2">
                        <span className="text-base font-bold text-indigo-700">{preco}</span>
                        {ean && <span className="text-xs text-gray-400">EAN: {ean}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
