import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Flex,
    Input,
    Text,
    useColorMode
} from "@chakra-ui/react";
import { FiSearch, FiInbox, FiChevronUp, FiChevronDown } from "react-icons/fi";
import ContainerCarrot from "../../../../../components/Container";
import { getCariNamaMonthly } from "../../../../../features/eso/esoApiService";
import usePagination from "../../../../../hooks/usePagination";
import Pagination from "../../../../../components/Pagination/";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CariNamaMonthlyStyled } from "./CariNamaMonthly.styled";

const CariNamaMonthlyPage = () => {
    const { colorMode } = useColorMode();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Fetch data
    const { data: cariNamaData = [], isLoading, isError } = useQuery({
        queryKey: ['cariNamaMonthly'],
        queryFn: getCariNamaMonthly,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Search logic - filter by nama_siswa, modul, kelas
    const filteredData = useMemo(() => {
        if (!searchQuery) return cariNamaData;

        return cariNamaData.filter((item) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (item.nama_siswa && item.nama_siswa.toLowerCase().includes(searchLower)) ||
                (item.modul && item.modul.toLowerCase().includes(searchLower)) ||
                (item.kelas && item.kelas.toLowerCase().includes(searchLower))
            );
        });
    }, [cariNamaData, searchQuery]);

    // Sort logic - sortable: nama_siswa, modul, kelas, hari_terakhir_schedule
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            // String comparison
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination - 20 items per page
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems,
        setCurrentPage } =
        usePagination(sortedData, 20);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <ContainerCarrot>
            <CariNamaMonthlyStyled colorMode={colorMode}>
                <Box className="header">
                    <h1>Cari Nama Monthly</h1>
                    <Text className="subtitle">
                        Data siswa untuk pencarian bulanan
                    </Text>
                </Box>

                {/* Search Bar */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama siswa, modul, atau kelas..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            pl="40px"
                        />
                        <Box
                            position="absolute"
                            left="12px"
                            top="50%"
                            transform="translateY(-50%)"
                            pointerEvents="none"
                        >
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}>
                            <Skeleton count={20} height={40} style={{ marginBottom: '8px' }} />
                        </Box>
                    ) : isError ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>Gagal memuat data. Silakan refresh halaman.</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>
                                {searchQuery
                                    ? "Tidak ada data yang sesuai dengan pencarian"
                                    : "Belum ada data cari nama monthly"}
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>No</th>
                                        <th 
                                            onClick={() => handleSort('nama_siswa')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '200px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Nama Siswa
                                                {sortConfig.key === 'nama_siswa' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('modul')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '120px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Modul
                                                {sortConfig.key === 'modul' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('kelas')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '150px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Kelas
                                                {sortConfig.key === 'kelas' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('hari_terakhir_schedule')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '180px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Hari Terakhir Schedule
                                                {sortConfig.key === 'hari_terakhir_schedule' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{(currentPage - 1) * 20 + index + 1}</td>
                                            <td>{item.nama_siswa}</td>
                                            <td>{item.modul}</td>
                                            <td>{item.kelas}</td>
                                            <td>{item.hari_terakhir_schedule}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Flex justify="center" mt={4}>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={goToPage}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        totalItems={totalItems}
                                    />
                                </Flex>
                            )}
                        </>
                    )}
                </Box>
            </CariNamaMonthlyStyled>
        </ContainerCarrot>
    );
};

export default CariNamaMonthlyPage;
