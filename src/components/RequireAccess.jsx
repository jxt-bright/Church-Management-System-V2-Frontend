import { useAuth } from "../context/AuthContext.jsx";
import useAccessLevel from "../hooks/useAccessLevel.js";
import { useNavigate } from "react-router-dom";



const RequireAccess = ({ minStatus, children, redirectTo = "/login" }) => {
    // const navigate = useNavigate();
    // const { user } = useAuth();
    const canAccess = useAccessLevel(minStatus);

    if (!canAccess) return;

    // User is authorized
    return children;
};

export default RequireAccess;

