/**
 * Navigation Configuration
 * Single source of truth for all menu items and navigation
 * 
 * Benefits:
 * - Centralized menu management
 * - Built-in RBAC support
 * - Easy to add new divisions (Finance, Marcom, etc.)
 * - Consistent menu structure across Navbar and Sidebar
 * - Type-safe menu definitions
 */

import { 
  FiHome, FiTrendingUp, FiCheckSquare, FiBriefcase, 
  FiUser, FiSettings, FiCreditCard, FiUserPlus 
} from 'react-icons/fi';
import { PiSuitcaseBold } from 'react-icons/pi';
import { ACCESS_GROUPS, JABATAN } from '@/utils/constants/accessControl';

/**
 * Check if user has access to a menu item
 * @param {Object} user - Current user object
 * @param {Object} access - Access configuration (allowedRoles, allowedJabatan, requireAny)
 * @returns {boolean}
 */
export const checkMenuAccess = (user, access) => {
  if (!user) return false;
  if (!access) return true; // No access restriction

  const { allowedRoles = [], allowedJabatan = [], requireAny = true } = access;

  // If no restrictions specified, allow access
  if (allowedRoles.length === 0 && allowedJabatan.length === 0) return true;

  const hasRoleAccess = allowedRoles.length > 0 
    ? allowedRoles.includes(user.role)
    : true;

  const hasJabatanAccess = allowedJabatan.length > 0
    ? allowedJabatan.includes(user.jabatan)
    : true;

  // requireAny: true = OR logic (role OR jabatan)
  // requireAny: false = AND logic (role AND jabatan)
  return requireAny
    ? (hasRoleAccess || hasJabatanAccess)
    : (hasRoleAccess && hasJabatanAccess);
};

/**
 * Filter menu items based on user access
 * @param {Array} items - Menu items to filter
 * @param {Object} user - Current user object
 * @returns {Array} Filtered menu items
 */
export const filterMenuItems = (items, user) => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    // Check if user has access to this item
    if (item.access && !checkMenuAccess(user, item.access)) {
      return false;
    }

    // Recursively filter child items if exists
    if (item.items) {
      item.items = filterMenuItems(item.items, user);
      // Hide category if all children are filtered out
      return item.items.length > 0;
    }

    // Recursively filter categories if exists
    if (item.categories) {
      item.categories = item.categories
        .map(cat => ({
          ...cat,
          items: filterMenuItems(cat.items, user)
        }))
        .filter(cat => cat.items.length > 0);
      // Hide section if all categories are filtered out
      return item.categories.length > 0;
    }

    return true;
  });
};

/**
 * Main Navigation Configuration
 */
export const NAVIGATION_CONFIG = {
  /**
   * Common sections (available to all authenticated users)
   */
  common: [
    {
      id: 'home',
      title: 'Home',
      icon: <FiHome />,
      path: '/home',
      items: [
        { 
          label: 'Overview', 
          path: '/home', 
          icon: <FiTrendingUp />,
          description: 'Dashboard overview'
        },
        { 
          label: 'Attendance', 
          path: '/attendance', 
          icon: <FiCheckSquare />,
          description: 'Mark daily attendance'
        },
        { 
          label: 'KPI Details', 
          path: '/home/kpi', 
          icon: <FiBriefcase />,
          description: 'View KPI metrics'
        },
        { 
          label: 'Leave Request', 
          path: '/leave-request', 
          icon: <FiBriefcase />,
          description: 'Submit leave requests'
        },
      ]
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: <FiUser />,
      items: [
        { label: 'My Profile', path: '/profile', icon: <FiUser /> },
        { label: 'Payslip', path: '/payslip', icon: <FiCreditCard /> },
        { label: 'Settings', path: '/settings', icon: <FiSettings /> },
      ]
    }
  ],

  /**
   * Division-specific sections
   */
  divisions: {
    /**
     * CSO (Customer Support Officer)
     */
    cso: {
      id: 'cso',
      title: 'CSO Tasks',
      icon: <PiSuitcaseBold />,
      access: ACCESS_GROUPS.CSO_OR_ADMIN,
      basePath: '/my-tasks',
      categories: [
        {
          name: 'Bersama',
          items: [
            { label: 'Statistik Prospektif', path: '/my-tasks/statistik-prospektif' },
            { label: 'Rekap Jadwal Mentor', path: '/my-tasks/rekap-jadwal-mentor' },
            { label: 'Daftar Kelas Tersedia', path: '/my-tasks/daftar-kelas-tersedia' },
            { label: 'Daftar Kirim Merchandise', path: '/my-tasks/daftar-kirim-merch' },
            { label: 'Daftar Siswa Trial', path: '/my-tasks/daftar-siswa-trial' },
            { label: 'Daftar Offboarding', path: '/my-tasks/daftar-offboarding' },
            { label: 'Daily Story', path: '/my-tasks/daily-story' },
            { label: 'Janji Temu', path: '/my-tasks/janji-temu' },
            { label: 'Ticket External', path: '/my-tasks/ticket-external' },
            { label: 'Pendaftaran Lanjutan', path: '/my-tasks/pendaftaran-lanjutan' },
            { label: 'Pendaftaran Fulltime Course', path: '/my-tasks/pendaftaranfd-course' },
            { label: 'Lost And Found', path: '/my-tasks/lostnfound' },
            { label: 'Prospektif Dari Marcom', path: '/my-tasks/prospektif-dari-marcom' },
            { label: 'Partnership', path: '/my-tasks/partnership' },
            { label: 'Dashboard Siswa Aktif', path: '/my-tasks/dashboard-siswa-aktif' },
          ]
        },
        {
          name: 'Personal',
          items: [
            { label: 'Prospektif Form', path: '/my-tasks/prospektif-form' },
            { label: 'Dashboard Prospektif', path: '/my-tasks/dashboard-prospektif' },
            { label: 'Dashboard Reminder', path: '/my-tasks/dashboard-reminder' },
            { label: 'Dashboard Daily', path: '/my-tasks/dashboard-daily' },
            { label: 'Dashboard Invoice', path: '/my-tasks/dashboard-invoice' },
            { label: 'Dashboard Portfolio', path: '/my-tasks/dashboard-portfolio' },
            { label: 'FD Student Identity', path: '/my-tasks/fd-student-identity' },
            { label: 'Profil Siswa', path: '/my-tasks/profil-siswa' },
            { label: 'Create Ticketing', path: '/my-tasks/create-ticketing' },
            { label: 'Ticketing Internal', path: '/my-tasks/ticketing-internal' },
            { label: 'Track Ticket From Me', path: '/my-tasks/track-ticket-fme' },
            { label: 'Review Karyawan', path: '/my-tasks/review-karyawan' },
            { label: 'Dashboard Karyawan', path: '/my-tasks/dashboard-karyawan' },
          ]
        }
      ]
    },

    /**
     * ESO (Education Support Officer)
     */
    eso: {
      id: 'eso',
      title: 'ESO Tasks',
      icon: <PiSuitcaseBold />,
      access: ACCESS_GROUPS.ESO_OR_ADMIN,
      basePath: '/eso',
      categories: [
        {
          name: 'Bersama',
          items: [
            { label: 'Nomor Urut Sertifikat', path: '/eso/nomor-urut-sertifikat' },
            { label: 'Pendaftaran Lanjutan', path: '/eso/pendaftaran-lanjutan' },
            { label: 'Kelengkapan Data', path: '/eso/kelengkapan-data' },
            { label: 'Artwork of The Month', path: '/eso/artwork-of-the-month' },
            { label: 'Student Report', path: '/eso/student-report' },
            { label: 'Progress Report Monthly', path: '/eso/progress-report-monthly' },
            { label: 'Cari Nama Monthly', path: '/eso/cari-nama-monthly' },
            { label: 'Daftar Offboarding', path: '/eso/daftar-offboarding' },
            { label: 'Ticketing External', path: '/eso/ticket-external' },
          ]
        },
        {
          name: 'Personal',
          items: [
            { label: 'Dashboard Full-Time', path: '/eso/dashboard-fulltime' },
            { label: 'Dashboard Ticketing Mentor', path: '/eso/dashboard-ticketing-mentor' },
            { label: 'FD Identity', path: '/eso/fd-identity' },
            { label: 'Review Karyawan', path: '/eso/review-karyawan' },
            { label: 'Create Ticketing Internal', path: '/eso/create-ticketing-internal' },
            { label: 'Track Ticket From Me', path: '/eso/track-ticket-fme' },
            { label: 'Ticketing Internal', path: '/eso/ticketing-internal' },
            { label: 'Cari Data Student Report', path: '/eso/cari-data-student-report' },
          ]
        }
      ]
    },

    /**
     * Finance Division
     */
    finance: {
      id: 'finance',
      title: 'Finance',
      icon: <FiCreditCard />,
      access: {
        allowedRoles: ['admin', 'super_admin'],
        allowedJabatan: [JABATAN.FINANCE],
        requireAny: true
      },
      basePath: '/finance',
      categories: [
        {
          name: 'Bersama',
          items: [
            { label: 'Approval Pendaftaran', path: '/finance/approval-pendaftaran' },
            { label: 'Daftar Harga', path: '/finance/daftar-harga' },
            { label: 'Daftar Diskon', path: '/finance/daftar-diskon' },
            { label: 'Bukti Pembayaran', path: '/finance/bukti-pembayaran' },
            { label: 'Pendaftaran Fulltime', path: '/finance/pendaftaran-fulltime' },
            { label: 'Daftar Offboarding', path: '/finance/daftar-offboarding' },
            { label: 'Data BKM', path: '/finance/data-bkm' },
          ]
        },
        {
          name: 'Personal',
          items: [
            { label: 'Tagihan Siswa', path: '/finance/tagihan-siswa' },
          ]
        }
      ]
    }
  },

  /**
   * Admin section (only for admin users)
   */
  admin: {
    id: 'admin',
    title: 'Admin',
    icon: <FiUserPlus />,
    access: ACCESS_GROUPS.ADMIN_ONLY,
    items: [
      { label: 'Register User', path: '/admin/register', icon: <FiUserPlus /> },
      // Add more admin items here
    ]
  }
};

/**
 * Get navigation menu for specific user
 * @param {Object} user - Current user object
 * @returns {Object} Filtered navigation config
 */
export const getNavigationForUser = (user) => {
  if (!user) return { common: [], divisions: {}, admin: null };

  const config = {
    common: filterMenuItems(NAVIGATION_CONFIG.common, user),
    divisions: {},
    admin: null
  };

  // Filter divisions
  Object.entries(NAVIGATION_CONFIG.divisions).forEach(([key, division]) => {
    if (checkMenuAccess(user, division.access)) {
      config.divisions[key] = {
        ...division,
        categories: division.categories
          .map(cat => ({
            ...cat,
            items: filterMenuItems(cat.items, user)
          }))
          .filter(cat => cat.items.length > 0)
      };
    }
  });

  // Filter admin section
  if (checkMenuAccess(user, NAVIGATION_CONFIG.admin.access)) {
    config.admin = {
      ...NAVIGATION_CONFIG.admin,
      items: filterMenuItems(NAVIGATION_CONFIG.admin.items, user)
    };
  }

  return config;
};

/**
 * Get current active section based on pathname
 * @param {string} pathname - Current path
 * @returns {string|null} Section ID
 */
export const getActiveSection = (pathname) => {
  if (pathname.startsWith('/my-tasks')) return 'cso';
  if (pathname.startsWith('/eso')) return 'eso';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/profile') || pathname.startsWith('/payslip') || pathname.startsWith('/settings')) return 'profile';
  if (pathname === '/home' || pathname.startsWith('/attendance') || pathname.startsWith('/leave-request') || pathname.startsWith('/home/kpi')) return 'home';
  return null;
};

/**
 * Example usage in Sidebar component:
 * 
 * import { getNavigationForUser, getActiveSection } from '@/config/navigation.config';
 * 
 * function Sidebar({ user }) {
 *   const location = useLocation();
 *   const navigation = getNavigationForUser(user);
 *   const activeSection = getActiveSection(location.pathname);
 *   
 *   // Render common menus
 *   navigation.common.map(section => ...)
 *   
 *   // Render division menus
 *   Object.values(navigation.divisions).map(division => ...)
 *   
 *   // Render admin menu
 *   if (navigation.admin) { ... }
 * }
 */
