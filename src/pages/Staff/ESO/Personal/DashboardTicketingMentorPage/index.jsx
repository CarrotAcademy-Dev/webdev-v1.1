import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue, 
  Heading, 
  Grid, 
  Select,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import Container from '@/components/Container';
import StatisticsBarChart from '@/components/StatisticsBarChart';
import { getDashboardTicketingMentor } from '@/features/eso/esoApiService';

function DashboardTicketingMentorPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('#fcf7ecff', '#2C3748');
  const tableHeaderColor = useColorModeValue('#3b3b43ff', 'dark.text.primary');
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardTicketingMentor', selectedYear],
    queryFn: () => getDashboardTicketingMentor(selectedYear),
  });

  // Generate year options (current year - 5 to current year + 1)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i.toString());
    }
    return years;
  }, [currentYear]);

  // Transform data for charts
  const chartData = useMemo(() => {
    if (!dashboardData) return {};

    const categories = ['Artist Journal', 'Siswa tidak Proaktif', 'Presensi Online'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result = {};

    categories.forEach(category => {
      // Get all mentors from first month
      const firstMonthData = dashboardData.January?.[category] || {};
      const mentors = Object.keys(firstMonthData);

      // Prepare datasets object for StatisticsBarChart
      const datasets = {};
      mentors.forEach(mentor => {
        datasets[mentor] = months.map(month => {
          return dashboardData[month]?.[category]?.[mentor] || 0;
        });
      });

      result[category] = {
        labels: months.map(m => m.substring(0, 3)), // Jan, Feb, Mar...
        datasets,
        mentors, // Keep mentors array for categories prop
      };
    });

    return result;
  }, [dashboardData]);

  // Table data per category
  const tableData = useMemo(() => {
    if (!dashboardData) return {};

    const categories = ['Artist Journal', 'Siswa tidak Proaktif', 'Presensi Online'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result = {};

    categories.forEach(category => {
      const firstMonthData = dashboardData.January?.[category] || {};
      const mentors = Object.keys(firstMonthData);

      result[category] = months.map(month => {
        const row = { month };
        mentors.forEach(mentor => {
          row[mentor] = dashboardData[month]?.[category]?.[mentor] || 0;
        });
        return row;
      });
    });

    return result;
  }, [dashboardData]);

  // Get mentor columns
  const mentorColumns = useMemo(() => {
    if (!dashboardData) return [];
    const firstMonthData = dashboardData.January?.['Artist Journal'] || {};
    return Object.keys(firstMonthData);
  }, [dashboardData]);

  if (error) {
    return (
      <Container>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Gagal memuat data dashboard ticketing mentor. {error.message}
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header with Year Filter */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Dashboard Ticketing Mentor {selectedYear}</Heading>
        <Flex align="center" gap={2}>
          <FiCalendar size={20} color={labelColor} />
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            width="150px"
            bg={bgColor}
            borderColor={borderColor}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="orange.500" thickness="4px" />
        </Flex>
      ) : (
        <>
          {/* Artist Journal Section */}
          <Box mb={8}>
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                {chartData['Artist Journal']?.mentors ? (
                  <>
                    <Box height="400px" mb={6}>
                      <StatisticsBarChart
                        data={chartData['Artist Journal']}
                        title="Artist Journal"
                        categories={chartData['Artist Journal'].mentors}
                      />
                    </Box>

                    {/* Table Artist Journal */}
                    <Box overflowX="auto">
                  <Box as="table" width="100%" borderWidth="1px" borderColor={borderColor} borderRadius="md">
                    <Box as="thead" bg={tableHeaderBg}>
                      <Box as="tr">
                        <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor}>
                          Bulan
                        </Box>
                        {mentorColumns.map(mentor => (
                          <Box key={mentor} as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor}>
                            {mentor}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {tableData['Artist Journal']?.map((row, idx) => (
                        <Box key={idx} as="tr" _hover={{ bg: tableRowHoverBg }}>
                          <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                            {row.month}
                          </Box>
                          {mentorColumns.map(mentor => (
                            <Box key={mentor} as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                              {row[mentor]}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                  </>
                ) : (
                  <Text>Tidak ada data untuk ditampilkan</Text>
                )}
              </CardBody>
            </Card>
          </Box>

          {/* Siswa tidak Proaktif Section */}
          <Box mb={8}>
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                {chartData['Siswa tidak Proaktif']?.mentors ? (
                  <>
                    <Box height="400px" mb={6}>
                      <StatisticsBarChart
                        data={chartData['Siswa tidak Proaktif']}
                        title="Siswa tidak Proaktif"
                        categories={chartData['Siswa tidak Proaktif'].mentors}
                      />
                    </Box>

                    {/* Table Siswa tidak Proaktif */}
                    <Box overflowX="auto">
                  <Box as="table" width="100%" borderWidth="1px" borderColor={borderColor} borderRadius="md">
                    <Box as="thead" bg={tableHeaderBg}>
                      <Box as="tr">
                        <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor}>
                          Bulan
                        </Box>
                        {mentorColumns.map(mentor => (
                          <Box key={mentor} as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor}>
                            {mentor}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {tableData['Siswa tidak Proaktif']?.map((row, idx) => (
                        <Box key={idx} as="tr" _hover={{ bg: tableRowHoverBg }}>
                          <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                            {row.month}
                          </Box>
                          {mentorColumns.map(mentor => (
                            <Box key={mentor} as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                              {row[mentor]}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                  </>
                ) : (
                  <Text>Tidak ada data untuk ditampilkan</Text>
                )}
              </CardBody>
            </Card>
          </Box>

          {/* Presensi Online Section */}
          <Box mb={8}>
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                {chartData['Presensi Online']?.mentors ? (
                  <>
                    <Box height="400px" mb={6}>
                      <StatisticsBarChart
                        data={chartData['Presensi Online']}
                        title="Presensi Online"
                        categories={chartData['Presensi Online'].mentors}
                      />
                    </Box>

                    {/* Table Presensi Online */}
                    <Box overflowX="auto">
                  <Box as="table" width="100%" borderWidth="1px" borderColor={borderColor} borderRadius="md">
                    <Box as="thead" bg={tableHeaderBg}>
                      <Box as="tr">
                        <Box as="th" p={3} textAlign="left" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor}>
                          Bulan
                        </Box>
                        {mentorColumns.map(mentor => (
                          <Box key={mentor} as="th" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor} fontWeight="bold" color={tableHeaderColor}>
                            {mentor}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {tableData['Presensi Online']?.map((row, idx) => (
                        <Box key={idx} as="tr" _hover={{ bg: tableRowHoverBg }}>
                          <Box as="td" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                            {row.month}
                          </Box>
                          {mentorColumns.map(mentor => (
                            <Box key={mentor} as="td" p={3} textAlign="center" borderBottomWidth="1px" borderColor={borderColor}>
                              {row[mentor]}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                  </>
                ) : (
                  <Text>Tidak ada data untuk ditampilkan</Text>
                )}
              </CardBody>
            </Card>
          </Box>
        </>
      )}
    </Container>
  );
}

export default DashboardTicketingMentorPage;
