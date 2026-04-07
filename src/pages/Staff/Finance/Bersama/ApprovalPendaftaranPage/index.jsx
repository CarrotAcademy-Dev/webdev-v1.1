/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  IconButton, 
  useToast, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  useColorModeValue,
  Badge,
  Skeleton,
  Button
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApprovalPendaftaran, ceklisApprovalPendaftaran } from '@/features/finance/financeApiService';
import useDebounce from '@/hooks/useDebounce';
import { StyledApprovalPendaftaran } from './ApprovalPendaftaran.styled';
import ContainerCarrot from '@/components/Container';
import { FiSearch, FiCheckCircle, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Pagination from '@/components/Pagination';
import { logger } from '@/utils/logger';

function ApprovalPendaftaranPage() {
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

  // Fetch approval pendaftaran data
  const { data: approvalData, isLoading, isError, error } = useQuery({
    queryKey: ['approvalPendaftaran'],
    queryFn: getApprovalPendaftaran,
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

  // Approve mutation
  const { mutate: approvePendaftaran, isPending } = useMutation({
    mutationFn: ceklisApprovalPendaftaran,
    onMutate: async (psid) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['approvalPendaftaran'] });
      
      const previousData = queryClient.getQueryData(['approvalPendaftaran']);

      // Optimistic update
      queryClient.setQueryData(['approvalPendaftaran'], (oldData) => {
        if (!oldData) return [];
        return oldData.map(item => 
          item.psid === psid ? { ...item, approved: 'TRUE' } : item
        );
      });

      return { previousData };
    },
    onSuccess: (data, psid) => {
      if (data.status === 'success') {
        toast({
          title: 'Berhasil',
          description: data.message || 'Approval pendaftaran berhasil diceklis',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
        logger.info('[Approval Pendaftaran] Approved successfully', { psid });
      } else {
        // Rollback on server error
        queryClient.setQueryData(['approvalPendaftaran'], (context) => context.previousData);
        
        toast({
          title: 'Gagal',
          description: data.message || 'Gagal approve pendaftaran',
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
        queryClient.setQueryData(['approvalPendaftaran'], context.previousData);
      }

      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat approve',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });

      logger.error('[Approval Pendaftaran] Error approving', { psid, error: error.message });
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['approvalPendaftaran'] });
    }
  });

  // Handle approve button click
  const handleApprove = (psid) => {
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

    approvePendaftaran(psid);
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!approvalData) return [];

    let filtered = [...approvalData];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.psid?.toLowerCase().includes(searchLower) ||
        item.nama_siswa?.toLowerCase().includes(searchLower) ||
        item.program?.toLowerCase().includes(searchLower) ||
        item.schedule?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortConfig);

    return filtered;
  }, [approvalData, debouncedSearch, sortConfig]);

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
            Error: {error?.message || 'Gagal memuat data approval pendaftaran'}
          </Text>
        </Box>
      </ContainerCarrot>
    );
  }

  return (
    <ContainerCarrot>
      <StyledApprovalPendaftaran>
        {/* Header */}
        <div className="page-header">
          <h1>Approval Pendaftaran</h1>
          <p>Kelola approval pendaftaran siswa baru</p>
        </div>

        {/* Search Bar */}
        <Box mb={6}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Cari PSID, Nama Siswa, Program..."
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
                <th onClick={() => handleSort('nama_siswa')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Nama Siswa {renderSortIcon('nama_siswa')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('umur')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Umur {renderSortIcon('umur')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('schedule')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Schedule {renderSortIcon('schedule')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('first_class')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    First Class {renderSortIcon('first_class')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('program')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Program {renderSortIcon('program')}
                  </Flex>
                </th>
                <th>Bukti Pembayaran</th>
                <th onClick={() => handleSort('payment')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Payment {renderSortIcon('payment')}
                  </Flex>
                </th>
                <th onClick={() => handleSort('approved')} style={{ cursor: 'pointer' }}>
                  <Flex align="center" gap={2}>
                    Status {renderSortIcon('approved')}
                  </Flex>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text color={textColor}>
                      {debouncedSearch ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data'}
                    </Text>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={`${item.psid}-${index}`}>
                    <td>{item.psid}</td>
                    <td>{item.nama_siswa}</td>
                    <td>{item.umur}</td>
                    <td>{item.schedule}</td>
                    <td>{item.first_class}</td>
                    <td>{item.program}</td>
                    <td>
                      {item.bukti_pembayaran ? (
                        <a 
                          href={item.bukti_pembayaran} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#3182ce', textDecoration: 'underline' }}
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <Text color={textColor}>-</Text>
                      )}
                    </td>
                    <td>{item.payment}</td>
                    <td>
                      {item.approved === 'TRUE' ? (
                        <Badge colorScheme="green" display="flex" alignItems="center" gap={1} w="fit-content">
                          <FiCheckCircle size={12} />
                          Approved
                        </Badge>
                      ) : (
                        <Badge colorScheme="yellow" w="fit-content">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td>
                      {item.approved !== 'TRUE' && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<FiCheckCircle />}
                          onClick={() => handleApprove(item.psid)}
                          isLoading={isPending}
                          isDisabled={isPending}
                        >
                          Approve
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
      </StyledApprovalPendaftaran>
    </ContainerCarrot>
  );
}

export default ApprovalPendaftaranPage;
