import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute component with role and jabatan-based access control
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of allowed roles (e.g., ['admin', 'super_admin'])
 * @param {string[]} props.allowedJabatan - Array of allowed jabatan (e.g., ['Customer Support Officer'])
 * @param {boolean} props.requireAny - If true, user needs EITHER role OR jabatan. If false, needs BOTH (default: true)
 */
function ProtectedRoute({ children, allowedRoles = [], allowedJabatan = [], requireAny = true }) {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();

    // Check if user is logged in
    if (!currentUser) {
        return <Navigate to="/" state={{ from: location }} replace />; 
    }

    // If no restrictions specified, allow access
    const hasRoleRestriction = allowedRoles.length > 0;
    const hasJabatanRestriction = allowedJabatan.length > 0;

    if (!hasRoleRestriction && !hasJabatanRestriction) {
        return children;
    }

    // Check role access
    const hasRoleAccess = hasRoleRestriction 
        ? allowedRoles.includes(currentUser.role)
        : true;

    // Check jabatan access
    const hasJabatanAccess = hasJabatanRestriction
        ? allowedJabatan.includes(currentUser.jabatan)
        : true;

    // Determine final access based on requireAny flag
    const hasAccess = requireAny
        ? (hasRoleAccess || hasJabatanAccess)
        : (hasRoleAccess && hasJabatanAccess);

    if (!hasAccess) {
        // Redirect to access denied or dashboard
        return <Navigate to="/access-denied" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;