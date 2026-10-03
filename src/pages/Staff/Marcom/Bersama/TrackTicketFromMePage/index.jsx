/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  useColorModeValue,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
  Tooltip
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getTrackTicketFme } from '@/features/marcom/marcomApiService';
import ContainerCarrot from '@/components/Container';
import InfoCard from '@/components/InfoCard';
import Pagination from '@/components/Pagination';
import useDebounce from '@/hooks/useDebounce';
import { StyledTrackTicketFromMePage } from './TrackTicketFromMePage.styled';
import {
  FiSearch,
  FiTag,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiCalendar
} from 'react-icons/fi';

export default function TrackTicketFromMePage() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Detail Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Query
  const { data: ticketList = [], isLoading } = useQuery({
    queryKey: ['marcomTrackTickets'],
    queryFn: getTrackTicketFme,
    staleTime: 3 * 60 * 1000
  });

  // Filtered data
  const filteredData = useMemo(() => {
    return ticketList.filter((item) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        (item.id_ticket && item.id_ticket.toLowerCase().includes(q)) ||
        (item.nama_ticket && item.nama_ticket.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.responsible && item.responsible.toLowerCase().includes(q));

      const statusVal = String(item.status || '').trim().toLowerCase();
      let matchStatus = true;
      if (filterStatus === 'OPEN') {
        matchStatus = statusVal === 'open';
      } else if (filterStatus === 'PROGRESS') {
        matchStatus = statusVal.includes('progress') || statusVal === 'in progress';
      } else if (filterStatus === 'CLOSE') {
        matchStatus = statusVal === 'close' || statusVal === 'done';
      }

      return matchSearch && matchStatus;
    });
  }, [ticketList, debouncedSearch, filterStatus]);

  // Statistics
  const totalTickets = ticketList.length;
  const openCount = ticketList.filter(
    (i) => String(i.status || '').trim().toLowerCase() === 'open'
  ).length;
  const inProgressCount = ticketList.filter((i) =>
    String(i.status || '').trim().toLowerCase().includes('progress')
  ).length;
  const closeCount = ticketList.filter((i) => {
    const s = String(i.status || '').trim().toLowerCase();
    return s === 'close' || s === 'done';
  }).length;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'open') {
      return (
        <Badge colorScheme="blue" px={2} py={0.5} borderRadius="full">
          Open
        </Badge>
      );
    }
    if (s.includes('progress')) {
      return (
        <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="full">
          In Progress
        </Badge>
      );
    }
    if (s === 'close' || s === 'done') {
      return (
        <Badge colorScheme="green" px={2} py={0.5} borderRadius="full">
          Close
        </Badge>
      );
    }
    return (
      <Badge colorScheme="gray" px={2} py={0.5} borderRadius="full">
        {status || '-'}
      </Badge>
    );
  };

  return (
    <ContainerCarrot>
      <StyledTrackTicketFromMePage>
        <div className="page-header">
          <h1>Track Ticket From Me (Marcom)</h1>
          <p>Pelacakan tiket internal dan permintaan tugas yang diajukan oleh divisi Marcom</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <InfoCard>
            <FiTag size={28} color="#4A5568" />
            <div>
              <p>Total Tiket</p>
              <h3>{totalTickets}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiAlertCircle size={28} color="#3182CE" />
            <div>
              <p>Tiket Open</p>
              <h3>{openCount}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiClock size={28} color="#D69E2E" />
            <div>
              <p>In Progress</p>
              <h3>{inProgressCount}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiCheckCircle size={28} color="#38A169" />
            <div>
              <p>Tiket Selesai / Close</p>
              <h3>{closeCount}</h3>
            </div>
          </InfoCard>
        </div>

        {/* Controls & Table Container */}
        <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Cari ID, judul, divisi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                borderRadius="md"
              />
            </InputGroup>

            <Flex gap={2}>
              <Button
                size="xs"
                variant={filterStatus === 'ALL' ? 'solid' : 'outline'}
                colorScheme="gray"
                onClick={() => {
                  setFilterStatus('ALL');
                  setCurrentPage(1);
                }}
              >
                Semua ({totalTickets})
              </Button>
              <Button
                size="xs"
                variant={filterStatus === 'OPEN' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => {
                  setFilterStatus('OPEN');
                  setCurrentPage(1);
                }}
              >
                Open ({openCount})
              </Button>
              <Button
                size="xs"
                variant={filterStatus === 'PROGRESS' ? 'solid' : 'outline'}
                colorScheme="yellow"
                onClick={() => {
                  setFilterStatus('PROGRESS');
                  setCurrentPage(1);
                }}
              >
                Progress ({inProgressCount})
              </Button>
              <Button
                size="xs"
                variant={filterStatus === 'CLOSE' ? 'solid' : 'outline'}
                colorScheme="green"
                onClick={() => {
                  setFilterStatus('CLOSE');
                  setCurrentPage(1);
                }}
              >
                Close ({closeCount})
              </Button>
            </Flex>
          </Flex>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th>ID Tiket</th>
                  <th>Nama / Judul Tiket</th>
                  <th>Responsible (Penerima)</th>
                  <th>Deadline</th>
                  <th>Tipe / Label</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={8}>
                        <Skeleton height="35px" />
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text color={textColor}>Tidak ada tiket ditemukan</Text>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr key={item.id_ticket || idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        <Badge colorScheme="purple" fontSize="xs">
                          {item.id_ticket || '-'}
                        </Badge>
                      </td>
                      <td>
                        <Text fontWeight="600">{item.nama_ticket || '-'}</Text>
                        <Text fontSize="xs" color={textColor} noOfLines={1}>
                          {item.description || ''}
                        </Text>
                      </td>
                      <td>
                        <Text fontSize="xs" fontWeight="500">
                          {item.responsible || '-'}
                        </Text>
                      </td>
                      <td>
                        <Flex align="center" gap={1}>
                          <FiCalendar size={13} color="#718096" />
                          <Text fontSize="xs">
                            {item.deadline ? String(item.deadline).split(' ')[0] : '-'}
                          </Text>
                        </Flex>
                      </td>
                      <td>
                        <Flex gap={1} wrap="wrap">
                          {item.label && (
                            <Badge colorScheme="teal" fontSize="2xs">
                              {item.label}
                            </Badge>
                          )}
                          {item.type && (
                            <Badge colorScheme="blue" fontSize="2xs">
                              {item.type}
                            </Badge>
                          )}
                        </Flex>
                      </td>
                      <td style={{ textAlign: 'center' }}>{getStatusBadge(item.status)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Tooltip label="Lihat Rincian Tiket">
                          <IconButton
                            icon={<FiEye />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            aria-label="Lihat Rincian"
                            onClick={() => handleOpenDetail(item)}
                          />
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredData.length > itemsPerPage && (
            <Box mt={4}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </Box>
          )}
        </Box>

        {/* Detail Modal */}
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Flex align="center" gap={2}>
                <Badge colorScheme="purple">{selectedTicket?.id_ticket}</Badge>
                <Text fontSize="md">{selectedTicket?.nama_ticket}</Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTicket && (
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <GridItem colSpan={2}>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Deskripsi:
                    </Text>
                    <Box
                      p={2}
                      borderRadius="md"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      fontSize="sm"
                    >
                      {selectedTicket.description || '-'}
                    </Box>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Status:
                    </Text>
                    <Box mt={1}>{getStatusBadge(selectedTicket.status)}</Box>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Deadline:
                    </Text>
                    <Text fontSize="sm">{selectedTicket.deadline || '-'}</Text>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Pengirim (From):
                    </Text>
                    <Text fontSize="sm">{selectedTicket['from_who?'] || 'Marcom'}</Text>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Responsible:
                    </Text>
                    <Text fontSize="sm">{selectedTicket.responsible || '-'}</Text>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Accountable:
                    </Text>
                    <Text fontSize="sm">{selectedTicket.accountable || '-'}</Text>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Timestamp:
                    </Text>
                    <Text fontSize="sm">{selectedTicket.timestamp || '-'}</Text>
                  </GridItem>

                  {selectedTicket.result && (
                    <GridItem colSpan={2}>
                      <Text fontSize="xs" fontWeight="600" color="gray.500">
                        Hasil / Result:
                      </Text>
                      <Box
                        p={2}
                        borderRadius="md"
                        bg={useColorModeValue('green.50', 'green.900')}
                        fontSize="sm"
                      >
                        {selectedTicket.result}
                      </Box>
                    </GridItem>
                  )}

                  {selectedTicket.notes && (
                    <GridItem colSpan={2}>
                      <Text fontSize="xs" fontWeight="600" color="gray.500">
                        Catatan:
                      </Text>
                      <Text fontSize="sm">{selectedTicket.notes}</Text>
                    </GridItem>
                  )}
                </Grid>
              )}
            </ModalBody>
            <ModalFooter>
              <Button size="sm" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </StyledTrackTicketFromMePage>
    </ContainerCarrot>
  );
}
