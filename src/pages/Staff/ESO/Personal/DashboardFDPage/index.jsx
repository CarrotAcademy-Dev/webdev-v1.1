import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, Text, Input, useColorModeValue, Spinner, Heading, Grid, InputGroup, InputLeftElement, Badge, Select, Button } from '@chakra-ui/react';
import { FiUser, FiCalendar, FiCheckCircle, FiSearch, FiX } from 'react-icons/fi';
import Container from '@/components/Container';
import InfoCard from '@/components/InfoCard';
import Pagination from '@/components/Pagination';
import { getListSiswaFD, getDataDashboardFD } from '@/features/eso/esoApiService';

function DashboardFDPage() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Filter states
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const valueColor = useColorModeValue('gray.900', 'white');
  const suggestionBgHover = useColorModeValue('gray.100', 'gray.700');
  const tableHeaderBg = useColorModeValue('#fcf7ecff', '#2C3748');
  const tableHeaderColor = useColorModeValue('#3b3b43ff', 'dark.text.primary');
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch list siswa FD
  const { data: studentList, isLoading: isLoadingList } = useQuery({
    queryKey: ['siswaFDList'],
    queryFn: getListSiswaFD,
  });

  // Filter student list based on search query
  const filteredStudents = useMemo(() => {
    if (!studentList || !searchQuery) return [];
    return studentList.filter(nama => 
      nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentList, searchQuery]);

  // Handle student selection
  const handleSelectStudent = (nama) => {
    setSelectedStudent(nama);
    setSearchQuery(nama);
    setShowSuggestions(false);
    setCurrentPage(1);
    setSelectedIndex(-1);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredStudents.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredStudents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredStudents.length) {
          handleSelectStudent(filteredStudents[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard, error } = useQuery({
    queryKey: ['dashboardFD', selectedStudent],
    queryFn: () => getDataDashboardFD(selectedStudent),
    enabled: !!selectedStudent,
  });
  
  // Filter presensi by month/year
  const filteredPresensi = useMemo(() => {
    if (!dashboardData?.presensi) return [];
    
    let filtered = dashboardData.presensi;
    
    if (filterMonth || filterYear) {
      // Map nama bulan ke nomor
      const monthMap = {
        'jan': '01', 'januari': '01',
        'feb': '02', 'februari': '02',
        'mar': '03', 'maret': '03',
        'apr': '04', 'april': '04',
        'may': '05', 'mei': '05',
        'jun': '06', 'juni': '06',
        'jul': '07', 'juli': '07',
        'aug': '08', 'agustus': '08',
        'sep': '09', 'september': '09',
        'oct': '10', 'oktober': '10',
        'nov': '11', 'november': '11',
        'dec': '12', 'desember': '12'
      };
      
      filtered = filtered.filter(item => {
        if (!item.tanggal) return false;
        
        let month = '';
        let year = '';
        
        const tanggalStr = String(item.tanggal).trim();
        
        // Format "DD MMM YYYY" (e.g., "19 Jan 2023")
        if (tanggalStr.includes(' ')) {
          const parts = tanggalStr.split(' ');
          if (parts.length === 3) {
            const monthName = parts[1].toLowerCase().trim();
            month = monthMap[monthName] || '';
            year = parts[2].trim();
          }
        } 
        // Format "DD/MM/YYYY" atau "DD-MM-YYYY"
        else {
          // eslint-disable-next-line no-useless-escape
          const dateParts = tanggalStr.split(/[\/\-]/);
          if (dateParts.length === 3) {
            month = dateParts[1].padStart(2, '0');
            year = dateParts[2].trim();
          }
        }
        
        // Filter by month
        if (filterMonth && month !== filterMonth) return false;
        
        // Filter by year
        if (filterYear && year !== filterYear) return false;
        
        return true;
      });
    }
    
    return filtered;
  }, [dashboardData?.presensi, filterMonth, filterYear]);
  
  // Get unique years from presensi data
  const availableYears = useMemo(() => {
    if (!dashboardData?.presensi) return [];
    
    const years = new Set();
    dashboardData.presensi.forEach(item => {
      if (item.tanggal) {
        // Support format "DD MMM YYYY" (e.g., "19 Jan 2023")
        if (item.tanggal.includes(' ')) {
          const parts = item.tanggal.split(' ');
          if (parts.length === 3) {
            years.add(parts[2]);
          }
        } 
        // Support format "DD/MM/YYYY" atau "DD-MM-YYYY"
        else {
          // eslint-disable-next-line no-useless-escape
          const dateParts = item.tanggal.split(/[\/\-]/);
          if (dateParts.length === 3) {
            years.add(dateParts[2]);
          }
        }
      }
    });
    
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [dashboardData?.presensi]);
  
  // Reset filter
  const handleResetFilter = () => {
    setFilterMonth('');
    setFilterYear('');
    setCurrentPage(1);
  };
  
  // Pagination for filtered presensi
  const totalPages = filteredPresensi.length > 0
    ? Math.ceil(filteredPresensi.length / itemsPerPage) 
    : 0;
  
  const paginatedPresensi = filteredPresensi.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const startIndex = filteredPresensi.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredPresensi.length);
  const totalItems = filteredPresensi.length;

  return (
    <Container>
      <Box py={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} gap={4} flexWrap="wrap">
          <Heading size="lg" color="orange.500">
            Dashboard Siswa Full-Time
          </Heading>
          
          {/* Search Student */}
          <Box width={{ base: '100%', md: '400px' }} position="relative">
            <InputGroup>
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) {
                    setSelectedStudent('');
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                bg={bgColor}
                borderColor={borderColor}
                disabled={isLoadingList}
              />
            </InputGroup>
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && searchQuery && filteredStudents.length > 0 && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                mt={1}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="lg"
                maxH="300px"
                overflowY="auto"
                zIndex={10}
              >
                {filteredStudents.map((nama, index) => (
                  <Box
                    key={index}
                    bg={selectedIndex === index ? 'orange.50' : 'transparent'}
                    _dark={{
                      bg: selectedIndex === index ? 'orange.900' : 'transparent'
                    }}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: suggestionBgHover }}
                    onClick={() => handleSelectStudent(nama)}
                    borderBottom={index < filteredStudents.length - 1 ? '1px solid' : 'none'}
                    borderColor={borderColor}
                  >
                    <Text fontSize="sm">{nama}</Text>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* No results message */}
            {showSuggestions && searchQuery && filteredStudents.length === 0 && studentList && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                mt={1}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="lg"
                p={3}
                zIndex={10}
              >
                <Text fontSize="sm" color={labelColor}>
                  Tidak ada siswa ditemukan
                </Text>
              </Box>
            )}
          </Box>
        </Flex>

        {/* Loading State */}
        {isLoadingDashboard && selectedStudent && (
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="xl" color="orange.500" thickness="4px" />
          </Flex>
        )}

        {/* Error State */}
        {error && (
          <Box 
            p={6} 
            bg="red.50" 
            _dark={{ bg: 'red.900' }} 
            borderRadius="lg" 
            borderLeft="4px solid" 
            borderColor="red.500"
          >
            <Text color="red.700" _dark={{ color: 'red.200' }}>
              {error.message}
            </Text>
          </Box>
        )}

        {/* Dashboard Content */}
        {!selectedStudent && !isLoadingDashboard && (
          <Flex justify="center" align="center" minH="400px">
            <Text fontSize="lg" color={labelColor}>
              {searchQuery ? 'Pilih nama siswa dari hasil pencarian' : 'Cari nama siswa untuk melihat dashboard'}
            </Text>
          </Flex>
        )}

        {dashboardData && selectedStudent && !isLoadingDashboard && (
          <Box>
            {/* Biodata Section */}
            <Box 
              bg={bgColor} 
              borderRadius="lg" 
              p={6} 
              mb={6}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex align="center" gap={3} mb={4}>
                <Box as={FiUser} fontSize="2xl" color="orange.500" />
                <Heading size="md">Profil Siswa Full-Time</Heading>
              </Flex>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Box>
                  <Text fontSize="sm" color={labelColor} mb={1}>Nama Siswa</Text>
                  <Text fontSize="lg" fontWeight="bold" color={valueColor}>
                    {dashboardData.biodata.nama}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={labelColor} mb={1}>Angkatan</Text>
                  <Text fontSize="lg" fontWeight="bold" color={valueColor}>
                    {dashboardData.biodata.angkatan}
                  </Text>
                </Box>
              </Grid>
            </Box>

            {/* Progress Section */}
            <Box 
              bg={bgColor} 
              borderRadius="lg" 
              p={6} 
              mb={6}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex align="center" gap={3} mb={6}>
                <Box as={FiCheckCircle} fontSize="2xl" color="orange.500" />
                <Heading size="md">Progress Pembelajaran</Heading>
              </Flex>

              {/* Grade Card */}
              <Box mb={6}>
                <Text fontSize="sm" color={labelColor} mb={3} fontWeight="semibold">
                  Grade Saat Ini
                </Text>
                <Box 
                  borderWidth="2px"
                  borderColor="orange.500"
                  p={4} 
                  borderRadius="lg"
                  textAlign="center"
                  bg={bgColor}
                >
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    {dashboardData.nilai?.grade || 'N/A'}
                  </Text>
                </Box>
              </Box>

              {/* Progress Bars */}
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4}>
                {dashboardData.nilai?.project !== undefined && (
                  <InfoCard>
                    <FiCheckCircle size="24px" color="#FE7743" />
                    <Text fontSize="sm" color={labelColor}>Project</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
                      {dashboardData.nilai.project}
                    </Text>
                  </InfoCard>
                )}
                {dashboardData.nilai?.project_brief !== undefined && (
                  <InfoCard>
                    <FiCheckCircle size="24px" color="#FE7743" />
                    <Text fontSize="sm" color={labelColor}>Project Brief</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
                      {dashboardData.nilai.project_brief}
                    </Text>
                  </InfoCard>
                )}
                {dashboardData.nilai?.meeting_notulen !== undefined && (
                  <InfoCard>
                    <FiCheckCircle size="24px" color="#FE7743" />
                    <Text fontSize="sm" color={labelColor}>Notulen</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
                      {dashboardData.nilai.meeting_notulen}
                    </Text>
                  </InfoCard>
                )}
                {dashboardData.nilai?.presensi !== undefined && (
                  <InfoCard>
                    <FiCheckCircle size="24px" color="#FE7743" />
                    <Text fontSize="sm" color={labelColor}>Attendance</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
                      {dashboardData.nilai.presensi}
                    </Text>
                  </InfoCard>
                )}
              </Grid>
            </Box>

            {/* Presensi Section */}
            <Box 
              bg={bgColor} 
              borderRadius="lg" 
              overflow="hidden"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                  <Flex align="center" gap={3}>
                    <Box as={FiCalendar} fontSize="xl" color="orange.500" />
                    <Heading size="md" color={valueColor}>
                      Riwayat Presensi
                    </Heading>
                  </Flex>
                  
                  {/* Filter Controls */}
                  <Flex gap={2} align="center" flexWrap="wrap">
                    <Select
                      placeholder="Semua Bulan"
                      value={filterMonth}
                      onChange={(e) => {
                        setFilterMonth(e.target.value);
                        setCurrentPage(1);
                      }}
                      width="150px"
                      size="sm"
                      bg={bgColor}
                    >
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </Select>
                    
                    <Select
                      placeholder="Semua Tahun"
                      value={filterYear}
                      onChange={(e) => {
                        setFilterYear(e.target.value);
                        setCurrentPage(1);
                      }}
                      width="120px"
                      size="sm"
                      bg={bgColor}
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Select>
                    
                    {(filterMonth || filterYear) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="orange"
                        onClick={handleResetFilter}
                        leftIcon={<FiX />}
                      >
                        Reset
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Box>

              <Box overflowX="auto">
                <Box as="table" width="100%" css={{ borderCollapse: 'collapse' }}>
                  <Box as="thead" bg={tableHeaderBg}>
                    <Box as="tr">
                      <Box as="th" p={3} textAlign="center" borderBottom="1px solid" borderColor={borderColor} color={tableHeaderColor}>
                        <Text fontSize="sm" fontWeight="semibold">No</Text>
                      </Box>
                      <Box as="th" p={3} textAlign="left" borderBottom="1px solid" borderColor={borderColor} color={tableHeaderColor}>
                        <Text fontSize="sm" fontWeight="semibold">Tanggal</Text>
                      </Box>
                      <Box as="th" p={3} textAlign="center" borderBottom="1px solid" borderColor={borderColor} color={tableHeaderColor}>
                        <Text fontSize="sm" fontWeight="semibold">Check In</Text>
                      </Box>
                      <Box as="th" p={3} textAlign="center" borderBottom="1px solid" borderColor={borderColor} color={tableHeaderColor}>
                        <Text fontSize="sm" fontWeight="semibold">Check Out</Text>
                      </Box>
                      <Box as="th" p={3} textAlign="center" borderBottom="1px solid" borderColor={borderColor} color={tableHeaderColor}>
                        <Text fontSize="sm" fontWeight="semibold">Point</Text>
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {paginatedPresensi.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" colSpan={5} p={8} textAlign="center">
                          <Text color={labelColor}>Tidak ada data presensi</Text>
                        </Box>
                      </Box>
                    ) : (
                      paginatedPresensi.map((item, index) => (
                        <Box 
                          as="tr" 
                          key={index}
                          _hover={{ bg: tableRowHoverBg }}
                          borderBottom="1px solid"
                          borderColor={borderColor}
                        >
                          <Box as="td" p={3} textAlign="center">
                            <Text fontSize="sm">{(currentPage - 1) * itemsPerPage + index + 1}</Text>
                          </Box>
                          <Box as="td" p={3}>
                            <Text fontSize="sm">{item.tanggal}</Text>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Text fontSize="sm" color={valueColor}>
                              {item.check_in || '-'}
                            </Text>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Text fontSize="sm" color={valueColor}>
                              {item.check_out || '-'}
                            </Text>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Badge
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="semibold"
                              colorScheme="orange"
                            >
                              {item.point || '0'}
                            </Badge>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box p={4} borderTop="1px solid" borderColor={borderColor}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default DashboardFDPage;
