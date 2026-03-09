import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Spinner, 
  useColorMode,
  Button,
  Flex,
  Text,
  useColorModeValue,
  IconButton
} from '@chakra-ui/react';
import { FiInbox, FiSearch, FiExternalLink } from 'react-icons/fi';
import { getPendaftaranLanjutan } from '@/features/eso/esoApiService';
import ContainerCarrot from '@/components/Container';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { StyledPendaftaranLanjutanPage } from './PendaftaranLanjutan.styled';

const PendaftaranLanjutanPage = () => {
  const { colorMode } = useColorMode();
  
  // Theme colors
  const cardBg = useColorModeValue('white', 'dark.bg.card');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // State management
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data using React Query
  const { data: pendaftaranData = [], isLoading, isError } = useQuery({
    queryKey: ['pendaftaranLanjutanEso'],
    queryFn: getPendaftaranLanjutan,
    refetchOnWindowFocus: false,
  });

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return pendaftaranData;
    
    return pendaftaranData.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.psid?.toLowerCase().includes(searchLower) ||
        item.nama?.toLowerCase().includes(searchLower)
      );
    });
  }, [pendaftaranData, searchQuery]);

  // Use pagination hook
  const {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
    resetPage
  } = usePagination(filteredData, 10);

  // Reset to page 1 when search changes
  useEffect(() => {
    resetPage();
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>No</th>
            <th style={{ width: '120px' }}>PSID</th>
            <th>Nama</th>
            <th style={{ width: '150px' }}>Prefilled Link</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td><Skeleton /></td>
              <td><Skeleton /></td>
              <td><Skeleton /></td>
              <td><Skeleton /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );    

  return (
    <ContainerCarrot>
      <StyledPendaftaranLanjutanPage data-theme={colorMode}>
        {/* Page Title */}
        <h1 className="page-title">Pendaftaran Lanjutan</h1>
        <Text fontSize="md" color={textMuted} mb={6}>
          Data pendaftaran lanjutan siswa dengan prefilled form link
        </Text>

        {/* Search Bar */}
        <Flex mb={4} gap={3} alignItems="center" flexWrap="wrap">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Cari PSID atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>
          <Text fontSize="sm" color={textMuted}>
            {filteredData.length} results
          </Text>
        </Flex>

      {/* Table or Loading State */}
      {isLoading ? (
        renderSkeleton()
      ) : isError ? (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={16} 
          bg={cardBg}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <FiInbox size={48} color="gray" />
          <Text fontSize="xl" fontWeight="600" mt={4}>Gagal memuat data</Text>
          <Text fontSize="sm" color={textMuted}>Terjadi kesalahan saat mengambil data</Text>
        </Flex>
      ) : currentItems.length === 0 ? (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={16} 
          bg={cardBg}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <FiInbox size={48} color="gray" />
          <Text fontSize="xl" fontWeight="600" mt={4}>Tidak ada data</Text>
          <Text fontSize="sm" color={textMuted}>Belum ada data pendaftaran lanjutan yang tersedia</Text>
        </Flex>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th style={{ width: '120px' }}>PSID</th>
                  <th>Nama</th>
                  <th style={{ width: '150px' }}>Prefilled Link</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.psid || index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.psid}</td>
                    <td>{item.nama}</td>
                    <td>
                      <Button
                        as="a"
                        href={item.prefilled}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<FiExternalLink />}
                        variant="solid"
                      >
                        Open Form
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex mt={6} justify="center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
              />
            </Flex>
          )}
        </>
      )}
      </StyledPendaftaranLanjutanPage>
    </ContainerCarrot>
  );
};

export default PendaftaranLanjutanPage;
