import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import SistemTabs from "@/components/SistemTabs";
import DataTableComponent from "@/components/Table";
import { Input, Flex, Text, useToast, Button, Box, useColorModeValue } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { 
    getDataPortfolio,
    pencarianNamaPortfolio
} from "@/features/cso/csoApiService";
import { StyledDashboardPortfolio } from "./DashboardPortfolio.styled";
import { useState, useMemo } from "react";
import { FiClock, FiAlertCircle, FiAlertTriangle, FiSearch } from "react-icons/fi";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function DashboardPortfolioPage() {
    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    
    const [searchName, setSearchName] = useState('');
    const toast = useToast();

    // Fetch portfolio data
    const { data: portfolioData, isLoading: loadingPortfolio } = useQuery({
        queryKey: ['portfolioData'],
        queryFn: getDataPortfolio,
        staleTime: 5 * 60 * 1000
    });

    // Fetch search portfolio (manual trigger)
    const { data: searchData, isLoading: loadingSearch, refetch: refetchSearch } = useQuery({
        queryKey: ['searchPortfolio', searchName],
        queryFn: () => pencarianNamaPortfolio(searchName),
        enabled: false,
        staleTime: 5 * 60 * 1000
    });

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

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Transform data untuk tabs
    const tableData = useMemo(() => {
        const transformPortfolioData = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => ({
                id: index + 1,
                no: index + 1,
                psid: row.psid || '-',
                nama: row.nama || '-',
                sisaHari: row.sisa_hari || 0,
                deadline: formatDate(row.deadline),
                targetJumlahKarya: row.target_jumlah_karya || '-',
                karyaSelesai: row.karya_selesai || '-',
                sisaKarya: row.sisa_karya || '-'
            }));
        };

        const transformSearchData = (data) => {
            if (!data || !data.result || data.result.length === 0) return [];
            return data.result.map((row, index) => ({
                id: index + 1,
                no: index + 1,
                psid: row.psid || '-',
                nama: row.nama || '-',
                targetKampus: row.target_kampus || '-',
                deadline: row.deadline || '-',
                applicationLink: row.application_requirement_link || '-',
                karyaSelesai: row.karya_selesai || '-',
                targetJumlahKarya: row.target_jumlah_karya || '-'
            }));
        };

        return {
            hmin3bulan: transformPortfolioData(portfolioData?.data_hmin3bulan || []),
            hmin2bulan: transformPortfolioData(portfolioData?.data_hmin2bulan || []),
            hmin1bulan: transformPortfolioData(portfolioData?.data_hmin1bulan || []),
            hmin15hari: transformPortfolioData(portfolioData?.data_hmin15hari || []),
            searchResult: transformSearchData(searchData)
        };
    }, [portfolioData, searchData]);

    // Define tabs
    const tabItems = [
        { key: 'hmin3bulan', label: 'H-3 Bulan' },
        { key: 'hmin2bulan', label: 'H-2 Bulan' },
        { key: 'hmin1bulan', label: 'H-1 Bulan' },
        { key: 'hmin15hari', label: 'H-15 Hari' }
    ];

    // Headers untuk portfolio tabs
    const headerPortfolio = [
        { key: 'no', label: 'No' },
        { key: 'psid', label: 'PSID' },
        { key: 'nama', label: 'Nama' },
        { 
            key: 'sisaHari', 
            label: 'Sisa Hari',
            render: (item) => {
                const days = item.sisaHari;
                let color = '#48BB78'; // green
                if (days < 15) color = '#E53E3E'; // red
                else if (days < 45) color = '#ED8936'; // orange
                else if (days < 75) color = '#ECC94B'; // yellow
                
                return <Text color={color} fontWeight="bold">{days} hari</Text>;
            }
        },
        { key: 'deadline', label: 'Deadline' },
        { key: 'targetJumlahKarya', label: 'Target Jumlah Karya' },
        { key: 'karyaSelesai', label: 'Karya Selesai' },
        { key: 'sisaKarya', label: 'Sisa Karya' }
    ];

    // Headers untuk search result
    const headerSearch = [
        { key: 'no', label: 'No' },
        { key: 'psid', label: 'PSID' },
        { key: 'nama', label: 'Nama' },
        { key: 'targetKampus', label: 'Target Kampus' },
        { key: 'deadline', label: 'Deadline' },
        {
            key: 'applicationLink',
            label: 'Application Link',
            render: (item) => {
                if (!item.applicationLink || item.applicationLink === '-') {
                    return '-';
                }
                return (
                    <a 
                        href={item.applicationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#FE7743', textDecoration: 'underline' }}
                    >
                        Lihat Link
                    </a>
                );
            }
        },
        { key: 'karyaSelesai', label: 'Karya Selesai' },
        { key: 'targetJumlahKarya', label: 'Target Jumlah Karya' }
    ];

    const getHeaderItems = () => {
        return headerPortfolio;
    };

    const isLoading = loadingPortfolio;

    return (
        <StyledDashboardPortfolio>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Dashboard Portfolio - Overview</h1>

                        {/* KPI Cards Grid */}
                        <div className="stats-grid-portfolio">
                            <InfoCard>
                                <FiClock size="30px" color="#48BB78" />
                                <p>H-3 Bulan</p>
                                {loadingPortfolio ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.hmin3bulan?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiAlertCircle size="30px" color="#ECC94B" />
                                <p>H-2 Bulan</p>
                                {loadingPortfolio ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.hmin2bulan?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiAlertTriangle size="30px" color="#ED8936" />
                                <p>H-1 Bulan</p>
                                {loadingPortfolio ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.hmin1bulan?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiAlertTriangle size="30px" color="#E53E3E" />
                                <p>H-15 Hari</p>
                                {loadingPortfolio ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.hmin15hari?.length || 0}</p>
                                )}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>

            {/* Search Section - Separate Container */}
            <div className="main-content-section" style={{ marginTop: '2rem' }}>
                <ContainerCarrot>
                    <Box bg={cardBg} borderRadius="12px" p={6} boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)">
                        <Text fontSize="xl" fontWeight="bold" mb={4} color="#2D3748">
                            Cari Portfolio Per Nama
                        </Text>
                        
                        {/* Search Form */}
                        <Flex gap={3} mb={6} align="center">
                            <Input
                                placeholder="Masukkan nama siswa"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                maxW="400px"
                                bg={cardBg}
                                borderColor="gray.300"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
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
                        {searchData && (
                            <DataTableComponent
                                tableData={tableData.searchResult}
                                headerItems={headerSearch}
                                isLoading={loadingSearch}
                            />
                        )}
                        
                        {!searchData && (
                            <Text color="gray.500" textAlign="center" py={8}>
                                Masukkan nama siswa dan klik tombol Cari untuk menampilkan portfolio
                            </Text>
                        )}
                    </Box>
                </ContainerCarrot>
            </div>

            {/* Tabs Section - Portfolio Deadline Categories */}
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs 
                        tabItems={tabItems}
                        tableData={tableData}
                        headerItems={headerPortfolio}
                        isLoading={isLoading}
                        getHeaderItemsForTab={getHeaderItems}
                    />
                </ContainerCarrot>
            </div>
        </StyledDashboardPortfolio>
    );
}

export default DashboardPortfolioPage;
