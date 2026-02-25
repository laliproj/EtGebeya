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
              >
                <div className="w-full sm:w-1/3 text-surface-500 font-medium capitalize mb-1 sm:mb-0">
                  {/* Format camelCase keys like screenSize to Screen Size */}
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="w-full sm:w-2/3 text-surface-900 dark:text-white font-medium">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features List */}
      {features && features.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            Key Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center shrink-0">
                  <HiOutlineCheck className="w-3.5 h-3.5 text-success-600 dark:text-success-500" />
                </div>
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSpecs;
