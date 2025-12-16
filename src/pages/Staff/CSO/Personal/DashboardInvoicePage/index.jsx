import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import SistemTabs from "@/components/SistemTabs";
import DataTableComponent from "@/components/Table";
import { Input, Flex, Text, Checkbox, useToast, Select, Button, Box, useColorModeValue } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getInvoiceTagihToday,
    getCariInvoice,
    getStudioNaikUmur,
    submitStudioNaikUmur
} from "@/features/cso/csoApiService";
import { StyledDashboardInvoice } from "./DashboardInvoice.styled";
import { useState, useMemo, useContext } from "react";
import { FiFileText, FiSearch, FiUsers } from "react-icons/fi";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from "@/context/AuthContext";

function DashboardInvoicePage() {
    const currentDate = new Date();
    const { user } = useContext(AuthContext);
    
    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
    
    // Format date untuk backend: "d mmm yyyy" e.g., "1 Dec 2025"
    const formatDateForBackend = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Format date untuk input: "yyyy-mm-dd"
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format bulan tahun: "mmm yyyy"
    const formatMonthYear = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const [selectedDate, setSelectedDate] = useState(formatDateForInput(currentDate));
    const [selectedMonthYear, setSelectedMonthYear] = useState(formatMonthYear(currentDate));
    const [searchName, setSearchName] = useState('');
    const [selectedAge, setSelectedAge] = useState('ALL');
    const toast = useToast();
    const queryClient = useQueryClient();

    // Fetch invoice tagih today
    const { data: invoiceTagih, isLoading: loadingInvoice } = useQuery({
        queryKey: ['invoiceTagihToday', selectedDate],
        queryFn: () => {
            const backendDate = formatDateForBackend(new Date(selectedDate));
            return getInvoiceTagihToday(backendDate);
        },
        enabled: !!selectedDate,
        staleTime: 5 * 60 * 1000
    });

    // Fetch cari invoice (manual trigger)
    const { data: cariInvoiceData, isLoading: loadingSearch, refetch: refetchSearch } = useQuery({
        queryKey: ['cariInvoice', searchName],
        queryFn: () => getCariInvoice(searchName),
        enabled: false, // Manual trigger only
        staleTime: 5 * 60 * 1000
    });

    // Fetch studio naik umur
    const { data: studioNaikUmur, isLoading: loadingStudio } = useQuery({
        queryKey: ['studioNaikUmur', selectedMonthYear, selectedAge],
        queryFn: () => getStudioNaikUmur(selectedMonthYear, selectedAge),
        enabled: !!selectedMonthYear,
        staleTime: 5 * 60 * 1000
    });

    // Mutation for studio naik umur
    const studioMutation = useMutation({
        mutationFn: ({ uniqueId, nama }) => {
            const pic = user?.name || 'Unknown';
            return submitStudioNaikUmur(uniqueId, nama, pic);
        },
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Data studio naik umur berhasil diupdate",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['studioNaikUmur']);
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

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleMonthYearChange = (e) => {
        setSelectedMonthYear(e.target.value);
    };

    const handleAgeChange = (e) => {
        setSelectedAge(e.target.value);
    };

    const handleSearch = () => {
        if (!searchName.trim()) {
            toast({
                title: "Peringatan",
                description: "Nama siswa harus diisi",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        refetchSearch();
    };

    const handleStudioChecklist = async (item) => {
        await studioMutation.mutateAsync({
            uniqueId: item.id_uniq,
            nama: item.nama
        });
    };

    // Transform data untuk tabs
    const tableData = useMemo(() => {
        const transformInvoiceTagih = (data) => {
            if (!data || !data.result || data.result.length === 0) return [];
            return data.result.map((row, index) => ({
                id: index + 1,
                no: index + 1,
                nama: row.nama || '-',
                produk: row.produk || '-',
                harga: row.harga || 0,
                tanggal: row.tanggal || '-',
                sisaTagihan: row.sisa_tagihan || 0,
                linkPdf: row.link_pdf || '#'
            }));
        };

        const transformCariInvoice = (data) => {
            if (!data || !data.result || data.result.length === 0) return [];
            return data.result.map((row, index) => ({
                id: index + 1,
                no: index + 1,
                produk: row.produk || '-',
                tanggal: row.tanggal || '-',
                harga: row.harga || 0,
                status: row.status || '-'
            }));
        };

        const transformStudioUndone = (data) => {
            if (!data || !data.undone || data.undone.length === 0) return [];
            return data.undone.map((row, index) => ({
                id: row.id_uniq,
                no: index + 1,
                nama: row.nama || '-',
                modul: row.modul || '-',
                tanggalLahir: row.tanggal_lahir || '-',
                bulanKelas: row.bulan_kelas || '-',
                umur: row.umur || '-',
                kategori: row.kategori || '-',
                id_uniq: row.id_uniq
            }));
        };

        const transformStudioDone = (data) => {
            if (!data || !data.done || data.done.length === 0) return [];
            return data.done.map((row, index) => ({
                id: row.id_uniq,
                no: index + 1,
                nama: row.nama || '-',
                modul: row.modul || '-',
                tanggalLahir: row.tanggal_lahir || '-',
                bulanKelas: row.bulan_kelas || '-',
                umur: row.umur || '-',
                kategori: row.kategori || '-'
            }));
        };

        return {
            invoiceTagih: transformInvoiceTagih(invoiceTagih),
            cariInvoice: transformCariInvoice(cariInvoiceData),
            studioUndone: transformStudioUndone(studioNaikUmur),
            studioDone: transformStudioDone(studioNaikUmur)
        };
    }, [invoiceTagih, cariInvoiceData, studioNaikUmur]);

    // Define tabs (tanpa Cari Invoice)
    const tabItems = [
        { key: 'invoiceTagih', label: 'Invoice Tagih Hari Ini' },
        { key: 'studioUndone', label: 'Studio Naik Umur (Undone)' },
        { key: 'studioDone', label: 'Studio Naik Umur (Done)' }
    ];

    // Headers untuk Invoice Tagih
    const headerInvoiceTagih = [
        { key: 'no', label: 'No' },
        { key: 'nama', label: 'Nama' },
        { key: 'produk', label: 'Produk' },
        { 
            key: 'harga', 
            label: 'Harga',
            render: (item) => {
                if (typeof item.harga === 'number') {
                    return `Rp ${item.harga.toLocaleString('id-ID')}`;
                }
                return item.harga;
            }
        },
        { key: 'tanggal', label: 'Tanggal' },
        { 
            key: 'sisaTagihan', 
            label: 'Sisa Tagihan',
            render: (item) => {
                if (typeof item.sisaTagihan === 'number') {
                    return `Rp ${item.sisaTagihan.toLocaleString('id-ID')}`;
                }
                return item.sisaTagihan;
            }
        },
        {
            key: 'linkPdf',
            label: 'PDF',
            render: (item) => (
                <a 
                    href={item.linkPdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#FE7743', textDecoration: 'underline' }}
                >
                    Lihat PDF
                </a>
            )
        }
    ];

    // Headers untuk Cari Invoice
    const headerCariInvoice = [
        { key: 'no', label: 'No' },
        { key: 'produk', label: 'Produk' },
        { key: 'tanggal', label: 'Tanggal' },
        { 
            key: 'harga', 
            label: 'Harga',
            render: (item) => {
                if (typeof item.harga === 'number') {
                    return `Rp ${item.harga.toLocaleString('id-ID')}`;
                }
                return item.harga;
            }
        },
        { key: 'status', label: 'Status' }
    ];

    // Headers untuk Studio Undone
    const headerStudioUndone = [
        { key: 'no', label: 'No' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        { key: 'tanggalLahir', label: 'Tanggal Lahir' },
        { key: 'bulanKelas', label: 'Bulan Kelas' },
        { key: 'umur', label: 'Umur' },
        { key: 'kategori', label: 'Kategori' },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isDisabled={studioMutation.isPending}
                    onChange={() => handleStudioChecklist(item)}
                    sx={{
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#48BB78',
                                borderColor: '#48BB78',
                            }
                        }
                    }}
                />
            )
        }
    ];

    // Headers untuk Studio Done
    const headerStudioDone = [
        { key: 'no', label: 'No' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        { key: 'tanggalLahir', label: 'Tanggal Lahir' },
        { key: 'bulanKelas', label: 'Bulan Kelas' },
        { key: 'umur', label: 'Umur' },
        { key: 'kategori', label: 'Kategori' }
    ];

    const getHeaderItems = (tabKey) => {
        switch(tabKey) {
            case 'invoiceTagih':
                return headerInvoiceTagih;
            case 'studioUndone':
                return headerStudioUndone;
            case 'studioDone':
                return headerStudioDone;
            default:
                return [];
        }
    };

    const isLoading = loadingInvoice || loadingStudio;

    return (
        <StyledDashboardInvoice>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Dashboard Invoice - Overview</h1>
                        
                        {/* Filter Section */}
                        <Flex gap={4} mb={6} direction={{ base: 'column', md: 'row' }} align="flex-start">
                            {/* Filter Tanggal untuk Invoice Tagih */}
                            <Flex gap={2} align="center">
                                <Text fontWeight="semibold" minW="120px">Tanggal Invoice:</Text>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    maxW="200px"
                                    bg={cardBg}
                                    borderColor="gray.300"
                                />
                            </Flex>

                            {/* Filter Bulan untuk Studio */}
                            <Flex gap={2} align="center">
                                <Text fontWeight="semibold" minW="100px">Bulan Studio:</Text>
                                <Select
                                    value={selectedMonthYear}
                                    onChange={handleMonthYearChange}
                                    maxW="180px"
                                    bg={cardBg}
                                    borderColor="gray.300"
                                >
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const date = new Date(currentDate.getFullYear(), i, 1);
                                        const value = formatMonthYear(date);
                                        return (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        );
                                    })}
                                </Select>
                            </Flex>

                            {/* Filter Age untuk Studio */}
                            <Flex gap={2} align="center">
                                <Text fontWeight="semibold" minW="120px">Filter Umur:</Text>
                                <Select
                                    value={selectedAge}
                                    onChange={handleAgeChange}
                                    maxW="150px"
                                    bg={cardBg}
                                    borderColor="gray.300"
                                >
                                    <option value="ALL">ALL</option>
                                    <option value="M">M</option>
                                    <option value="DV1">DV1</option>
                                    <option value="DV2">DV2</option>
                                    <option value="P">P</option>
                                </Select>
                            </Flex>
                        </Flex>

                        {/* KPI Cards Grid */}
                        <div className="stats-grid-invoice">
                            <InfoCard>
                                <FiFileText size="30px" color="#FE7743" />
                                <p>Invoice Tagih Hari Ini</p>
                                {loadingInvoice ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{invoiceTagih?.result_angka || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiUsers size="30px" color="#FE7743" />
                                <p>Studio Undone</p>
                                {loadingStudio ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.studioUndone?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiUsers size="30px" color="#FE7743" />
                                <p>Studio Done</p>
                                {loadingStudio ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.studioDone?.length || 0}</p>
                                )}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>

            {/* Tabs Section - Invoice Tagih & Studio Naik Umur */}
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs 
                        tabItems={tabItems}
                        tableData={tableData}
                        headerItems={headerInvoiceTagih}
                        isLoading={isLoading}
                        getHeaderItemsForTab={getHeaderItems}
                    />
                </ContainerCarrot>
            </div>

            {/* Cari Invoice Section - Separate Container */}
            <div className="main-content-section" style={{ marginTop: '2rem' }}>
                <ContainerCarrot>
                    <Box bg={cardBg} borderRadius="12px" p={6} boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)">
                        <Text fontSize="xl" fontWeight="bold" mb={4} color="#2D3748">
                            Cari Invoice Per Nama
                        </Text>
                        
                        {/* Search Form */}
                        <Flex gap={3} mb={6} align="center">
                            <Input
                                placeholder="Masukkan nama lengkap siswa"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                maxW="400px"
                                bg={cardBg}
                                borderColor="gray.300"
                            />
                            <Button
                                colorScheme="orange"
                                onClick={handleSearch}
                                isLoading={loadingSearch}
                            >
                                <FiSearch style={{ marginRight: '8px' }} />
                                Cari
                            </Button>
                        </Flex>

                        {/* Search Results Table */}
                        {cariInvoiceData && (
                            <DataTableComponent
                                tableData={tableData.cariInvoice}
                                headerItems={headerCariInvoice}
                                isLoading={loadingSearch}
                            />
                        )}
                        
                        {!cariInvoiceData && (
                            <Text color="gray.500" textAlign="center" py={8}>
                                Masukkan nama siswa dan klik tombol Cari untuk menampilkan invoice
                            </Text>
                        )}
                    </Box>
                </ContainerCarrot>
            </div>
        </StyledDashboardInvoice>
    );
}

export default DashboardInvoicePage;
