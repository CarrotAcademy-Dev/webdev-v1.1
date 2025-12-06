// Prefetch utility to load routes on hover for faster navigation
const prefetchedRoutes = new Set();

export const prefetchRoute = (path) => {
  if (prefetchedRoutes.has(path)) return;
  
  prefetchedRoutes.add(path);
  
  // Dynamically import the route component
  switch (path) {
    case '/home':
      import('../pages/Staff/OverviewPage');
      break;
    case '/home/kpi':
      import('../pages/Staff/KpiDetailsPage');
      break;
    case '/my-tasks/daftar-kirim-merch':
      import('../pages/Staff/CSO/Bersama/DaftarKirimMerchPage');
      break;
    case '/my-tasks/daftar-siswa-trial':
      import('../pages/Staff/CSO/Bersama/DaftarSiswaTrialPage');
      break;
    case '/my-tasks/dashboard-siswa-aktif':
      import('../pages/Staff/CSO/Bersama/DashboardSiswaAktifPage');
      break;
    case '/my-tasks/dashboard-prospektif':
      import('../pages/Staff/CSO/Personal/DashboardProspektifPage');
      break;
    case '/my-tasks/track-ticket-fme':
      import('../pages/Staff/CSO/Personal/TrackTicketFmePage');
      break;
    // Add more routes as needed
    default:
      break;
  }
};

export const clearPrefetchCache = () => {
  prefetchedRoutes.clear();
};
