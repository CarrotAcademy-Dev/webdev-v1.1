import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/" state={{ from: location }} replace />; 
    }
    return children;
}
export default ProtectedRoute;