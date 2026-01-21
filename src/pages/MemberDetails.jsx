import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Heart, Briefcase, GraduationCap, 
  Users, AlertCircle, Edit, ArrowLeft, Trash2, Loader2 
} from 'lucide-react';
import Swal from 'sweetalert2'; 
import memberService from '../services/memberService';
import FlashMessage from '../components/FlashMessage';

const MemberDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [member, setMember] = useState(null);
  const [flash, setFlash] = useState({ message: '', type: '' });

  // Fetch Member Data
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await memberService.getMemberById(id);
        setMember(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching member:", err);
        setError('Failed to load member details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id]);

  // Handle flash messages from previous pages
  useEffect(() => {
    if (location.state && location.state.flashMessage) {
      setFlash({
        message: location.state.flashMessage,
        type: location.state.flashType || 'success'
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Optimized Handle Delete
  const handleDelete = () => {
    Swal.fire({
      title: "Delete Member?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Perform delete via service
          await memberService.deleteMember(id);
          
          // Show success message
          await Swal.fire({
            title: "Deleted!",
            text: "Member has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });

          // Redirect to members list
          navigate('/members'); 
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire("Error", "Failed to delete member.", "error");
        }
      }
    });
  };

  const getInitials = () => {
    if (!member) return '';
    return `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`;
  };

  // Helper for consistent banner colors
  const getBannerColor = () => {
    return 'from-blue-500 to-cyan-500';
  };

  const InfoCard = ({ icon: Icon, title, value, iconColor }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-sm font-semibold text-gray-900 break-words">{value || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading member details...</p>
        </div>
      </div>
    );
  }


  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Member Not Found</h3>
          <p className="text-gray-500 mb-6">{error || "The requested member could not be found."}</p>
          <button 
            onClick={() => navigate("/members")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <FlashMessage 
        message={flash.message} 
        type={flash.type} 
        onClose={() => setFlash({ message: '', type: '' })} 
      />
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button 
            onClick={() => navigate("/members")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Members</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-red-200 hover:border-red-300 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            
            <button 
              onClick={() => navigate(`/member/edit/${member._id}`)} 
              className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          
          {/* Banner  */}
          <div className={`h-32 bg-gradient-to-r ${getBannerColor()}`}></div>
          
          {/* Profile Section */}
          <div className="px-8 pb-8">
            <div className="flex flex-col items-center -mt-24 mb-6">
              
              {/* Profile Image Box */}
              <div className="relative">
                {member.profileImage?.url ? (
                  <img 
                    src={member.profileImage.url} 
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-56 h-56 rounded-2xl border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  // Avatar background
                  <div className={`w-56 h-56 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br ${getBannerColor()} flex items-center justify-center`}>
                    <span className="text-7xl font-bold text-white">{getInitials()}</span>
                  </div>
                )}
              </div>

              {/* Name and Status */}
              <div className="mt-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  
                  {/* Category  */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.category === 'Adult' ? 'bg-blue-100 text-blue-700' :
                      member.category === 'Youth' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                  }`}>
                    {member.category}
                  </span>
                  
                  {/* Status */}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {member.memberStatus}
                  </span>
                  
                  {/* Gender  */}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                    {member.gender}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-xs text-gray-500 font-medium">First Name</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">{member.firstName}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Last Name</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">{member.lastName}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 break-all">{member.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <Phone className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">{member.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Personal Information
            </h2>
            <div className="space-y-3">
              <InfoCard icon={MapPin} title="House Address" value={member.houseAddress} iconColor="bg-red-500" />
              <InfoCard icon={MapPin} title="GPS Address" value={member.gpsAddress} iconColor="bg-green-500" />
              <InfoCard icon={Heart} title="Relationship Status" value={member.relationshipStatus} iconColor="bg-pink-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Work & Education
            </h2>
            <div className="space-y-3">
              <InfoCard icon={Briefcase} title="Work/School" value={member.workOrSchool} iconColor="bg-blue-500" />
              <InfoCard icon={GraduationCap} title="Level/Position" value={member.levelOrPosition} iconColor="bg-indigo-500" />
              <InfoCard icon={Users} title="Program/Department" value={member.programOrDepartment} iconColor="bg-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Emergency Contact
            </h2>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  This person will be contacted in case of emergencies. Please ensure details are current.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoCard icon={User} title="Contact Name" value={member.emergencyName} iconColor="bg-orange-500" />
              <InfoCard icon={Phone} title="Contact Number" value={member.emergencyContact} iconColor="bg-red-500" />
              <InfoCard icon={Heart} title="Relationship" value={member.emergencyRelation} iconColor="bg-pink-500" />
              <InfoCard icon={MapPin} title="Contact Address" value={member.emergencyAddress} iconColor="bg-teal-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDetails;