import React, { useContext } from 'react';
import { Badge, Progress } from '@chakra-ui/react';
import { 
    FiUser, 
    FiBriefcase, 
    FiDollarSign, 
    FiMapPin,
    FiCalendar,
    FiClock,
    FiFileText,
    FiExternalLink,
    FiPhone,
    FiMail,
    FiHome
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import StyledProfilePage from './Profile.Styled';
import { formatDate } from '@/utils/formatters';

function Profile() {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    // Helper functions
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';
        // Format: 0822-8775-7067 atau raw number
        return phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
    };

    const calculateWorkDuration = (startDate) => {
        if (!startDate) return { years: 0, months: 0, days: 0, text: '-' };
        
        const start = new Date(startDate);
        const now = new Date();
        
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();
        
        if (days < 0) {
            months--;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        return {
            years,
            months,
            days,
            text: `${years} TAHUN ${months} BULAN ${days} HARI`
        };
    };

    const calculateContractProgress = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        
        const total = end - start;
        const elapsed = now - start;
        
        const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);
        return Math.round(percentage * 10) / 10; // Round to 1 decimal
    };

    const calculateRemainingDays = (endDate) => {
        if (!endDate) return 0;
        
        const end = new Date(endDate);
        const now = new Date();
        
        const diff = end - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        return Math.max(days, 0);
    };

    const formatDocumentLink = (link) => {
        if (!link) return null;
        // Convert Google Drive view link to preview link
        if (link.includes('drive.google.com')) {
            const fileId = link.match(/\/d\/([^/]+)/)?.[1] || link.match(/id=([^&]+)/)?.[1];
            if (fileId) {
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }
        return link;
    };

    // Data extraction with fallback
    const profile = {
        // Basic
        nama: currentUser.nama || currentUser['Nama Karyawan'] || '-',
        email: currentUser.Email || '-',
        idKaryawan: currentUser.id_karyawan || currentUser['ID Karyawan'] || '-',
        jabatan: currentUser.jabatan || currentUser.Jabatan || currentUser['Nama Jabatan Sekarang'] || '-',
        divisi: currentUser['Divisi'] || '-',
        level: currentUser.Level || '-',
        status: currentUser.Status || 'Full Time',
        
        // Personal
        jenisKelamin: currentUser.jenisKelamin || currentUser['Jenis Kelamin'] || '-',
        tanggalLahir: currentUser['Tanggal Lahir'],
        agama: currentUser.Agama || '-',
        statusKawin: currentUser['Status Kawin'] || '-',
        jumlahAnak: currentUser['Jumlah Anak'] || 0,
        
        // Contact
        noTelp: currentUser['No Telp'] || currentUser.noTelp || '-',
        alamatKTP: currentUser['Alamat KTP'] || '-',
        domisili: currentUser.Domisili || '-',
        
        // Employment
        tanggalMasuk: currentUser['Tanggal Masuk'],
        tanggalSelesaiKontrak: currentUser['Tanggal Selesai Kontrak'],
        tanggalSelesaiProbation: currentUser['Tanggal Selesai Probation'],
        masaKerja: currentUser['Masa Kerja'] || '-',
        jatahCuti: currentUser['Jatah Cuti'] || 0,
        
        // Financial
        nik: currentUser['No. KTP'] || '-',
        npwp: currentUser.NPWP || '-',
        akunBank: currentUser['Akun Bank'] || '-',
        noRekening: currentUser['No Rekening'] || '-',
        
        // Documents
        fotoKTP: currentUser['Foto KTP'],
        fotoKK: currentUser['Foto Kartu Keluarga'],
        fotoNPWP: currentUser['Foto NPWP'],
        
        // Other
        codeName: currentUser.codeName || '-',
        jamMasuk: currentUser['Jam Masuk'],
        note: currentUser.Note || '',
        aktif: currentUser['Aktif/Tidak Aktif'] || currentUser.aktif
    };

    const workDuration = calculateWorkDuration(profile.tanggalMasuk);
    const contractProgress = calculateContractProgress(profile.tanggalMasuk, profile.tanggalSelesaiKontrak);
    const remainingDays = calculateRemainingDays(profile.tanggalSelesaiKontrak);

    return (
        <StyledProfilePage>
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar-large">
                    {getInitials(profile.nama)}
                </div>
                <div className="profile-info">
                    <h1>{profile.nama}</h1>
                    <div className="profile-subtitle">{profile.jabatan}</div>
                    <div className="profile-meta">
                        <div className="meta-item">
                            <FiBriefcase />
                            <span>{profile.divisi}</span>
                        </div>
                        <div className="meta-item">
                            <FiCalendar />
                            <span>Bergabung {formatDate.toShortDate(profile.tanggalMasuk)}</span>
                        </div>
                        <Badge 
                            colorScheme={profile.aktif === 'ya' || profile.aktif === 'Aktif' ? 'green' : 'red'}
                            fontSize="0.9rem"
                            px={3}
                            py={1}
                        >
                            {profile.aktif === 'ya' || profile.aktif === 'Aktif' ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Info Cards Grid */}
            <div className="profile-cards">
                {/* Lama Bekerja Card */}
                <div className="info-card work-duration-card">
                    <div className="card-header">
                        <FiClock />
                        <h3>Lama Bekerja</h3>
                    </div>
                    <div className="card-content">
                        <div className="duration-grid">
                            <div className="duration-item">
                                <div className="duration-label">Total</div>
                                <div className="duration-value large">{workDuration.text}</div>
                            </div>
                            <div className="duration-item">
                                <div className="duration-label">Kontrak S/D</div>
                                <div className="duration-value">
                                    {formatDate.toShortDate(profile.tanggalSelesaiKontrak)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="progress-bar">
                            <div className="progress-label">
                                <span>Progress</span>
                                <span>{contractProgress}%</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${contractProgress}%` }}></div>
                            </div>
                        </div>

                        <div className="info-row">
                            <span className="label">Sisa Kontrak</span>
                            <span className="value warning">{remainingDays} Hari</span>
                        </div>
                    </div>
                </div>

                {/* Administratif & Finansial Card */}
                <div className="info-card">
                    <div className="card-header">
                        <FiDollarSign />
                        <h3>Administratif & Finansial</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="label">NIK</span>
                            <span className="value">{profile.nik}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">NPWP</span>
                            <span className="value">{profile.npwp}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Akun Bank</span>
                            <span className="value">{profile.akunBank}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">No Rekening</span>
                            <span className="value highlight">{profile.noRekening}</span>
                        </div>
                    </div>
                </div>

                {/* Personal Info Card */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Personal Info</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="label">ID Karyawan</span>
                            <span className="value">{profile.idKaryawan}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Nama Jabatan</span>
                            <span className="value">{profile.jabatan}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Tanggal Lahir</span>
                            <span className="value">{formatDate.toShortDate(profile.tanggalLahir)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Jenis Kelamin</span>
                            <span className="value">{profile.jenisKelamin}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Status</span>
                            <span className="value">{profile.statusKawin}</span>
                        </div>
                    </div>
                </div>

                {/* Alamat & Kontak Card */}
                <div className="info-card">
                    <div className="card-header">
                        <FiMapPin />
                        <h3>Alamat & Kontak</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="label">Domisili</span>
                            <span className="value">{profile.domisili}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Alamat</span>
                            <span className="value">{profile.alamatKTP}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Handphone</span>
                            <span className="value">{formatPhoneNumber(profile.noTelp)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Email</span>
                            <span className="value">{profile.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Data Karyawan */}
            <div className="detail-section">
                <h2>Detail Data Karyawan</h2>
                
                <div className="detail-grid">
                    <div className="detail-item">
                        <div className="detail-label">Nama Lengkap</div>
                        <div className="detail-value">{profile.nama}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Code Name</div>
                        <div className="detail-value">{profile.codeName}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Agama</div>
                        <div className="detail-value">{profile.agama}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Jumlah Anak</div>
                        <div className="detail-value">{profile.jumlahAnak}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Status Pekerjaan</div>
                        <div className="detail-value">{profile.status}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Level</div>
                        <div className="detail-value">{profile.level}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Tanggal Masuk</div>
                        <div className="detail-value">{formatDate.toLongDate(profile.tanggalMasuk)}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Tanggal Selesai Probation</div>
                        <div className="detail-value">{formatDate.toLongDate(profile.tanggalSelesaiProbation)}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Tanggal Selesai Kontrak</div>
                        <div className="detail-value">{formatDate.toLongDate(profile.tanggalSelesaiKontrak)}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Jatah Cuti</div>
                        <div className="detail-value">{profile.jatahCuti} Hari</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Dokumen KTP</div>
                        <div className="document-links">
                            {profile.fotoKTP ? (
                                <a href={formatDocumentLink(profile.fotoKTP)} target="_blank" rel="noopener noreferrer">
                                    <FiFileText />
                                    <span>Lihat KTP</span>
                                    <FiExternalLink />
                                </a>
                            ) : (
                                <div className="detail-value empty">Tidak ada dokumen</div>
                            )}
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Dokumen Kartu Keluarga</div>
                        <div className="document-links">
                            {profile.fotoKK ? (
                                <a href={formatDocumentLink(profile.fotoKK)} target="_blank" rel="noopener noreferrer">
                                    <FiFileText />
                                    <span>Lihat KK</span>
                                    <FiExternalLink />
                                </a>
                            ) : (
                                <div className="detail-value empty">Tidak ada dokumen</div>
                            )}
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Dokumen NPWP</div>
                        <div className="document-links">
                            {profile.fotoNPWP ? (
                                <a href={formatDocumentLink(profile.fotoNPWP)} target="_blank" rel="noopener noreferrer">
                                    <FiFileText />
                                    <span>Lihat NPWP</span>
                                    <FiExternalLink />
                                </a>
                            ) : (
                                <div className="detail-value empty">Tidak ada dokumen</div>
                            )}
                        </div>
                    </div>

                    {profile.note && (
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                            <div className="detail-label">Catatan</div>
                            <div className="detail-value">{profile.note}</div>
                        </div>
                    )}
                </div>
            </div>
        </StyledProfilePage>
    );
}

export default Profile;
