import React from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/20/solid';

const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, totalProducts, limit } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const startProduct = (currentPage - 1) * limit + 1;
  const endProduct = Math.min(currentPage * limit, totalProducts);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  // Lógica avançada para gerar números das páginas com ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    } else {
      if (currentPage <= 4) {
        // Início: 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Fim: 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push('ellipsis-start');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('ellipsis-start');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const PaginationButton = ({ onClick, disabled, children, isActive = false, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center min-w-[40px] h-10 text-sm font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 z-10' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-white hover:border-gray-300' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {/* Mobile Version */}
      <div className="flex flex-col space-y-4 sm:hidden">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{startProduct}-{endProduct}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalProducts}</span> produtos
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Página {currentPage} de {totalPages}
          </p>
        </div>
        
        <div className="flex justify-between space-x-3">
          <PaginationButton
          onClick={handlePrevious}
          disabled={currentPage === 1}
            className="flex-1 rounded-xl"
        >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Anterior
          </PaginationButton>
          
          <PaginationButton
          onClick={handleNext}
          disabled={currentPage === totalPages}
            className="flex-1 rounded-xl"
        >
          Próximo
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </PaginationButton>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{startProduct}-{endProduct}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalProducts}</span> produtos
          </p>
        </div>

        <nav className="flex items-center space-x-1" aria-label="Paginação">
          {/* Primeira página */}
          <PaginationButton
            onClick={handleFirst}
            disabled={currentPage === 1}
            className="rounded-l-xl"
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
            <span className="sr-only">Primeira página</span>
          </PaginationButton>

          {/* Página anterior */}
          <PaginationButton
              onClick={handlePrevious}
              disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="sr-only">Página anterior</span>
          </PaginationButton>

          {/* Números das páginas */}
          {pageNumbers.map((page, index) => {
            if (typeof page === 'string' && page.includes('ellipsis')) {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center justify-center min-w-[40px] h-10 text-gray-500"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </div>
              );
            }

            return (
              <PaginationButton
                key={page}
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className={
                  index === 0 && pageNumbers[0] !== 1 ? 'rounded-l-xl' :
                  index === pageNumbers.length - 1 && pageNumbers[pageNumbers.length - 1] !== totalPages ? 'rounded-r-xl' : ''
                }
              >
                {page}
              </PaginationButton>
            );
          })}

          {/* Próxima página */}
          <PaginationButton
              onClick={handleNext}
              disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="w-4 h-4" />
            <span className="sr-only">Próxima página</span>
          </PaginationButton>

          {/* Última página */}
          <PaginationButton
            onClick={handleLast}
            disabled={currentPage === totalPages}
            className="rounded-r-xl"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
            <span className="sr-only">Última página</span>
          </PaginationButton>
          </nav>
      </div>

      {/* Informações adicionais */}
      <div className="hidden lg:flex lg:justify-center lg:mt-4">
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          Use as setas do teclado ← → para navegar entre páginas
        </div>
      </div>
    </div>
  );
};

export default Pagination;
