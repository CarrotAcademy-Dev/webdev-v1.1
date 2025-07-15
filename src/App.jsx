import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import OverviewPage from './pages/Staff/OverviewPage';
import Login from './components/Login';
import KpiDetailsPage from './pages/Staff/KpiDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFound';
import ProspectivePage from './pages/Staff/CSO/Personal/ProspectivePage';
import DaftarKirimMerchPage from './pages/Staff/CSO/Bersama/DaftarKirimMerchPage';
import DaftarSiswaTrialPage from './pages/Staff/CSO/Bersama/DaftarSiswaTrialPage';
import DailyStoryPage from './pages/Staff/CSO/Bersama/DailyStoryPage';
import DaftarOffboardingPage from './pages/Staff/CSO/Bersama/DaftarOffboardingPage';
import PendaftaranFdPage from './pages/Staff/CSO/Bersama/PendaftaranFDPage';
import LostNFoundPage from './pages/Staff/CSO/Bersama/LostNFound';
import ProspektifMarcomPage from './pages/Staff/CSO/Bersama/ProspektifDariMarcom';
import DaftarKelasTersediaPage from './pages/Staff/CSO/Bersama/DaftarKelasTersediaPage';
import RekapJadwalMentorPage from './pages/Staff/CSO/Bersama/RekapJadwalMentorPage';
import StatistikProspektifPage from './pages/Staff/CSO/Bersama/StatistikProspektifPage';
import JanjiTemuPage from './pages/Staff/CSO/Bersama/JanjiTemuPage';
import TicketExternalPage from './pages/Staff/CSO/Bersama/TicketExternalPage';
import PendaftaranLanjutanPage from './pages/Staff/CSO/Bersama/PendaftaranLanjutanPage';

function App() {
  return (
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
        path="/my-tasks/prospective" 
        element={
          <ProtectedRoute>
            <Layout>
              <ProspectivePage />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;