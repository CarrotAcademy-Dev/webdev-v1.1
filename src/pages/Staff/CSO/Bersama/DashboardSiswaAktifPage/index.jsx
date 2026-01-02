import ContainerCarrot from "@/components/Container";
import Pagination from "@/components/Pagination";
import { Select, Box, Grid, GridItem, Input, InputGroup, InputLeftElement, Button, Flex, Text, IconButton, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getDataSiswaAktifPerBulan, getDashboardSiswaAktifTahunan } from "@/features/cso/csoApiService";
import { StyledDashboardSiswaAktifPage } from "./DashboardSiswaAktif.styled";
import { useState, useMemo } from "react";
import { FiSearch, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Bar } from 'react-chartjs-2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function DashboardSiswaAktifPage() {
    const { colorMode } = useColorMode();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');

    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

    // States untuk chart filter (dari bulan - sampai bulan)
    const [chartStartMonth, setChartStartMonth] = useState('0'); // January
    const [chartEndMonth, setChartEndMonth] = useState('11'); // December

    // States untuk pagination, search, dan sort
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch data tahunan untuk chart dan tabel-tabel
    const { data: dashboardTahunan, isLoading: isLoadingTahunan } = useQuery({
        queryKey: ['dashboardSiswaAktifTahunan', selectedYear],
        queryFn: () => getDashboardSiswaAktifTahunan(selectedYear),
        placeholderData: {}
    });

    const { data: siswaData, isLoading: isLoadingBulanan, isError, error } = useQuery({
        queryKey: ['siswaAktifPerBulan', selectedYear, selectedMonth],
        queryFn: () => getDataSiswaAktifPerBulan({ 
            tahun: selectedYear, 
            bulan: monthNames[parseInt(selectedMonth)]
        }),
        placeholderData: []
    });

    const isLoading = isLoadingTahunan || isLoadingBulanan;

    // Process data untuk chart dan tabel-tabel
    const processedData = useMemo(() => {
        if (!siswaData || siswaData.length === 0) {
            return {
                totalAktif: 0,
                totalOnline: 0,
                totalOffline: 0,
                totalCuti: 0,
                totalNew: 0,
                totalRetention: 0,
                byModul: {},
                byKelas: {},
                byStatus: {},
                onlineStudents: [],
                offlineStudents: [],
                cutiStudents: [],
                newStudents: [],
                retentionStudents: []
            };
        }

        const stats = {
            totalAktif: siswaData.length,
            totalOnline: 0,
            totalOffline: 0,
            totalCuti: 0,
            totalNew: 0,
            totalRetention: 0,
            byModul: {},
            byKelas: {},
            byStatus: {},
            onlineStudents: [],
            offlineStudents: [],
            cutiStudents: [],
            newStudents: [],
            retentionStudents: []
        };

        siswaData.forEach(siswa => {
            const kelas = siswa.kelas || '';
            const modul = siswa.modul || '';
            const status = siswa.status || '';

            // Count by class type
            if (kelas === 'OL') {
                stats.totalOnline++;
                stats.onlineStudents.push(siswa);
            } else if (kelas === 'OF') {
                stats.totalOffline++;
                stats.offlineStudents.push(siswa);
            }

            // Count by status
            if (status === 'Cuti') {
                stats.totalCuti++;
                stats.cutiStudents.push(siswa);
            } else if (status === 'New') {
                stats.totalNew++;
                stats.newStudents.push(siswa);
            } else if (status === 'Retention') {
                stats.totalRetention++;
                stats.retentionStudents.push(siswa);
            }

            // Count by module
            if (modul) {
                stats.byModul[modul] = (stats.byModul[modul] || 0) + 1;
            }

            // Count by class
            if (kelas) {
                stats.byKelas[kelas] = (stats.byKelas[kelas] || 0) + 1;
            }

            // Count by status
            if (status) {
                stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            }
        });

        return stats;
    }, [siswaData]);

    // Prepare chart data untuk trend tahunan
    const chartData = useMemo(() => {
        if (!dashboardTahunan || !dashboardTahunan.rec_trend_program_siswa) {
            return null;
        }

        const data = dashboardTahunan.rec_trend_program_siswa;
        const startIdx = parseInt(chartStartMonth);
        const endIdx = parseInt(chartEndMonth);
        
        // Ambil bulan yang dipilih (dari startMonth sampai endMonth)
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const selectedMonths = monthLabels.slice(startIdx, endIdx + 1);

        // Extract data untuk setiap program
        const datasets = [
            {
                label: 'Foundation',
                data: data.foundation?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#ec6969ff',
                borderColor: '#ec6969ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Drawing',
                data: data.drawing?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#47c174ff',
                borderColor: '#47c174ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Painting',
                data: data.painting?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#8d63d4ff',
                borderColor: '#8d63d4ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Digital',
                data: data.digital?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#648adcff',
                borderColor: '#648adcff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Portfolio',
                data: data.portfolio?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#db8c61ff',
                borderColor: '#db8c61ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Bootcamp',
                data: data.bootcamp?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#52c1dcff',
                borderColor: '#52c1dcff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Trial',
                data: data.trial?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#d2b150ff',
                borderColor: '#d2b150ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'Cuti',
                data: data.cuti?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#e05593ff',
                borderColor: '#e05593ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
            {
                label: 'New',
                data: data.new_student?.slice(startIdx, endIdx + 1).map(item => item[0] || 0) || [],
                backgroundColor: '#9cd250ff',
                borderColor: '#9cd250ff',
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
            },
        ];

        return {
            labels: selectedMonths,
            datasets: datasets
        };
    }, [dashboardTahunan, chartStartMonth, chartEndMonth]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 11
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: `Trend Program Siswa ${selectedYear} (${monthNames[parseInt(chartStartMonth)]} - ${monthNames[parseInt(chartEndMonth)]})`,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 13,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        weight: '500'
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        barPercentage: 0.8,
        categoryPercentage: 0.9
    };

    // Filter, Sort, dan Pagination untuk tabel list siswa
    const filteredSiswaData = useMemo(() => {
        if (!searchQuery) return siswaData;
        
        return siswaData.filter(siswa => {
            const searchLower = searchQuery.toLowerCase();
            return (
                siswa.nama?.toLowerCase().includes(searchLower) ||
                siswa.modul?.toLowerCase().includes(searchLower) ||
                siswa.status?.toLowerCase().includes(searchLower) ||
                siswa.kelas?.toLowerCase().includes(searchLower)
            );
        });
    }, [siswaData, searchQuery]);

    const sortedSiswaData = useMemo(() => {
        if (!sortConfig.key) return filteredSiswaData;

        const sorted = [...filteredSiswaData].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredSiswaData, sortConfig]);

    const paginatedSiswaData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedSiswaData.slice(startIndex, endIndex);
    }, [sortedSiswaData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedSiswaData.length / itemsPerPage);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledDashboardSiswaAktifPage data-theme={colorMode}>
            <ContainerCarrot>
                <div className="hero-section">
                    <h1 className="page-title">CHART TREND PROGRAM SISWA</h1>
                    <div className="filter-section">
                        <Box display="flex" gap={4} alignItems="center">
                            <Box>
                                <label>Month: </label>
                                <Select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    width="150px"
                                    border="1px solid"
                                    borderColor="yellow.600"
                                >
                                    {monthNames.map((month, index) => (
                                        <option key={index} value={index}>
                                            {month}
                                        </option>
                                    ))}
                                </Select>
                            </Box>
                            <Box>
                                <label>Year: </label>
                                <Select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    width="150px"
                                    border="1px solid"
                                    borderColor="yellow.600"
                                >
                                    {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </Select>
                            </Box>
                        </Box>
                    </div>
                </div>

                {/* Summary Cards */}
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
                    <GridItem>
                        <Box className="summary-card">
                            <h3>Total Siswa Aktif</h3>
                            {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="number">{processedData.totalAktif}</p>}
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box className="summary-card">
                            <h3>Online</h3>
                            {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="number">{processedData.totalOnline}</p>}
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box className="summary-card">
                            <h3>Offline</h3>
                            {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="number">{processedData.totalOffline}</p>}
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box className="summary-card">
                            <h3>Cuti</h3>
                            <p className="number">{processedData.totalCuti}</p>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box className="summary-card">
                            <h3>New</h3>
                            <p className="number">{processedData.totalNew}</p>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box className="summary-card">
                            <h3>Retention</h3>
                            <p className="number">{processedData.totalRetention}</p>
                        </Box>
                    </GridItem>
                </Grid>

                {/* Chart Section */}
                <Box className="chart-section" mb={6}>
                    <h2 className="section-title">Distribusi Per Program</h2>
                    <Box className="chart-container">
                        {/* Temporary simple bar representation */}
                        <div className="simple-bars">
                            {Object.entries(processedData.byModul).map(([modul, count]) => (
                                <div key={modul} className="bar-item">
                                    <div className="bar-label">{modul}</div>
                                    <div className="bar-wrapper">
                                        <div 
                                            className="bar-fill" 
                                            style={{ 
                                                width: `${(count / processedData.totalAktif) * 100}%`,
                                                backgroundColor: getRandomColor(modul)
                                            }}
                                        >
                                            <span className="bar-value">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Box>
                </Box>

                {/* Tabel List Siswa Aktif */}
                <Box className="table-section" mb={6}>
                    <h2 className="section-title">
                        LIST SISWA AKTIF - {monthNames[parseInt(selectedMonth)]} {selectedYear}
                    </h2>
                    
                    <div className="table-wrapper">
                        {/* Search Bar - Fixed tidak ikut scroll */}
                        <div className="search-container">
                            <InputGroup maxW="400px">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search across all columns..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    bg={cardBg}
                                    borderRadius="md"
                                />
                            </InputGroup>
                            {searchQuery && (
                                <Text fontSize="sm" color="gray.600" mt={2}>
                                    {sortedSiswaData.length} results
                                </Text>
                            )}
                        </div>

                        {/* Table dengan horizontal scroll */}
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th 
                                            onClick={() => handleSort('nama')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Nama
                                                {sortConfig.key === 'nama' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('modul')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Modul
                                                {sortConfig.key === 'modul' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('status')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Status
                                                {sortConfig.key === 'status' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('kelas')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Class
                                                {sortConfig.key === 'kelas' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, idx) => (
                                            <tr key={idx}>
                                                <td><Skeleton height="20px" /></td>
                                                <td><Skeleton height="20px" /></td>
                                                <td><Skeleton height="20px" width="80px" /></td>
                                                <td><Skeleton height="20px" width="80px" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <>
                                            {paginatedSiswaData.map((siswa, index) => (
                                                <tr key={index}>
                                                    <td>{siswa.nama}</td>
                                                    <td>{siswa.modul}</td>
                                                    <td>
                                                        <span className={`status-badge ${siswa.status?.toLowerCase() || ''}`}>
                                                            {siswa.status || '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`class-badge ${siswa.kelas?.toLowerCase() || ''}`}>
                                                            {siswa.kelas}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {paginatedSiswaData.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                                        {searchQuery ? 'No matching data found' : 'No data available'}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {sortedSiswaData.length > 0 && totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                startIndex={(currentPage - 1) * itemsPerPage}
                                endIndex={Math.min(currentPage * itemsPerPage, sortedSiswaData.length)}
                                totalItems={sortedSiswaData.length}
                            />
                        )}
                    </div>
                </Box>

                {/* DATA TAHUNAN - Tabel-Tabel Lainnya */}
                {dashboardTahunan && Object.keys(dashboardTahunan).length > 0 && (
                    <>
                        {/* Chart Trend Program Siswa */}
                        {dashboardTahunan.rec_trend_program_siswa && chartData && (
                            <Box className="chart-section" mb={6}>
                                <h2 className="section-title">CHART TREND PROGRAM SISWA {selectedYear}</h2>
                                
                                {/* Filter Bulan */}
                                <Flex justify="center" gap={4} mb={4} flexWrap="wrap">
                                    <Flex align="center" gap={2}>
                                        <Text fontWeight="600" fontSize="sm">Dari:</Text>
                                        <Select
                                            value={chartStartMonth}
                                            onChange={(e) => setChartStartMonth(e.target.value)}
                                            size="sm"
                                            maxW="150px"
                                            bg={cardBg}
                                        >
                                            {monthNames.map((month, idx) => (
                                                <option key={idx} value={idx}>{month}</option>
                                            ))}
                                        </Select>
                                    </Flex>
                                    <Flex align="center" gap={2}>
                                        <Text fontWeight="600" fontSize="sm">Sampai:</Text>
                                        <Select
                                            value={chartEndMonth}
                                            onChange={(e) => setChartEndMonth(e.target.value)}
                                            size="sm"
                                            maxW="150px"
                                            bg={cardBg}
                                        >
                                            {monthNames.map((month, idx) => (
                                                <option key={idx} value={idx}>{month}</option>
                                            ))}
                                        </Select>
                                    </Flex>
                                </Flex>

                                {/* Chart */}
                                <Box className="chart-container" height="400px">
                                    <Bar data={chartData} options={chartOptions} />
                                </Box>
                            </Box>
                        )}

                        {/* Tabel Trend Program Siswa */}
                        {dashboardTahunan.rec_trend_program_siswa && (
                            <Box className="table-section" mb={6}>
                                <h2 className="section-title">TABEL TREND PROGRAM SISWA {selectedYear}</h2>
                                <TrendProgramTable data={dashboardTahunan.rec_trend_program_siswa} isLoading={isLoadingTahunan} />
                            </Box>
                        )}

                        {/* Grid untuk Tabel Online dan Offline - Responsive */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
                            {/* Tabel Online */}
                            {dashboardTahunan.rec_trend_program_siswa_online && (
                                <GridItem minW={0} overflow="hidden">
                                    <Box className="table-section">
                                        <h2 className="section-title">TABEL SISWA AKTIF ONLINE</h2>
                                        <TrendProgramTable data={dashboardTahunan.rec_trend_program_siswa_online} isLoading={isLoadingTahunan} />
                                    </Box>
                                </GridItem>
                            )}

                            {/* Tabel Offline */}
                            {dashboardTahunan.rec_trend_program_siswa_offline && (
                                <GridItem minW={0} overflow="hidden">
                                    <Box className="table-section">
                                        <h2 className="section-title">TABEL SISWA AKTIF OFFLINE</h2>
                                        <TrendProgramTable data={dashboardTahunan.rec_trend_program_siswa_offline} isLoading={isLoadingTahunan} />
                                    </Box>
                                </GridItem>
                            )}
                        </Grid>

                        {/* Grid untuk 3 Tabel Kecil - Responsive */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={6}>
                            {/* Tabel Siswa Baru Perhari */}
                            {dashboardTahunan.rec_siswa_baru_perhari && (
                                <GridItem minW={0} overflow="hidden">
                                    <Box className="table-section" mb={6}>
                                        <h2 className="section-title">TABEL SISWA BARU PER HARI</h2>
                                        <SimpleDailyTable data={dashboardTahunan.rec_siswa_baru_perhari} />
                                    </Box>
                                </GridItem>
                            )}
                            
                            {/* Tabel Siswa Baru Perbulan */}
                            {dashboardTahunan.rec_siswa_baru_perbulan && (
                                <GridItem minW={0} overflow="hidden">
                                    <Box className="table-section">
                                        <h2 className="section-title">TABEL SISWA BARU PERBULAN</h2>
                                        <SimpleMonthlyTable data={dashboardTahunan.rec_siswa_baru_perbulan} />
                                    </Box>
                                </GridItem>
                            )}

                            {/* Tabel Siswa Off Perbulan */}
                            {dashboardTahunan.rec_list_siswa_off_perbulan && (
                                <GridItem minW={0} overflow="hidden">
                                    <Box className="table-section">
                                        <h2 className="section-title">TABEL SISWA OFF PERBULAN</h2>
                                        <SimpleMonthlyTable data={dashboardTahunan.rec_list_siswa_off_perbulan} />
                                    </Box>
                                </GridItem>
                            )}

                            {/* Tabel Cuti Realtime */}
                            {dashboardTahunan.rec_cuti_realtime && (
                                <GridItem minW={0} overflow="hidden">
                                    <Box className="table-section">
                                        <h2 className="section-title">TABEL SISWA CUTI REALTIME</h2>
                                        <SimpleMonthlyTable data={dashboardTahunan.rec_cuti_realtime} />
                                    </Box>
                                </GridItem>
                            )}
                        </Grid>

                        {/* Tabel Kelas Real vs Tagihan Perbulan */}
                        {dashboardTahunan.rec_perbandingan_kelas_real_tagihan_perbulan && (
                            <Box className="table-section" mb={6}>
                                <h2 className="section-title">TABEL DATA SESI KELAS VS TAGIHAN PER BULAN</h2>
                                <PerbandinganKelasTable data={dashboardTahunan.rec_perbandingan_kelas_real_tagihan_perbulan} />
                            </Box>
                        )}

                        {/* Tabel Kelas Real Perminggu */}
                        {dashboardTahunan.rec_kelas_real_perminggu && (
                            <Box className="table-section" mb={6}>
                                <h2 className="section-title">TABEL DATA KELAS REAL PER MINGGU</h2>
                                <WeeklyTable data={dashboardTahunan.rec_kelas_real_perminggu} />
                            </Box>
                        )}

                        {/* Tabel Kelas Real Perhari */}
                        {dashboardTahunan.rec_kelas_real_perhari && (
                            <Box className="table-section" mb={6}>
                                <h2 className="section-title">TABEL DATA KELAS REAL PER HARI</h2>
                                <DailyKelasTable data={dashboardTahunan.rec_kelas_real_perhari} />
                            </Box>
                        )}
                    </>
                )}
            </ContainerCarrot>
        </StyledDashboardSiswaAktifPage>
    );

    // Helper functions
    // function countModulByClass(modul, kelas) {
    //     return siswaData.filter(s => 
    //         s.modul?.includes(modul) && s.kelas === kelas
    //     ).length;
    // }

    // function countStatusByClass(status, kelas) {
    //     return siswaData.filter(s => 
    //         s.status === status && s.kelas === kelas
    //     ).length;
    // }

    function getRandomColor(str) {
        const colors = [
            '#f97316', '#fb923c', '#fdba74', '#fed7aa'
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
}

// Helper Components untuk Tabel-tabel
const TrendProgramTable = ({ data, isLoading }) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Bulan</th>
                        <th>Full-Time</th>
                        <th>Foundation</th>
                        <th>Drawing</th>
                        <th>Painting</th>
                        <th>Digital</th>
                        <th>Portfolio</th>
                        <th>Bootcamp</th>
                        <th>Trial</th>
                        <th>Cuti</th>
                        <th>New</th>
                        <th>Retention</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <tr key={idx}>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                                <td><Skeleton height="20px" /></td>
                            </tr>
                        ))
                    ) : (
                        monthNames.map((month, index) => (
                            <tr key={index}>
                                <td><strong>{month}</strong></td>
                                <td>{data.fulltime?.[index]?.[0] || 0}</td>
                                <td>{data.foundation?.[index]?.[0] || 0}</td>
                                <td>{data.drawing?.[index]?.[0] || 0}</td>
                                <td>{data.painting?.[index]?.[0] || 0}</td>
                                <td>{data.digital?.[index]?.[0] || 0}</td>
                                <td>{data.portfolio?.[index]?.[0] || 0}</td>
                                <td>{data.bootcamp?.[index]?.[0] || 0}</td>
                                <td>{data.trial?.[index]?.[0] || 0}</td>
                                <td>{data.cuti?.[index]?.[0] || 0}</td>
                                <td>{data.new_student?.[index]?.[0] || 0}</td>
                                <td>{data.retention?.[index]?.[0] || 0}</td>
                                <td><strong>{data.total_active_student?.[index]?.[0] || 0}</strong></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

const SimpleMonthlyTable = ({ data }) => {
    const months = [
        { key: 'januari', label: 'Januari' },
        { key: 'februari', label: 'Februari' },
        { key: 'maret', label: 'Maret' },
        { key: 'april', label: 'April' },
        { key: 'mei', label: 'Mei' },
        { key: 'juni', label: 'Juni' },
        { key: 'juli', label: 'Juli' },
        { key: 'agustus', label: 'Agustus' },
        { key: 'september', label: 'September' },
        { key: 'oktober', label: 'Oktober' },
        { key: 'november', label: 'November' },
        { key: 'desember', label: 'Desember' }
    ];

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Bulan</th>
                        <th>Jumlah Siswa</th>
                    </tr>
                </thead>
                <tbody>
                    {months.map((month) => (
                        <tr key={month.key}>
                            <td><strong>{month.label}</strong></td>
                            <td>{data[month.key] || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PerbandinganKelasTable = ({ data }) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Bulan</th>
                        <th>Tagihan</th>
                        <th>Real</th>
                        <th>Hangus/Pengganti</th>
                    </tr>
                </thead>
                <tbody>
                    {monthNames.map((month, index) => (
                        <tr key={index}>
                            <td><strong>{month}</strong></td>
                            <td>{data.tagihan?.[index]?.[0] || 0}</td>
                            <td>{data.real?.[index]?.[0] || 0}</td>
                            <td>{data.hangus_atau_pengganti?.[index]?.[0] || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const WeeklyTable = ({ data }) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Bulan</th>
                        <th>Minggu 1</th>
                        <th>Minggu 2</th>
                        <th>Minggu 3</th>
                        <th>Minggu 4</th>
                        <th>Minggu 5</th>
                    </tr>
                </thead>
                <tbody>
                    {monthNames.map((month, index) => (
                        <tr key={index}>
                            <td><strong>{month}</strong></td>
                            <td>{data.minggu_satu?.[index]?.[0] || 0}</td>
                            <td>{data.minggu_dua?.[index]?.[0] || 0}</td>
                            <td>{data.minggu_tiga?.[index]?.[0] || 0}</td>
                            <td>{data.minggu_empat?.[index]?.[0] || 0}</td>
                            <td>{data.minggu_lima?.[index]?.[0] || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SimpleDailyTable = ({ data }) => {
    const days = [
        { key: 'senin', label: 'Senin' },
        { key: 'selasa', label: 'Selasa' },
        { key: 'rabu', label: 'Rabu' },
        { key: 'kamis', label: 'Kamis' },
        { key: 'jumat', label: 'Jumat' },
        { key: 'sabtu', label: 'Sabtu' }
    ];

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Hari</th>
                        <th>Jumlah Siswa</th>
                    </tr>
                </thead>
                <tbody>
                    {days.map((day) => (
                        <tr key={day.key}>
                            <td><strong>{day.label}</strong></td>
                            <td>{data[day.key] || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const DailyKelasTable = ({ data }) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Bulan</th>
                        <th>Senin</th>
                        <th>Selasa</th>
                        <th>Rabu</th>
                        <th>Kamis</th>
                        <th>Jumat</th>
                        <th>Sabtu</th>
                    </tr>
                </thead>
                <tbody>
                    {monthNames.map((month, index) => (
                        <tr key={index}>
                            <td><strong>{month}</strong></td>
                            <td>{data.senin?.[index]?.[0] || 0}</td>
                            <td>{data.selasa?.[index]?.[0] || 0}</td>
                            <td>{data.rabu?.[index]?.[0] || 0}</td>
                            <td>{data.kamis?.[index]?.[0] || 0}</td>
                            <td>{data.jumat?.[index]?.[0] || 0}</td>
                            <td>{data.sabtu?.[index]?.[0] || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardSiswaAktifPage;
