import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue, 
  Heading, 
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  InputGroup,
  InputLeftElement,
  Link as ChakraLink,
  Badge
} from '@chakra-ui/react';
import { FiSearch, FiExternalLink } from 'react-icons/fi';
import Container from '@/components/Container';
import Pagination from '@/components/Pagination';
import { getFDIdentity } from '@/features/eso/esoApiService';

function FDIdentityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderBg = useColorModeValue('#fcf7ecff', '#2C3748');
  const tableHeaderColor = useColorModeValue('#3b3b43ff', 'dark.text.primary');
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.700');
  const linkColor = useColorModeValue('blue.600', 'blue.300');

  // Fetch FD Identity data
  const { data: identityData, isLoading, error } = useQuery({
    queryKey: ['fdIdentity'],
    queryFn: getFDIdentity,
  });

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!identityData) return [];
    
    if (!searchQuery.trim()) return identityData;
    
    const query = searchQuery.toLowerCase();
    return identityData.filter(student => 
      student.nama_lengkap?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.phone_number_siswa?.toLowerCase().includes(query)
    );
  }, [identityData, searchQuery]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Calculate start and end index for pagination info
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);

  // Convert Google Drive link to direct view link
  const getDirectLink = (driveUrl) => {
    if (!driveUrl) return null;
    const fileIdMatch = driveUrl.match(/id=([^&]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
    }
    return driveUrl;
  };

  if (error) {
    return (
      <Container>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Gagal memuat data identitas siswa FD. {error.message}
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Full-Time Course Student Identity</Heading>
        <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="md">
          Total: {filteredData.length} Siswa
        </Badge>
      </Flex>

      {/* Search */}
      <Box mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Cari nama, email, atau nomor telepon..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            bg={bgColor}
            borderColor={borderColor}
          />
        </InputGroup>
      </Box>

      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="orange.500" thickness="4px" />
        </Flex>
      ) : (
        <>
          {/* Table */}
          <Box overflowX="auto" bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="md" mb={6}>
            <Box as="table" width="100%">
              <Box as="thead" bg={tableHeaderBg}>
                <Box as="tr">
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="50px">
                    No
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="150px">
                    Timestamp
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="200px">
                    Nama Lengkap
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="150px">
                    Email Siswa
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="150px">
                    Nama Email
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="120px">
                    Nomor HP Siswa
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="80px">
                    KTP
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="80px">
                    Ijazah
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="100px">
                    Akta Kelahiran
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="80px">
                    Pas Foto
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="120px">
                    Surat Keterangan
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="100px">
                    Ukuran T-Shirt
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="100px">
                    Ukuran Jaket
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="250px">
                    Alamat Domisili
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="250px">
                    Alamat KTP
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="200px">
                    Nama Orang Tua
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="250px">
                    Alamat Orang Tua
                  </Box>
                  <Box as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="120px">
                    No HP Orang Tua
                  </Box>
                  <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor} minW="150px">
                    Email Orang Tua
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {paginatedData.length === 0 ? (
                  <Box as="tr">
                    <Box as="td" colSpan={19} p={6} textAlign="center" color="gray.500">
                      Tidak ada data ditemukan
                    </Box>
                  </Box>
                ) : (
                  paginatedData.map((student, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const timestamp = student.timestamp ? new Date(student.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
                    return (
                      <Box key={index} as="tr" _hover={{ bg: tableRowHoverBg }}>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          {rowNumber}
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{timestamp}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontWeight="medium">{student.nama_lengkap || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{student.email_siswa || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{student.nama_email || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{student.phone_number_siswa || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          {student.ktp ? (
                            <ChakraLink
                              href={getDirectLink(student.ktp)}
                              isExternal
                              color={linkColor}
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Lihat
                              <FiExternalLink size={12} />
                            </ChakraLink>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          {student.ijazah ? (
                            <ChakraLink
                              href={getDirectLink(student.ijazah)}
                              isExternal
                              color={linkColor}
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Lihat
                              <FiExternalLink size={12} />
                            </ChakraLink>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          {student.akta_kelahiran ? (
                            <ChakraLink
                              href={getDirectLink(student.akta_kelahiran)}
                              isExternal
                              color={linkColor}
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Lihat
                              <FiExternalLink size={12} />
                            </ChakraLink>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          {student.pas_photo ? (
                            <ChakraLink
                              href={getDirectLink(student.pas_photo)}
                              isExternal
                              color={linkColor}
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Lihat
                              <FiExternalLink size={12} />
                            </ChakraLink>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          {student.surat_keterangan ? (
                            <ChakraLink
                              href={getDirectLink(student.surat_keterangan)}
                              isExternal
                              color={linkColor}
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Lihat
                              <FiExternalLink size={12} />
                            </ChakraLink>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          <Badge colorScheme="green">{student.ukuran_tshirt || '-'}</Badge>
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          <Badge colorScheme="blue">{student.ukuran_jaket || '-'}</Badge>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm" whiteSpace="pre-wrap">{student.alamat_domisi || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm" whiteSpace="pre-wrap">{student.alamat_ktp || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{student.nama_orangtua || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm" whiteSpace="pre-wrap">{student.alamat_orangtua || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{student.phone_number_orangtua || '-'}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                          <Text fontSize="sm">{student.email_orangtua || '-'}</Text>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredData.length}
              />
            </Flex>
          )}
        </>
      )}
    </Container>
  );
}

export default FDIdentityPage;
