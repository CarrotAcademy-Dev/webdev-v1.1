import { useState, useMemo } from 'react';
import { Box, Flex, Text, Grid, GridItem, Input, InputGroup, InputLeftElement, Select, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import ContainerCarrot from '@/components/Container';
import Pagination from '@/components/Pagination';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiClock, FiAlertCircle, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import { getTrackTicketFme } from '@/features/eso/esoApiService';
import { StyledTrackTicketFme } from './TrackTicketFme.styled';

function TrackTicketFmePage() {
    const { colorMode } = useColorMode();
    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
    const tableHeaderBg = useColorModeValue('#fcf7ecff', '#2C3748');
    const tableHeaderHoverBg = useColorModeValue('#f5efdcff', '#3A4556');
    const tableHeaderColor = useColorModeValue('#3b3b43ff', 'dark.text.primary');
    
    //Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Year filter state
    const [selectedYear, setSelectedYear] = useState('all');

    // Fetch tickets data
    const { data: tickets = [], isLoading, isError, error } = useQuery({
        queryKey: ['trackTicketFmeEso'],
        queryFn: getTrackTicketFme,
        staleTime: 5 * 60 * 1000
    });

    // Helper untuk sorting dengan handling tanggal
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;

        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handling untuk kolom deadline (tanggal)
            if (sortConfig.key === 'deadline') {
                const aDate = aValue ? new Date(aValue) : 0;
                const bDate = bValue ? new Date(bValue) : 0;

                return sortConfig.direction === 'asc'
                    ? aDate - bDate
                    : bDate - aDate;
            }

            // Sort berdasarkan priority
            if (sortConfig.key === 'priority') {
                const priorityOrder = { 'Very High': 4, 'High': 3, 'Normal': 2, 'Low': 1 };
                const aPriority = priorityOrder[aValue] || 0;
                const bPriority = priorityOrder[bValue] || 0;

                return sortConfig.direction === 'asc'
                    ? aPriority - bPriority
                    : bPriority - aPriority;
            }

            // Default sorting (string/number)
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Filtered tickets
    const filteredTickets = useMemo(() => {
        let filtered = tickets;

        // Filter by search query
        if (debouncedSearchQuery) {
            const lowercasedQuery = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(ticket => {
                return (
                    ticket.id_ticket?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.nama_ticket?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.description?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.status?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.label?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.type?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.priority?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.responsible?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.result?.toLowerCase().includes(lowercasedQuery) ||
                    ticket.notes?.toLowerCase().includes(lowercasedQuery)
                );
            });
        }

        // Filter by year
        if (selectedYear !== 'all') {
            filtered = filtered.filter(ticket => {
                if (!ticket.deadline) return false;
                const ticketYear = new Date(ticket.deadline).getFullYear().toString();
                return ticketYear === selectedYear;
            });
        }

        return filtered;
    }, [tickets, debouncedSearchQuery, selectedYear]);

    // Get available years from tickets
    const availableYears = useMemo(() => {
        const years = new Set();
        tickets.forEach(ticket => {
            if (ticket.deadline) {
                const year = new Date(ticket.deadline).getFullYear();
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a); // Sort descending
    }, [tickets]);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1); // Reset ke halaman pertama setelah sorting
    };

    // Sort dan Pagination
    const sortedTickets = sortData(filteredTickets, sortConfig);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTickets = sortedTickets.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);

    const TableSkeleton = ({ columns }) => {
        return Array(5).fill(0).map((_, idx) => (
            <Box as="tr" key={idx}>
                {Array(columns).fill(0).map((_, colIdx) => (
                    <Box as="td" key={colIdx} p={3}>
                        <Skeleton height={20} />
                    </Box>
                ))}
            </Box>
        ));
    };

    const TableCell = ({ children, colSpan, textAlign, wrap, ...props }) => (
        <Box
            as="td"
            p={3}
            borderBottom="1px solid"
            borderColor="gray.200"
            colSpan={colSpan}
            textAlign={textAlign}
            whiteSpace={wrap ? "normal" : "nowrap"}
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
                bg={tableHeaderBg} 
                color={tableHeaderColor} 
                textAlign="left"
                cursor={isSortable ? "pointer" : "default"}
                userSelect="none"
                onClick={isSortable ? () => handleSort(sortKey) : undefined}
                _hover={isSortable ? { bg: tableHeaderHoverBg } : undefined}
                transition="background 0.2s"
                {...props}
            >
                {isSortable ? (
                    <Flex align="center" gap={1}>
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

    const getPriorityColor = (priority) => {
        if (priority === 'High') return 'red.500';
        if (priority === 'Medium') return 'orange.500';
        return 'gray.500';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
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
            <StyledTrackTicketFme data-theme={colorMode}>
                <Box className="page-header">
                    <Flex justify="space-between" align="center" mb={6}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Track Ticket From Me
                        </Text>
                    </Flex>

                    {/* Overview Cards */}
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
                        <GridItem>
                            <Box className="overview-card" bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiClock size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color={textColor} mb={1} fontWeight="bold">Total Tickets</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {isLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{tickets.length}</Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        <GridItem>
                            <Box className="overview-card" bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiClock size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color={textColor} mb={1} fontWeight="bold">Open Tickets</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {isLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">
                                            {tickets.filter(t => t.status === 'Open').length}
                                        </Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        <GridItem>
                            <Box className="overview-card" bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#28a745" p={2} borderRadius="md">
                                        <FiAlertCircle size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color={textColor} mb={1} fontWeight="bold">Close Tickets</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {isLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">
                                            {tickets.filter(t => t.status === 'Close').length}
                                        </Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Table Section */}
                <Box className="table-section">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            All Tickets
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {sortedTickets.length} tickets
                        </Text>
                    </Flex>

                    {/* Search Bar */}
                    <Flex mb={4} gap={3} alignItems="center" flexWrap="wrap">
                        <InputGroup maxW="500px">
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="gray" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search data ticket..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                borderRadius="md"
                                bg={cardBg}
                            />
                        </InputGroup>
                        
                        <Select
                            maxW="150px"
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setCurrentPage(1);
                            }}
                            borderRadius="md"
                            bg={cardBg}
                        >
                            <option value="all">Semua Tahun</option>
                            {availableYears.map(year => (
                                <option key={year} value={year.toString()}>
                                    {year}
                                </option>
                            ))}
                        </Select>

                        {searchQuery && (
                            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                                {sortedTickets.length} result{sortedTickets.length !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </Flex>
                    
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>No</TableHeader>
                                    <TableHeader sortKey="timestamp">Timestamp</TableHeader>
                                    <TableHeader sortKey="id_ticket">ID Ticket</TableHeader>
                                    <TableHeader sortKey="nama_ticket">Nama Ticket</TableHeader>
                                    <TableHeader>Description</TableHeader>
                                    <TableHeader sortKey="status">Status</TableHeader>
                                    <TableHeader sortKey="deadline">Deadline</TableHeader>
                                    <TableHeader sortKey="label">Label</TableHeader>
                                    <TableHeader sortKey="type">Type</TableHeader>
                                    <TableHeader sortKey="priority">Priority</TableHeader>
                                    <TableHeader sortKey="responsible">Responsible</TableHeader>
                                    <TableHeader>Result</TableHeader>
                                    <TableHeader>Notes</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {isLoading ? (
                                    <TableSkeleton columns={13} />
                                ) : sortedTickets.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={13} textAlign="center">
                                            {searchQuery 
                                                ? `Tidak ada ticket yang cocok dengan "${searchQuery}"` 
                                                : 'Tidak ada ticket'
                                            }
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginatedTickets.map((ticket, idx) => (
                                        <Box 
                                            as="tr" 
                                            key={ticket.id_ticket}
                                        >
                                            <TableCell>{startIndex + idx + 1}</TableCell>
                                            <TableCell>{formatDate(ticket.timestamp)}</TableCell>
                                            <TableCell>{ticket.id_ticket}</TableCell>
                                            <TableCell wrap>{ticket.nama_ticket}</TableCell>
                                            <TableCell wrap maxW="300px">{ticket.description}</TableCell>
                                            <TableCell>
                                                <Text 
                                                    color={ticket.status === 'Open' ? 'orange.500' : 'green.500'}
                                                    fontWeight="medium"
                                                >
                                                    {ticket.status}
                                                </Text>
                                            </TableCell>
                                            <TableCell>{formatDate(ticket.deadline)}</TableCell>
                                            <TableCell wrap>{ticket.label}</TableCell>
                                            <TableCell>{ticket.type}</TableCell>
                                            <TableCell>
                                                <Text color={getPriorityColor(ticket.priority)} fontWeight="medium">
                                                    {ticket.priority || '-'}
                                                </Text>
                                            </TableCell>
                                            <TableCell wrap>{ticket.responsible}</TableCell>
                                            <TableCell>{ticket.result || '-'}</TableCell>
                                            <TableCell wrap maxW="250px">{ticket.notes || '-'}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalItems={sortedTickets.length}
                        />
                    )}
                </Box>
            </StyledTrackTicketFme>
        </ContainerCarrot>
    );
}

export default TrackTicketFmePage;
