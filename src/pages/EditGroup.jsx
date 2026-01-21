import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import groupService from '../services/groupService';
import FlashMessage from '../components/FlashMessage';

const GroupEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pastor: '',
    phoneNumber: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: '' });

  // Fetch Group Data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await groupService.getGroupById(id);
        setFormData({
          name: response.name || '',
          location: response.location || '',
          pastor: response.pastor || '',
          phoneNumber: response.phoneNumber || '',
          email: response.email || ''
        });
      } catch (error) {
        setFlash({ 
          message: error.response?.data?.message || 'Failed to fetch group details',
          type: 'danger' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGroupData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.pastor.trim()) newErrors.pastor = 'Pastor name is required';
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must contain only digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // UPDATED HANDLESUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    if (!validateForm()) return;

    // Disable button immediately
    setIsSubmitting(true);
    setFlash({ message: '', type: '' });

    try {
      await groupService.updateGroup(id, formData);
      
      navigate('/groups', {
        state: {
          flashMessage: 'Group updated successfully!',
          flashType: 'success'
        }
      });

    } catch (error) {
      // Only re-enable the button if there was an error
      setFlash({ 
        message: error.response?.data?.message || 'Failed to update group',
        type: 'danger' 
      });
      setIsSubmitting(false); 
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading group details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <FlashMessage
        message={flash.message}
        type={flash.type}
        onClose={() => setFlash({ message: '', type: '' })}
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Group</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete='off'
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter group name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                autoComplete='off'
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter location"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Pastor */}
            <div>
              <label htmlFor="pastor" className="block text-sm font-medium text-gray-700 mb-1">
                Pastor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="pastor"
                name="pastor"
                value={formData.pastor}
                onChange={handleChange}
                autoComplete='off'
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pastor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter pastor name"
              />
              {errors.pastor && <p className="mt-1 text-sm text-red-600">{errors.pastor}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                autoComplete='off'
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete='off'
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email (optional)"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GroupEditPage;