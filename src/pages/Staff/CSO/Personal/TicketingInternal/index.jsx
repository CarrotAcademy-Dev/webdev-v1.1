import { useState, useMemo } from 'react';
import { Box, Flex, Text, Grid, GridItem, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, Textarea, useDisclosure, useToast, Select, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTicketingInternal, postCeklisTicketingInternal } from '@/features/cso/csoApiService';
import useDebounce from '@/hooks/useDebounce';
import { StyledTicketingInternal } from './TicketingInternal.styled';
import ContainerCarrot from '@/components/Container';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTag, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';

function TicketingInternal() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

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

    // Fetch tickets
    const { data: tickets = [], isLoading, isError, error } = useQuery({
        queryKey: ['ticketing-internal'],
        queryFn: getTicketingInternal,
        staleTime: 5 * 60 * 1000
    });

    // Helper untuk sorting dengan handling tanggal
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Special handling untuk kolom deadline (tanggal)
            if (sortConfig.key === 'deadline') {
                // Parse tanggal ke timestamp untuk perbandingan yang akurat
                const aDate = aVal ? new Date(aVal).getTime() : 0;
                const bDate = bVal ? new Date(bVal).getTime() : 0;
                
                return sortConfig.direction === 'asc' 
                    ? aDate - bDate 
                    : bDate - aDate;
            }

            // Untuk priority, sort berdasarkan tingkat urgency
            if (sortConfig.key === 'priority') {
                const priorityOrder = { 'Very High': 4, 'High': 3, 'Normal': 2, 'Low': 1 };
                const aOrder = priorityOrder[aVal] || 0;
                const bOrder = priorityOrder[bVal] || 0;
                
                return sortConfig.direction === 'asc'
                    ? aOrder - bOrder
                    : bOrder - aOrder;
            }

            // Default string comparison untuk kolom lainnya
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Submit mutation
    const { mutate: submitTicket } = useMutation({
        mutationFn: postCeklisTicketingInternal,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['ticketing-internal'] });
            const previousData = queryClient.getQueryData(['ticketing-internal']);

            // Optimistic update - mark as updating
            queryClient.setQueryData(['ticketing-internal'], (oldData) => {
                if (!oldData) return [];
                return oldData.map(ticket => 
                    ticket.id_ticket === variables.id_ticket 
                        ? { ...ticket, isUpdating: true }
                        : ticket
                );
            });

            return { previousData };
        },
        onError: (error, variables, context) => {
            if (context && context.previousData) {
                queryClient.setQueryData(['ticketing-internal'], context.previousData);
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

            // Remove from list after animation
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['ticketing-internal'] });
            }, 500);

            onClose();
            setFormData({ result: '', notes: '' });
            setSelectedTicket(null);
        }
    });

    const handleOpenModal = (ticket) => {
        setSelectedTicket(ticket);
        setFormData({
            result: ticket.result || '',
            notes: ticket.notes || ''
        });
        onOpen();
    };

    const handleSubmit = () => {
        if (!formData.result || !formData.notes) {
            toast({
                title: 'Form Tidak Lengkap',
                description: 'Result dan Notes wajib diisi',
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        submitTicket({
            id_ticket: selectedTicket.id_ticket,
            result: formData.result,
            notes: formData.notes
        });
    };

    // Filter data berdasarkan search query
    const filteredTickets = useMemo(() => {
        if (!debouncedSearch) return tickets;

        const searchLower = debouncedSearch.toLowerCase();
        return tickets.filter(ticket => {
            return (
                ticket.id_ticket?.toLowerCase().includes(searchLower) ||
                ticket.nama_ticket?.toLowerCase().includes(searchLower) ||
                ticket.description?.toLowerCase().includes(searchLower) ||
                ticket.label?.toLowerCase().includes(searchLower) ||
                ticket.priority?.toLowerCase().includes(searchLower) ||
                ticket.from_who?.toLowerCase().includes(searchLower)
            );
        });
    }, [tickets, debouncedSearch]);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1); // Reset ke halaman pertama saat sort
    };

    // Sort dan Pagination
    const sortedTickets = sortData(filteredTickets, sortConfig);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTickets = sortedTickets.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);

    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <Flex justify="center" align="center" gap={2} mt={4}>
                <IconButton
                    icon={<FiChevronLeft />}
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    isDisabled={currentPage === 1}
                    aria-label="Previous page"
                />
                <Text fontSize="sm">
                    Page {currentPage} of {totalPages}
                </Text>
                <IconButton
                    icon={<FiChevronRight />}
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    isDisabled={currentPage === totalPages}
                    aria-label="Next page"
                />
            </Flex>
        );
    };

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
                bg="#fcf7ecff" 
                color="#3b3b43ff" 
                textAlign="left"
                cursor={isSortable ? "pointer" : "default"}
                userSelect="none"
                onClick={isSortable ? () => handleSort(sortKey) : undefined}
                _hover={isSortable ? { bg: "#f5efdcff" } : undefined}
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
            <StyledTicketingInternal>
                <Box className="page-header">
                    <Flex justify="space-between" align="center" mb={6}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Ticketing Internal
                        </Text>
                    </Flex>

                    {/* Overview Cards */}
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiClock size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Total Open Tickets</Text>
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
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiAlertCircle size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">High Priority</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {isLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">
                                            {tickets.filter(t => t.priority === 'High').length}
                                        </Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiTag size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Lost & Found</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {isLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">
                                            {tickets.filter(t => t.label === 'Lost and Found').length}
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
                            Open Tickets
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {tickets.length}
                        </Text>
                    </Flex>

                    {/* Search Bar */}
                    <Flex mb={4} gap={3} alignItems="center">
                        <InputGroup maxW="500px">
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="gray" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search data ticket..."
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
                                {sortedTickets.length} result{sortedTickets.length !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>No</TableHeader>
                                    <TableHeader sortKey="id_ticket">ID Ticket</TableHeader>
                                    <TableHeader sortKey="nama_ticket">Nama Ticket</TableHeader>
                                    <TableHeader>Description</TableHeader>
                                    <TableHeader sortKey="deadline">Deadline</TableHeader>
                                    <TableHeader sortKey="label">Label</TableHeader>
                                    <TableHeader sortKey="priority">Priority</TableHeader>
                                    <TableHeader sortKey="from_who">From</TableHeader>
                                    <TableHeader>Action</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {isLoading ? (
                                    <TableSkeleton columns={9} />
                                ) : sortedTickets.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={9} textAlign="center">
                                            {searchQuery 
                                                ? `Tidak ada ticket yang cocok dengan "${searchQuery}"` 
                                                : 'Tidak ada ticket open'
                                            }
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginatedTickets.map((ticket, idx) => (
                                        <Box 
                                            as="tr" 
                                            key={ticket.id_ticket}
                                            opacity={ticket.isUpdating ? 0.5 : 1}
                                            transition="opacity 0.3s"
                                        >
                                            <TableCell>{startIndex + idx + 1}</TableCell>
                                            <TableCell>{ticket.id_ticket}</TableCell>
                                            <TableCell wrap>{ticket.nama_ticket}</TableCell>
                                            <TableCell wrap maxW="300px">{ticket.description}</TableCell>
                                            <TableCell>{formatDate(ticket.deadline)}</TableCell>
                                            <TableCell>{ticket.label}</TableCell>
                                            <TableCell>
                                                <Text color={getPriorityColor(ticket.priority)} fontWeight="medium">
                                                    {ticket.priority}
                                                </Text>
                                            </TableCell>
                                            <TableCell>{ticket.from_who}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenModal(ticket)}
                                                    isDisabled={ticket.isUpdating}
                                                    leftIcon={<FiCheckCircle />}
                                                >
                                                    Done
                                                </Button>
                                            </TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls />
                </Box>

                {/* Modal for Submit Result */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Complete Ticket: {selectedTicket?.id_ticket}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Box mb={4}>
                                <Text fontWeight="bold" mb={2}>Ticket Info:</Text>
                                <Text fontSize="sm" color="gray.600">
                                    {selectedTicket?.nama_ticket} - {selectedTicket?.description}
                                </Text>
                            </Box>

                            <Box mb={4}>
                                <Text mb={2} fontWeight="medium">Result *</Text>
                                <Select
                                    value={formData.result}
                                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                    placeholder="Pilih result"
                                >
                                    <option value="Done">Done</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Not Found">Not Found</option>
                                    <option value="Resolved">Resolved</option>
                                </Select>
                            </Box>

                            <Box mb={4}>
                                <Text mb={2} fontWeight="medium">Notes *</Text>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Tambahkan catatan..."
                                    rows={4}
                                />
                            </Box>

                            <Text fontSize="xs" color="gray.500">* Wajib diisi</Text>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="orange" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledTicketingInternal>
        </ContainerCarrot>
    );
}

export default TicketingInternal;
