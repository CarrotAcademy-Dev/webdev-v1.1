import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast, Input, Spinner } from '@chakra-ui/react';
import { FiPlus, FiX, FiInbox, FiSearch } from 'react-icons/fi';
import ContainerCarrot from '@/components/Container';
import StyledNomorUrutSertifikat from './NomorUrutSertifikat.styled';
import { getNomorUrutSertifikat, addNomorUrutSertifikat } from '@/features/eso/esoApiService';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ITEMS_PER_PAGE = 10;
const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MODULS = ['Reuni', 'Desain Grafis', 'Videografi', 'Fotografi', 'Videografi & Fotografi', 'Desain Grafis & Fotografi', 'Desain Grafis & Videografi', 'Desain Grafis & Videografi & Fotografi'];

function NomorUrutSertifikatPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nomor_urut: '',
        nama: '',
        modul: '',
        angkatan: '',
        bulan_lulus: '',
        tahun_lulus: String(CURRENT_YEAR)
    });
    const [formErrors, setFormErrors] = useState({});

    // Fetch data
    const { data: rawData = [], isLoading, isError, error } = useQuery({
        queryKey: ['nomorUrutSertifikat'],
        queryFn: getNomorUrutSertifikat,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Add mutation
    const addMutation = useMutation({
        mutationFn: addNomorUrutSertifikat,
        onSuccess: () => {
            queryClient.invalidateQueries(['nomorUrutSertifikat']);
            toast({
                title: 'Berhasil!',
                description: 'Data nomor urut sertifikat berhasil ditambahkan',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            handleCloseModal();
        },
        onError: (err) => {
            toast({
                title: 'Gagal menambahkan data',
                description: err.message || 'Terjadi kesalahan saat menambahkan data',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    // Filter data based on search query
    const filteredData = rawData.filter(item => {
        const search = searchQuery.toLowerCase();
        return (
            item.nomor_urut?.toLowerCase().includes(search) ||
            item.nama?.toLowerCase().includes(search) ||
            item.modul?.toLowerCase().includes(search) ||
            item.angkatan?.toLowerCase().includes(search) ||
            item.nomor_sertifikat?.toLowerCase().includes(search)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.nomor_urut.trim()) errors.nomor_urut = 'Nomor urut harus diisi';
        if (!formData.nama.trim()) errors.nama = 'Nama harus diisi';
        if (!formData.modul.trim()) errors.modul = 'Modul harus dipilih';
        if (!formData.angkatan.trim()) errors.angkatan = 'Angkatan harus diisi';
        if (!formData.bulan_lulus.trim()) errors.bulan_lulus = 'Bulan lulus harus dipilih';
        if (!formData.tahun_lulus.trim()) errors.tahun_lulus = 'Tahun lulus harus diisi';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast({
                title: 'Form tidak lengkap',
                description: 'Mohon lengkapi semua field yang wajib diisi',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        addMutation.mutate(formData);
    };

    // Handle modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
        setFormData({
            nomor_urut: '',
            nama: '',
            modul: '',
            angkatan: '',
            bulan_lulus: '',
            tahun_lulus: String(CURRENT_YEAR)
        });
        setFormErrors({});
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            nomor_urut: '',
            nama: '',
            modul: '',
            angkatan: '',
            bulan_lulus: '',
            tahun_lulus: String(CURRENT_YEAR)
        });
        setFormErrors({});
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    if (isError) {
        return (
            <ContainerCarrot>
                <StyledNomorUrutSertifikat>
                    <div className="hero-section">
                        <h1 className="page-title">Nomor Urut Sertifikat Full-Time</h1>
                    </div>
                    <div className="empty-state">
                        <div className="empty-icon">⚠️</div>
                        <div className="empty-text">Error: {error.message}</div>
                        <div className="empty-subtext">Gagal memuat data. Silakan refresh halaman.</div>
                    </div>
                </StyledNomorUrutSertifikat>
            </ContainerCarrot>
        );
    }

    return (
        <ContainerCarrot>
            <StyledNomorUrutSertifikat>
                {/* Header */}
                <div className="hero-section">
                    <h1 className="page-title">Nomor Urut Sertifikat Full-Time</h1>
                </div>

                {/* Controls */}
                <div className="controls-section">
                    <div className="search-box">
                        <Input
                            placeholder="Cari berdasarkan nama, nomor urut, modul..."
                            value={searchQuery}
                            onChange={handleSearch}
                            size="lg"
                            leftIcon={<FiSearch />}
                        />
                    </div>
                    <button className="add-button" onClick={handleOpenModal}>
                        <FiPlus />
                        Tambah Data Baru
                    </button>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="center">No</th>
                                <th>Nomor Urut</th>
                                <th>Nama</th>
                                <th>Modul</th>
                                <th>Angkatan</th>
                                <th>Bulan Lulus</th>
                                <th>Tahun Lulus</th>
                                <th>Nomor Sertifikat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                                    <tr key={index}>
                                        <td className="center"><Skeleton width={30} /></td>
                                        <td><Skeleton width={80} /></td>
                                        <td><Skeleton width={150} /></td>
                                        <td><Skeleton width={120} /></td>
                                        <td><Skeleton width={80} /></td>
                                        <td><Skeleton width={80} /></td>
                                        <td><Skeleton width={60} /></td>
                                        <td><Skeleton width={100} /></td>
                                    </tr>
                                ))
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="center">{startIndex + index + 1}</td>
                                        <td className="highlight">{item.nomor_urut}</td>
                                        <td>{item.nama}</td>
                                        <td>{item.modul}</td>
                                        <td>{item.angkatan}</td>
                                        <td>{item.bulan_lulus}</td>
                                        <td>{item.tahun_lulus}</td>
                                        <td>{item.nomor_sertifikat || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <div className="empty-icon"><FiInbox /></div>
                                            <div className="empty-text">
                                                {searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada data'}
                                            </div>
                                            <div className="empty-subtext">
                                                {searchQuery 
                                                    ? 'Coba kata kunci lain' 
                                                    : 'Tambahkan data baru dengan klik tombol di atas'
                                                }
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && paginatedData.length > 0 && (
                    <div className="pagination-section">
                        <div className="pagination-info">
                            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
                        </div>
                        <div className="pagination-controls">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={currentPage === page ? 'active' : ''}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Tambah Data Sertifikat</h2>
                                <button className="close-button" onClick={handleCloseModal}>
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>
                                        Nomor Urut<span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nomor_urut"
                                        value={formData.nomor_urut}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 001"
                                    />
                                    {formErrors.nomor_urut && (
                                        <div className="error-message">{formErrors.nomor_urut}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Nama Siswa<span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleInputChange}
                                        placeholder="Nama lengkap siswa"
                                    />
                                    {formErrors.nama && (
                                        <div className="error-message">{formErrors.nama}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Modul<span className="required">*</span>
                                    </label>
                                    <select
                                        name="modul"
                                        value={formData.modul}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Pilih Modul --</option>
                                        {MODULS.map(modul => (
                                            <option key={modul} value={modul}>{modul}</option>
                                        ))}
                                    </select>
                                    {formErrors.modul && (
                                        <div className="error-message">{formErrors.modul}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Angkatan<span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="angkatan"
                                        value={formData.angkatan}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 54"
                                    />
                                    {formErrors.angkatan && (
                                        <div className="error-message">{formErrors.angkatan}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Bulan Lulus<span className="required">*</span>
                                    </label>
                                    <select
                                        name="bulan_lulus"
                                        value={formData.bulan_lulus}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Pilih Bulan --</option>
                                        {MONTHS.map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                    {formErrors.bulan_lulus && (
                                        <div className="error-message">{formErrors.bulan_lulus}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Tahun Lulus<span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="tahun_lulus"
                                        value={formData.tahun_lulus}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 2026"
                                        min="2020"
                                        max="2050"
                                    />
                                    {formErrors.tahun_lulus && (
                                        <div className="error-message">{formErrors.tahun_lulus}</div>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-button" 
                                        onClick={handleCloseModal}
                                        disabled={addMutation.isLoading}
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-button"
                                        disabled={addMutation.isLoading}
                                    >
                                        {addMutation.isLoading ? (
                                            <>
                                                <Spinner size="sm" mr={2} />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            'Simpan Data'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </StyledNomorUrutSertifikat>
        </ContainerCarrot>
    );
}

export default NomorUrutSertifikatPage;
