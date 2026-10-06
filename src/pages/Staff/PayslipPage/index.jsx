import { useContext } from 'react';
import {
  Box,
  Heading,
  Grid,
  Text,
  Badge,
  Stack,
  Flex,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  FiFileText,
  FiUser,
  FiBriefcase,
  FiMail,
  FiClock,
  FiAlertCircle,
  FiShield
} from 'react-icons/fi';
import Container from '@/components/Container';
import { AuthContext } from '@/context/AuthContext';

function PayslipPage() {
  const { currentUser } = useContext(AuthContext);

  // Color values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const valueColor = useColorModeValue('gray.900', 'white');
  const inProgressBg = useColorModeValue('orange.50', 'rgba(254, 119, 67, 0.12)');
  const inProgressBorder = useColorModeValue('orange.200', 'rgba(254, 119, 67, 0.3)');

  // Data profil user yang sedang login
  const employeeName = currentUser?.nama || 'Karyawan Carrot Academy';
  const employeeId = currentUser?.id_karyawan || currentUser?.['Nama + ID Karyawan']?.split(' - ')?.[1] || '-';
  const employeePosition = currentUser?.jabatan || currentUser?.['Nama Jabatan Sekarang'] || '-';
  const employeeDepartment = currentUser?.['Divisi'] || 'Carrot Academy';
  const employeeEmail = currentUser?.email || '-';
  const employeeStatus = currentUser?.['Status'] || currentUser?.['Aktif/Tidak Aktif'] || 'Aktif';

  return (
    <Container>
      <Box py={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" color="orange.500" mb={1}>
              Payslip Saya
            </Heading>
            <Text fontSize="sm" color={labelColor}>
              Informasi profil karyawan dan status slip gaji digital.
            </Text>
          </Box>
          <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="0.8rem">
            Tahap Pengembangan
          </Badge>
        </Flex>

        {/* Informasi Karyawan Card */}
        <Box
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          borderRadius="xl"
          p={6}
          mb={8}
          boxShadow="sm"
        >
          <Flex align="center" gap={3} mb={5} pb={4} borderBottom="1px solid" borderColor={borderColor}>
            <Box
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="orange.100"
              _dark={{ bg: 'orange.900' }}
              color="orange.500"
              display="flex"
              align="center"
              justify="center"
            >
              <Icon as={FiUser} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="bold" color={valueColor}>
                Detail Identitas Karyawan
              </Text>
              <Text fontSize="xs" color={labelColor}>
                Data terverifikasi dari profil akun yang sedang aktif
              </Text>
            </Box>
          </Flex>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={5}>
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FiUser} fontSize="sm" color="gray.400" />
                <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase">
                  Nama Lengkap
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="bold" color={valueColor}>
                {employeeName}
              </Text>
            </Box>

            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FiFileText} fontSize="sm" color="gray.400" />
                <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase">
                  ID Karyawan
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="bold" color="blue.500">
                {employeeId}
              </Text>
            </Box>

            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FiBriefcase} fontSize="sm" color="gray.400" />
                <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase">
                  Jabatan
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="bold" color={valueColor}>
                {employeePosition}
              </Text>
            </Box>

            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FiShield} fontSize="sm" color="gray.400" />
                <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase">
                  Divisi / Departemen
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="medium" color={valueColor}>
                {employeeDepartment}
              </Text>
            </Box>

            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FiMail} fontSize="sm" color="gray.400" />
                <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase">
                  Email Akun
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="medium" color={valueColor}>
                {employeeEmail}
              </Text>
            </Box>

            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FiAlertCircle} fontSize="sm" color="gray.400" />
                <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase">
                  Status Karyawan
                </Text>
              </Flex>
              <Badge colorScheme="green" px={2} py={0.5} borderRadius="md" fontSize="xs">
                {employeeStatus}
              </Badge>
            </Box>
          </Grid>
        </Box>

        {/* Status In-Progress Banner */}
        <Box
          bg={inProgressBg}
          borderColor={inProgressBorder}
          borderWidth="1.5px"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          textAlign="center"
          position="relative"
          overflow="hidden"
          boxShadow="sm"
        >
          <Box
            w="64px"
            h="64px"
            borderRadius="full"
            bg="orange.100"
            _dark={{ bg: 'orange.900' }}
            color="orange.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            margin="0 auto 1.25rem"
          >
            <Icon as={FiClock} boxSize={8} />
          </Box>

          <Heading size="md" color={valueColor} mb={2}>
            Rincian Gaji Digital Sedang Dalam Proses
          </Heading>

          <Text fontSize="sm" color={labelColor} maxW="600px" mx="auto" lineHeight="1.7" mb={5}>
            Modul integrasi slip gaji otomatis saat ini sedang dalam tahap sinkronisasi dengan database penggajian internal. Rincian gaji, tunjangan, dan unduhan slip PDF akan dapat diakses langsung di halaman ini setelah proses integrasi selesai.
          </Text>

          <Flex justify="center" wrap="wrap" gap={3}>
            <Badge colorScheme="orange" variant="subtle" px={3} py={1} borderRadius="full">
              Status: Sedang Dalam Pembuatan
            </Badge>
            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
              Keamanan Data Payroll Terjamin
            </Badge>
          </Flex>
        </Box>

        {/* Informasi Kontak Bantuan */}
        <Box
          mt={6}
          p={4}
          bg={useColorModeValue('gray.50', 'gray.800')}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="start" gap={3}>
            <Icon as={FiAlertCircle} color="orange.500" mt={0.5} />
            <Text fontSize="xs" color={labelColor} lineHeight="1.6">
              <strong>Pertanyaan seputar honor atau slip gaji fisik?</strong>
              <br />
              Untuk konfirmasi rincian honor, perhitungan freelance, atau permohonan slip gaji resmi, silakan hubungi tim <strong>Finance</strong> atau <strong>HR&GA</strong> Carrot Academy.
            </Text>
          </Flex>
        </Box>
      </Box>
    </Container>
  );
}

export default PayslipPage;
