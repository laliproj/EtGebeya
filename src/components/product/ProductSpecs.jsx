import { HiOutlineCheck } from 'react-icons/hi2';

const ProductSpecs = ({ specs, features }) => {
  if (!specs && (!features || features.length === 0)) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Specifications Table */}
      {specs && Object.keys(specs).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            Specifications
          </h3>
          <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
            {Object.entries(specs).map(([key, value], index) => (
              <div 
                key={key} 
                className={`flex flex-col sm:flex-row sm:items-center px-4 py-3 text-sm ${
                  index !== Object.keys(specs).length - 1 ? 'border-b border-surface-100 dark:border-surface-800' : ''
                } ${index % 2 === 0 ? 'bg-surface-50 dark:bg-surface-800/30' : 'bg-white dark:bg-surface-900'}`}
