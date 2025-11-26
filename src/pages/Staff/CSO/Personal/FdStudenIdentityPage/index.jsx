import { useState, useMemo } from 'react';
import { Box, Flex, Text, IconButton, Input, InputGroup, InputLeftElement, Link, Tooltip } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import ContainerCarrot from '@/components/Container';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiChevronLeft, FiChevronRight, FiSearch, FiChevronUp, FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { getFdIdentity } from '@/features/cso/csoApiService';
import { StyledFDStudentIdentityPage } from './FdStudentIdentityPage.styled';

function FdStudentIdentityPage() {    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Fetch FD Student Identity data
    const { data: studentData = [], isLoading, isError, error } = useQuery({
        queryKey: ['fd-student-identity'],
        queryFn: getFdIdentity,
        staleTime: 5 * 60 * 1000,
    });

    // Helper untuk sorting dengan handling tanggal
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Handling untuk kolom timestamp (tanggal)
            if (sortConfig.key === 'timestamp') {
                // Parse tanggal ke timestamp untuk perbandingan yang akurat
                const aDate = aVal ? new Date(aVal).getTime() : 0;
                const bDate = bVal ? new Date(bVal).getTime() : 0;

                return sortConfig.direction === 'asc'
                    ? aDate - bDate
                    : bDate - aDate;
            }

            // Default string comparison
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Filter data berdasarkan search query
    const filteredData = useMemo(() => {
        if (!debouncedSearchQuery) return studentData;
            
        const searchLower = debouncedSearchQuery.toLowerCase();
        return studentData.filter(item => {
            return (
                item.email?.toLowerCase().includes(searchLower) ||
                item.nama_lengkap?.toLowerCase().includes(searchLower) ||
                item.email_siswa?.toLowerCase().includes(searchLower) ||
                item.email_orangtua?.toLowerCase().includes(searchLower)
            );
        });
    }, [studentData, debouncedSearchQuery]);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1); // Reset ke halaman pertama setelah sorting
    };

    // Sort dan Pagination
    const sortedData = sortData(filteredData, sortConfig);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <Flex justify="center" align="center" gap={2} mt={4}>
                <IconButton 
                    icon={<FiChevronLeft />}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    isDisabled={currentPage === 1}
                    aria-label="Previous Page"
                />
                <Text>
                    Page {currentPage} of {totalPages}
                </Text>
                <IconButton 
                    icon={<FiChevronRight />}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    isDisabled={currentPage === totalPages}
                    aria-label="Next Page"
                />
            </Flex>
        );
    };

    const TableSkeleton = ({ columns }) => {
        return Array(5).fill(0).map((_, rowIndex) => (
            <Box as="tr" key={rowIndex}>
                {Array(columns).fill(0).map((_, colIndex) => (
                    <Box as="td" key={colIndex} p={3}>
                        <Skeleton height="20px" />
                    </Box>
                ))}
            </Box>
        ));
    };

    const TableCell = ({ children, textAlign, wrap, maxW, ...props }) => (
        <Box
            as="td"
            p={3}
            borderBottom="1px solid"
            borderColor="gray.200"
            textAlign={textAlign}
            whiteSpace={wrap ? 'normal' : 'nowrap'}
            maxW={maxW}
            wordBreak={wrap ? 'break-word' : 'normal'}
            {...props}
        >
            {children}
        </Box>
    );

    const TableHeader = ({ children, sortKey, ...props }) => {
        const isSortable = !!sortKey;
        const isActive = sortConfig.key === sortKey;

        return (
            <Box
                as="th"
                p={3}
                bg="#fcf7ecff"
                color="#3b3b43ff"
                textAlign="left"
                cursor={isSortable ? 'pointer' : 'default'}
                userSelect="none"
                onClick={isSortable ? () => handleSort(sortKey) : undefined}
                _hover={isSortable ? { bg: "#f5efdcff" } : undefined}
                transition="background-color 0.2s"
                {...props}
            >
                {isSortable ? (
                    <Flex align="center" gap={2}>
                        {children}
                        {isActive && (
                            sortConfig.direction === 'asc'
                                ? <FiChevronUp size={14} />
                                : <FiChevronDown size={14} />
                        )}
                    </Flex>
                ) : (
                    children
                )}
            </Box>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Helper untuk render link document yang clickable
    const renderDocLink = (url) => {
        if (!url) return '-';
        return (
            <Flex align="center" gap={1}>
                <Text
                    as="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="blue.500"
                    textDecoration="underline"
                    _hover={{ color: 'blue.700' }}
                    fontSize="sm"
                >
                    View
                </Text>
                <FiExternalLink size={12} color="#3182CE" />
            </Flex>
        );
    };

    // Helper untuk render text dengan scrollbar horizontal
    const renderScrollableText = (text) => {
        if (!text) return '-';
        
        return (
            <Tooltip 
                label={text} 
                placement="top" 
                hasArrow 
                bg="gray.700" 
                color="white" 
                fontSize="sm"
                openDelay={200}
                closeDelay={500}
                closeOnMouseDown={false}
                gutter={12}
            >
                <Box
                    maxW="280px"
                    overflowX="auto"
                    overflowY="hidden"
                    whiteSpace="nowrap"
                    cursor="help"
                    userSelect="text"
                    css={{
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE and Edge
                    }}
                >
                    <Text fontSize="sm" py={1}>{text}</Text>
                </Box>
            </Tooltip>
        );
    };

    if (isError) {
        return (
            <ContainerCarrot>
                <Box p={4}>
                    <Text color="red.500">Error: {error.message}</Text>
                </Box>
            </ContainerCarrot>
        );
    }

    return (
        <ContainerCarrot>
            <StyledFDStudentIdentityPage>
                <Box className="page-header">
                    <Flex justify="space-between" align="center" mb={6}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Fd Student Identity Data
                        </Text>
                    </Flex>
                </Box>

                {/* Table Section */}
                <Box className="table-section">
                    <Flex fontSize="lg" fontWeight="bold">
                        <Text fontSize="lg" fontWeight="bold" marginRight={3}>
                            Student Identity Records
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Total: {filteredData.length} records
                        </Text>
                    </Flex>

                    {/* Search Bar */}
                    <Flex mb={4} gap={3} alignItems="center">
                        <InputGroup maxW="500px">
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="gray" />
                            </InputLeftElement>
                            <Input 
                                placeholder="Search data siswa"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); // Reset ke page 1 saat search
                                }}
                                borderRadius="md"
                                bg="white"
                            />
                        </InputGroup>
                        {searchQuery && (
                            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                                {sortedData.length} result{sortedData.length !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>No</TableHeader>
                                    <TableHeader sortKey="timestamp">Timestamp</TableHeader>
                                    <TableHeader sortKey="email">Email</TableHeader>
                                    <TableHeader sortKey="nama_lengkap">Nama Lengkap</TableHeader>
                                    <TableHeader sortKey="ktp">KTP</TableHeader>
                                    <TableHeader sortKey="ijazah">Ijazah</TableHeader>
                                    <TableHeader sortKey="akta_kelahiran">Akta Kelahiran</TableHeader>
                                    <TableHeader sortKey="pas_photo">Pas Photo</TableHeader>
                                    <TableHeader sortKey="ukuran_tshirt">Ukuran T-Shirt</TableHeader>
                                    <TableHeader sortKey="ukuran_jaket">Ukuran Jaket</TableHeader>
                                    <TableHeader sortKey="alamat_domisi">Alamat Domisili</TableHeader>
                                    <TableHeader sortKey="alamat_ktp">Alamat KTP</TableHeader>
                                    <TableHeader sortKey="email_siswa">Email Siswa</TableHeader>
                                    <TableHeader sortKey="nama_email">Nama Email</TableHeader>
                                    <TableHeader sortKey="phone_number_siswa">No. HP Siswa</TableHeader>
                                    <TableHeader sortKey="nama_orangtua">Nama Orangtua</TableHeader>
                                    <TableHeader sortKey="alamat_orangtua">Alamat Orangtua</TableHeader>
                                    <TableHeader sortKey="phone_number_orangtua">No. HP Orangtua</TableHeader>
                                    <TableHeader sortKey="email_orangtua">Email Orangtua</TableHeader>
                                    <TableHeader sortKey="surat_keterangan">Surat Ket.</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {isLoading ? (
                                    <TableSkeleton columns={19} />
                                ) : sortedData.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={19} textAlign="center">
                                            {searchQuery
                                                ? `No results found for "${searchQuery}"`
                                                : "No data available."
                                            }
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <Box
                                            as="tr"
                                            key={item.id}
                                            opacity={item.isUpadated ? 0.6 : 1}
                                            transition="opacity 0.3s"
                                        >
                                            <TableCell>{startIndex + index + 1}</TableCell>
                                            <TableCell>{formatDate(item.timestamp)}</TableCell>
                                            <TableCell maxW="500px">{item.email || '-'}</TableCell>
                                            <TableCell wrap maxW="200px">{item.nama_lengkap || '-'}</TableCell>
                                            <TableCell>{renderDocLink(item.ktp)}</TableCell>
                                            <TableCell>{renderDocLink(item.ijazah)}</TableCell>
                                            <TableCell>{renderDocLink(item.akta_kelahiran)}</TableCell>
                                            <TableCell>{renderDocLink(item.pas_photo)}</TableCell>
                                            <TableCell>{item.ukuran_tshirt || '-'}</TableCell>
                                            <TableCell>{item.ukuran_jaket || '-'}</TableCell>
                                            <TableCell>{renderScrollableText(item.alamat_domisi)}</TableCell>
                                            <TableCell>{renderScrollableText(item.alamat_ktp)}</TableCell>
                                            <TableCell maxW="500px">{item.email_siswa || '-'}</TableCell>
                                            <TableCell wrap maxW="180px">{item.nama_email || '-'}</TableCell>
                                            <TableCell>{item.phone_number_siswa || '-'}</TableCell>
                                            <TableCell wrap maxW="180px">{item.nama_orangtua || '-'}</TableCell>
                                            <TableCell>{renderScrollableText(item.alamat_orangtua)}</TableCell>
                                            <TableCell>{item.phone_number_orangtua || '-'}</TableCell>
                                            <TableCell wrap maxW="220px">{item.email_orangtua || '-'}</TableCell>
                                            <TableCell>{renderDocLink(item.surat_keterangan)}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls />
                </Box>
            </StyledFDStudentIdentityPage>
        </ContainerCarrot>
    )
}

export default FdStudentIdentityPage;