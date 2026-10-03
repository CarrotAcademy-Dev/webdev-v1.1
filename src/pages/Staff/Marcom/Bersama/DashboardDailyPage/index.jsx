/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  useColorModeValue,
  Skeleton
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardDaily } from '@/features/marcom/marcomApiService';
import ContainerCarrot from '@/components/Container';
import InfoCard from '@/components/InfoCard';
import Pagination from '@/components/Pagination';
import useDebounce from '@/hooks/useDebounce';
import { StyledDashboardDailyPage } from './DashboardDailyPage.styled';
import {
  FiSearch,
  FiCalendar,
  FiGift,
  FiUserCheck,
  FiUsers
} from 'react-icons/fi';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function DashboardDailyPage() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterMonth, setFilterMonth] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Query
  const { data: dailyList = [], isLoading } = useQuery({
    queryKey: ['marcomDashboardDaily'],
    queryFn: getDashboardDaily,
    staleTime: 5 * 60 * 1000
  });

  // Current date info
  const today = new Date();
  const currentMonthNum = today.getMonth() + 1; // 1 - 12
  const todayDateStr = today.toISOString().split('T')[0];

  // Helper birthday check
  const isBirthdayThisMonth = (tglLahir) => {
    if (!tglLahir) return false;
    const parts = String(tglLahir).split('-');
    if (parts.length >= 2) {
      const birthMonth = parseInt(parts[1], 10);
      return birthMonth === currentMonthNum;
    }
    return false;
  };

  const isBirthdayToday = (tglLahir) => {
    if (!tglLahir) return false;
    const parts = String(tglLahir).split('-');
    if (parts.length >= 3) {
      const birthMonth = parseInt(parts[1], 10);
      const birthDay = parseInt(parts[2], 10);
      return birthMonth === currentMonthNum && birthDay === today.getDate();
    }
    return false;
  };

  const calculateAge = (tglLahir) => {
    if (!tglLahir) return null;
    const birthYear = parseInt(String(tglLahir).split('-')[0], 10);
    if (!isNaN(birthYear) && birthYear > 1900) {
      return today.getFullYear() - birthYear;
    }
    return null;
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return dailyList.filter((item) => {
      const matchSearch =
        !debouncedSearch || (item.nama && item.nama.toLowerCase().includes(debouncedSearch.toLowerCase()));

      let matchMonth = true;
      if (filterMonth !== 'ALL') {
        const monthIndex = parseInt(filterMonth, 10);
        if (item.tanggal_lahir) {
          const parts = String(item.tanggal_lahir).split('-');
          matchMonth = parseInt(parts[1], 10) === monthIndex;
        } else {
          matchMonth = false;
        }
      }

      return matchSearch && matchMonth;
    });
  }, [dailyList, debouncedSearch, filterMonth]);

  // Statistics
  const totalCount = dailyList.length;
  const birthdayThisMonthCount = dailyList.filter((i) => isBirthdayThisMonth(i.tanggal_lahir)).length;
  const birthdayTodayCount = dailyList.filter((i) => isBirthdayToday(i.tanggal_lahir)).length;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <ContainerCarrot>
      <StyledDashboardDailyPage>
        <div className="page-header">
          <h1>Dashboard Daily Marcom</h1>
          <p>Pemantauan jadwal kelas siswa dan jadwal ulang tahun untuk konten apresiasi & ucapan</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <InfoCard>
            <FiUsers size={28} color="#4299E1" />
            <div>
              <p>Total Siswa Terdata</p>
              <h3>{totalCount}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiGift size={28} color="#ED64A6" />
            <div>
              <p>Ultah Bulan Ini ({MONTH_NAMES[currentMonthNum - 1]})</p>
              <h3>{birthdayThisMonthCount} Siswa</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiUserCheck size={28} color="#48BB78" />
            <div>
              <p>Ultah Hari Ini</p>
              <h3>{birthdayTodayCount} Siswa</h3>
            </div>
          </InfoCard>
        </div>

        {/* Controls & Table Container */}
        <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                borderRadius="md"
              />
            </InputGroup>

            <Flex gap={2} align="center">
              <Text fontSize="sm" color={textColor} whiteSpace="nowrap">
                Bulan Lahir:
              </Text>
              <Select
                size="sm"
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setCurrentPage(1);
                }}
                w="160px"
                borderRadius="md"
              >
                <option value="ALL">Semua Bulan</option>
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </Select>
            </Flex>
          </Flex>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th>Tanggal Kelas</th>
                  <th>Nama Lengkap Siswa</th>
                  <th>Tanggal Lahir</th>
                  <th>Usia</th>
                  <th>Status Ulang Tahun</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={7}>
                        <Skeleton height="35px" />
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text color={textColor}>Tidak ada data siswa ditemukan</Text>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => {
                    const isToday = isBirthdayToday(item.tanggal_lahir);
                    const isMonth = isBirthdayThisMonth(item.tanggal_lahir);
                    const age = calculateAge(item.tanggal_lahir);

                    return (
                      <tr key={item.row || idx}>
                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td>
                          <Flex align="center" gap={1}>
                            <FiCalendar size={13} color="#718096" />
                            <Text fontSize="xs">{item.tanggal_kelas || '-'}</Text>
                          </Flex>
                        </td>
                        <td>
                          <Text fontWeight="600">{item.nama}</Text>
                        </td>
                        <td>
                          <Text fontSize="xs">{item.tanggal_lahir || '-'}</Text>
                        </td>
                        <td>
                          <Text fontSize="xs" fontWeight="500">
                            {age ? `${age} tahun` : '-'}
                          </Text>
                        </td>
                        <td>
                          {isToday ? (
                            <Badge colorScheme="pink" px={2} py={0.5} borderRadius="full">
                              🎉 HARI INI!
                            </Badge>
                          ) : isMonth ? (
                            <Badge colorScheme="purple" px={2} py={0.5} borderRadius="full">
                              🎂 Bulan Ini
                            </Badge>
                          ) : (
                            <Badge colorScheme="gray" px={2} py={0.5} borderRadius="full">
                              -
                            </Badge>
                          )}
                        </td>
                        <td>
                          <Text fontSize="xs" color={textColor}>
                            {item.ket || '-'}
                          </Text>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredData.length > itemsPerPage && (
            <Box mt={4}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </Box>
          )}
        </Box>
      </StyledDashboardDailyPage>
    </ContainerCarrot>
  );
}
