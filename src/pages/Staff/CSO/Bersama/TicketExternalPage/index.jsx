import { useState, useMemo } from 'react';
import { Box, Flex, Text, Grid, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, Textarea, useDisclosure, useToast, Select, Input, InputGroup, InputLeftElement, useColorModeValue, useColorMode, Badge, Skeleton } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTicketExternal, postTicketExternal } from '@/features/cso/csoApiService';
import useDebounce from '@/hooks/useDebounce';
import { StyledTicketExternal } from './TicketExternal.styled';
import ContainerCarrot from '@/components/Container';
import InfoCard from '@/components/InfoCard';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTag, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import { LuTicket, LuTicketCheck } from 'react-icons/lu';
import Pagination from '@/components/Pagination';

function TicketExternalPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode } = useColorMode();

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [formData, setFormData] = useState({
        result: '',
        notes: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Year filter state
    const [selectedYear, setSelectedYear] = useState('all');

    // Tab state (Open/Close)
    const [activeTab, setActiveTab] = useState('open');

    // Fetch tickets
    const { data: ticketData, isLoading, isError, error } = useQuery({
        queryKey: ['ticketExternal'],
        queryFn: getTicketExternal,
        staleTime: 5 * 60 * 1000,
        placeholderData: { dataOpen: [], dataClose: [] }
    });

    // Only show loading on initial load, not on background refetch
    const showLoading = isLoading && !ticketData;

    // Helper untuk sorting
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Special handling untuk kolom tanggal
            if (sortConfig.key === 'tanggal') {
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

    // Submit mutation
    const { mutate: submitTicket } = useMutation({
        mutationFn: postTicketExternal,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['ticketExternal'] });
            const previousData = queryClient.getQueryData(['ticketExternal']);

            // Optimistic update - instantly move ticket from open to close
            queryClient.setQueryData(['ticketExternal'], (oldData) => {
                if (!oldData) return { dataOpen: [], dataClose: [] };
                
                // Find ticket and remove from open
                const ticketToClose = oldData.dataOpen.find(
                    ticket => ticket.idTicket === variables.rowData.idTicket
                );
                
                if (!ticketToClose) return oldData;
                
                // Update ticket with result and move to closed
                const closedTicket = {
                    ...ticketToClose,
                    hasil: variables.result,
                    status: 'close'
                };
                
                return {
                    dataOpen: oldData.dataOpen.filter(
                        ticket => ticket.idTicket !== variables.rowData.idTicket
                    ),
                    dataClose: [closedTicket, ...oldData.dataClose]
                };
            });

            return { previousData };
        },
        onError: (error, variables, context) => {
            if (context && context.previousData) {
                queryClient.setQueryData(['ticketExternal'], context.previousData);
            }
            toast({
                title: 'Submit Failed',
                description: error.message || 'Gagal submit ticket',
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        },
        onSuccess: () => {
            toast({
                title: 'Ticket Berhasil Diselesaikan!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            onClose();
            setFormData({ result: '', notes: '' });
            setSelectedTicket(null);
            
            // Refetch in background to sync with server (won't show loading)
            queryClient.invalidateQueries({ queryKey: ['ticketExternal'] });
        }
    });

    const handleOpenModal = (ticket) => {
        setSelectedTicket(ticket);
        setFormData({
            result: ticket.hasil || '',
            notes: ticket.detail || ''
        });
        onOpen();
    };

    const handleSubmit = () => {
        submitTicket({
            rowData: selectedTicket,
            result: formData.result
        });
    };

    // Get available years from tickets
    const availableYears = useMemo(() => {
        if (!ticketData) return [];
        const years = new Set();
        [...ticketData.dataOpen, ...ticketData.dataClose].forEach(ticket => {
            if (ticket.timestamp) {
                const year = new Date(ticket.timestamp).getFullYear();
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [ticketData]);

    // Filter data based on active tab, search, and year
    const filteredTickets = useMemo(() => {
        if (!ticketData) return [];
        
        let tickets = activeTab === 'open' ? ticketData.dataOpen : ticketData.dataClose;

        // Filter by search query
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            tickets = tickets.filter(ticket => {
                return (
                    ticket.idTicket?.toLowerCase().includes(searchLower) ||
                    ticket.nama?.toLowerCase().includes(searchLower) ||
                    ticket.kategori?.toLowerCase().includes(searchLower) ||
                    ticket.subKategori?.toLowerCase().includes(searchLower) ||
                    ticket.detail?.toLowerCase().includes(searchLower) ||
                    ticket.nomor_hp?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Filter by year
        if (selectedYear !== 'all') {
            tickets = tickets.filter(ticket => {
                if (!ticket.timestamp) return false;
                const ticketYear = new Date(ticket.timestamp).getFullYear().toString();
                return ticketYear === selectedYear;
            });
        }

        return tickets;
    }, [ticketData, activeTab, debouncedSearch, selectedYear]);

    // Apply sorting
    const sortedTickets = useMemo(() => {
        return sortData(filteredTickets, sortConfig);
    }, [filteredTickets, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
    const paginatedTickets = sortedTickets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    if (currentPage !== 1 && (debouncedSearch || selectedYear !== 'all' || activeTab)) {
        setCurrentPage(1);
    }

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
    };

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledTicketExternal data-theme={colorMode}>
            <ContainerCarrot>
                {/* Header Stats */}
                <Box mb={6}>
                    <Text fontSize="2xl" fontWeight="bold" mb={4}>Ticketing External</Text>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <InfoCard hoverable>
                            <Flex align="center" gap={3}>
                                <LuTicket size="30px" color="#FE7743" />
                                <Box>
                                    <Text fontSize="sm" color={textColor}>Open Tickets</Text>
                                    {showLoading ? (
                                        <Skeleton height="32px" width="60px" />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{ticketData?.dataOpen.length || 0}</Text>
                                    )}
                                </Box>
                            </Flex>
                        </InfoCard>
                        <InfoCard hoverable>
                            <Flex align="center" gap={3}>
                                <LuTicketCheck size="30px" color="green" />
                                <Box>
                                    <Text fontSize="sm" color={textColor}>Closed Tickets</Text>
                                    {showLoading ? (
                                        <Skeleton height="32px" width="60px" />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{ticketData?.dataClose.length || 0}</Text>
                                    )}
                                </Box>
                            </Flex>
                        </InfoCard>
                    </Grid>
                </Box>

                {/* Filters */}
                <Flex mb={4} gap={3} wrap="wrap" align="center">
                    <InputGroup maxW="300px">
                        <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            bg={cardBg}
                        />
                    </InputGroup>
                    <Select
                        maxW="150px"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        bg={cardBg}
                    >
                        <option value="all">Semua Tahun</option>
                        {availableYears.map(year => (
                            <option key={year} value={year.toString()}>
                                {year}
                            </option>
                        ))}
                    </Select>
                </Flex>

                {/* Tabs */}
                <Flex mb={4} gap={2} borderBottom="2px solid" borderColor={borderColor}>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('open')}
                        borderBottom={activeTab === 'open' ? '3px solid' : 'none'}
                        borderColor="orange.500"
                        borderRadius={0}
                        pb={2}
                        _hover={{ bg: 'transparent' }}
                    >
                        <FiClock style={{ marginRight: '8px' }} />
                        Open ({ticketData?.dataOpen.length || 0})
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('close')}
                        borderBottom={activeTab === 'close' ? '3px solid' : 'none'}
                        borderColor="orange.500"
                        borderRadius={0}
                        pb={2}
                        _hover={{ bg: 'transparent' }}
                    >
                        <FiCheckCircle style={{ marginRight: '8px' }} />
                        Closed ({ticketData?.dataClose.length || 0})
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper" overflowX="auto" mb={4}>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('idTicket')} style={{ cursor: 'pointer' }}>
                                    <Flex align="center" gap={1}>
                                        ID Ticket {getSortIcon('idTicket')}
                                    </Flex>
                                </th>
                                <th onClick={() => handleSort('nama')} style={{ cursor: 'pointer' }}>
                                    <Flex align="center" gap={1}>
                                        Nama {getSortIcon('nama')}
                                    </Flex>
                                </th>
                                <th onClick={() => handleSort('kategori')} style={{ cursor: 'pointer' }}>
                                    <Flex align="center" gap={1}>
                                        Kategori {getSortIcon('kategori')}
                                    </Flex>
                                </th>
                                <th onClick={() => handleSort('subKategori')} style={{ cursor: 'pointer' }}>
                                    <Flex align="center" gap={1}>
                                        Request {getSortIcon('subKategori')}
                                    </Flex>
                                </th>
                                <th onClick={() => handleSort('tanggal')} style={{ cursor: 'pointer' }}>
                                    <Flex align="center" gap={1}>
                                        Deadline {getSortIcon('tanggal')}
                                    </Flex>
                                </th>
                                <th>No HP</th>
                                <th>Media</th>
                                <th>Detail</th>
                                {activeTab === 'open' && <th>Action</th>}
                                {activeTab === 'close' && <th>Hasil</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {showLoading ? (
                                // Skeleton rows
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`skeleton-${index}`}>
                                        <td><Skeleton height="16px" /></td>
                                        <td><Skeleton height="16px" /></td>
                                        <td><Skeleton height="16px" width="80px" /></td>
                                        <td><Skeleton height="16px" /></td>
                                        <td><Skeleton height="16px" width="100px" /></td>
                                        <td><Skeleton height="16px" width="100px" /></td>
                                        <td><Skeleton height="16px" width="80px" /></td>
                                        <td><Skeleton height="16px" /></td>
                                        <td><Skeleton height="16px" width="80px" /></td>
                                    </tr>
                                ))
                            ) : paginatedTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'open' ? 9 : 9} style={{ textAlign: 'center', padding: '40px' }}>
                                        <FiAlertCircle size="40px" style={{ margin: '0 auto 10px' }} />
                                        <Text>Tidak ada data ticket</Text>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTickets.map((ticket) => (
                                        <tr 
                                            key={ticket.idTicket}
                                            className={ticket.isUpdating ? 'updating-row' : ''}
                                        >
                                            <td>
                                                <Badge colorScheme="blue">{ticket.idTicket}</Badge>
                                            </td>
                                            <td>{ticket.nama || '-'}</td>
                                            <td>
                                                <Badge colorScheme="purple">{ticket.kategori || '-'}</Badge>
                                            </td>
                                            <td>{ticket.subKategori || '-'}</td>
                                            <td>{ticket.tanggal || '-'}</td>
                                            <td>{ticket.nomor_hp || '-'}</td>
                                            <td>{ticket.media || '-'}</td>
                                            <td style={{ maxWidth: '200px' }}>
                                                {ticket.detail ? (
                                                    <Text noOfLines={2} title={ticket.detail}>
                                                        {ticket.detail}
                                                    </Text>
                                                ) : '-'}
                                            </td>
                                            {activeTab === 'open' && (
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="orange"
                                                        onClick={() => handleOpenModal(ticket)}
                                                        isDisabled={ticket.isUpdating}
                                                        leftIcon={<FiCheckCircle />}
                                                    >
                                                        Done
                                                    </Button>
                                                </td>
                                            )}
                                            {activeTab === 'close' && (
                                                <td>{ticket.hasil || '-'}</td>
                                            )}
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </Box>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

                {/* Modal for submitting ticket */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay />
                    <ModalContent bg={cardBg}>
                        <ModalHeader>Complete Ticket</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {selectedTicket && (
                                <Box mb={4}>
                                    <Text fontSize="sm" fontWeight="bold" mb={2}>Ticket Details:</Text>
                                    <Grid templateColumns="120px 1fr" gap={2} fontSize="sm">
                                        <Text fontWeight="medium">ID Ticket:</Text>
                                        <Text>{selectedTicket.idTicket}</Text>
                                        <Text fontWeight="medium">Nama:</Text>
                                        <Text>{selectedTicket.nama}</Text>
                                        <Text fontWeight="medium">Kategori:</Text>
                                        <Text>{selectedTicket.kategori}</Text>
                                        <Text fontWeight="medium">Request:</Text>
                                        <Text>{selectedTicket.subKategori}</Text>
                                        <Text fontWeight="medium">Detail:</Text>
                                        <Text>{selectedTicket.detail || '-'}</Text>
                                    </Grid>
                                </Box>
                            )}
                            <Box>
                                <Text fontWeight="bold" mb={2}>Result:</Text>
                                <Textarea
                                    value={formData.result}
                                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                    placeholder="Masukkan hasil penyelesaian ticket..."
                                    rows={4}
                                />
                            </Box>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="orange"
                                onClick={handleSubmit}
                                leftIcon={<FiCheckCircle />}
                            >
                                Submit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </ContainerCarrot>
        </StyledTicketExternal>
    );
}

export default TicketExternalPage;
