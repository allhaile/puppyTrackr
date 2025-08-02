import React, { useState, useEffect } from 'react';
import { X, Dog, Calendar, Weight, Smartphone, Stethoscope } from 'lucide-react';

const DogForm = ({ isOpen, onClose, onSubmit, dog = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birth_date: '',
    weight_lbs: '',
    microchip_id: '',
    vet_name: '',
    vet_phone: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (dog) {
      setFormData({
        name: dog.name || '',
        breed: dog.breed || '',
        birth_date: dog.birth_date || '',
        weight_lbs: dog.weight_lbs || '',
        microchip_id: dog.microchip_id || '',
        vet_name: dog.vet_name || '',
        vet_phone: dog.vet_phone || ''
      });
    } else {
      setFormData({
        name: '',
        breed: '',
        birth_date: '',
        weight_lbs: '',
        microchip_id: '',
        vet_name: '',
        vet_phone: ''
      });
    }
    setErrors({});
  }, [dog, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Dog name is required';
    }
    
    if (formData.weight_lbs && (isNaN(formData.weight_lbs) || formData.weight_lbs <= 0)) {
      newErrors.weight_lbs = 'Weight must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up the data before submitting
    const cleanData = {
      ...formData,
      name: formData.name.trim(),
      breed: formData.breed.trim() || null,
      birth_date: formData.birth_date || null,
      weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
      microchip_id: formData.microchip_id.trim() || null,
      vet_name: formData.vet_name.trim() || null,
      vet_phone: formData.vet_phone.trim() || null
    };

    onSubmit(cleanData);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} days old`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`;
      }
      return `${years}y ${remainingMonths}m old`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {dog ? 'Edit Dog' : 'Add New Dog'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Basic Information</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Dog Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''}`}
                placeholder="e.g., Buddy, Luna, Max"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Breed (Optional)
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Golden Retriever, Mixed, Unknown"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Birth Date (Optional)
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="input-field"
              />
              {formData.birth_date && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {calculateAge(formData.birth_date)}
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Weight className="w-4 h-4 inline mr-1" />
                Weight in lbs (Optional)
              </label>
              <input
                type="number"
                name="weight_lbs"
                value={formData.weight_lbs}
                onChange={handleInputChange}
                className={`input-field ${errors.weight_lbs ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''}`}
                placeholder="e.g., 45.5"
                step="0.1"
                min="0"
              />
              {errors.weight_lbs && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weight_lbs}</p>
              )}
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Medical Information</h3>
            
            {/* Microchip */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Smartphone className="w-4 h-4 inline mr-1" />
                Microchip ID (Optional)
              </label>
              <input
                type="text"
                name="microchip_id"
                value={formData.microchip_id}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., 982000123456789"
              />
            </div>

            {/* Vet Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-1" />
                Veterinarian Name (Optional)
              </label>
              <input
                type="text"
                name="vet_name"
                value={formData.vet_name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Dr. Smith, City Animal Hospital"
              />
            </div>

            {/* Vet Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Veterinarian Phone (Optional)
              </label>
              <input
                type="tel"
                name="vet_phone"
                value={formData.vet_phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., (555) 123-4567"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (dog ? 'Update Dog' : 'Add Dog')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DogForm; 