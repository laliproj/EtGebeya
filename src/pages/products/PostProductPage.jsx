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
