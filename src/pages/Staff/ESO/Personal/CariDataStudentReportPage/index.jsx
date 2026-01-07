import { useState, useMemo } from 'react';
import { Box, Flex, Text, Button, useToast, useColorModeValue, useColorMode, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getListNamaStudentReport, getDataStudentReport } from '@/features/eso/esoApiService';
import { StyledCariDataStudentReport } from './CariDataStudentReport.styled';
import ContainerCarrot from '@/components/Container';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiSearch, FiUser, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Pagination from '@/components/Pagination';

function CariDataStudentReportPage() {
    const toast = useToast();
    const { colorMode } = useColorMode();

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
    const tableHeaderHoverBg = useColorModeValue('#f5efdcff', '#3A4556');
    const tableHeaderColor = useColorModeValue('#3b3b43ff', 'dark.text.primary');

    const [searchInput, setSearchInput] = useState('');
    const [selectedNama, setSelectedNama] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [studentReportData, setStudentReportData] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Fetch list nama siswa untuk dropdown
    const { data: namaList = [], isLoading: isLoadingNama } = useQuery({
        queryKey: ['list-nama-student-report'],
        queryFn: getListNamaStudentReport,
        staleTime: 10 * 60 * 1000 // Cache 10 menit
    });

    // Mutation untuk search student report
    const searchMutation = useMutation({
        mutationFn: getDataStudentReport,
        onSuccess: (data) => {
            setStudentReportData(data);
            setHasSearched(true);
            setCurrentPage(1);
            toast({
                title: 'Data ditemukan',
                description: `Ditemukan ${data.length} record untuk ${selectedNama}`,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
        },
        onError: (error) => {
            setStudentReportData([]);
            setHasSearched(true);
            toast({
                title: 'Data tidak ditemukan',
                description: error.message,
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
        }
    });

    // Filter nama berdasarkan input search
    const filteredNamaList = useMemo(() => {
        if (!searchInput || !namaList.length) return [];
        const query = searchInput.toLowerCase();
        return namaList.filter(nama => 
            nama.toLowerCase().includes(query)
        ).slice(0, 10); // Max 10 suggestions
    }, [searchInput, namaList]);

    // Handle select nama dari dropdown
    const handleSelectNama = (nama) => {
        setSelectedNama(nama);
        setSearchInput(nama);
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    // Handle search button
    const handleSearch = () => {
        if (!selectedNama) {
            toast({
                title: 'Nama siswa harus dipilih',
                description: 'Silakan pilih nama siswa dari dropdown',
                status: 'warning',
                duration: 2000,
                isClosable: true
            });
            return;
        }
        searchMutation.mutate(selectedNama);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        setShowDropdown(value.length > 0);
        setHighlightedIndex(-1);
        // Reset selected nama jika user mengetik lagi
        if (value !== selectedNama) {
            setSelectedNama('');
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || filteredNamaList.length === 0) {
            // If dropdown not shown but Enter pressed, trigger search
            if (e.key === 'Enter' && selectedNama) {
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredNamaList.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredNamaList.length) {
                    handleSelectNama(filteredNamaList[highlightedIndex]);
                } else if (selectedNama) {
                    handleSearch();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Helper untuk sorting
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Handle tanggal sorting
            if (sortConfig.key === 'tanggal') {
                const parseDate = (str) => {
                    if (!str) return new Date(0);
                    const parts = str.split('/');
                    if (parts.length === 3) {
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                    return new Date(str);
                };
                aVal = parseDate(aVal);
                bVal = parseDate(bVal);
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Handle sort
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sort data
    const sortedData = useMemo(() => 
        sortData(studentReportData, sortConfig),
        [studentReportData, sortConfig]
    );

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <Box ml={1} opacity={0.3}><FiChevronUp /></Box>;
        }
        return sortConfig.direction === 'asc' 
            ? <Box ml={1}><FiChevronUp /></Box> 
            : <Box ml={1}><FiChevronDown /></Box>;
    };

    return (
        <StyledCariDataStudentReport data-theme={colorMode}>
            <ContainerCarrot>
                <h1 className="page-title">Cari Data Student Report</h1>

                {/* Search Section */}
                <Box bg={cardBg} p={6} borderRadius="md" boxShadow="sm" mb={6}>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={tableHeaderColor}>
                        Cari Data Siswa
                    </Text>
                    
                    <Flex gap={4} align="flex-start">
                        <Box flex={1} position="relative">
                            <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color="gray" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Ketik nama siswa..."
                                    value={searchInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setShowDropdown(searchInput.length > 0)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    bg={cardBg}
                                    borderColor="gray.300"
                                    _focus={{ borderColor: '#FE7743', boxShadow: '0 0 0 1px #FE7743' }}
                                />
                            </InputGroup>

                            {/* Dropdown suggestions */}
                            {showDropdown && filteredNamaList.length > 0 && (
                                <Box
                                    position="absolute"
                                    top="100%"
                                    left={0}
                                    right={0}
                                    mt={1}
                                    bg={cardBg}
                                    boxShadow="lg"
                                    borderRadius="md"
                                    maxH="300px"
                                    overflowY="auto"
                                    zIndex={10}
                                    border="1px solid"
                                    borderColor="gray.200"
                                >
                                    {filteredNamaList.map((nama, index) => (
                                        <Box
                                            key={index}
                                            p={3}
                                            cursor="pointer"
                                            bg={highlightedIndex === index ? tableHeaderHoverBg : 'transparent'}
                                            _hover={{ bg: tableHeaderHoverBg }}
                                            onClick={() => handleSelectNama(nama)}
                                            borderBottom={index < filteredNamaList.length - 1 ? '1px solid' : 'none'}
                                            borderColor="gray.100"
                                            transition="background-color 0.15s ease"
                                        >
                                            <Flex align="center" gap={2}>
                                                <FiUser color="#FE7743" />
                                                <Text color={tableHeaderColor}>{nama}</Text>
                                            </Flex>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {isLoadingNama && (
                                <Text fontSize="sm" color={textColor} mt={2}>
                                    Memuat daftar nama siswa...
                                </Text>
                            )}
                        </Box>

                        <Button
                            colorScheme="orange"
                            size="lg"
                            onClick={handleSearch}
                            isLoading={searchMutation.isPending}
                            leftIcon={<FiSearch />}
                            bg="#FE7743"
                            _hover={{ bg: '#fe8c5a' }}
                            px={8}
                        >
                            Cari
                        </Button>
                    </Flex>

                    {selectedNama && (
                        <Text fontSize="sm" color="green.500" mt={2}>
                            ✓ Nama terpilih: <strong>{selectedNama}</strong>
                        </Text>
                    )}
                </Box>

                {/* Results Section */}
                {hasSearched && (
                    <Box bg={cardBg} p={6} borderRadius="md" boxShadow="sm">
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="semibold" color={tableHeaderColor}>
                                Hasil Pencarian: {selectedNama}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                                Total: {studentReportData.length} record
                            </Text>
                        </Flex>

                        {searchMutation.isPending ? (
                            <Box>
                                <Skeleton count={5} height={50} />
                            </Box>
                        ) : studentReportData.length === 0 ? (
                            <Flex justify="center" align="center" minH="200px">
                                <Text color={textColor} fontSize="lg">
                                    Tidak ada data untuk nama ini
                                </Text>
                            </Flex>
                        ) : (
                            <>
                                {/* Table */}
                                <Box overflowX="auto">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '5%', textAlign: 'center' }}>No</th>
                                                <th 
                                                    onClick={() => handleSort('tanggal')}
                                                    style={{ cursor: 'pointer', minWidth: '120px' }}
                                                >
                                                    <Flex align="center" justify="center">
                                                        Tanggal {renderSortIcon('tanggal')}
                                                    </Flex>
                                                </th>
                                                <th 
                                                    onClick={() => handleSort('jam')}
                                                    style={{ cursor: 'pointer', minWidth: '100px' }}
                                                >
                                                    <Flex align="center" justify="center">
                                                        Jam {renderSortIcon('jam')}
                                                    </Flex>
                                                </th>
                                                <th style={{ minWidth: '120px' }}>Modul</th>
                                                <th style={{ minWidth: '120px' }}>Kelas</th>
                                                <th style={{ minWidth: '100px' }}>Level</th>
                                                <th style={{ minWidth: '150px' }}>Mentor</th>
                                                <th style={{ minWidth: '200px' }}>Tema</th>
                                                <th style={{ minWidth: '120px', textAlign: 'center' }}>Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((record, index) => (
                                                <tr key={index}>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {record.tanggal || '-'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {record.jam || '-'}
                                                    </td>
                                                    <td>{record.modul || '-'}</td>
                                                    <td>{record.kelas || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {record.level || '-'}
                                                    </td>
                                                    <td>{record.mentor || '-'}</td>
                                                    <td>{record.tema || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <Box
                                                            as="span"
                                                            px={3}
                                                            py={1}
                                                            borderRadius="full"
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                            bg={
                                                                record.attendance === 'Hadir' ? 'green.100' :
                                                                record.attendance === 'Izin' ? 'yellow.100' :
                                                                record.attendance === 'Alfa' ? 'red.100' :
                                                                'gray.100'
                                                            }
                                                            color={
                                                                record.attendance === 'Hadir' ? 'green.700' :
                                                                record.attendance === 'Izin' ? 'yellow.700' :
                                                                record.attendance === 'Alfa' ? 'red.700' :
                                                                'gray.700'
                                                            }
                                                        >
                                                            {record.attendance || '-'}
                                                        </Box>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Flex justify="center" mt={6}>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </Flex>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </ContainerCarrot>
        </StyledCariDataStudentReport>
    );
}

export default CariDataStudentReportPage;
