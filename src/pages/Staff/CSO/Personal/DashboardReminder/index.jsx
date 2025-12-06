import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Box, 
    Text, 
    Flex,
    Grid,
    GridItem
} from '@chakra-ui/react';
import { FiTrendingUp, FiUserX, FiMessageSquare, FiDollarSign, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ContainerCarrot from '@/components/Container';
import SistemTabs from '@/components/SistemTabs';
import { StyledDashboardReminder } from './DashboardReminder.styled';
import {
    getReminderFoundationNaikModul,
    getReminderSiswaCuti,
    getReminderChatFulltime,
    getReminderHargaFulltime,
    getReminderHoliday
} from '@/features/cso/csoApiService';

function DashboardReminder() {
    // Helper untuk format tanggal
    const formatToMonthYear = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatToDayMonthYear = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const currentDate = new Date();
    const [selectedDate, setSelectedDate] = useState(currentDate);
    
    // Format untuk API calls
    const monthYearFilter = formatToMonthYear(selectedDate); // "Nov 2025" - untuk Foundation & Cuti
    const dateFilter = formatToDayMonthYear(selectedDate); // "24 Nov 2025" - untuk Chat & Harga

    // Fetch data dari 5 endpoints berbeda
    const { data: foundationData = [], isLoading: foundationLoading } = useQuery({
        queryKey: ['reminderFoundation', monthYearFilter],
        queryFn: () => getReminderFoundationNaikModul(monthYearFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: cutiData = [], isLoading: cutiLoading } = useQuery({
        queryKey: ['reminderCuti', monthYearFilter],
        queryFn: () => getReminderSiswaCuti(monthYearFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: chatData = [], isLoading: chatLoading } = useQuery({
        queryKey: ['reminderChat', dateFilter],
        queryFn: () => getReminderChatFulltime(dateFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: hargaData = { normal: [], promo: [] }, isLoading: hargaLoading } = useQuery({
        queryKey: ['reminderHarga', dateFilter],
        queryFn: () => getReminderHargaFulltime(dateFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: holidayData = {}, isLoading: holidayLoading } = useQuery({
        queryKey: ['reminderHoliday'],
        queryFn: getReminderHoliday,
        staleTime: 5 * 60 * 1000,
    });

    // Transform data ke format SistemTabs
    const tableData = useMemo(() => ({
        foundation: foundationData || [],
        cuti: cutiData || [],
        chat: chatData || [],
        hargaNormal: hargaData.normal || [],
        hargaPromo: hargaData.promo || []
    }), [foundationData, cutiData, chatData, hargaData]);

    // Define tabs
    const tabItems = [
        { key: 'foundation', label: 'Foundation Naik Modul' },
        { key: 'cuti', label: 'Siswa Cuti' },
        { key: 'chat', label: 'Chat Fulltime' },
        { key: 'hargaNormal', label: 'Harga Normal' },
        { key: 'hargaPromo', label: 'Harga Promo' }
    ];

    // Define headers untuk setiap tab
    const getHeaderItems = (tabKey) => {
        const headersMap = {
            foundation: [
                { key: 'nama', label: 'Nama' },
                { key: 'umur', label: 'Umur' },
                { key: 'tanggal_kelas_terdekat', label: 'Tanggal Kelas Terdekat' }
            ],
            cuti: [
                { key: 'nama', label: 'Nama' },
                { key: 'modul', label: 'Modul' },
                { key: 'tanggal_kelas_terakhir', label: 'Tanggal Kelas Terakhir' }
            ],
            chat: [
                { key: 'angkatan', label: 'Angkatan' },
                { key: 'info', label: 'Info' },
                { key: 'tanggal', label: 'Tanggal' }
            ],
            hargaNormal: [
                { key: 'kode_faktur', label: 'Kode Faktur' },
                { key: 'nama', label: 'Nama' },
                { key: 'total_tagihan', label: 'Total Tagihan' },
                { key: 'sisa_biaya', label: 'Sisa Biaya' },
                { key: 'pembayaran_terakhir', label: 'Pembayaran Terakhir' }
            ],
            hargaPromo: [
                { key: 'kode_faktur', label: 'Kode Faktur' },
                { key: 'nama', label: 'Nama' },
                { key: 'total_tagihan', label: 'Total Tagihan' },
                { key: 'sisa_biaya', label: 'Sisa Biaya' },
                { key: 'pembayaran_terakhir', label: 'Pembayaran Terakhir' }
            ]
        };
        return headersMap[tabKey] || [];
    };

    const isLoading = foundationLoading || cutiLoading || chatLoading || hargaLoading;

    return (
        <ContainerCarrot>
            <StyledDashboardReminder>
                <Box className="hero-section">
                    <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
                        <Text fontSize="2xl" fontWeight="bold" color="#FE7743">
                            Dashboard Reminder
                        </Text>
                        
                        {/* Single Date Filter */}
                        <Box minWidth="200px">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="d MMM yyyy"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                className="date-picker-input"
                                placeholderText="Select date"
                            />
                        </Box>
                    </Flex>

                    {/* Overview Cards - 2x3 Grid */}
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
                        {/* Foundation Naik Modul */}
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiTrendingUp size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Foundation Naik Modul</Text>
                                        <Text fontSize="xs" color="gray.500">{monthYearFilter}</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {foundationLoading ? (
                                        <Skeleton width={60} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{foundationData.length || 0} siswa</Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        {/* Reminder Chat Full-Time */}
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiMessageSquare size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Reminder Chat Full-Time</Text>
                                        <Text fontSize="xs" color="gray.500">{dateFilter}</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {chatLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{chatData.length || 0}</Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        {/* Reminder Holiday */}
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiCalendar size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">{holidayData.keterangan || 'Hari Raya Natal'}</Text>
                                        <Text fontSize="xs" color="gray.500">{holidayData.tanggal || '25 Dec 2025'}</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {holidayLoading ? (
                                        <Skeleton width={60} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{holidayData.sisa_hari || 0} hari</Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        {/* Reminder Bootcamp (placeholder - coming soon) */}
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiUserX size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Reminder Bootcamp</Text>
                                        <Text fontSize="xs" color="gray.500">Countdown</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    <Text fontSize="2xl" fontWeight="bold">-</Text>
                                </Flex>
                            </Box>
                        </GridItem>

                        {/* Reminder Harga Promo Full-Time */}
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiDollarSign size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Reminder Harga Promo Full-Time</Text>
                                        <Text fontSize="xs" color="gray.500">Total</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {hargaLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{hargaData.promo?.length || 0}</Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>

                        {/* Reminder Harga Normal Full-Time */}
                        <GridItem>
                            <Box className="overview-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Flex align="center" gap={3} mb={2}>
                                    <Box color="#FE7743" p={2} borderRadius="md">
                                        <FiDollarSign size={20} />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">Reminder Harga Normal Full-Time</Text>
                                        <Text fontSize="xs" color="gray.500">Total</Text>
                                    </Box>
                                </Flex>
                                <Flex p={3} borderRadius="md" align="center" justify="center">
                                    {hargaLoading ? (
                                        <Skeleton width={40} height={30} />
                                    ) : (
                                        <Text fontSize="2xl" fontWeight="bold">{hargaData.normal?.length || 0}</Text>
                                    )}
                                </Flex>
                            </Box>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Tabs Section */}
                <Box className="main-content-section">
                    <SistemTabs
                        tabItems={tabItems}
                        tableData={tableData}
                        headerItems={[]} 
                        isLoading={isLoading}
                        getHeaderItemsForTab={getHeaderItems}
                    />
                </Box>
            </StyledDashboardReminder>
        </ContainerCarrot>
    );
}

export default DashboardReminder;
