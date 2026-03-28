import { useState } from 'react';
import {
  Box,
  Heading,
  Grid,
  Text,
  Button,
  Badge,
  Stack,
  Flex,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDownload, FiDollarSign, FiCalendar, FiFileText } from 'react-icons/fi';
import Container from '@/components/Container';

/**
 * EXPECTED BACKEND API STRUCTURE:
 * 
 * GET /api/payslip/summary
 * Response: {
 *   status: 'success',
 *   result: {
 *     employee_name: string,
 *     employee_id: string,
 *     position: string,
 *     department: string,
 *     base_salary: number,
 *     last_payment_date: string (YYYY-MM-DD),
 *     last_payment_amount: number
 *   }
 * }
 * 
 * GET /api/payslip/list?year=2026
 * Response: {
 *   status: 'success',
 *   result: [
 *     {
 *       id: string,
 *       month: string (e.g., "Januari 2026"),
 *       payment_date: string (YYYY-MM-DD),
 *       gross_salary: number,
 *       deductions: number,
 *       net_salary: number,
 *       status: string ('paid' | 'pending' | 'processing'),
 *       pdf_url: string (download link)
 *     }
 *   ]
 * }
 */

function PayslipPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Mock data - akan diganti dengan data dari backend
  const summaryData = {
    employee_name: 'Cristin Magdalena Sitompul',
    employee_id: 'EMP-001',
    position: 'Customer Support Officer',
    department: 'Customer Service',
    base_salary: 5000000,
    last_payment_date: '2026-01-25',
    last_payment_amount: 5250000,
  };

  const payslipList = [
    {
      id: '1',
      month: 'Januari 2026',
      payment_date: '2026-01-25',
      gross_salary: 5500000,
      deductions: 250000,
      net_salary: 5250000,
      status: 'paid',
      pdf_url: 'https://example.com/payslip/2026-01.pdf',
    },
    {
      id: '2',
      month: 'Desember 2025',
      payment_date: '2025-12-25',
      gross_salary: 5500000,
      deductions: 250000,
      net_salary: 5250000,
      status: 'paid',
      pdf_url: 'https://example.com/payslip/2025-12.pdf',
    },
    {
      id: '3',
      month: 'November 2025',
      payment_date: '2025-11-25',
      gross_salary: 5000000,
      deductions: 200000,
      net_salary: 4800000,
      status: 'paid',
      pdf_url: 'https://example.com/payslip/2025-11.pdf',
    },
  ];

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Color values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const valueColor = useColorModeValue('gray.900', 'white');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { colorScheme: 'green', label: 'Dibayar' },
      pending: { colorScheme: 'yellow', label: 'Pending' },
      processing: { colorScheme: 'blue', label: 'Diproses' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge colorScheme={config.colorScheme}>{config.label}</Badge>;
  };

  // Handle download
  const handleDownload = (pdfUrl) => {
    // Backend akan provide direct download link
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container>
      <Box py={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="orange.500">
            Payslip Saya
          </Heading>
        </Flex>

        {/* Summary Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
          {/* Employee Info Card */}
          <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" p={5}>
            <Stack gap={3}>
              <Flex align="center" gap={2}>
                <Box as={FiFileText} fontSize="xl" color="orange.500" />
                <Text fontSize="sm" color={labelColor} fontWeight="medium">
                  Informasi Karyawan
                </Text>
              </Flex>
              <Box>
                <Text fontSize="lg" fontWeight="bold" color={valueColor}>
                  {summaryData.employee_name}
                </Text>
                <Text fontSize="sm" color={labelColor}>
                  {summaryData.employee_id} • {summaryData.position}
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Base Salary Card */}
          <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" p={5}>
            <Stack gap={3}>
              <Flex align="center" gap={2}>
                <Box as={FiDollarSign} fontSize="xl" color="blue.500" />
                <Text fontSize="sm" color={labelColor} fontWeight="medium">
                  Gaji Pokok
                </Text>
              </Flex>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
                  {formatCurrency(summaryData.base_salary)}
                </Text>
                <Text fontSize="sm" color={labelColor}>
                  Per bulan
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Last Payment Date Card */}
          <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" p={5}>
            <Stack gap={3}>
              <Flex align="center" gap={2}>
                <Box as={FiCalendar} fontSize="xl" color="purple.500" />
                <Text fontSize="sm" color={labelColor} fontWeight="medium">
                  Pembayaran Terakhir
                </Text>
              </Flex>
              <Box>
                <Text fontSize="lg" fontWeight="bold" color={valueColor}>
                  {formatDate(summaryData.last_payment_date)}
                </Text>
                <Text fontSize="sm" color={labelColor}>
                  Tanggal bayar
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Last Payment Amount Card */}
          <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" p={5}>
            <Stack gap={3}>
              <Flex align="center" gap={2}>
                <Box as={FiDollarSign} fontSize="xl" color="green.500" />
                <Text fontSize="sm" color={labelColor} fontWeight="medium">
                  Total Terakhir
                </Text>
              </Flex>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {formatCurrency(summaryData.last_payment_amount)}
                </Text>
                <Text fontSize="sm" color={labelColor}>
                  Gaji bersih
                </Text>
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Payslip History Section */}
        <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Box p={5} borderBottom="1px solid" borderColor={borderColor}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Riwayat Payslip</Heading>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                width="150px"
                size="sm"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Flex>
          </Box>
          <Box overflowX="auto">
            <Box as="table" width="100%" css={{ borderCollapse: 'collapse' }}>
              <Box as="thead" bg={useColorModeValue('gray.50', 'gray.700')}>
                <Box as="tr">
                  <Box as="th" textAlign="left" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Bulan
                  </Box>
                  <Box as="th" textAlign="left" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Tanggal Bayar
                  </Box>
                  <Box as="th" textAlign="right" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Gaji Kotor
                  </Box>
                  <Box as="th" textAlign="right" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Potongan
                  </Box>
                  <Box as="th" textAlign="right" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Gaji Bersih
                  </Box>
                  <Box as="th" textAlign="center" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Status
                  </Box>
                  <Box as="th" textAlign="center" p={3} fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Aksi
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {payslipList.length === 0 ? (
                  <Box as="tr">
                    <Box as="td" colSpan={7} textAlign="center" py={8}>
                      <Text color={labelColor}>Tidak ada data payslip untuk tahun {selectedYear}</Text>
                    </Box>
                  </Box>
                ) : (
                  payslipList.map((payslip) => (
                    <Box as="tr" key={payslip.id} borderTop="1px solid" borderColor={borderColor}>
                      <Box as="td" p={3} fontWeight="medium">
                        {payslip.month}
                      </Box>
                      <Box as="td" p={3}>
                        {formatDate(payslip.payment_date)}
                      </Box>
                      <Box as="td" p={3} textAlign="right">
                        {formatCurrency(payslip.gross_salary)}
                      </Box>
                      <Box as="td" p={3} textAlign="right" color="red.500">
                        -{formatCurrency(payslip.deductions)}
                      </Box>
                      <Box as="td" p={3} textAlign="right" fontWeight="bold" color="green.500">
                        {formatCurrency(payslip.net_salary)}
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        {getStatusBadge(payslip.status)}
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <Button
                          size="sm"
                          colorScheme="orange"
                          leftIcon={<FiDownload />}
                          onClick={() => handleDownload(payslip.pdf_url, payslip.month)}
                          isDisabled={payslip.status !== 'paid'}
                        >
                          Download
                        </Button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Info Note */}
        <Box mt={6} p={4} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
          <Text fontSize="sm" color={labelColor}>
            <strong>Catatan:</strong> Payslip hanya dapat didownload setelah status pembayaran menjadi "Dibayar". 
            Jika ada pertanyaan terkait payslip, silakan hubungi HRD.
          </Text>
        </Box>
      </Box>
    </Container>
  );
}

export default PayslipPage;
