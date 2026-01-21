
import { useAuth } from "../context/AuthContext";

const ROLE_LEVELS = {
  churchAdmin: 1,
  churchPastor: 2,
  groupAdmin: 3,
  groupPastor: 4,
  manager: 5,
};

const useAccessLevel = (requiredStatus) => {
  const { user } = useAuth();
  if (!user || !user.status) return false;

  const userRank = ROLE_LEVELS[user.status] ?? 0;
  const requiredRank = ROLE_LEVELS[requiredStatus] ?? 0;

  return userRank >= requiredRank;
};

export default useAccessLevel;

