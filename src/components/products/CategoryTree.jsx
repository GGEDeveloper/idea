import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const CategoryItem = ({ 
  category, 
  level = 0, 
  onSelect, 
  selectedCategories = [] 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Expande os primeiros níveis por padrão
  const hasChildren = category.children && category.children.length > 0;
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
  const isSelected = safeSelectedCategories.some(catId => catId === category.id);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(category.id);
  };

  return (
    <div className={`pl-${level * 4} mb-1`}>
      <div 
        className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={handleToggle}
      >
        {hasChildren ? (
          <span className="mr-1">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            )}
          </span>
        ) : (
          <span className="w-4"></span>
        )}
        <label className="flex items-center cursor-pointer w-full">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">
            {category.name || (category.path ? category.path.split('\\').pop() : 'Categoria sem nome')}
            {category.directProductCount > 0 && (
              <span className="ml-1 text-xs text-gray-500">
                ({category.directProductCount})
              </span>
            )}
          </span>
        </label>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              onSelect={onSelect}
              selectedCategories={safeSelectedCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ 
  categories = [], 
  selectedCategories = [], 
  onCategorySelect 
}) => {
  if (!categories || categories.length === 0) {
    return <div className="text-sm text-gray-500">Nenhuma categoria encontrada</div>;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onSelect={onCategorySelect}
          selectedCategories={selectedCategories}
        />
      ))}
    </div>
  );
};

export default CategoryTree;
