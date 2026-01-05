import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfilSiswa, submitProfilSiswa } from '@/features/cso/csoApiService';
import { AuthContext } from '@/context/AuthContext';
import { StyledProfilSiswa } from './ProfilSiswa.styled';
import { Box, Flex, Input, Button, Text, Textarea, useToast, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { format } from 'date-fns';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProfilSiswaPage = () => {
    const { currentUser } = useContext(AuthContext);
    const { colorMode } = useColorMode();
    
    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    
    const [searchName, setSearchName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const toast = useToast();
    const queryClient = useQueryClient();

    // Fetch student profile data
    const {
        data: profileData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profilSiswa', searchQuery],
        queryFn: () => getProfilSiswa(searchQuery),
        enabled: !!searchQuery,
        staleTime: 1000 * 60 * 5
    });

    // Mutation for submitting edited data
    const submitMutation = useMutation({
        mutationFn: submitProfilSiswa,
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Data profil siswa berhasil diupdate',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsEditMode(false);
            queryClient.invalidateQueries(['profilSiswa', searchQuery]);
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Gagal mengupdate data',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        },
    });

    const handleSearch = () => {
        if (searchName.trim()) {
            setSearchQuery(searchName.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const studentData = profileData?.result?.[0] || null;
    const finishedCourses = profileData?.finished_course || [];
    const activeCourses = profileData?.active_course || [];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    const handleEditClick = () => {
        if (studentData) {
            setEditedData({ ...studentData });
            setIsEditMode(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditedData({});
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitEdit = () => {
        const dataToSubmit = {
            pic: currentUser?.name || '',
            timestamp: new Date().toISOString(),
            ...editedData
        };
        submitMutation.mutate(dataToSubmit);
    };

    const renderField = (label, field, fullWidth = false, isTextarea = false) => {
        const value = isEditMode ? (editedData[field] || '') : (studentData?.[field] || '-');
        
        return (
            <div className={`info-field ${fullWidth ? 'full-width' : ''}`}>
                <div className="field-label">{label}</div>
                {isEditMode ? (
                    isTextarea ? (
                        <Textarea
                            value={value}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            size="sm"
                            resize="vertical"
                        />
                    ) : (
                        <Input
                            value={value}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            size="sm"
                        />
                    )
                ) : (
                    <div className="field-value">{value}</div>
                )}
            </div>
        );
    };

    return (
        <StyledProfilSiswa data-theme={colorMode}>
            <h1 className="page-title">Profil Siswa</h1>

            {/* Search Section */}
            <div className="search-section">
                <Flex gap={4} align="center" wrap="wrap">
                    <Text fontWeight="600" fontSize="sm" color="gray.700" minW="100px">
                        Cari Siswa:
                    </Text>
                    <Input
                        placeholder="Masukkan nama siswa..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        maxW="400px"
                        size="md"
                    />
                    <Button
                        onClick={handleSearch}
                        bg="#141814ff"
                        color="white"
                        _hover={{ bg: '#41b11bff' }}
                        size="md"
                    >
                        Search
                    </Button>
                </Flex>
            </div>

            {/* Loading State */}
            {isLoading && (
                <Box bg={cardBg} p={8} borderRadius="12px">
                    <Skeleton height="200px" borderRadius="12px" />
                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <Skeleton height="100px" borderRadius="8px" />
                        <Skeleton height="100px" borderRadius="8px" />
                        <Skeleton height="100px" borderRadius="8px" />
                        <Skeleton height="100px" borderRadius="8px" />
                    </div>
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Box bg={cardBg} p={8} borderRadius="12px" textAlign="center">
                    <Text color="red.500" fontSize="lg">
                        Error: {error.message}
                    </Text>
                </Box>
            )}

            {/* Empty State */}
            {!isLoading && !error && !studentData && searchQuery && (
                <Box bg={cardBg} p={8} borderRadius="12px" textAlign="center">
                    <Text color="gray.500" fontSize="lg">
                        Tidak ada data siswa ditemukan untuk "{searchQuery}"
                    </Text>
                </Box>
            )}

            {/* Student Profile */}
            {studentData && (
                <div className="profile-container">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="profile-photo">
                            {studentData.photo ? (
                                <img src={studentData.photo} alt={studentData.nama_lengkap} />
                            ) : (
                                <span className="placeholder">👤</span>
                            )}
                        </div>

                        <div className="student-info">
                            <div className="info-item">
                                <div className="info-label">NIS</div>
                                <div className="info-value">{studentData.nis || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">PSID</div>
                                <div className="info-value">{studentData.psid || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Status</div>
                                <div className="info-value">
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: studentData.status_aktif === 'Active' ? '#E8F5E9' : '#FFEBEE',
                                        color: studentData.status_aktif === 'Active' ? '#2E7D32' : '#C62828'
                                    }}>
                                        {studentData.status_aktif || '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Program</div>
                                <div className="info-value">{studentData.program || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Umur Saat Daftar</div>
                                <div className="info-value">{studentData.age_when_join || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Umur Sekarang</div>
                                <div className="info-value">{studentData.age_now || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="profile-content">
                        {/* Edit Button */}
                        {!isEditMode && (
                            <Button
                                onClick={handleEditClick}
                                bg="#FE7743"
                                color="white"
                                _hover={{ bg: '#E56533' }}
                                mb={4}
                                size="md"
                            >
                                Edit Data
                            </Button>
                        )}

                        {/* Edit Mode Buttons */}
                        {isEditMode && (
                            <Flex gap={3} mb={4}>
                                <Button
                                    onClick={handleSubmitEdit}
                                    bg="#4CAF50"
                                    color="white"
                                    _hover={{ bg: '#45A049' }}
                                    isLoading={submitMutation.isPending}
                                    size="md"
                                >
                                    Simpan
                                </Button>
                                <Button
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    size="md"
                                >
                                    Batal
                                </Button>
                            </Flex>
                        )}

                        {/* Personal Information */}
                        <h3 className="section-title">Informasi Pribadi</h3>
                        <div className="info-grid">
                            {renderField('Nama Lengkap', 'nama_lengkap', true)}
                            {renderField('Nama Panggilan', 'nama_panggilan')}
                            {renderField('Jenis Kelamin', 'jenis_kelamin')}
                            {renderField('Tempat Lahir', 'kota_kelahiran')}
                            <div className="info-field">
                                <div className="field-label">Tanggal Lahir</div>
                                <div className="field-value">{formatDate(studentData?.tanggal_lahir)}</div>
                            </div>
                            {renderField('Nomor HP', 'nomor_hp')}
                            {renderField('Email', 'gmail', true)}
                            {renderField('Pekerjaan/Pelajar', 'pekerjaan_pelajar')}
                            {renderField('Perusahaan/Sekolah', 'perusahaan_sekolah')}
                            {renderField('Alamat', 'alamat', true, true)}
                            {renderField('Catatan Alamat', 'catatan_alamat', true)}
                        </div>

                        {/* Parent Information */}
                        <h3 className="section-title">Informasi Orang Tua</h3>
                        <div className="info-grid">
                            {renderField('Nama Orang Tua', 'nama_orangtua', true)}
                            {renderField('Nomor HP Orang Tua', 'nomor_hp_orangtua')}
                            {renderField('Email Orang Tua', 'email_orangtua', true)}
                        </div>

                        {/* Learning Information */}
                        <h3 className="section-title">Informasi Pembelajaran</h3>
                        <div className="info-grid">
                            {renderField('Kelas', 'kelas')}
                            {renderField('Status Kelas', 'status_kelas')}
                            {renderField('Jadwal 30 Hari Terakhir', 'jadwal_30day_terakhir', true)}
                            {renderField('Target 1', 'target_1', true)}
                            {renderField('Target 2', 'target_2', true)}
                            {renderField('Target 3', 'target_3', true)}
                            {renderField('Latest Artwork', 'latest_artwork', true)}
                            {renderField('URL Portfolio', 'url_portfolio', true)}
                            {(!isEditMode && studentData?.url_portfolio) && (
                                <div className="info-field full-width">
                                    <div className="field-label">Portfolio</div>
                                    <div className="field-value">
                                        <a href={studentData.url_portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#FE7743', textDecoration: 'underline' }}>
                                            Lihat Portfolio
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Links & Documents */}
                        <h3 className="section-title">Links & Dokumen</h3>
                        <div className="info-grid">
                            {renderField('Bukti Pembayaran', 'bukti_pembayaran', true)}
                            {renderField('Link Form Lanjutan Studio', 'link_form_lanjutan_studio', true)}
                            {renderField('Link Form Lanjutan Fulltime', 'link_form_lanjutan_fulltime', true)}
                            {renderField('Photo', 'photo', true)}
                            {renderField('Predrawing', 'predrawing', true)}
                            {renderField('Remove Link Predrawing', 'remove_link_predrawing', true)}
                        </div>

                        {/* Interest & Preferences */}
                        <h3 className="section-title">Minat & Preferensi</h3>
                        <div className="info-grid">
                            {renderField('Favourite Artist', 'favourite_artist', true)}
                            {renderField('Art Interest', 'art_interest', true)}
                            {renderField('Other Interest', 'other_interest', true)}
                            {renderField('Like', 'like', true, true)}
                            {renderField('Dislike', 'dislike', true, true)}
                        </div>

                        {/* Additional Info */}
                        <h3 className="section-title">Informasi Tambahan</h3>
                        <div className="info-grid">
                            {renderField('Merch', 'merch', true)}
                            <div className="info-field">
                                <div className="field-label">Timestamp</div>
                                <div className="field-value">{formatDate(studentData?.timestamp)}</div>
                            </div>
                        </div>

                        {/* Notes */}
                        <h3 className="section-title">Catatan</h3>
                        <div className="info-grid">
                            {renderField('Catatan CSO/ESO', 'catatan_cso_eso', true, true)}
                            {renderField('Catatan Mentor', 'catatan_mentor', true, true)}
                        </div>

                        {/* Finished Courses */}
                        <div className="course-section">
                            <h3 className="section-title">Finished Course</h3>
                            {finishedCourses.length > 0 ? (
                                <Box overflowX="auto">
                                    <table className="course-table">
                                        <thead>
                                            <tr>
                                                <th>Modul</th>
                                                <th>Level</th>
                                                <th>Kelas</th>
                                                <th>Sesi</th>
                                                <th>Tanggal Sertifikat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finishedCourses.map((course, index) => (
                                                <tr key={index}>
                                                    <td>{course.modul}</td>
                                                    <td>{course.level}</td>
                                                    <td>{course.kelas}</td>
                                                    <td>{course.sesi}</td>
                                                    <td>{formatDate(course.tanggal_sertifikat)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : (
                                <div className="empty-state">Tidak ada finished course</div>
                            )}
                        </div>

                        {/* Active Courses */}
                        <div className="course-section">
                            <h3 className="section-title">Active Course</h3>
                            {activeCourses.length > 0 ? (
                                <Box overflowX="auto">
                                    <table className="course-table">
                                        <thead>
                                            <tr>
                                                <th>Modul</th>
                                                <th>Level</th>
                                                <th>First Class</th>
                                                <th>Sesi</th>
                                                <th>Masterpiece</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeCourses.map((course, index) => (
                                                <tr key={index}>
                                                    <td>{course.modul}</td>
                                                    <td>{course.level}</td>
                                                    <td>{course.first_class}</td>
                                                    <td>{course.sesi}</td>
                                                    <td>{course.masterpice}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : (
                                <div className="empty-state">Tidak ada active course</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </StyledProfilSiswa>
    );
};

export default ProfilSiswaPage;
