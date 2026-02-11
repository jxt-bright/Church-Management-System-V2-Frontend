
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Layout from "./components/Layout";
import { ProtectedRoute } from './components/RequireAccess.jsx';

// Import Pages
import Login from './pages/Login.jsx';
import ResetPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import MemberRegistration from './pages/MemberRegistration';
import AddGroup from './pages/AddGroup.jsx';
import AddChurch from './pages/AddChurch.jsx';
import AddUser from './pages/AddUser.jsx';
import Members from './pages/Members.jsx';
import Groups from './pages/Groups.jsx';
import Churches from './pages/Churches.jsx';
import Users from './pages/Users.jsx';
import MemberDetails from './pages/MemberDetails.jsx';
import EditGroup from './pages/EditGroup.jsx';
import EditChurch from './pages/EditChurch.jsx';
import EditUser from './pages/EditUser.jsx';
import EditMember from './pages/EditMember.jsx';
import Attendance from './pages/Attendance.jsx';
import AddSpecialService from './pages/AddSpecialService.jsx';
import SpecialServices from './pages/SpecialServices.jsx';



const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/resetpassword" element={<ResetPassword />} />

            {/* --- Protected Routes --- */}

            <Route path="/home" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <Home /> </Layout>
                </ProtectedRoute>
            } />

            {/* Registration Routes */}
            <Route path="/addgroup" element={
                <ProtectedRoute minStatus="manager">
                    <Layout> <AddGroup /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/addchurch" element={
                <ProtectedRoute minStatus="groupAdmin">
                    <Layout> <AddChurch /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/addmember" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <MemberRegistration /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/adduser" element={
                <ProtectedRoute minStatus="churchPastor">
                    <Layout> <AddUser /> </Layout>
                </ProtectedRoute>
            } />

            {/* View Routes */}
            <Route path="/members" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <Members /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/groups" element={
                <ProtectedRoute minStatus="manager">
                    <Layout> <Groups /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/churches" element={
                <ProtectedRoute minStatus="groupAdmin">
                    <Layout> <Churches /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/users" element={
                <ProtectedRoute minStatus="churchPastor">
                    <Layout> <Users /> </Layout>
                </ProtectedRoute>
            } />

            {/* Details & Edit Routes */}
            <Route path="/member/:id" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <MemberDetails /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/group/edit/:id" element={
                <ProtectedRoute minStatus="manager">
                    <Layout> <EditGroup /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/church/edit/:id" element={
                <ProtectedRoute minStatus="groupAdmin">
                    <Layout> <EditChurch /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/user/edit/:id" element={
                <ProtectedRoute minStatus="churchPastor">
                    <Layout> <EditUser /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/member/edit/:id" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <EditMember /> </Layout>
                </ProtectedRoute>
            } />

            {/* Service & Attendance Records */}
            <Route path="/attendance" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <Attendance /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/addspecialservice" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <AddSpecialService /> </Layout>
                </ProtectedRoute>
            } />
            <Route path="/specialservices" element={
                <ProtectedRoute minStatus="churchAdmin">
                    <Layout> <SpecialServices /> </Layout>
                </ProtectedRoute>
            } />

            {/* Fallback - Redirect to Login if path not found */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
