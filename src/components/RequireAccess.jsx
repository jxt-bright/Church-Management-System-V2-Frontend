import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import useAccessLevel from "../hooks/useAccessLevel.js";


const RequireAccess = ({ minStatus, children, redirectTo = "/login" }) => {
    const { user, loading } = useAuth();
    const canAccess = useAccessLevel(minStatus);

    // Wait for AuthContext to restore the session from the refresh token
    if (loading) {
        return null;
    }

    if (!user || !canAccess) return;

    // User is authorized
    return children;
};






const ProtectedRoute = ({ minStatus, children, redirectTo = "/" }) => {
    const { user, loading } = useAuth();
    const canAccess = useAccessLevel(minStatus);

    // Wait for AuthContext to restore the session from the refresh token
    if (loading) {
        return null;
    }

    // If no user is logged in, or they don't have the required status
    if (!user || !canAccess) {
        // 'replace' prevents the user from hitting "back" to return to this spot
        return <Navigate to={redirectTo} replace />;
    }

    // User is authorized
    return children;
};



export {
    RequireAccess,
    ProtectedRoute
}
