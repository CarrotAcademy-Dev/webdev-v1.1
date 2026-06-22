/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  useColorModeValue,
  Badge,
  Skeleton,
  Button,
  useToast,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBuktiPembayaran, ceklisBuktiPembayaran } from '@/features/finance/financeApiService';
import useDebounce from '@/hooks/useDebounce';
import { StyledBuktiPembayaran } from './BuktiPembayaran.styled';
import ContainerCarrot from '@/components/Container';
import { FiSearch, FiCheckCircle, FiChevronUp, FiChevronDown, FiInfo } from 'react-icons/fi';
import Pagination from '@/components/Pagination';
import { logger } from '@/utils/logger';

function BuktiPembayaranPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'dark.bg.card');
  const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch bukti pembayaran data
  const { data: buktiData, isLoading, isError, error } = useQuery({
    queryKey: ['buktiPembayaran'],
    queryFn: getBuktiPembayaran,
    staleTime: 5 * 60 * 1000
  });

  // Helper untuk sorting
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key || !data) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';

      // Default string comparison
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

  // Ceklis mutation
  const { mutate: ceklisBukti, isPending } = useMutation({
    mutationFn: ceklisBuktiPembayaran,
    onMutate: async (psid) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['buktiPembayaran'] });
      
      const previousData = queryClient.getQueryData(['buktiPembayaran']);

      // Optimistic update
      queryClient.setQueryData(['buktiPembayaran'], (oldData) => {
        if (!oldData) return [];
        return oldData.map(item => 
          item.psid === psid ? { ...item, ceklis: 'TRUE' } : item
        );
      });

      return { previousData };
    },
    onSuccess: (data, psid) => {
      if (data.status === 'success') {
        toast({
          title: 'Berhasil',
          description: data.message || 'Bukti pembayaran berhasil diceklis',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
        logger.info('[Bukti Pembayaran] Ceklis successfully', { psid });
      } else {
        // Rollback on server error
        queryClient.setQueryData(['buktiPembayaran'], (context) => context.previousData);
        
        toast({
          title: 'Gagal',
          description: data.message || 'Gagal ceklis bukti pembayaran',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top'
        });
      }
    },
    onError: (error, psid, context) => {
      // Rollback on network error
      if (context?.previousData) {
        queryClient.setQueryData(['buktiPembayaran'], context.previousData);
      }

      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat ceklis',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });

      logger.error('[Bukti Pembayaran] Error ceklis', { psid, error: error.message });
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['buktiPembayaran'] });
    }
  });

  // Handle ceklis button click
  const handleCeklis = (psid) => {
    if (!psid) {
      toast({
        title: 'Error',
        description: 'PSID tidak valid',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    ceklisBukti(psid);
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!buktiData) return [];

    let filtered = [...buktiData];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.psid?.toLowerCase().includes(searchLower) ||
        item.id_ticket?.toLowerCase().includes(searchLower) ||
        item.nama?.toLowerCase().includes(searchLower) ||
        item.kategori?.toLowerCase().includes(searchLower) ||
        item.request?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortConfig);

    return filtered;
  }, [buktiData, debouncedSearch, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <ContainerCarrot>
        <Flex direction="column" gap={4}>
          <Skeleton height="60px" />
          <Skeleton height="400px" />
        </Flex>
      </ContainerCarrot>
    );
  }

  // Show error state
  if (isError) {
    return (
      <ContainerCarrot>
        <Box p={8} textAlign="center">
          <Text color="red.500" fontSize="lg">
            Error: {error?.message || 'Gagal memuat data bukti pembayaran'}
          </Text>
        </Box>
      </ContainerCarrot>
    );
  }

  return (
    <ContainerCarrot>
      <StyledBuktiPembayaran>
        {/* Header */}
        <div className="page-header">
          <h1>Bukti Pembayaran</h1>
          <p>Kelola bukti pembayaran siswa</p>
        </div>

        {/* Search Bar */}
        <Box mb={6}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Cari PSID, ID Ticket, Nama, Kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
            />
          </InputGroup>
        </Box>

        {/* Table */}
        <Box className="table-container" bg={cardBg} borderRadius="md" overflow="hidden">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('psid')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    PSID {renderSortIcon('psid')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('id_ticket')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    ID Ticket {renderSortIcon('id_ticket')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('nama')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Nama {renderSortIcon('nama')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Status {renderSortIcon('status')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('kategori')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Kategori {renderSortIcon('kategori')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('request')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Request {renderSortIcon('request')}
                  </Flex>
                </th>
                <th>Request Detail</th>
                <th onClick={() => handleSort('responsible')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Responsible {renderSortIcon('responsible')}
                  </Flex>
                </th>
                <th>Lampiran</th>
                <th onClick={() => handleSort('ceklis')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Status Ceklis {renderSortIcon('ceklis')}
                  </Flex>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text color={textColor}>
                      {debouncedSearch ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data'}
                    </Text>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={`${item.psid}-${item.id_ticket}-${index}`}>
                    <td>{item.psid}</td>
                    <td>{item.id_ticket}</td>
                    <td>{item.nama}</td>
                    <td>
                      <Badge 
                        colorScheme={
                          item.status?.toLowerCase() === 'open' ? 'orange' : 
                          item.status?.toLowerCase() === 'closed' ? 'green' : 
                          'gray'
                        }
                      >
                        {item.status || '-'}
                      </Badge>
                    </td>
                    <td>{item.kategori}</td>
                    <td>{item.request}</td>
                    <td>
                      {item.request_detail ? (
                        <Tooltip label={item.request_detail} placement="top" hasArrow>
                          <Flex align="center" gap={1} cursor="pointer">
                            <Text isTruncated maxW="150px">{item.request_detail}</Text>
                            <IconButton
                              icon={<FiInfo />}
                              size="xs"
                              variant="ghost"
                              aria-label="Info"
                            />
                          </Flex>
                        </Tooltip>
                      ) : (
                        <Text color={textColor}>-</Text>
                      )}
                    </td>
                    <td>{item.responsible}</td>
                    <td>
                      {item.lampiran ? (
                        <a 
                          href={item.lampiran} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#3182ce', textDecoration: 'underline' }}
                        >
                          Lihat
                        </a>
                      ) : (
                        <Text color={textColor}>-</Text>
                      )}
                    </td>
                    <td>
                      {item.ceklis === 'TRUE' ? (
                        <Badge colorScheme="green" display="flex" alignItems="center" gap={1} w="fit-content">
                          <FiCheckCircle size={12} />
                          Ceklis
                        </Badge>
                      ) : (
                        <Badge colorScheme="yellow" w="fit-content">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td>
                      {item.ceklis !== 'TRUE' && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<FiCheckCircle />}
                          onClick={() => handleCeklis(item.psid)}
                          isLoading={isPending}
                          isDisabled={isPending}
                        >
                          Ceklis
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box mt={6}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={(currentPage - 1) * itemsPerPage}
              endIndex={currentPage * itemsPerPage}
              totalItems={processedData.length}
            />
          </Box>
        )}
      </StyledBuktiPembayaran>
    </ContainerCarrot>
  );
}

export default BuktiPembayaranPage;
