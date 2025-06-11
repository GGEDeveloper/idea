import React, { useState } from 'react';

const ProductTabs = ({ description, attributes }) => {
  const [activeTab, setActiveTab] = useState('description');

  const hasDescription = description && description.trim() !== '';
  const hasAttributes = attributes && attributes.length > 0;

  // If there's no content for any tab, don't render the component
  if (!hasDescription && !hasAttributes) {
    return null;
  }

  const tabStyles = 'px-4 py-2 text-lg font-medium rounded-t-lg transition-colors';
  const activeTabStyles = 'bg-white text-indigo-600';
  const inactiveTabStyles = 'bg-gray-200 text-gray-600 hover:bg-gray-300';

  return (
    <div className="w-full mt-12">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {hasDescription && (
          <button
            onClick={() => setActiveTab('description')}
            className={`${tabStyles} ${activeTab === 'description' ? activeTabStyles : inactiveTabStyles}`}
          >
            Descrição
          </button>
        )}
        {hasAttributes && (
          <button
            onClick={() => setActiveTab('attributes')}
            className={`${tabStyles} ${activeTab === 'attributes' ? activeTabStyles : inactiveTabStyles}`}
          >
            Especificações Técnicas
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-white rounded-b-lg shadow-inner">
        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {/* Using dangerouslySetInnerHTML to render potential HTML content from description */}
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        )}
        {activeTab === 'attributes' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Detalhes do Produto</h3>
            <table className="w-full text-left table-auto">
              <tbody>
                {attributes.map((attr, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-600 w-1/3">{attr.name}</td>
                    <td className="py-3 px-4 text-gray-800">{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
