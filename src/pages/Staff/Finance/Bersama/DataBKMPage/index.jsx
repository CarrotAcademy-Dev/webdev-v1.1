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
  Skeleton,
  Button,
  FormControl,
  FormLabel,
  useToast
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { getDataBKM } from '@/features/finance/financeApiService';
import useDebounce from '@/hooks/useDebounce';
import { StyledDataBKM } from './DataBKM.styled';
import ContainerCarrot from '@/components/Container';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Pagination from '@/components/Pagination';
import { logger } from '@/utils/logger';

function DataBKMPage() {
  const toast = useToast();
  
  // Theme colors
  const cardBg = useColorModeValue('white', 'dark.bg.card');
  const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Search input state
  const [namaInput, setNamaInput] = useState('');
  const [bkmData, setBkmData] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Table search (after data fetched)
  const [tableSearch, setTableSearch] = useState('');
  const debouncedTableSearch = useDebounce(tableSearch, 300);

  // Fetch BKM mutation
  const { mutate: fetchBKM, isPending } = useMutation({
    mutationFn: getDataBKM,
    onSuccess: (data) => {
      setBkmData(data || []);
      setCurrentPage(1); // Reset to page 1
      
      toast({
        title: 'Data berhasil dimuat',
        description: `Ditemukan ${data?.length || 0} data BKM`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      
      logger.info('[Data BKM] Data fetched successfully', { 
        namaLengkap: namaInput,
        count: data?.length || 0 
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Gagal memuat data BKM',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      logger.error('[Data BKM] Error fetching data', { 
        namaLengkap: namaInput,
        error: error.message 
      });
      setBkmData([]);
    }
  });

  // Helper untuk sorting
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key || !data) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

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

  // Handle search BKM
  const handleSearch = () => {
    if (!namaInput.trim()) {
      return;
    }
    fetchBKM(namaInput.trim());
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Process data (filter + sort)
  const processedData = useMemo(() => {
    if (!bkmData) return [];

    let filtered = [...bkmData];

    // Apply table search
    if (debouncedTableSearch) {
      const searchLower = debouncedTableSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.no_bkm?.toLowerCase().includes(searchLower) ||
        item.deskripsi?.toLowerCase().includes(searchLower) ||
        item.nama_siswa?.toLowerCase().includes(searchLower) ||
        item.program?.toLowerCase().includes(searchLower) ||
        item.kode_faktur?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortConfig);

    return filtered;
  }, [bkmData, debouncedTableSearch, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [debouncedTableSearch]);

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '-';
    const numericValue = value.toString().replace(/[^0-9]/g, '');
    return `Rp ${parseInt(numericValue).toLocaleString('id-ID')}`;
  };

  return (
    <ContainerCarrot>
      <StyledDataBKM>
        {/* Header */}
        <div className="page-header">
          <h1>Data BKM (Bukti Kas Masuk)</h1>
          <p>Cari data BKM berdasarkan nama siswa</p>
        </div>

        {/* Search by Name */}
        <Box mb={6}>
          <FormControl maxW="600px">
            <FormLabel>Nama Lengkap Siswa</FormLabel>
            <Flex gap={3}>
              <Input
                placeholder="Masukkan nama lengkap siswa..."
                value={namaInput}
                onChange={(e) => setNamaInput(e.target.value)}
                onKeyPress={handleKeyPress}
                bg={cardBg}
                borderColor={borderColor}
                flex={1}
              />
              <Button
                colorScheme="orange"
                onClick={handleSearch}
                isLoading={isPending}
                isDisabled={!namaInput.trim()}
                minW="100px"
              >
                Cari
              </Button>
            </Flex>
          </FormControl>
        </Box>

        {/* Show results only if data fetched */}
        {bkmData.length > 0 && (
          <>
            {/* Table Search */}
            <Box mb={6}>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Cari No BKM, Deskripsi, Program..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
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
                    <th onClick={() => handleSort('no')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        No {renderSortIcon('no')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('tanggal')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Tanggal {renderSortIcon('tanggal')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('no_bkm')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        No BKM {renderSortIcon('no_bkm')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('deskripsi')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Deskripsi {renderSortIcon('deskripsi')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('jumlah_awal')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Jumlah Awal {renderSortIcon('jumlah_awal')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('jenis_payment')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Jenis Payment {renderSortIcon('jenis_payment')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('jumlah_final')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Jumlah Final {renderSortIcon('jumlah_final')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('kode_faktur')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Kode Faktur {renderSortIcon('kode_faktur')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('program')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Program {renderSortIcon('program')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('tanggal_tagihan')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Tanggal Tagihan {renderSortIcon('tanggal_tagihan')}
                      </Flex>
                    </th>
                    <th onClick={() => handleSort('qty')} style={{ cursor: 'pointer' }}>
                      <Flex align="center" gap={2}>
                        Qty {renderSortIcon('qty')}
                      </Flex>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>
                        <Text color={textColor}>
                          {debouncedTableSearch ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data'}
                        </Text>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={`${item.no_bkm}-${index}`}>
                        <td>{item.no}</td>
                        <td>{item.tanggal}</td>
                        <td>{item.no_bkm}</td>
                        <td>{item.deskripsi}</td>
                        <td>{formatCurrency(item.jumlah_awal)}</td>
                        <td>{item.jenis_payment}</td>
                        <td>{formatCurrency(item.jumlah_final)}</td>
                        <td>{item.kode_faktur}</td>
                        <td>{item.program}</td>
                        <td>{item.tanggal_tagihan}</td>
                        <td>{item.qty}</td>
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
          </>
        )}

        {/* Empty state */}
        {bkmData.length === 0 && !isPending && (
          <Box textAlign="center" py={10}>
            <Text color={textColor} fontSize="lg">
              Masukkan nama lengkap siswa dan klik "Cari" untuk melihat data BKM
            </Text>
          </Box>
        )}

        {/* Loading state */}
        {isPending && (
          <Flex direction="column" gap={4}>
            <Skeleton height="60px" />
            <Skeleton height="400px" />
          </Flex>
        )}
      </StyledDataBKM>
    </ContainerCarrot>
  );
}

export default DataBKMPage;
