import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useColorMode } from '@chakra-ui/react';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import { ACCESS_GROUPS } from './utils/constants/accessControl';

// Lazy load pages for better performance
const Login = lazy(() => import('./components/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePassword'));
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
const CreateTicketingInternalPageEso = lazy(() => import('./pages/Staff/ESO/Personal/CreateTicketingInternalPage'));
const CariDataStudentReportPage = lazy(() => import('./pages/Staff/ESO/Personal/CariDataStudentReportPage'));
const DashboardFDPage = lazy(() => import('./pages/Staff/ESO/Personal/DashboardFDPage'));
const DashboardTicketingMentorPage = lazy(() => import('./pages/Staff/ESO/Personal/DashboardTicketingMentorPage'));
const FDIdentityPage = lazy(() => import('./pages/Staff/ESO/Personal/FDIdentityPage'));
const ReviewKaryawanPageEso = lazy(() => import('./pages/Staff/ESO/Personal/ReviewKaryawanPage'));
// ESO Bersama
const NomorUrutSertifikatPage = lazy(() => import('./pages/Staff/ESO/Bersama/NomorUrutSertifikatPage'));
const PendaftaranLanjutanPageEso = lazy(() => import('./pages/Staff/ESO/Bersama/PendaftaranLanjutanPage'));
const KelengkapanDataPage = lazy(() => import('./pages/Staff/ESO/Bersama/KelengkapanDataPage'));
const ArtworkOfTheMonthPage = lazy(() => import('./pages/Staff/ESO/Bersama/ArtworkOfTheMonthPage'));
const StudentReportPage = lazy(() => import('./pages/Staff/ESO/Bersama/StudentReportPage'));
const ProgressReportMonthlyPage = lazy(() => import('./pages/Staff/ESO/Bersama/ProgressReportMonthlyPage'));
const CariNamaMonthlyPage = lazy(() => import('./pages/Staff/ESO/Bersama/CariNamaMonthlyPage'));
const DaftarOffboardingPageEso = lazy(() => import('./pages/Staff/ESO/Bersama/DaftarOffboardingPage'));
const TicketExternalPageEso = lazy(() => import('./pages/Staff/ESO/Bersama/TicketExternalPage'));
// Finance
const ApprovalPendaftaranPage = lazy(() => import('./pages/Staff/Finance/Bersama/ApprovalPendaftaranPage'));
const DaftarHargaPage = lazy(() => import('./pages/Staff/Finance/Bersama/DaftarHargaPage'));
const DataBKMPage = lazy(() => import('./pages/Staff/Finance/Bersama/DataBKMPage'));
const BuktiPembayaranPage = lazy(() => import('./pages/Staff/Finance/Bersama/BuktiPembayaranPage'));
const TagihanPage = lazy(() => import('./pages/Staff/Finance/Bersama/TagihanPage'));
const DaftarOffboardingFinancePage = lazy(() => import('./pages/Staff/Finance/Bersama/DaftarOffboardingPage'));
const PendaftaranFulltimeCoursePage = lazy(() => import('./pages/Staff/Finance/Bersama/PendaftaranFulltimeCoursePage'));
const DaftarKirimMerchFinancePage = lazy(() => import('./pages/Staff/Finance/Bersama/DaftarKirimMerchFinancePage'));
const TicketExternalFinancePage = lazy(() => import('./pages/Staff/Finance/Bersama/TicketExternalFinancePage'));
const DaftarHargaPersonalPage = lazy(() => import('./pages/Staff/Finance/Personal/DaftarHargaPage'));
const TicketingInternalFinancePage = lazy(() => import('./pages/Staff/Finance/Personal/TicketingInternalPage'));
const TrackTicketFromMePage = lazy(() => import('./pages/Staff/Finance/Personal/TrackTicketFromMePaage'));
const ReviewKaryawanFinPage = lazy(() => import('./pages/Staff/Finance/Personal/ReviewKaryawanPage'));
const StatistikTagihanPage = lazy(() => import('./pages/Staff/Finance/Personal/StatistikTagihanPage'));
const DashboardPendapatanPage = lazy(() => import('./pages/Staff/Finance/Personal/DashboardPendapatanPage'));
const ProfileSiswaPage = lazy(() => import('./pages/Staff/Finance/Personal/ProfileSiswaPage'));
// HR Recruitment
const DashboardReportPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/DashboardReport'));
const JamKerjaPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/JamKerja'));
const TugasInterviewPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/TugasInterview'));
const HasilResponseTestKandidatPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/HasilResponseKandidat'));
const ApplicantDataPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/ApplicantData'));
const HumanResourceRequestsPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/HumanResourceRequests'));
const PenilaianKandidatPage = lazy(() => import('./pages/Staff/HRGA/HRRecruitmen/PenilaianKandidat'));
// HRGA Asset
const AssetDataPage = lazy(() => import('./pages/Staff/HRGA/Asset/AssetPage'));
const DashboardAssetPage = lazy(() => import('./pages/Staff/HRGA/Asset/DashboardAssetPage'));
const DailyAssetPage = lazy(() => import('./pages/Staff/HRGA/Asset/DailyAssetPage'));
const PenyusutanPage = lazy(() => import('./pages/Staff/HRGA/Asset/PenyusutanPage'));
const ServicesPage = lazy(() => import('./pages/Staff/HRGA/Asset/ServicesPage'));
const MaintenancePage = lazy(() => import('./pages/Staff/HRGA/Asset/MaintenancePage'));
const PeminjamanBarangPage = lazy(() => import('./pages/Staff/HRGA/Asset/PeminjamanBarang'));
const DetailBarangPage = lazy(() => import('./pages/Staff/HRGA/Asset/DetailBarangPage'));
const AssetHistoryPage = lazy(() => import('./pages/Staff/HRGA/Asset/AssetHistoryPage'));

// Admin & Other
const RegisterUserPage = lazy(() => import('./pages/Admin/RegisterUserPage'));
const PayslipPage = lazy(() => import('./pages/Staff/PayslipPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));

function App() {
  const { colorMode } = useColorMode();
  
  // Set data-theme attribute on root element for styled components
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', colorMode);
  }
  
  return (
    <ErrorBoundary>
      <div data-theme={colorMode}>
        <Suspense fallback={<Loading />}>
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route 
            path="/update-password" 
            element={
              <ProtectedRoute>
                <UpdatePasswordPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />
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
          path="/payslip" 
          element={
            <ProtectedRoute>
              <Layout>
                <PayslipPage />
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
        <Route path="/my-tasks/fd-student-identity" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <FdStudentIdentityPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-tasks/track-ticket-fme" element={
          <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
              <TrackTicketFmePage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* ESO Routes */}
        {/* ESO Bersama */}
        <Route path="/eso/nomor-urut-sertifikat" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <NomorUrutSertifikatPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/pendaftaran-lanjutan" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <PendaftaranLanjutanPageEso />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/kelengkapan-data" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <KelengkapanDataPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/artwork-of-the-month" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <ArtworkOfTheMonthPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/student-report" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <StudentReportPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/progress-report-monthly" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <ProgressReportMonthlyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/cari-nama-monthly" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <CariNamaMonthlyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/daftar-offboarding" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <DaftarOffboardingPageEso />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/eso/ticket-external" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <TicketExternalPageEso />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* ESO Personal */}
        <Route path="/eso/track-ticket-fme" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <TrackTicketFmePageEso />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/eso/ticketing-internal" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <TicketingInternalPageEso />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/eso/create-ticketing-internal" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <CreateTicketingInternalPageEso />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/eso/cari-data-student-report" element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <CariDataStudentReportPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path='/eso/dashboard-fulltime' element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <DashboardFDPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/eso/dashboard-ticketing-mentor' element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <DashboardTicketingMentorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/eso/fd-identity' element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <FDIdentityPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/eso/review-karyawan' element={
          <ProtectedRoute {...ACCESS_GROUPS.ESO_OR_ADMIN}>
            <Layout>
              <ReviewKaryawanPageEso />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Finance Routes */}
        <Route path="/finance/approval-pendaftaran" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <ApprovalPendaftaranPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/daftar-harga" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <DaftarHargaPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/data-bkm" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <DataBKMPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/bukti-pembayaran" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <BuktiPembayaranPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/tagihan" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <TagihanPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/daftar-offboarding" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <DaftarOffboardingFinancePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/pendaftaran-fulltime" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <PendaftaranFulltimeCoursePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/ticket-external" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <TicketExternalFinancePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/track-ticket-from-me" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <TrackTicketFromMePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/daftar-kirim-merch" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <DaftarKirimMerchFinancePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/ticketing-internal" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <TicketingInternalFinancePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/daftar-harga-personal" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <DaftarHargaPersonalPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/review-karyawan" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <ReviewKaryawanFinPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/statistik-tagihan" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <StatistikTagihanPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/dashboard-pendapatan" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <DashboardPendapatanPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/profile-siswa" element={
          <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
              <ProfileSiswaPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/dashboard-report" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <DashboardReportPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/jam-kerja" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <JamKerjaPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/tugas-interview" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <TugasInterviewPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/hasil-response-test-kandidat" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <HasilResponseTestKandidatPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/applicant-data" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <ApplicantDataPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/human-resource-requests" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <HumanResourceRequestsPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/penilaian-kandidat" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <PenilaianKandidatPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/asset-data" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <AssetDataPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/dashboard-asset" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <DashboardAssetPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/daily-asset" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <DailyAssetPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/penyusutan" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <PenyusutanPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/services" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <ServicesPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/maintenance" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <MaintenancePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/peminjaman-barang" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <PeminjamanBarangPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/detail-barang" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <DetailBarangPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/hrga/asset-history" element={
          <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
              <AssetHistoryPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
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
    </ErrorBoundary>
  );
}

export default App;