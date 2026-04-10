import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCamera, HiOutlineCheck, HiOutlineXMark, HiOutlinePhoto, HiOutlineExclamationTriangle, HiOutlineMapPin, HiOutlineSparkles } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import categoriesData from '../../data/categories.json';
import brandsData from '../../data/brands.json';
import { getCategorySpecs } from '../../utils/helpers';
import productService from '../../services/productService';
import { addProduct } from '../../store/productSlice';

const STEPS = [
  { id: 1, title: 'Category' },
  { id: 2, title: 'Brand & Model' },
  { id: 3, title: 'Photos' },
  { id: 4, title: 'Details' },
  { id: 5, title: 'Preview' },
];

const PostProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    images: [], // store objects { file, preview }
    title: '',
    description: '',
    price: '',
    condition: '',
    location: user?.location || '',
    specs: {},
    features: [],
  });

  // Step 1: Category Selection
  const handleCategorySelect = (slug) => {
    setFormData(prev => ({ ...prev, category: slug, brand: '', model: '', specs: {} }));
    setCurrentStep(2);
  };

  // Step 2: Brand Selection
  const availableBrands = formData.category ? brandsData[formData.category] || [] : [];
  const handleBrandSelect = (brandName) => {
    setFormData(prev => ({ ...prev, brand: brandName, model: '' }));
  };

  // Step 3: Photos Upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }
    
    // Simulate camera-only restriction message
    toast('Make sure these are real photos taken by you', { icon: '📸' });

    // Store both the File object and the preview URL
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const updated = [...prev.images];
      // Revoke object URL to prevent memory leaks
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated.splice(index, 1);
      return { ...prev, images: updated };
    });
  };

  // Step 4: Details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => {
      const features = [...prev.features];
      const index = features.indexOf(feature);
      if (index === -1) {
        features.push(feature);
      } else {
        features.splice(index, 1);
      }
      return { ...prev, features };
    });
  };

  // Validation
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.category) { toast.error('Please select a category'); return false; }
        return true;
      case 2:
        if (!formData.brand) { toast.error('Please select a brand'); return false; }
        return true;
      case 3:
        if (formData.images.length < 1) { toast.error('Please upload at least 1 photo'); return false; }
        return true;
      case 4:
        if (!formData.title.trim()) { toast.error('Title is required'); return false; }
        if (!formData.description.trim()) { toast.error('Description is required'); return false; }
        if (!formData.price || Number(formData.price) <= 0) { toast.error('Valid price is required'); return false; }
        if (!formData.condition) { toast.error('Please select a condition'); return false; }
        if (!formData.location.trim()) { toast.error('Location is required'); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('brand', formData.brand);
      data.append('model', formData.model || formData.title);
      data.append('condition', formData.condition);
      data.append('location', formData.location);
      data.append('specs', JSON.stringify(formData.specs));
      data.append('features', JSON.stringify(formData.features));
      
      formData.images.forEach(img => {
        if (img.file) {
          data.append('images[]', img.file);
        }
      });

      const newProduct = await productService.create(data);
      dispatch(addProduct(newProduct));
      toast.success('Product listed successfully!');
      navigate(`/products/${newProduct.id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post product';
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in">
            {categoriesData.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                  formData.category === cat.slug
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-surface-800'
                }`}
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-semibold text-surface-900 dark:text-white">{cat.name}</span>
              </button>
            ))}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Select Brand</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.name)}
                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                      formData.brand === brand.name
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-surface-800'
                    }`}
                  >
                    <span className="text-2xl">{brand.logo}</span>
                    <span className="font-medium text-surface-900 dark:text-white">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.brand && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Select Model (Optional)</h3>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:ring-0 focus:border-primary-500 transition-colors"
                >
                  <option value="">Select a model...</option>
                  {availableBrands.find(b => b.name === formData.brand)?.models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="other">Other Model</option>
                </select>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 rounded-xl flex gap-3">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-warning-600 dark:text-warning-500 shrink-0" />
              <div>
                <p className="font-semibold text-warning-800 dark:text-warning-400">Photo Requirements</p>
                <p className="text-sm text-warning-700 dark:text-warning-500 mt-1">
                  You must upload at least 1 photo. Only photos taken directly from your phone camera are allowed to ensure authenticity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Upload Button */}
              {formData.images.length < 10 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HiOutlineCamera className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Add Photo</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    capture="environment" // Suggests taking a photo directly on mobile
                  />
                </div>
              )}

              {/* Previews */}
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-surface-200 dark:border-surface-700">
                  <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-danger-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-surface-500 font-medium">
              {formData.images.length} / 10 photos uploaded (Minimum 1 required)
            </p>
          </div>
        );

      case 4:
        const specFields = getCategorySpecs(formData.category);
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Basic Details</h3>
              <Input
                label="Listing Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. iPhone 14 Pro Max 256GB"
                maxLength={70}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Price (ETB) *"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Condition *</label>
                  <div className="flex gap-3">
                    {['New', 'Used'].map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, condition: cond }))}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                          formData.condition === cond
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                            : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Describe the item, its condition, included accessories, and any defects..."
                  className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              <Input
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Neighborhood"
              />
            </div>

            {/* Dynamic Specs */}
            {specFields.length > 0 && (
              <div className="pt-6 border-t border-surface-200 dark:border-surface-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">Specifications</h3>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.title || !formData.description) {
                        toast.error('Please enter title and description first');
                        return;
                      }
                      const toastId = toast.loading('Extracting specs with AI...');
                      try {
                        // Assuming api is imported from '../../services/api'
                        const api = (await import('../../services/api')).default;
                        const response = await api.post('/ai/analyze_product.php', {
                          title: formData.title,
                          description: formData.description,
                          category: formData.category
                        });
                        
                        if (response.data?.success && response.data?.data?.extractedSpecs) {
                          const extracted = response.data.data.extractedSpecs;
                          setFormData(prev => ({
                            ...prev,
                            specs: { ...prev.specs, ...extracted }
                          }));
                          toast.success('Specs auto-filled successfully!', { id: toastId });
                        } else {
                          toast.error('AI could not extract specs. Try providing more details.', { id: toastId });
                        }
                      } catch (err) {
                        toast.error('AI extraction failed. Please fill manually.', { id: toastId });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                  >
                    <HiOutlineSparkles className="w-4 h-4" />
                    Auto-fill with AI
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specFields.map(spec => (
                    <div key={spec}>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 capitalize">
                        {spec.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={formData.specs[spec] || ''}
                        onChange={(e) => handleSpecChange(spec, e.target.value)}
                        className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/50 rounded-xl p-4 flex items-center justify-center gap-2 mb-8">
              <HiOutlineCheck className="w-5 h-5 text-success-600 dark:text-success-500" />
              <span className="font-medium text-success-800 dark:text-success-400">All steps completed. Review your listing below.</span>
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
              <div className="aspect-[21/9] bg-surface-100 dark:bg-surface-800 relative">
                {formData.images.length > 0 ? (
                  <img src={formData.images[0].preview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiOutlinePhoto className="w-12 h-12 text-surface-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 dark:bg-surface-900/90 backdrop-blur rounded-full text-xs font-bold shadow-sm">
                    {formData.condition}
                  </span>
                  <span className="px-3 py-1 bg-white/90 dark:bg-surface-900/90 backdrop-blur rounded-full text-xs font-bold text-primary-600 shadow-sm uppercase">
                    {formData.brand}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{formData.title}</h2>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 shrink-0">
                    ${Number(formData.price).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-surface-600 dark:text-surface-300 mb-6 whitespace-pre-line text-sm">
                  {formData.description}
                </p>
                
                <div className="flex items-center gap-2 text-surface-500 text-sm">
                  <HiOutlineMapPin className="w-4 h-4" />
                  {formData.location}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                currentStep > step.id
                  ? 'bg-success-500 text-white'
                  : currentStep === step.id
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
              }`}>
                {currentStep > step.id ? <HiOutlineCheck className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-xs mt-2 hidden sm:block font-medium ${
                currentStep >= step.id ? 'text-surface-900 dark:text-white' : 'text-surface-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        {/* Progress Line */}
        <div className="relative -mt-10 mb-8 sm:mb-12 h-1 bg-surface-200 dark:bg-surface-700 rounded-full mx-10 z-0 hidden sm:block">
          <div 
            className="absolute top-0 left-0 h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 md:p-10 shadow-sm min-h-[400px]">
        
        <div className="mb-8 border-b border-surface-100 dark:border-surface-800 pb-4">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="mt-12 pt-6 border-t border-surface-100 dark:border-surface-800 flex justify-between">
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
            icon={currentStep === 1 ? undefined : HiOutlineArrowLeft}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="px-8"
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              icon={HiOutlineCheck}
              className="px-8"
            >
              Post Listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostProductPage;
