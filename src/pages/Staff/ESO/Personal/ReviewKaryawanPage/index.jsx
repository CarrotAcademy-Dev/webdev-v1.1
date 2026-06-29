import ContainerCarrot from "@/components/Container";
import DataTableComponent from "@/components/Table";
import { 
    Input, 
    Flex, 
    Text, 
    useToast, 
    Button, 
    Select,
    Textarea,
    Radio,
    RadioGroup,
    Stack,
    useColorModeValue,
    useColorMode
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getReviewKaryawan,
    submitReviewKaryawan
} from "@/features/eso/esoApiService";
import { StyledReviewKaryawan } from "./ReviewKaryawan.styled";
import { useState, useMemo, useContext } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";

// Dummy data karyawan - nanti bisa diganti dengan API
const KARYAWAN_LIST = [
    { nama: "Cristin Magdalena Sitompul", id: "017.03.05.23", jabatan: "Customer Support Officer", tingkat: "Staff", status: "Full Time" },
    { nama: "Eka Dwi Saputra", id: "018.04.06.24", jabatan: "Technical Support", tingkat: "Staff", status: "Full Time" },
    { nama: "Budi Santoso", id: "019.05.07.25", jabatan: "Project Manager", tingkat: "Manager", status: "Full Time" },
];

function ReviewKaryawanPage() {
    const { currentUser } = useContext(AuthContext);
    const toast = useToast();
    const queryClient = useQueryClient();
    const { colorMode } = useColorMode();

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');

    const [selectedKaryawan, setSelectedKaryawan] = useState('');
    const [karyawanData, setKaryawanData] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        disiplin: '',
        komunikasi: '',
        kerja_sama_tim: '',
        tanggung_jawab: '',
        inisiatif: '',
        kinerja_umum: '',
        review: ''
    });

    // Fetch review history when karyawan selected
    const { data: reviewHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['reviewKaryawan', selectedKaryawan],
        queryFn: () => getReviewKaryawan(selectedKaryawan),
        enabled: !!selectedKaryawan,
        staleTime: 2 * 60 * 1000
    });

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: submitReviewKaryawan,
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Review karyawan berhasil disubmit",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            // Reset form
            setFormData({
                disiplin: '',
                komunikasi: '',
                kerja_sama_tim: '',
                tanggung_jawab: '',
                inisiatif: '',
                kinerja_umum: '',
                review: ''
            });
            // Refetch history
            queryClient.invalidateQueries({ queryKey: ['reviewKaryawan', selectedKaryawan] });
        },
        onError: (error) => {
            toast({
                title: "Gagal",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const handleKaryawanChange = (e) => {
        const nama = e.target.value;
        setSelectedKaryawan(nama);
        
        const karyawan = KARYAWAN_LIST.find(k => k.nama === nama);
        setKaryawanData(karyawan);
        
        // Reset form when changing karyawan
        setFormData({
            disiplin: '',
            komunikasi: '',
            kerja_sama_tim: '',
            tanggung_jawab: '',
            inisiatif: '',
            kinerja_umum: '',
            review: ''
        });
    };

    const handleRatingChange = (criteria, value) => {
        setFormData(prev => ({
            ...prev,
            [criteria]: value
        }));
    };

    const handleSubmit = () => {
        // Validation
        if (!selectedKaryawan) {
            toast({
                title: "Peringatan",
                description: "Pilih karyawan terlebih dahulu",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const requiredFields = ['disiplin', 'komunikasi', 'kerja_sama_tim', 'tanggung_jawab', 'inisiatif', 'kinerja_umum'];
        const isComplete = requiredFields.every(field => formData[field] !== '');

        if (!isComplete) {
            toast({
                title: "Peringatan",
                description: "Semua kriteria penilaian harus diisi",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Submit
        submitMutation.mutate({
            reviewer: currentUser?.name || 'Unknown',
            nama_karyawan: karyawanData.nama,
            id_karyawan: karyawanData.id,
            jabatan: karyawanData.jabatan,
            tingkat_pekerjaan: karyawanData.tingkat,
            status: karyawanData.status,
            ...formData
        });
    };

    // Transform history data for table - filter by current user (privacy)
    const historyTableData = useMemo(() => {
        if (!reviewHistory || !reviewHistory.result) return [];
        
        // Filter hanya review yang dibuat oleh user saat ini
        const currentUserReviews = reviewHistory.result.filter(
            item => item.reviewer === currentUser?.name
        );
        
        return currentUserReviews.map((item, index) => ({
            id: item.id_review,
            no: index + 1,
            date: new Date(item.date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            id_review: item.id_review,
            reviewer: item.reviewer,
            disiplin: item.disiplin,
            komunikasi: item.komunikasi,
            kerjasama_tim: item.kerjasama_tim,
            tanggung_jawab: item.tanggung_jawab,
            inisiatif: item.inisiatif,
            kinerja_umum: item.kinerja_umum,
            komentar: item.komentar || '-'
        }));
    }, [reviewHistory, currentUser]);

    const headerHistory = [
        { key: 'no', label: 'No' },
        { key: 'date', label: 'Tanggal' },
        { key: 'id_review', label: 'ID Review' },
        { key: 'reviewer', label: 'Reviewer' },
        { key: 'disiplin', label: 'Disiplin' },
        { key: 'komunikasi', label: 'Komunikasi' },
        { key: 'kerjasama_tim', label: 'Kerja Sama Tim' },
        { key: 'tanggung_jawab', label: 'Tanggung Jawab' },
        { key: 'inisiatif', label: 'Inisiatif' },
        { key: 'kinerja_umum', label: 'Kinerja Umum' },
        { key: 'komentar', label: 'Komentar' }
    ];

    const criteriaList = [
        { key: 'disiplin', label: 'Disiplin' },
        { key: 'komunikasi', label: 'Komunikasi' },
        { key: 'kerja_sama_tim', label: 'Kerja Sama Tim' },
        { key: 'tanggung_jawab', label: 'Tanggung Jawab' },
        { key: 'inisiatif', label: 'Inisiatif' },
        { key: 'kinerja_umum', label: 'Kinerja Umum' }
    ];

    return (
        <StyledReviewKaryawan data-theme={colorMode}>
            <ContainerCarrot>
                <h1 className="page-title">📋 Penilaian Karyawan</h1>

                {/* Form Section */}
                <div className="form-section">
                    <h2 className="section-title">Form Penilaian</h2>
                    
                    <div className="warning-text">
                        <FiAlertTriangle />
                        Hanya perlu mengisi bagian yang berwarna putih, semakin tinggi semakin baik.
                    </div>

                    {/* Select Karyawan */}
                    <div className="form-group">
                        <label>Nama Karyawan *</label>
                        <Select
                            placeholder="Pilih Karyawan"
                            value={selectedKaryawan}
                            onChange={handleKaryawanChange}
                            bg={cardBg}
                        >
                            {KARYAWAN_LIST.map(karyawan => (
                                <option key={karyawan.id} value={karyawan.nama}>
                                    {karyawan.nama}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Data Karyawan (Read-only) */}
                    {karyawanData && (
                        <>
                            <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                                <div className="form-group">
                                    <label>ID Karyawan</label>
                                    <Input
                                        value={karyawanData.id}
                                        isReadOnly
                                        className="input-readonly"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nama Jabatan</label>
                                    <Input
                                        value={karyawanData.jabatan}
                                        isReadOnly
                                        className="input-readonly"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tingkat Pekerjaan</label>
                                    <Input
                                        value={karyawanData.tingkat}
                                        isReadOnly
                                        className="input-readonly"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <Input
                                        value={karyawanData.status}
                                        isReadOnly
                                        className="input-readonly"
                                    />
                                </div>
                            </div>

                            {/* Kriteria Penilaian */}
                            <div className="criteria-section">
                                <h3 className="criteria-title">Kriteria Penilaian</h3>
                                <div className="criteria-grid">
                                    {criteriaList.map(criteria => (
                                        <div key={criteria.key} className="criteria-item">
                                            <label>{criteria.label}</label>
                                            <RadioGroup
                                                value={formData[criteria.key]}
                                                onChange={(value) => handleRatingChange(criteria.key, value)}
                                            >
                                                <Stack direction="row" spacing={3}>
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <Radio key={num} value={num.toString()} colorScheme="orange">
                                                            {num}
                                                        </Radio>
                                                    ))}
                                                </Stack>
                                            </RadioGroup>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Komentar/Masukan */}
                            <div className="comment-section">
                                <div className="form-group">
                                    <label>Komentar / Masukan</label>
                                    <Textarea
                                        placeholder="Masukkan komentar atau masukan (opsional)"
                                        value={formData.review}
                                        onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                                        rows={4}
                                        bg={cardBg}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="submit-section">
                                <Button
                                    colorScheme="orange"
                                    size="lg"
                                    onClick={handleSubmit}
                                    isLoading={submitMutation.isPending}
                                >
                                    SIMPAN
                                </Button>
                            </div>
                        </>
                    )}

                    {!karyawanData && (
                        <Flex justify="center" align="center" py={8}>
                            <Text color="gray.500">Pilih karyawan untuk mulai memberikan penilaian</Text>
                        </Flex>
                    )}
                </div>

                {/* History Section */}
                {selectedKaryawan && (
                    <div className="history-section">
                        <h2 className="section-title">Riwayat Penilaian Saya - {selectedKaryawan}</h2>
                        <DataTableComponent
                            tableData={historyTableData}
                            headerItems={headerHistory}
                            isLoading={loadingHistory}
                        />
                    </div>
                )}
            </ContainerCarrot>
        </StyledReviewKaryawan>
    );
}

export default ReviewKaryawanPage;
