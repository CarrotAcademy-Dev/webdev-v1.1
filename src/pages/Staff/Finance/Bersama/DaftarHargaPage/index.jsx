/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getDaftarHarga, getDaftarDiskon } from '@/features/finance/financeApiService';
import useDebounce from '@/hooks/useDebounce';
import { StyledDaftarHarga } from './DaftarHarga.styled';
import ContainerCarrot from '@/components/Container';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Pagination from '@/components/Pagination';
import { logger } from '@/utils/logger';

function DaftarHargaPage() {
  // Theme colors
  const cardBg = useColorModeValue('white', 'dark.bg.card');
  const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tabBg = useColorModeValue('gray.50', 'gray.700');

  // Active tab
  const [activeTab, setActiveTab] = useState(0);

  // Harga Produk state
  const [hargaPage, setHargaPage] = useState(1);
  const [hargaSearch, setHargaSearch] = useState('');
  const [hargaSort, setHargaSort] = useState({ key: null, direction: 'asc' });
  const debouncedHargaSearch = useDebounce(hargaSearch, 300);

  // Diskon state
  const [diskonPage, setDiskonPage] = useState(1);
  const [diskonSearch, setDiskonSearch] = useState('');
  const [diskonSort, setDiskonSort] = useState({ key: null, direction: 'asc' });
  const debouncedDiskonSearch = useDebounce(diskonSearch, 300);

  const itemsPerPage = 10;

  // Fetch Daftar Harga
  const { data: hargaData, isLoading: hargaLoading, isError: hargaError, error: hargaErrorMsg } = useQuery({
    queryKey: ['daftarHarga'],
    queryFn: getDaftarHarga,
    staleTime: 5 * 60 * 1000
  });

  // Fetch Daftar Diskon
  const { data: diskonData, isLoading: diskonLoading, isError: diskonError, error: diskonErrorMsg } = useQuery({
    queryKey: ['daftarDiskon'],
    queryFn: getDaftarDiskon,
    staleTime: 5 * 60 * 1000
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
  const handleSort = (key, isHarga = true) => {
    if (isHarga) {
      let direction = 'asc';
      if (hargaSort.key === key && hargaSort.direction === 'asc') {
        direction = 'desc';
      }
      setHargaSort({ key, direction });
    } else {
      let direction = 'asc';
      if (diskonSort.key === key && diskonSort.direction === 'asc') {
        direction = 'desc';
      }
      setDiskonSort({ key, direction });
    }
  };

  // Process Harga data
  const processedHarga = useMemo(() => {
    if (!hargaData) return [];

    let filtered = [...hargaData];

    // Apply search
    if (debouncedHargaSearch) {
      const searchLower = debouncedHargaSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.nama_produk?.toLowerCase().includes(searchLower) ||
        item.nama_display?.toLowerCase().includes(searchLower) ||
        item.harga_satuan?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = sortData(filtered, hargaSort);

    return filtered;
  }, [hargaData, debouncedHargaSearch, hargaSort]);

  // Process Diskon data
  const processedDiskon = useMemo(() => {
    if (!diskonData) return [];

    let filtered = [...diskonData];

    // Apply search
    if (debouncedDiskonSearch) {
      const searchLower = debouncedDiskonSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.nama_produk?.toLowerCase().includes(searchLower) ||
        item.jumlah_sesi?.toLowerCase().includes(searchLower) ||
        item.potongan_harga?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = sortData(filtered, diskonSort);

    return filtered;
  }, [diskonData, debouncedDiskonSearch, diskonSort]);

  // Pagination for Harga
  const hargaTotalPages = Math.ceil(processedHarga.length / itemsPerPage);
  const paginatedHarga = processedHarga.slice(
    (hargaPage - 1) * itemsPerPage,
    hargaPage * itemsPerPage
  );

  // Pagination for Diskon
  const diskonTotalPages = Math.ceil(processedDiskon.length / itemsPerPage);
  const paginatedDiskon = processedDiskon.slice(
    (diskonPage - 1) * itemsPerPage,
    diskonPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useMemo(() => {
    setHargaPage(1);
  }, [debouncedHargaSearch]);

  useMemo(() => {
    setDiskonPage(1);
  }, [debouncedDiskonSearch]);

  // Render sort icon
  const renderSortIcon = (key, sortConfig) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '-';
    // Remove non-numeric characters and format
    const numericValue = value.toString().replace(/[^0-9]/g, '');
    return `Rp ${parseInt(numericValue).toLocaleString('id-ID')}`;
  };

  // Show loading skeleton
  if (hargaLoading || diskonLoading) {
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
  if (hargaError && diskonError) {
    return (
      <ContainerCarrot>
        <Box p={8} textAlign="center">
          <Text color="red.500" fontSize="lg">
            Error: Gagal memuat data daftar harga dan diskon
          </Text>
        </Box>
      </ContainerCarrot>
    );
  }

  return (
    <ContainerCarrot>
      <StyledDaftarHarga>
        {/* Header */}
        <div className="page-header">
          <h1>Daftar Harga & Diskon</h1>
          <p>Kelola harga produk dan diskon siswa</p>
        </div>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="orange">
          <TabList>
            <Tab fontWeight="600">Harga Produk</Tab>
            <Tab fontWeight="600">Diskon</Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: Harga Produk */}
            <TabPanel px={0}>
              {/* Search Bar */}
              <Box mb={6}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari Nama Produk, Display, Harga..."
                    value={hargaSearch}
                    onChange={(e) => setHargaSearch(e.target.value)}
                    bg={cardBg}
                    borderColor={borderColor}
                  />
                </InputGroup>
              </Box>

              {/* Table Harga */}
              <Box className="table-container" bg={cardBg} borderRadius="md" overflow="hidden">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('nama_produk', true)} style={{ cursor: 'pointer' }}>
                        <Flex align="center" gap={2}>
                          Nama Produk {renderSortIcon('nama_produk', hargaSort)}
                        </Flex>
                      </th>
                      <th onClick={() => handleSort('nama_display', true)} style={{ cursor: 'pointer' }}>
                        <Flex align="center" gap={2}>
                          Nama Display {renderSortIcon('nama_display', hargaSort)}
                        </Flex>
                      </th>
                      <th onClick={() => handleSort('harga_satuan', true)} style={{ cursor: 'pointer' }}>
                        <Flex align="center" gap={2}>
                          Harga Satuan {renderSortIcon('harga_satuan', hargaSort)}
                        </Flex>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHarga.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                          <Text color={textColor}>
                            {debouncedHargaSearch ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data'}
                          </Text>
                        </td>
                      </tr>
                    ) : (
                      paginatedHarga.map((item, index) => (
                        <tr key={`${item.nama_produk}-${index}`}>
                          <td>{item.nama_produk}</td>
                          <td>{item.nama_display}</td>
                          <td>{formatCurrency(item.harga_satuan)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>

              {/* Pagination Harga */}
              {hargaTotalPages > 1 && (
                <Box mt={6}>
                  <Pagination
                    currentPage={hargaPage}
                    totalPages={hargaTotalPages}
                    onPageChange={setHargaPage}
                    startIndex={(hargaPage - 1) * itemsPerPage}
                    endIndex={hargaPage * itemsPerPage}
                    totalItems={processedHarga.length}
                  />
                </Box>
              )}
            </TabPanel>

            {/* Tab 2: Diskon */}
            <TabPanel px={0}>
              {/* Search Bar */}
              <Box mb={6}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari Nama Produk, Jumlah Sesi, Diskon..."
                    value={diskonSearch}
                    onChange={(e) => setDiskonSearch(e.target.value)}
                    bg={cardBg}
                    borderColor={borderColor}
                  />
                </InputGroup>
              </Box>

              {/* Table Diskon */}
              <Box className="table-container" bg={cardBg} borderRadius="md" overflow="hidden">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('nama_produk', false)} style={{ cursor: 'pointer' }}>
                        <Flex align="center" gap={2}>
                          Nama Produk {renderSortIcon('nama_produk', diskonSort)}
                        </Flex>
                      </th>
                      <th onClick={() => handleSort('jumlah_sesi', false)} style={{ cursor: 'pointer' }}>
                        <Flex align="center" gap={2}>
                          Jumlah Sesi {renderSortIcon('jumlah_sesi', diskonSort)}
                        </Flex>
                      </th>
                      <th onClick={() => handleSort('potongan_harga', false)} style={{ cursor: 'pointer' }}>
                        <Flex align="center" gap={2}>
                          Potongan Harga {renderSortIcon('potongan_harga', diskonSort)}
                        </Flex>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDiskon.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                          <Text color={textColor}>
                            {debouncedDiskonSearch ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data'}
                          </Text>
                        </td>
                      </tr>
                    ) : (
                      paginatedDiskon.map((item, index) => (
                        <tr key={`${item.nama_produk}-${index}`}>
                          <td>{item.nama_produk}</td>
                          <td>{item.jumlah_sesi}</td>
                          <td>{formatCurrency(item.potongan_harga)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>

              {/* Pagination Diskon */}
              {diskonTotalPages > 1 && (
                <Box mt={6}>
                  <Pagination
                    currentPage={diskonPage}
                    totalPages={diskonTotalPages}
                    onPageChange={setDiskonPage}
                    startIndex={(diskonPage - 1) * itemsPerPage}
                    endIndex={diskonPage * itemsPerPage}
                    totalItems={processedDiskon.length}
                  />
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </StyledDaftarHarga>
    </ContainerCarrot>
  );
}

export default DaftarHargaPage;
