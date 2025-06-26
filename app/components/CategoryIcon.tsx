'use client';

import React from 'react';
import { getCategorySVGIcon } from '../../src/services/categoryService';

interface CategoryIconProps {
  categoryName: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  categoryName, 
  size = 24, 
  className = '',
  style = {}
}) => {
  const iconPath = getCategorySVGIcon(categoryName);
  
  return (
    <img
      src={iconPath}
      alt={`${categoryName} icon`}
      width={size}
      height={size}
      className={`category-icon ${className}`}
      style={{
        objectFit: 'contain',
        filter: 'currentColor', // Allows CSS color inheritance
        ...style
      }}
      onError={(e) => {
        // Fallback to a generic icon if SVG doesn't load
        const target = e.target as HTMLImageElement;
        target.src = '/icons/categories/general_mechanic_tools.svg';
      }}
    />
  );
};

export default CategoryIcon; 