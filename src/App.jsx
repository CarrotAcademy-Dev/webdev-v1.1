import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useColorMode } from '@chakra-ui/react';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import { ACCESS_GROUPS } from './utils/constants/accessControl';

// Lazy load pages for better performance
const Login = lazy(() => import('./components/Login'));
const OverviewPage = lazy(() => import('./pages/Staff/OverviewPage'));
const KpiDetailsPage = lazy(() => import('./pages/Staff/KpiDetailsPage'));
const AttendancePage = lazy(() => import('./pages/Staff/AttendancePage'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const DaftarKirimMerchPage = lazy(() => import('./pages/Staff/CSO/Bersama/DaftarKirimMerchPage'));
const DaftarSiswaTrialPage = lazy(() => import('./pages/Staff/CSO/Bersama/DaftarSiswaTrialPage'));
const DailyStoryPage = lazy(() => import('./pages/Staff/CSO/Bersama/DailyStoryPage'));
const DaftarOffboardingPage = lazy(() => import('./pages/Staff/CSO/Bersama/DaftarOffboardingPage'));
const PendaftaranFdPage = lazy(() => import('./pages/Staff/CSO/Bersama/PendaftaranFDPage'));
const LostNFoundPage = lazy(() => import('./pages/Staff/CSO/Bersama/LostNFound'));
const ProspektifMarcomPage = lazy(() => import('./pages/Staff/CSO/Bersama/ProspektifDariMarcom'));
const DaftarKelasTersediaPage = lazy(() => import('./pages/Staff/CSO/Bersama/DaftarKelasTersediaPage'));
const RekapJadwalMentorPage = lazy(() => import('./pages/Staff/CSO/Bersama/RekapJadwalMentorPage'));
const StatistikProspektifPage = lazy(() => import('./pages/Staff/CSO/Bersama/StatistikProspektifPage'));
const JanjiTemuPage = lazy(() => import('./pages/Staff/CSO/Bersama/JanjiTemuPage'));
const TicketExternalPage = lazy(() => import('./pages/Staff/CSO/Bersama/TicketExternalPage'));
const PendaftaranLanjutanPage = lazy(() => import('./pages/Staff/CSO/Bersama/PendaftaranLanjutanPage'));
const PartnershipPage = lazy(() => import('./pages/Staff/CSO/Bersama/PartnershipPage'));
const DashboardSiswaAktifPage = lazy(() => import('./pages/Staff/CSO/Bersama/DashboardSiswaAktifPage'));
const DashboardDailyPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardDailyPage'));
const DashboardInvoicePage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardInvoicePage'));
const DashboardPortfolioPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardPortfolioPage'));
const ReviewKaryawanPage = lazy(() => import('./pages/Staff/CSO/Personal/ReviewKaryawanPage'));
const RekapAbsensiPage = lazy(() => import('./pages/Staff/CSO/Personal/RekapAbsensiPage'));
const ProfilSiswaPage = lazy(() => import('./pages/Staff/CSO/Personal/ProfilSiswaPage'));
const ProspektifFormPage = lazy(() => import('./pages/Staff/CSO/Personal/ProspektifFormPage'));
const DashboardProspektifPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardProspektifPage'));
const DashboardReminderPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardReminder'));
const CreateTicketingPage = lazy(() => import('./pages/Staff/CSO/Personal/CreateTicketingPage'));
const TicketingInternalPage = lazy(() => import('./pages/Staff/CSO/Personal/TicketingInternal'));
const FdStudentIdentityPage = lazy(() => import('./pages/Staff/CSO/Personal/FdStudenIdentityPage'));
const TrackTicketFmePage = lazy(() => import('./pages/Staff/CSO/Personal/TrackTicketFmePage'));
const TrackTicketFmePageEso = lazy(() => import('./pages/Staff/ESO/Personal/TrackTicketFMe'));
const TicketingInternalPageEso = lazy(() => import('./pages/Staff/ESO/Personal/TicketingInternalPage'));
const CariDataStudentReportPage = lazy(() => import('./pages/Staff/ESO/Personal/CariDataStudentReportPage'));
const RegisterUserPage = lazy(() => import('./pages/Admin/RegisterUserPage'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));

function App() {
  const { colorMode } = useColorMode();
  
  // Set data-theme attribute on root element for styled components
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', colorMode);
  }
  
  return (
    <div data-theme={colorMode}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/home" 
          element={
            <ProtectedRoute>
              <Layout>
                <OverviewPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home/kpi" 
          element={
            <ProtectedRoute>
              <Layout>
                <KpiDetailsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute>
              <Layout>
                <AttendancePage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-tasks/daftar-kirim-merch" 
          element={
            <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
              <Layout>
                <DaftarKirimMerchPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-tasks/daftar-siswa-trial" 
          element={
            <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
              <Layout>
                <DaftarSiswaTrialPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route path='/my-tasks/daily-story' element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DailyStoryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/daftar-offboarding' element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DaftarOffboardingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/pendaftaranfd-course' element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <PendaftaranFdPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/lostnfound' element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <LostNFoundPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/prospektif-dari-marcom' element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <ProspektifMarcomPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/daftar-kelas-tersedia" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DaftarKelasTersediaPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/rekap-jadwal-mentor" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <RekapJadwalMentorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/statistik-prospektif" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <StatistikProspektifPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/janji-temu" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <JanjiTemuPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/ticket-external" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <TicketExternalPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/pendaftaran-lanjutan" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <PendaftaranLanjutanPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/partnership" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <PartnershipPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-siswa-aktif" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DashboardSiswaAktifPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-prospektif" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DashboardProspektifPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-reminder" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DashboardReminderPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-daily" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DashboardDailyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-invoice" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DashboardInvoicePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-portfolio" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <DashboardPortfolioPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/review-karyawan" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <ReviewKaryawanPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-karyawan" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <RekapAbsensiPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/profil-siswa" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <ProfilSiswaPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/prospektif-form" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <ProspektifFormPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/create-ticketing" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <CreateTicketingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/ticketing-internal" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <TicketingInternalPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="my-tasks/fd-student-identity" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <FdStudentIdentityPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="my-tasks/track-ticket-fme" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <TrackTicketFmePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* ESO Routes */}
        <Route path="eso/track-ticket-fme" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <TrackTicketFmePageEso />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="eso/ticketing-internal" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <TicketingInternalPageEso />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="eso/cari-data-student-report" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <CariDataStudentReportPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/register-user" element={
          <ProtectedRoute {...ACCESS_GROUPS.ADMIN_ONLY}>
            <Layout>
              <RegisterUserPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </div>
  );
}

export default App;