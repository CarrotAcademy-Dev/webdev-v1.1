import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Flex,
    IconButton,
    Input,
    Text,
    Tooltip,
    useColorMode,
} from "@chakra-ui/react";
import { FiExternalLink, FiSearch, FiInbox, FiChevronUp, FiChevronDown } from "react-icons/fi";
import ContainerCarrot from "../../../../../components/Container";
import { getStudentReport } from "../../../../../features/eso/esoApiService";
import usePagination from "../../../../../hooks/usePagination";
import Pagination from "../../../../../components/Pagination/";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { StudentReportStyled } from "./StudentReport.styled";

const StudentReportPage = () => {
    const { colorMode } = useColorMode();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Fetch data
    const { data: reportData = [], isLoading, isError } = useQuery({
        queryKey: ["student-report"],
        queryFn: getStudentReport,
        staleTime: 1000 * 60 * 5,
    });

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return reportData;

        const query = searchQuery.toLowerCase();
        return reportData.filter(
            (item) =>
                item.nama_siswa?.toLowerCase().includes(query) ||
                item.psid?.toLowerCase().includes(query) ||
                item.modul?.toLowerCase().includes(query) ||
                item.mentor?.toLowerCase().includes(query) ||
                item.tema?.toLowerCase().includes(query) 
        );
    }, [reportData, searchQuery]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            // Special handling for date sorting (tanggal)
            if (sortConfig.key === 'tanggal') {
                const parseDate = (dateStr) => {
                    if (!dateStr) return new Date(0);
                    // Handle "DD/MM/YYYY" format
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                    return new Date(dateStr);
                };
                const aDate = parseDate(aValue);
                const bDate = parseDate(bValue);
                return sortConfig.direction === 'asc' 
                    ? aDate - bDate 
                    : bDate - aDate;
            }

            // String comparison for other fields
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } =
        usePagination(sortedData, 20);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Validate URL
    const isValidUrl = (urlString) => {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    // Render skeleton loading
    const renderSkeleton = () => (
        <Box className="table-scroll-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Jam</th>
                        <th>PSID</th>
                        <th>Nama Siswa</th>
                        <th>Modul</th>
                        <th>Group</th>
                        <th>Kelas</th>
                        <th>Mentor</th>
                        <th>Level</th>
                        <th>Tema</th>
                        <th>Absensi</th>
                        <th>Brief Acceptance</th>
                        <th>Visual Perception</th>
                        <th>Quality Concentration</th>
                        <th>Study Case Page</th>
                        <th>Study Case Score</th>
                        <th>Study Case Submit</th>
                        <th>Masterpiece Score</th>
                        <th>Masterpiece Submit</th>
                        <th>Link</th>
                        <th>Kendala</th>
                        <th>Status</th>
                        <th>Cek Presensi</th>
                        <th>Cek Karya</th>
                        <th>Cek Absen</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, index) => (
                        <tr key={index}>
                            {[...Array(25)].map((_, colIndex) => (
                                <td key={colIndex}>
                                    <Skeleton />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    );

    if (isError) {
        return (
            <ContainerCarrot>
                <StudentReportStyled data-theme={colorMode}>
                    <Box className="error-container">
                        <Text color="red.500" fontSize="lg">
                            ❌ Gagal memuat data. Silakan coba lagi.
                        </Text>
                    </Box>
                </StudentReportStyled>
            </ContainerCarrot>
        );
    }

    return (
        <ContainerCarrot>
            <StudentReportStyled data-theme={colorMode}>
                <Box className="header">
                    <Box>
                        <Text className="title">📊 Student Report</Text>
                        <Text className="subtitle">
                            Laporan lengkap siswa dengan detail pertemuan dan penilaian
                        </Text>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box className="search-container">
                    <Box position="relative" width={{ base: "100%", md: "400px" }}>
                        <Input
                            placeholder="Cari berdasarkan nama, PSID, modul, mentor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            paddingLeft="40px"
                            size="lg"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)">
                            <FiSearch size={20} />
                        </Box>
                    </Box>
                </Box>

                {/* Table */}
                {isLoading ? (
                    renderSkeleton()
                ) : sortedData.length === 0 ? (
                    <Box className="empty-state">
                        <FiInbox size={64} />
                        <Text fontSize="xl" marginTop="16px">
                            {searchQuery ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data available"}
                        </Text>
                    </Box>
                ) : (
                    <>
                        <Box className="table-scroll-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th 
                                            onClick={() => handleSort('tanggal')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Tanggal
                                                {sortConfig.key === 'tanggal' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th>Jam</th>
                                        <th>PSID</th>
                                        <th 
                                            onClick={() => handleSort('nama_siswa')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Nama Siswa
                                                {sortConfig.key === 'nama_siswa' && (
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
                                        <th>Group</th>
                                        <th>Kelas</th>
                                        <th 
                                            onClick={() => handleSort('mentor')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Mentor
                                                {sortConfig.key === 'mentor' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('level')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Level
                                                {sortConfig.key === 'level' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('tema')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Tema
                                                {sortConfig.key === 'tema' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('absensi')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Absensi
                                                {sortConfig.key === 'absensi' && (
                                                    sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th>Brief Acceptance</th>
                                        <th>Visual Perception</th>
                                        <th>Quality Concentration</th>
                                        <th>Study Case Page</th>
                                        <th>Study Case Score</th>
                                        <th>Study Case Submit</th>
                                        <th>Masterpiece Score</th>
                                        <th>Masterpiece Submit</th>
                                        <th>Link</th>
                                        <th>Kendala</th>
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
                                        <th>Cek Presensi</th>
                                        <th>Cek Karya</th>
                                        <th>Cek Absen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={`${item.psid}-${item.tanggal}-${index}`}>
                                            <td>{item.tanggal || "-"}</td>
                                            <td>{item.jam || "-"}</td>
                                            <td>{item.psid || "-"}</td>
                                            <td>{item.nama_siswa || "-"}</td>
                                            <td>{item.modul || "-"}</td>
                                            <td>{item.group || "-"}</td>
                                            <td>{item.kelas || "-"}</td>
                                            <td>{item.mentor || "-"}</td>
                                            <td>{item.level || "-"}</td>
                                            <td>
                                                <Tooltip content={item.tema || "-"}>
                                                    <Text noOfLines={2} maxW="200px">
                                                        {item.tema || "-"}
                                                    </Text>
                                                </Tooltip>
                                            </td>
                                            <td>{item.absensi || "-"}</td>
                                            <td>{item.brief_acceptance || "-"}</td>
                                            <td>{item.visual_perception || "-"}</td>
                                            <td>{item.quality_concentration || "-"}</td>
                                            <td>{item.study_case_page || "-"}</td>
                                            <td>{item.study_case_score || "-"}</td>
                                            <td>{item.study_case_submit || "-"}</td>
                                            <td>{item.masterpiece_score || "-"}</td>
                                            <td>{item.masterpiece_submit || "-"}</td>
                                            <td>
                                                {isValidUrl(item.link) ? (
                                                    <IconButton
                                                        as="a"
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        size="sm"
                                                        bg="blue.500"
                                                        color="white"
                                                        _hover={{ 
                                                            bg: "blue.600", 
                                                            transform: "translateY(-2px)", 
                                                            boxShadow: "lg" 
                                                        }}
                                                        _active={{ 
                                                            bg: "blue.700", 
                                                            transform: "translateY(0)" 
                                                        }}
                                                        aria-label="Open Link"
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : (
                                                    <Text fontSize="sm" color="gray.500">
                                                        No link
                                                    </Text>
                                                )}
                                            </td>
                                            <td>
                                                <Tooltip content={item.kendala || "-"}>
                                                    <Text noOfLines={2} maxW="200px">
                                                        {item.kendala || "-"}
                                                    </Text>
                                                </Tooltip>
                                            </td>
                                            <td>{item.status || "-"}</td>
                                            <td>{item.cek_presensi || "-"}</td>
                                            <td>{item.cek_karya || "-"}</td>
                                            <td>{item.cek_absen || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>

                        {/* Pagination */}
                        <Box className="pagination-container">
                            <Text className="pagination-info">
                                Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
                            </Text>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </Box>
                    </>
                )}
            </StudentReportStyled>
        </ContainerCarrot>
    );
};

export default StudentReportPage;
