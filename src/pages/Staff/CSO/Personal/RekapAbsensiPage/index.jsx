import React, { useState, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '@/context/AuthContext';
import { getRekapAbsensiKaryawan, getAbsensiBulanan, getPayslip } from '@/features/cso/csoApiService';
import { StyledRekapAbsensi } from './RekapAbsensi.styled';
import { Box, Flex, Select, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';
import Loading from '@/components/Loading';
import Pagination from '@/components/Pagination';
import { format } from 'date-fns';

const RekapAbsensiPage = () => {
    const { currentUser } = useContext(AuthContext);
    const { colorMode } = useColorMode();
    const namaKaryawan = currentUser?.nama || '';
    
    // Stats card colors - muted in dark mode
    const greenCardBg = useColorModeValue('#4CAF50', '#2E7D32');
    const redCardBg = useColorModeValue('#F44336', '#C62828');
    const orangeCardBg = useColorModeValue('#FF9800', '#E65100');
    
    // Table header colors
    const tableHeaderBg = useColorModeValue('#F7FAFC', '#3b495dff');
    const tableHeaderColor = useColorModeValue('#2D3748', '#E2E8F0');    const tableBorderColor = useColorModeValue('#E2E8F0', '#4A5568');
    // State for month filter
    const currentDate = new Date();
    const currentMonth = format(currentDate, 'MMM yyyy'); // Format: Dec 2025
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // State for payslip selector (English month names)
    const [payslipMonth, setPayslipMonth] = useState(format(currentDate, 'MMMM')); // January, February, etc
    const [payslipYear, setPayslipYear] = useState(format(currentDate, 'yyyy'));

    // Pagination state for attendance table
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch complete attendance data (with today's check-in/out)
    const {
        data: _rekapData,
        isLoading: isLoadingRekap,
        error: errorRekap
    } = useQuery({
        queryKey: ['rekapAbsensiKaryawan', namaKaryawan],
        queryFn: () => getRekapAbsensiKaryawan(namaKaryawan),
        enabled: !!namaKaryawan,
        staleTime: 1000 * 60 * 5
    });

    // Fetch monthly attendance data (with stats)
    const {
        data: monthlyData,
        isLoading: isLoadingMonthly
    } = useQuery({
        queryKey: ['absensiBulanan', namaKaryawan, selectedMonth],
        queryFn: () => getAbsensiBulanan(selectedMonth),
        enabled: !!namaKaryawan && !!selectedMonth,
        staleTime: 1000 * 60 * 5
    });

    // Fetch payslip data
    const {
        data: payslipData,
        isLoading: isLoadingPayslip
    } = useQuery({
        queryKey: ['payslip', namaKaryawan, payslipMonth, payslipYear],
        queryFn: () => getPayslip(payslipMonth, payslipYear),
        enabled: !!namaKaryawan && !!payslipMonth && !!payslipYear,
        staleTime: 1000 * 60 * 5
    });

    // Generate month options (last 12 months) - Format: Dec 2025
    const monthOptions = useMemo(() => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(format(date, 'MMM yyyy')); // Backend expects: Dec 2025
        }
        return months;
    }, []);

    // Generate month options for payslip (Indonesian months)
    const payslipMonthOptions = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate year options (last 3 years)
    const payslipYearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    }, []);

    const attendanceList = monthlyData?.result || [];
    const stats = monthlyData?.attendance || {}; // Fix: use attendance object
    const payslipResult = payslipData?.result?.[0] || null; // Fix: get first item from result array

    // Get today's attendance from monthly data
    const today = new Date();
    const todayDate = `${today.getDate()} ${format(today, 'MMMM')} ${today.getFullYear()}`;
    const presensiToday = attendanceList.find(item => item.date === todayDate) || {};

    // Pagination calculations
    const totalPages = Math.ceil(attendanceList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAttendance = attendanceList.slice(startIndex, endIndex);

    // Reset to page 1 when month changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth]);

    const formatCurrency = (value) => {
        if (!value) return 'Rp 0';
        return `Rp ${parseInt(value).toLocaleString('id-ID')}`;
    };

    if (isLoadingRekap) {
        return <Loading />;
    }

    if (errorRekap) {
        return (
            <Box p={8}>
                <Text color="red.500" fontSize="lg">
                    Error memuat data: {errorRekap.message}
                </Text>
            </Box>
        );
    }

    return (
        <StyledRekapAbsensi data-theme={colorMode}>
            <h1 className="page-title">Dashboard Karyawan</h1>

            {/* Today's Attendance Section */}
            <div className="today-section">
                <h2 className="section-title">Presensi Hari Ini</h2>
                <div className="time-display">
                    <div className="time-item">
                        <div className="time-label">Check In</div>
                        <div className="time-value">
                            {presensiToday.check_in || '-'}
                        </div>
                    </div>
                    <div className="time-item">
                        <div className="time-label">Check Out</div>
                        <div className="time-value">
                            {presensiToday.check_out || '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Table Section */}
            <div className="table-section">
                <Flex justify="space-between" align="center" mb={4}>
                    <h2 className="section-title" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
                        Riwayat Absensi
                    </h2>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        maxW="200px"
                        size="md"
                    >
                        {monthOptions.map((month) => (
                            <option key={month} value={month}>
                                {month}
                            </option>
                        ))}
                    </Select>
                </Flex>

                {/* Stats Cards */}
                <div className="statsCard">
                    {monthlyData && monthlyData.attendance && (
                        <div className="stats-grid">
                            <Box bg={greenCardBg} p={4} borderRadius="12px" boxShadow="sm">
                                <Text fontSize="2xl" fontWeight="bold" color="white">
                                    {stats.hadir || 0}
                                </Text>
                                <Text fontSize="sm" color="white" mt={1}>
                                    Hadir
                                </Text>
                            </Box>
                            <Box bg={redCardBg} p={4} borderRadius="12px" boxShadow="sm">
                                <Text fontSize="2xl" fontWeight="bold" color="white">
                                    {stats.tidak_hadir || 0}
                                </Text>
                                <Text fontSize="sm" color="white" mt={1}>
                                    Tidak Hadir
                                </Text>
                            </Box>
                            <Box bg={orangeCardBg} p={4} borderRadius="12px" boxShadow="sm">
                                <Text fontSize="2xl" fontWeight="bold" color="white">
                                    {stats.cuti || 0}
                                </Text>
                                <Text fontSize="sm" color="white" mt={1}>
                                    Cuti
                                </Text>
                            </Box>
                        </div>
                    )}
                </div>

                {isLoadingMonthly ? (
                    <Loading />
                ) : attendanceList.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={8}>
                        Tidak ada data absensi untuk bulan ini
                    </Text>
                ) : (
                    <Box overflowX="auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: tableHeaderBg }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: tableHeaderColor }}>Tanggal</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: tableHeaderColor }}>Hari</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: tableHeaderColor }}>Check In</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: tableHeaderColor }}>Check Out</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: tableHeaderColor }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: tableHeaderColor }}>Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAttendance.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: `1px solid ${tableBorderColor}` }}>
                                        <td style={{ padding: '12px' }}>{item.date}</td>
                                        <td style={{ padding: '12px' }}>{item.day}</td>
                                        <td style={{ padding: '12px' }}>{item.check_in || '-'}</td>
                                        <td style={{ padding: '12px' }}>{item.check_out || '-'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                background: item.attendance === 'Hadir' ? '#E8F5E9' :
                                                           item.attendance === 'Cuti' ? '#FFF3E0' : '#FFEBEE',
                                                color: item.attendance === 'Hadir' ? '#2E7D32' :
                                                       item.attendance === 'Cuti' ? '#E65100' : '#C62828'
                                            }}>
                                                {item.attendance}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.875rem', color: '#718096' }}>
                                            {item.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                startIndex={startIndex}
                                endIndex={endIndex}
                                totalItems={attendanceList.length}
                            />
                        )}
                    </Box>
                )}
            </div>

            {/* Payslip Section */}
            <div className="payslip-section">
                <h2 className="section-title">Slip Gaji</h2>

                {/* Payslip Filter */}
                <Flex gap={4} align="center" wrap="wrap" mb={6}>
                    <Text fontWeight="600" fontSize="sm" color="gray.700">
                        Pilih Periode:
                    </Text>
                    <Select
                        value={payslipMonth}
                        onChange={(e) => setPayslipMonth(e.target.value)}
                        maxW="200px"
                        size="md"
                    >
                        {payslipMonthOptions.map((month) => (
                            <option key={month} value={month}>
                                {month}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={payslipYear}
                        onChange={(e) => setPayslipYear(e.target.value)}
                        maxW="150px"
                        size="md"
                    >
                        {payslipYearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Select>
                </Flex>

                {isLoadingPayslip ? (
                    <Loading />
                ) : !payslipResult ? (
                    <Text color="gray.500" textAlign="center" py={8}>
                        Tidak ada data slip gaji untuk periode ini
                    </Text>
                ) : (
                    <div className="payslip-grid">
                        {/* Salary Section */}
                        <div className="payslip-group">
                            <div className="group-title">Gaji & Tunjangan</div>
                            <div className="payslip-item">
                                <span className="item-label">Gaji Pokok</span>
                                <span className="item-value">{formatCurrency(payslipResult.gaji_pokok)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Tunjangan Makan</span>
                                <span className="item-value">{formatCurrency(payslipResult.tunjangan_makan)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Tunjangan Transportasi</span>
                                <span className="item-value">{formatCurrency(payslipResult.tunjangan_transport)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Tambahan</span>
                                <span className="item-value">{formatCurrency(payslipResult.tambahan)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Total Upah Awal</span>
                                <span className="item-value">{formatCurrency(payslipResult.total_upah_awal)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">BPJS Kesehatan (Perusahaan)</span>
                                <span className="item-value">{formatCurrency(payslipResult.bpjs_kes_comp)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">JHT Staff</span>
                                <span className="item-value">{formatCurrency(payslipResult.jht_staff)}</span>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="payslip-group">
                            <div className="group-title">Potongan</div>
                            <div className="payslip-item">
                                <span className="item-label">Potongan Absen</span>
                                <span className="item-value">{formatCurrency(payslipResult.potongan_absen)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">BPJS Kesehatan (Staff)</span>
                                <span className="item-value">{formatCurrency(payslipResult.potongan_bpjs_kes_staff)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">JHT (Staff)</span>
                                <span className="item-value">{formatCurrency(payslipResult.potongan_jht_staff)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">PPh 21</span>
                                <span className="item-value">{formatCurrency(payslipResult.potongan_pph21)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Potongan Lainnya</span>
                                <span className="item-value">{formatCurrency(payslipResult.potongan_lainnya)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Total Potongan</span>
                                <span className="item-value">{formatCurrency(payslipResult.total_potongan)}</span>
                            </div>
                        </div>

                        {/* Attendance Info */}
                        <div className="payslip-group">
                            <div className="group-title">Informasi Kehadiran</div>
                            <div className="payslip-item">
                                <span className="item-label">Hari Kerja Bulanan</span>
                                <span className="item-value">{payslipResult.monthly_working_day || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Libur</span>
                                <span className="item-value">{payslipResult.holiday || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Jadwal Kerja</span>
                                <span className="item-value">{payslipResult.schedule_work_day || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Aktual Kerja</span>
                                <span className="item-value">{payslipResult.actual_work_day || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Cuti</span>
                                <span className="item-value">{payslipResult.on_leave || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Sakit</span>
                                <span className="item-value">{payslipResult.sick_day || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Tidak Hadir</span>
                                <span className="item-value">{payslipResult.absence || 0} hari</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Terlambat</span>
                                <span className="item-value">{payslipResult.late_early_time || '0 times'}</span>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="payslip-group">
                            <div className="group-title">Ringkasan</div>
                            <div className="payslip-item">
                                <span className="item-label">Total Gaji Kotor</span>
                                <span className="item-value">{formatCurrency(payslipResult.gross_salary)}</span>
                            </div>
                            <div className="payslip-item">
                                <span className="item-label">Total Potongan</span>
                                <span className="item-value">{formatCurrency(payslipResult.total_potongan)}</span>
                            </div>
                            <div className="payslip-item total">
                                <span className="item-label">Gaji Bersih (Take Home Pay)</span>
                                <span className="item-value">{formatCurrency(payslipResult.take_home_pay)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StyledRekapAbsensi>
    );
};

export default RekapAbsensiPage;
