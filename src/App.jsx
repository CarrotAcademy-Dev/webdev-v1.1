import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Lazy load pages for better performance
const Login = lazy(() => import('./components/Login'));
const OverviewPage = lazy(() => import('./pages/Staff/OverviewPage'));
const KpiDetailsPage = lazy(() => import('./pages/Staff/KpiDetailsPage'));
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
const DashboardProspektifPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardProspektifPage'));
const DashboardReminderPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardReminder'));
const CreateTicketingPage = lazy(() => import('./pages/Staff/CSO/Personal/CreateTicketingPage'));
const TicketingInternalPage = lazy(() => import('./pages/Staff/CSO/Personal/TicketingInternal'));
const FdStudentIdentityPage = lazy(() => import('./pages/Staff/CSO/Personal/FdStudenIdentityPage'));
const TrackTicketFmePage = lazy(() => import('./pages/Staff/CSO/Personal/TrackTicketFmePage'));

function App() {
  return (
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
          path="/my-tasks/daftar-kirim-merch" 
          element={
            <ProtectedRoute>
              <Layout>
                <DaftarKirimMerchPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-tasks/daftar-siswa-trial" 
          element={
            <ProtectedRoute>
              <Layout>
                <DaftarSiswaTrialPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route path='/my-tasks/daily-story' element={
          <ProtectedRoute>
            <Layout>
              <DailyStoryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/daftar-offboarding' element={
          <ProtectedRoute>
            <Layout>
              <DaftarOffboardingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/pendaftaranfd-course' element={
          <ProtectedRoute>
            <Layout>
              <PendaftaranFdPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/lostnfound' element={
          <ProtectedRoute>
            <Layout>
              <LostNFoundPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/my-tasks/prospektif-dari-marcom' element={
          <ProtectedRoute>
            <Layout>
              <ProspektifMarcomPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/daftar-kelas-tersedia" element={
          <ProtectedRoute>
            <Layout>
              <DaftarKelasTersediaPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/rekap-jadwal-mentor" element={
          <ProtectedRoute>
            <Layout>
              <RekapJadwalMentorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/statistik-prospektif" element={
          <ProtectedRoute>
            <Layout>
              <StatistikProspektifPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/janji-temu" element={
          <ProtectedRoute>
            <Layout>
              <JanjiTemuPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/ticket-external" element={
          <ProtectedRoute>
            <Layout>
              <TicketExternalPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/pendaftaran-lanjutan" element={
          <ProtectedRoute>
            <Layout>
              <PendaftaranLanjutanPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/partnership" element={
          <ProtectedRoute>
            <Layout>
              <PartnershipPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-siswa-aktif" element={
          <ProtectedRoute>
            <Layout>
              <DashboardSiswaAktifPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-prospektif" element={
          <ProtectedRoute>
            <Layout>
              <DashboardProspektifPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-reminder" element={
          <ProtectedRoute>
            <Layout>
              <DashboardReminderPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-daily" element={
          <ProtectedRoute>
            <Layout>
              <DashboardDailyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-invoice" element={
          <ProtectedRoute>
            <Layout>
              <DashboardInvoicePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-portfolio" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPortfolioPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/review-karyawan" element={
          <ProtectedRoute>
            <Layout>
              <ReviewKaryawanPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/dashboard-karyawan" element={
          <ProtectedRoute>
            <Layout>
              <RekapAbsensiPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/profil-siswa" element={
          <ProtectedRoute>
            <Layout>
              <ProfilSiswaPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/create-ticketing" element={
          <ProtectedRoute>
            <Layout>
              <CreateTicketingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/ticketing-internal" element={
          <ProtectedRoute>
            <Layout>
              <TicketingInternalPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="my-tasks/fd-student-identity" element={
          <ProtectedRoute>
            <Layout>
              <FdStudentIdentityPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="my-tasks/track-ticket-fme" element={
          <ProtectedRoute>
            <Layout>
              <TrackTicketFmePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;