// src/pages/MemberRegistration.jsx

import React, { useState, useEffect } from 'react';
import { Card, Container, ProgressBar } from 'react-bootstrap';

import memberService from '../services/memberService';
import churchService from '../services/churchService';

import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

import PersonalInfoForm from '../components/PersonalInfoForm';
import SchoolOrWorkInfo from '../components/SchoolOrWorkInfoForm';
import ContactInfoForm from '../components/ContactInfoForm';
import ReviewMemberInfo from '../components/ReviewMemberInfo';

const MemberRegistration = () => {
  const { user } = useAuth();

  const initialFormData = {
    churchId: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    relationshipStatus: '',
    category: '',
    memberStatus: '',
    profileImage: null,
    workOrSchool: '',
    levelOrPosition: '',
    programOrDepartment: '',
    phoneNumber: '',
    houseAddress: '',
    gpsAddress: '',
    emergencyContact: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyAddress: ''
  };

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState(initialFormData);
  const [churches, setChurches] = useState([]);


  useEffect(() => {
    const initializePage = async () => {
      // Wait for user to be loaded from context
      if (!user || !user.status) return;

      const userRole = user.status.toLowerCase();

      const dropdownRoles = ['manager', 'grouppastor', 'groupadmin'];
      const restrictedRoles = ['churchpastor', 'churchadmin'];


      if (dropdownRoles.includes(userRole)) {
        try {
          const response = await churchService.getChurches();
          const churchList = Array.isArray(response) ? response : (response.churches || response.data || []);
          setChurches(churchList);
        } catch (error) {
          console.error('Failed to load churches', error);
        }
      }

      else if (restrictedRoles.includes(userRole)) {
        if (user.churchId) {
          setFormData(prev => ({ ...prev, churchId: user.churchId }));
        }
      }
    };

    initializePage();
  }, [user]);


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (base64Image) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: base64Image
    }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);


  const handleSubmit = async () => {
    if (isLoading) return;

    // Ensure Church ID exists before sending
    if (!formData.churchId) {
      formData.churchId = user.churchId;
    }

    setIsLoading(true);

    try {
      const response = await memberService.addMember(formData);

      setFlash({
        message: response.message || 'Member registered successfully',
        type: 'success'
      });

      // Reset form to blank
      setFormData(initialFormData);

      const restrictedRoles = ['churchpastor', 'churchadmin'];
      if (user && restrictedRoles.includes(user.status?.toLowerCase()) && user.churchId) {
        setFormData(prev => ({ ...prev, churchId: user.churchId }));
      }

      setStep(1);
    } catch (err) {
      setFlash({
        message: err.response?.data?.message || 'Error registering member',
        type: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <FlashMessage
        message={flash.message}
        type={flash.type}
        onClose={() => setFlash({ message: '', type: '' })}
      />

      <h2 className="text-center mb-4">
        Member Registration
      </h2>

      <ProgressBar
        now={(step / 4) * 100}
        label={`Step ${step} of 4`}
        className="mb-4"
      />

      <Card className="shadow">
        <Card.Body>

          {step === 1 && (
            <PersonalInfoForm
              data={formData}
              onChange={handleChange}
              onImageChange={handleImageChange}
              onNext={nextStep}
              // Pass user and churches so the dropdown shows/hides correctly
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
              onSubmit={handleSubmit}
              onBack={prevStep}
              isLoading={isLoading}
            />
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default MemberRegistration;