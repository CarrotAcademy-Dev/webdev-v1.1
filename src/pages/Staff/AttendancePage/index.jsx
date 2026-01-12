import { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import {
    Box,
    Grid,
    Select,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useColorModeValue,
    Spinner,
    Heading,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import { getAbsensiBulanan } from "@/features/cso/csoApiService";
import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import AttendanceCalendar from "@/components/AttendanceCalendar";

function AttendancePage() {
    const { currentUser } = useContext(AuthContext);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMM yyyy'));
    const [holidays, setHolidays] = useState([]);

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const iconColor = useColorModeValue('#FE7743', '#FF9B7B');

    // Fetch holidays from API
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await fetch('https://api-harilibur.vercel.app/api');
                const data = await response.json();
                const filteredData = data.filter(item => item.is_national_holiday);
                setHolidays(filteredData);
            } catch (error) {
                console.error("Failed to fetch holidays:", error);
            }
        };
        fetchHolidays();
    }, []);

    // Fetch monthly attendance details
    // Need to fetch 2 months for payroll period (18 prev - 17 current)
    const getPrevMonth = () => {
        if (!selectedMonth) return format(new Date(), 'MMM yyyy');
        const [monthName, year] = selectedMonth.split(' ');
        const date = new Date(`${monthName} 1, ${year}`);
        const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        return format(prevDate, 'MMM yyyy');
    };

    const prevMonth = getPrevMonth();

    // Fetch current selected month
    const { data: currentMonthData, isLoading: isLoadingCurrent } = useQuery({
        queryKey: ['absensiBulanan', currentUser?.nama, selectedMonth],
        queryFn: () => getAbsensiBulanan(selectedMonth),
        enabled: !!currentUser?.nama,
        staleTime: 1000 * 60 * 5
    });

    // Fetch previous month (for payroll period)
    const { data: prevMonthData, isLoading: isLoadingPrev } = useQuery({
        queryKey: ['absensiBulanan', currentUser?.nama, prevMonth],
        queryFn: () => getAbsensiBulanan(prevMonth),
        enabled: !!currentUser?.nama,
        staleTime: 1000 * 60 * 5
    });

    const isLoadingMonthly = isLoadingCurrent || isLoadingPrev;

    // Merge data from both months
    const mergedMonthlyData = () => {
        const currentData = currentMonthData?.result || [];
        const prevData = prevMonthData?.result || [];
        return [...prevData, ...currentData];
    };

    // Generate month options (last 12 months)
    const generateMonthOptions = () => {
        const months = [];
        const currentDate = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(format(date, 'MMM yyyy'));
        }
        return months;
    };

    // Get payroll period dates (18th prev month to 17th current month)
    const getPayrollPeriod = () => {
        if (!selectedMonth) return { startDate: null, endDate: null, periodLabel: '' };

        // Parse selected month (e.g., "Jan 2026")
        const [monthName, year] = selectedMonth.split(' ');
        const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();
        const yearNumber = parseInt(year);

        // Payroll period: 18th prev month to 17th current month
        const startDate = new Date(yearNumber, monthNumber - 1, 18);
        let endDate = new Date(yearNumber, monthNumber, 17);
        
        // Check if we're in the current payroll period
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Determine which payroll period today falls into
        const currentPeriodStart = today.getDate() >= 18 
            ? new Date(today.getFullYear(), today.getMonth(), 18)
            : new Date(today.getFullYear(), today.getMonth() - 1, 18);
        
        const selectedPeriodStart = new Date(startDate);
        selectedPeriodStart.setHours(0, 0, 0, 0);
        
        const isCurrentPeriod = selectedPeriodStart.getTime() === currentPeriodStart.getTime();
        
        const currentPeriodEnd = today.getDate() >= 18
            ? new Date(today.getFullYear(), today.getMonth() + 1, 17)
            : new Date(today.getFullYear(), today.getMonth(), 17);
        
        // If current period, count up to today
        if (isCurrentPeriod && today <= currentPeriodEnd) {
            endDate = today;
        }

        // Generate period label
        const periodLabel = `${format(startDate, 'd MMM yyyy')} - ${format(endDate, 'd MMM yyyy')}`;

        return { startDate, endDate, periodLabel, isCurrentPeriod };
    };

    // Calculate working days for payroll period
    const calculateWorkingDays = () => {
        const { startDate, endDate } = getPayrollPeriod();
        if (!startDate || !endDate) return 0;

        let workingDays = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const isHoliday = holidays.some(h => 
                isSameDay(new Date(h.holiday_date), currentDate)
            );
            const isSunday = currentDate.getDay() === 0;

            // Count if not weekend (Sunday) and not holiday
            if (!isSunday && !isHoliday) {
                workingDays++;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return workingDays;
    };

    // Filter attendance by payroll period
    const getFilteredAttendance = () => {
        const allData = mergedMonthlyData();
        if (allData.length === 0) return [];
        
        const { startDate, endDate } = getPayrollPeriod();
        if (!startDate || !endDate) return allData;

        return allData.filter(record => {
            const recordDate = new Date(record.year, getMonthNumber(record.month), record.dayNum);
            return recordDate >= startDate && recordDate <= endDate;
        });
    };

    // Calculate statistics from filtered attendance
    const calculateStats = () => {
        const filteredData = getFilteredAttendance();
        
        if (filteredData.length === 0) {
            return {
                totalDays: 0,
                present: 0,
                late: 0,
                absent: 0,
                sick: 0,
                leave: 0,
                attendanceRate: 0
            };
        }

        const present = filteredData.filter(d => d.attendance === 'Hadir').length;
        const late = filteredData.filter(d => d.attendance === 'Telat').length;
        const absent = filteredData.filter(d => d.attendance === 'Tidak Hadir').length;
        const sick = filteredData.filter(d => d.attendance === 'Sakit').length;
        const leave = filteredData.filter(d => d.attendance === 'Izin').length;
        
        const workingDays = calculateWorkingDays();
        const attendanceRate = workingDays > 0 ? Math.round(((present + late) / workingDays) * 100) : 0;

        return { present, late, absent, sick, leave, attendanceRate };
    };

    // Calculate current streak
    const calculateStreak = () => {
        const allData = mergedMonthlyData();
        if (allData.length === 0) return 0;

        const sortedAttendance = [...allData].sort((a, b) => {
            const dateA = new Date(a.year, getMonthNumber(a.month), a.dayNum);
            const dateB = new Date(b.year, getMonthNumber(b.month), b.dayNum);
            return dateB - dateA;
        });

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedAttendance.length; i++) {
            const attendance = sortedAttendance[i];
            const attendanceDate = new Date(attendance.year, getMonthNumber(attendance.month), attendance.dayNum);
            attendanceDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - streak);

            if (attendanceDate.getTime() === expectedDate.getTime()) {
                if (attendance.attendance === 'Hadir') {
                    streak++;
                } else {
                    break;
                }
            } else if (attendanceDate < expectedDate) {
                break;
            }
        }

        return streak;
    };

    const getMonthNumber = (monthName) => {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        return months[monthName] || 0;
    };

    const stats = calculateStats();
    const currentStreak = calculateStreak();
    const workingDays = calculateWorkingDays();
    const { periodLabel, isCurrentPeriod } = getPayrollPeriod();
    const filteredAttendance = getFilteredAttendance();

    // Get attendance badge color
    const getAttendanceBadge = (status) => {
        const badges = {
            'Hadir': { colorScheme: 'green', label: 'Present' },
            'Telat': { colorScheme: 'orange', label: 'Late' },
            'Alfa': { colorScheme: 'red', label: 'Absent' },
            'Sakit': { colorScheme: 'purple', label: 'Sick' },
            'Izin': { colorScheme: 'blue', label: 'Leave' }
        };
        return badges[status] || { colorScheme: 'gray', label: status };
    };

    if (isLoadingMonthly) {
        return (
            <ContainerCarrot>
                <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
                    <Spinner size="xl" color="orange.500" />
                </Box>
            </ContainerCarrot>
        );
    }

    return (
        <ContainerCarrot>
            <Box mb={6}>
                <Heading size="lg" mb={2}>My Attendance</Heading>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <FiCalendar color={iconColor} size="20px" />
                    <Select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        maxW="200px"
                        bg={cardBg}
                        borderColor={borderColor}
                    >
                        {generateMonthOptions().map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </Select>
                </Box>
                
                {/* Payroll Period Info */}
                <Box mb={4} fontSize="sm" color="gray.500">
                    <strong>Periode Gaji:</strong> {periodLabel}
                    {isCurrentPeriod && ' (Berjalan)'}
                </Box>

                {/* Summary Statistics Cards */}
                <Grid 
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} 
                    gap={4} 
                    mb={6}
                >
                    <InfoCard hoverable>
                        <FiCalendar size="28px" color={iconColor} />
                        <Stat textAlign="center">
                            <StatLabel fontSize="sm">Working Days</StatLabel>
                            <StatNumber fontSize="2xl">{workingDays}</StatNumber>
                            <StatHelpText mb={0}>
                                {format(new Date(), 'MMM yyyy') === selectedMonth 
                                    ? 'Up to today' 
                                    : '18 prev - 17 current'}
                            </StatHelpText>
                        </Stat>
                    </InfoCard>

                    <InfoCard hoverable>
                        <FiCheckCircle size="28px" color="green" />
                        <Stat textAlign="center">
                            <StatLabel fontSize="sm">Present</StatLabel>
                            <StatNumber fontSize="2xl" color="green.500">{stats.present}</StatNumber>
                            <StatHelpText mb={0}>+ {stats.late} Late</StatHelpText>
                        </Stat>
                    </InfoCard>

                    <InfoCard hoverable>
                        <FiXCircle size="28px" color="red" />
                        <Stat textAlign="center">
                            <StatLabel fontSize="sm">Absent</StatLabel>
                            <StatNumber fontSize="2xl" color="red.500">{stats.absent}</StatNumber>
                            <StatHelpText mb={0}>{stats.sick} Sick, {stats.leave} Leave</StatHelpText>
                        </Stat>
                    </InfoCard>

                    <InfoCard hoverable className="dark-card">
                        <FiClock size="28px" color="white" />
                        <Stat textAlign="center">
                            <StatLabel fontSize="sm" color="white">Attendance Rate</StatLabel>
                            <StatNumber fontSize="2xl" color="white">{stats.attendanceRate}%</StatNumber>
                            <StatHelpText mb={0} color="white">{currentStreak} day streak 🔥</StatHelpText>
                        </Stat>
                    </InfoCard>
                </Grid>

                {/* Calendar and Detail Table Grid */}
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                    {/* Calendar View */}
                    <InfoCard>
                        <Box w="100%">
                            <Heading size="md" mb={4}>Calendar View</Heading>
                            <AttendanceCalendar />
                        </Box>
                    </InfoCard>

                    {/* Attendance Details Table */}
                    <InfoCard>
                        <Box w="100%">
                            <Heading size="md" mb={4}>Attendance Details</Heading>
                            {isLoadingMonthly ? (
                                <Box display="flex" justifyContent="center" py={8}>
                                    <Spinner color="orange.500" />
                                </Box>
                            ) : (
                                <TableContainer maxH="400px" overflowY="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead position="sticky" top={0} bg={cardBg} zIndex={1}>
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Check In</Th>
                                                <Th>Check Out</Th>
                                                <Th>Status</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredAttendance.length > 0 ? (
                                                filteredAttendance
                                                    .sort((a, b) => {
                                                        const dateA = new Date(a.year, getMonthNumber(a.month), a.dayNum);
                                                        const dateB = new Date(b.year, getMonthNumber(b.month), b.dayNum);
                                                        return dateB - dateA; // Sort descending (newest first)
                                                    })
                                                    .map((record, index) => {
                                                        const badge = getAttendanceBadge(record.attendance);
                                                        return (
                                                            <Tr key={index}>
                                                                <Td fontWeight="medium">
                                                                    {record.dayNum} {record.month.substring(0, 3)}
                                                                </Td>
                                                                <Td>{record.check_in || '-'}</Td>
                                                                <Td>{record.check_out || '-'}</Td>
                                                                <Td>
                                                                    <Badge colorScheme={badge.colorScheme}>
                                                                        {badge.label}
                                                                    </Badge>
                                                                </Td>
                                                            </Tr>
                                                        );
                                                    })
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={4} textAlign="center" py={8}>
                                                        No attendance data for this period
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </InfoCard>
                </Grid>
            </Box>
        </ContainerCarrot>
    );
}

export default AttendancePage;
