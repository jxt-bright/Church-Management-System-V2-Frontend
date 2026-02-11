// import { useAuth } from "../context/AuthContext.jsx";
// import useAccessLevel from "../hooks/useAccessLevel.js";
// import { useNavigate } from "react-router-dom";



// const RequireAccess = ({ minStatus, children, redirectTo = "/login" }) => {
//     // const navigate = useNavigate();
//     // const { user } = useAuth();
//     const canAccess = useAccessLevel(minStatus);

//     if (!canAccess) return;

//     // User is authorized
//     return children;
// };

// export default RequireAccess;




import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import useAccessLevel from "../hooks/useAccessLevel.js";

const RequireAccess = ({ minStatus, children, redirectTo = "/" }) => {
    const { user, loading } = useAuth();
    const canAccess = useAccessLevel(minStatus);

    // 1. Wait for AuthContext to restore the session from the refresh token
    if (loading) {
        return null; // Or a loading spinner
    }

    // 2. If no user is logged in, or they don't have the required status
    if (!user || !canAccess) {
        // 'replace' prevents the user from hitting "back" to return to this spot
        return <Navigate to={redirectTo} replace />;
    }

    // 3. User is authorized
    return children;
};

export default RequireAccess;

