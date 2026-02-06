import React, { useState, useEffect } from 'react';
import { Card, Container, ProgressBar, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import memberService from '../services/memberService';
import churchService from '../services/churchService';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

// Components
import PersonalInfoForm from '../components/PersonalInfoForm';
import SchoolOrWorkInfo from '../components/SchoolOrWorkInfoForm';
import ContactInfoForm from '../components/ContactInfoForm';
import ReviewMemberInfo from '../components/ReviewMemberInfo';

const MemberEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [flash, setFlash] = useState({ message: '', type: '' });
    const [churches, setChurches] = useState([]);

    const [formData, setFormData] = useState({
        churchId: '',
        firstName: '', lastName: '', email: '', gender: '',
        relationshipStatus: '', category: '', memberStatus: '',
        profileImage: null,
        workOrSchool: '', levelOrPosition: '', programOrDepartment: '',
        phoneNumber: '', houseAddress: '', gpsAddress: '',
        emergencyContact: '', emergencyName: '', emergencyRelation: '', emergencyAddress: ''
    });

    // Fetch Member Data & Churches
    useEffect(() => {
        const loadPageData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch Member Details
                const memberData = await memberService.getMemberById(id);
                
                let imageUrl = null;
                if (memberData.profileImage && typeof memberData.profileImage === 'object') {
                    imageUrl = memberData.profileImage.url; 
                } else {
                    imageUrl = memberData.profileImage;
                }

                let currentChurchId = '';
                if (memberData.churchId && typeof memberData.churchId === 'object') {
                    currentChurchId = memberData.churchId._id;
                } else {
                    currentChurchId = memberData.churchId;
                }

                setFormData({
                    ...memberData,
                    churchId: currentChurchId || '',
                    profileImage: imageUrl 
                });

                // Fetch Churches List (If User Role Allows)
                const allowedRoles = ['manager', 'grouppastor', 'groupadmin'];
                if (user && allowedRoles.includes(user.status?.toLowerCase())) {
                    try {
                        const churchResponse = await churchService.getChurches();
                        const churchList = Array.isArray(churchResponse) ? churchResponse : (churchResponse.churches || churchResponse.data || []);
                        setChurches(churchList);
                    } catch (churchError) {
                    }
                }

            } catch (error) {
                setFlash({ 
                    message: 'Failed to load member details. ' + (error.response?.data?.message || ''), 
                    type: 'danger' 
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        if (id) loadPageData();
    }, [id, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (base64Image) => {
        setFormData({ ...formData, profileImage: base64Image });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // Submit Logic
    const handleUpdate = async () => {
        if (isSaving) return;
        setIsSaving(true);
        
        try {
            const payload = { ...formData };

            // Remove profileImage if it hasn't changed (still a URL string)
            if (payload.profileImage && typeof payload.profileImage === 'string' && payload.profileImage.startsWith('http')) {
                delete payload.profileImage;
            }

            const response = await memberService.updateMember(id, payload);
            
            navigate(`/member/${id}`, { 
                state: { 
                    flashMessage: response.message || 'Member updated successfully!',
                    flashType: 'success' 
                }
            });
            
        } catch (err) {
            setFlash({ 
                message: err.response?.data?.message || 'Error updating member', 
                type: 'danger' 
            });
            setIsSaving(false);
        }
    };

    if (isLoadingData) {
        return (
            <Container className="py-5 text-center" style={{ maxWidth: '900px' }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">Loading member details...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5" style={{ maxWidth: '900px' }}>
            <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ msg: '', type: '' })} />

            <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="mb-0">Edit Member Profile</h2>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </div>

            <ProgressBar now={(step / 4) * 100} label={`Step ${step} of 4`} className="mb-4" variant="warning" />

            <Card className="shadow">
                <Card.Body>
                    {step === 1 && (
                        <PersonalInfoForm
                            data={formData}
                            onChange={handleChange}
                            onImageChange={handleImageChange}
                            onNext={nextStep}
                            // Pass props for Church Selection
                            user={user}
                            churches={churches}
                        />
                    )}
                    {step === 2 && (
                        <SchoolOrWorkInfo
                            data={formData}
                            onChange={handleChange}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {step === 3 && (
                        <ContactInfoForm
                            data={formData}
                            onChange={handleChange}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {step === 4 && (
                        <ReviewMemberInfo
                            data={formData}
                            onSubmit={handleUpdate}
                            onBack={prevStep}
                            isLoading={isSaving}
                        />
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MemberEditPage;