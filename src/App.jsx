import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Layout from "./components/Layout";
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Import Pages
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ForgotPassword'
import Home from './pages/Home';
import MemberRegistration from './pages/MemberRegistration'
import AddGroup from './pages/AddGroup.jsx';
import AddChurch from './pages/AddChurch.jsx';
import AddUser from './pages/AddUser.jsx';
import Members from './pages/Members.jsx'
import Groups from './pages/Groups.jsx'
import Churches from './pages/Churches.jsx'
import Users from './pages/Users.jsx'
import MemberDetails from './pages/MemberDetails.jsx'
import EditGroup from './pages/EditGroup.jsx'
import EditChurch from './pages/EditChurch.jsx'
import EditUser from './pages/EditUser.jsx'
import EditMember from './pages/EditMember.jsx'
import Attendance from './pages/Attendance.jsx'




const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/resetpassword" element={<ResetPassword />} />

                <Route path="/home" element={ <Layout> <Home /> </Layout> } />
                <Route path="/addgroup" element={ <Layout> <AddGroup /> </Layout> } />
                <Route path="/addchurch" element={ <Layout> <AddChurch /> </Layout> } />
                <Route path="/addmember" element={ <Layout> <MemberRegistration /> </Layout> } />
                <Route path="/adduser" element={ <Layout> <AddUser /> </Layout> } />
                <Route path="/members" element={ <Layout> <Members /> </Layout> } />
                <Route path="/groups" element={ <Layout> <Groups /> </Layout> } />
                <Route path="/churches" element={ <Layout> <Churches /> </Layout> } />
                <Route path="/users" element={ <Layout> <Users /> </Layout> } />
                <Route path="/member/:id" element={ <Layout> <MemberDetails /> </Layout> } />
                <Route path="/group/edit/:id" element={ <Layout> <EditGroup /> </Layout> } />
                <Route path="/church/edit/:id" element={ <Layout> <EditChurch /> </Layout> } />
                <Route path="/user/edit/:id" element={ <Layout> <EditUser /> </Layout> } />
                <Route path="/member/edit/:id" element={ <Layout> <EditMember /> </Layout> } />
                <Route path="/attendance" element={ <Layout> <Attendance /> </Layout> } />
            </Routes>
        </>
    )
}

export default App
