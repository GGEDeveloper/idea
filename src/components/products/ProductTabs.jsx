import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  CogIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const ProductTabs = ({ description, attributes }) => {
  const [activeTab, setActiveTab] = useState('description');

  const hasDescription = description && description.trim() !== '';
  const hasAttributes = attributes && attributes.length > 0;

  // If there's no content for any tab, don't render the component
  if (!hasDescription && !hasAttributes) {
    return (
      <div className="p-8 text-center bg-gray-50">
        <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Informações Adicionais Indisponíveis
        </h3>
        <p className="text-gray-500">
          Não há descrição detalhada ou especificações técnicas disponíveis para este produto.
        </p>
      </div>
    );
  }

  const tabs = [
    ...(hasDescription ? [{
      id: 'description',
      name: 'Descrição Detalhada',
      icon: DocumentTextIcon,
      content: description
    }] : []),
    ...(hasAttributes ? [{
      id: 'attributes',
      name: 'Especificações Técnicas',
      icon: CogIcon,
      content: attributes
    }] : [])
  ];

  // Set the first available tab as active if current active tab doesn't exist
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  return (
    <div className="w-full bg-white">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto">
          <nav className="flex space-x-8 px-6 sm:px-8 md:px-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
          <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-white rounded-t-lg -mb-px'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
          >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
          </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 sm:px-8 md:px-12 py-8">
        {activeTab === 'description' && hasDescription && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Descrição Completa do Produto
              </h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {/* Clean HTML content and render safely */}
              <div 
                className="space-y-4"
                dangerouslySetInnerHTML={{ 
                  __html: description
                    .replace(/<br\s*\/?>/gi, '</p><p>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                    .replace(/<p><\/p>/g, '')
                }} 
              />
            </div>
          </div>
        )}

        {activeTab === 'attributes' && hasAttributes && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CogIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Especificações Técnicas
              </h2>
              <p className="text-gray-600">
                Informações detalhadas sobre as características técnicas deste produto.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map((attr, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        {attr.key || attr.name}
                      </dt>
                    </div>
                    <dd className="text-base font-medium text-gray-900">
                      {attr.value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> As especificações podem variar conforme a versão do produto. 
                  Para informações mais detalhadas, contacte o nosso suporte técnico.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
