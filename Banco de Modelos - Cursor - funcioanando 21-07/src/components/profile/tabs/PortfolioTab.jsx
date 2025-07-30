import React from 'react';
import { Briefcase } from 'lucide-react';

const PortfolioTab = ({ portfolioItems }) => {
  if (!portfolioItems || portfolioItems.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Nenhum trabalho no portfólio.</h3>
        <p className="text-sm text-gray-500">Este modelo ainda não adicionou trabalhos ao portfólio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Trabalhos Realizados</h3>
        <div className="space-y-4">
          {portfolioItems.map((work, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{work.title}</h4>
                <p className="text-gray-600 text-sm">{work.client}</p>
              </div>
              <span className="text-gray-500 text-sm">{work.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioTab;