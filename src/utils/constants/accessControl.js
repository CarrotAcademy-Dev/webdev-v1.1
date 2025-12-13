// Role-based access constants

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    STAFF: 'staff'
};

export const JABATAN = {
    CSO: 'Customer Support Officer',
    ESO: 'Education Support Officer', 
    FINANCE: 'Finance Accounting',
    IT: 'IT Developer',
    MARCOM: 'Marketing Communications Spesialist',
    MENTOR: 'Illustation Drawing Teacher',
    INTERN: 'Intern',
    OPERATION: 'Operation Director',
    EDU: 'Education Director',
    HRGA: 'HR&GA Officer',
    SMS: 'Social Media Specialist',
    OB: 'Office Boy'
    // Add more jabatan as needed
};

// Access control groups
export const ACCESS_GROUPS = {
    ADMIN_ONLY: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
    },
    SUPER_ADMIN_ONLY: {
        allowedRoles: [ROLES.SUPER_ADMIN]
    },
    CSO_ONLY: {
        allowedJabatan: [JABATAN.CSO]
    },
    ESO_ONLY: {
        allowedJabatan: [JABATAN.ESO]
    },
    FINANCE_ONLY: {
        allowedJabatan: [JABATAN.FINANCE]
    },
    // Admin can also access CSO pages
    CSO_OR_ADMIN: {
        allowedJabatan: [JABATAN.CSO],
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        requireAny: true
    }
};
