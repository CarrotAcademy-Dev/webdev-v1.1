import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Box, 
    Text, 
    Flex,
    IconButton,
    Grid,
    GridItem
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiTrendingUp, FiUserX, FiMessageSquare, FiDollarSign, FiCalendar, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ContainerCarrot from '@/components/Container';
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
    const [selectedDate, setSelectedDate] = useState(currentDate); // Single date picker for all
    
    // Format untuk API calls - convert 1 date ke 2 format berbeda
    const monthYearFilter = formatToMonthYear(selectedDate); // "Nov 2025" - untuk Foundation & Cuti
    const dateFilter = formatToDayMonthYear(selectedDate); // "24 Nov 2025" - untuk Chat & Harga

    // Pagination states
    const [foundationPage, setFoundationPage] = useState(1);
    const [cutiPage, setCutiPage] = useState(1);
    const [chatPage, setChatPage] = useState(1);
    const [hargaNormalPage, setHargaNormalPage] = useState(1);
    const [hargaPromoPage, setHargaPromoPage] = useState(1);
    const itemsPerPage = 5;

    // Sort states untuk setiap tabel
    const [foundationSort, setFoundationSort] = useState({ key: null, direction: 'asc' });
    const [cutiSort, setCutiSort] = useState({ key: null, direction: 'asc' });
    const [chatSort, setChatSort] = useState({ key: null, direction: 'asc' });
    const [hargaNormalSort, setHargaNormalSort] = useState({ key: null, direction: 'asc' });
    const [hargaPromoSort, setHargaPromoSort] = useState({ key: null, direction: 'asc' });

    // Fetch data dari 5 endpoints berbeda - semua pake 1 selectedDate, tapi format beda
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

    // Helper untuk sorting
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;
        
        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Helper untuk pagination dengan sort
    const paginateData = (dataArray, currentPage, sortConfig = null) => {
        if (!dataArray || dataArray.length === 0) {
            return { paginatedData: [], totalPages: 1 };
        }
        
        // Sort dulu kalau ada
        const sortedData = sortConfig ? sortData(dataArray, sortConfig) : dataArray;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            paginatedData: sortedData.slice(startIndex, endIndex),
            totalPages: Math.ceil(sortedData.length / itemsPerPage)
        };
    };

    // Sort handlers untuk setiap tabel
    const handleFoundationSort = (key) => {
        setFoundationSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setFoundationPage(1);
    };

    const handleCutiSort = (key) => {
        setCutiSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCutiPage(1);
    };

    const handleChatSort = (key) => {
        setChatSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setChatPage(1);
    };

    const handleHargaNormalSort = (key) => {
        setHargaNormalSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setHargaNormalPage(1);
    };

    const handleHargaPromoSort = (key) => {
        setHargaPromoSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setHargaPromoPage(1);
    };

    // Pagination Controls Component
    const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null;

        return (
            <Flex justify="space-between" align="center" mt={4} px={2}>
                <Text fontSize="sm" color="gray.600">
                    Halaman {currentPage} dari {totalPages}
                </Text>
                <Flex gap={2}>
                    <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        aria-label="Previous page"
                    />
                    <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                        aria-label="Next Page"
                    />
                </Flex>
            </Flex>
        );
    };

    // Table Header Component dengan sort
    const TableHeader = ({ children, sortKey, sortConfig, onSort, ...props }) => {
        const isSortable = sortKey && onSort;
        
        return (
            <Box 
                as="th" 
                p={3} 
                bg="#fcf7ecff" 
                color="#3b3b43ff" 
                fontWeight="bold" 
                textAlign="left" 
                whiteSpace="nowrap"
                cursor={isSortable ? "pointer" : "default"}
                userSelect="none"
                onClick={isSortable ? () => onSort(sortKey) : undefined}
                {...props}
            >
                {isSortable ? (
                    <Flex align="center" gap={1}>
                        {children}
                        {sortConfig?.key === sortKey && (
                            sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                    </Flex>
                ) : (
                    children
                )}
            </Box>
        );
    };

    // Table Cell Component
    const TableCell = ({ children, wrap = false, ...props }) => (
        <Box
            as="td"
            p={3}
            borderBottom="1px solid"
            borderColor="gray.200"
            wordBreak={wrap ? "break-word" : "normal"}
            whiteSpace={wrap ? "normal" : "nowrap"}
            {...props}
        >
            {children}
        </Box>
    );

    // Skeleton Loading untuk tabel
    const TableSkeleton = ({ columns = 3 }) => (
        <>
            {[...Array(5)].map((_, idx) => (
                <Box as="tr" key={idx}>
                    {[...Array(columns)].map((_, colIdx) => (
                        <TableCell key={colIdx}>
                            <Skeleton height={20} />
                        </TableCell>
                    ))}
                </Box>
            ))}
        </>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReminder>
                <Box className="page-header">
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

                {/* Foundation Naik Modul Section */}
                <Box className="table-section">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            Foundation Naik Modul
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {foundationData.length || 0}
                        </Text>
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>Nomor</TableHeader>
                                    <TableHeader sortKey="nama" sortConfig={foundationSort} onSort={handleFoundationSort}>Nama</TableHeader>
                                    <TableHeader sortKey="umur" sortConfig={foundationSort} onSort={handleFoundationSort}>Umur</TableHeader>
                                    <TableHeader sortKey="tanggal_kelas_terdekat" sortConfig={foundationSort} onSort={handleFoundationSort}>Tanggal Kelas Terdekat</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {foundationLoading ? (
                                    <TableSkeleton columns={4} />
                                ) : foundationData.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={4} textAlign="center">
                                            Tidak ada data
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginateData(foundationData, foundationPage, foundationSort).paginatedData.map((item, idx) => (
                                        <Box as="tr" key={idx}>
                                            <TableCell>{(foundationPage - 1) * itemsPerPage + idx + 1}</TableCell>
                                            <TableCell wrap>{item.nama}</TableCell>
                                            <TableCell>{item.umur}</TableCell>
                                            <TableCell>{item.tanggal_kelas_terdekat}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls
                        currentPage={foundationPage}
                        totalPages={paginateData(foundationData, foundationPage, foundationSort).totalPages}
                        onPageChange={setFoundationPage}
                    />
                </Box>

                {/* Siswa Cuti Section */}
                <Box className="table-section">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            Siswa Cuti
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {cutiData.length || 0}
                        </Text>
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>Nomor</TableHeader>
                                    <TableHeader sortKey="nama" sortConfig={cutiSort} onSort={handleCutiSort}>Nama</TableHeader>
                                    <TableHeader sortKey="modul" sortConfig={cutiSort} onSort={handleCutiSort}>Modul</TableHeader>
                                    <TableHeader sortKey="tanggal_kelas_terakhir" sortConfig={cutiSort} onSort={handleCutiSort}>Tanggal Kelas Terakhir</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {cutiLoading ? (
                                    <TableSkeleton columns={4} />
                                ) : cutiData.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={4} textAlign="center">
                                            Tidak ada data
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginateData(cutiData, cutiPage, cutiSort).paginatedData.map((item, idx) => (
                                        <Box as="tr" key={idx}>
                                            <TableCell>{(cutiPage - 1) * itemsPerPage + idx + 1}</TableCell>
                                            <TableCell wrap>{item.nama}</TableCell>
                                            <TableCell>{item.modul}</TableCell>
                                            <TableCell>{item.tanggal_kelas_terakhir}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls
                        currentPage={cutiPage}
                        totalPages={paginateData(cutiData, cutiPage, cutiSort).totalPages}
                        onPageChange={setCutiPage}
                    />
                </Box>

                {/* Chat Fulltime Section */}
                <Box className="table-section">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            Reminder Chat Fulltime
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {chatData.length || 0}
                        </Text>
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>Nomor</TableHeader>
                                    <TableHeader sortKey="angkatan" sortConfig={chatSort} onSort={handleChatSort}>Angkatan</TableHeader>
                                    <TableHeader sortKey="info" sortConfig={chatSort} onSort={handleChatSort}>Info</TableHeader>
                                    <TableHeader sortKey="tanggal" sortConfig={chatSort} onSort={handleChatSort}>Tanggal</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {chatLoading ? (
                                    <TableSkeleton columns={4} />
                                ) : chatData.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={4} textAlign="center">
                                            Tidak ada data
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginateData(chatData, chatPage, chatSort).paginatedData.map((item, idx) => (
                                        <Box as="tr" key={idx}>
                                            <TableCell>{(chatPage - 1) * itemsPerPage + idx + 1}</TableCell>
                                            <TableCell>{item.angkatan}</TableCell>
                                            <TableCell wrap>{item.info}</TableCell>
                                            <TableCell>{item.tanggal}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls
                        currentPage={chatPage}
                        totalPages={paginateData(chatData, chatPage, chatSort).totalPages}
                        onPageChange={setChatPage}
                    />
                </Box>

                {/* Harga Fulltime - Normal Section */}
                <Box className="table-section">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            Reminder Harga Fulltime - Normal
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {hargaData.normal?.length || 0}
                        </Text>
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>Nomor</TableHeader>
                                    <TableHeader sortKey="kode_faktur" sortConfig={hargaNormalSort} onSort={handleHargaNormalSort}>Kode Faktur</TableHeader>
                                    <TableHeader sortKey="nama" sortConfig={hargaNormalSort} onSort={handleHargaNormalSort}>Nama</TableHeader>
                                    <TableHeader sortKey="total_tagihan" sortConfig={hargaNormalSort} onSort={handleHargaNormalSort}>Total Tagihan</TableHeader>
                                    <TableHeader sortKey="sisa_biaya" sortConfig={hargaNormalSort} onSort={handleHargaNormalSort}>Sisa Biaya</TableHeader>
                                    <TableHeader sortKey="pembayaran_terakhir" sortConfig={hargaNormalSort} onSort={handleHargaNormalSort}>Pembayaran Terakhir</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {hargaLoading ? (
                                    <TableSkeleton columns={6} />
                                ) : hargaData.normal?.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={6} textAlign="center">
                                            Tidak ada data
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginateData(hargaData.normal, hargaNormalPage, hargaNormalSort).paginatedData.map((item, idx) => (
                                        <Box as="tr" key={idx}>
                                            <TableCell>{(hargaNormalPage - 1) * itemsPerPage + idx + 1}</TableCell>
                                            <TableCell>{item.kode_faktur}</TableCell>
                                            <TableCell wrap>{item.nama}</TableCell>
                                            <TableCell>{item.total_tagihan}</TableCell>
                                            <TableCell>{item.sisa_biaya || '-'}</TableCell>
                                            <TableCell>{item.pembayaran_terakhir}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls
                        currentPage={hargaNormalPage}
                        totalPages={paginateData(hargaData.normal || [], hargaNormalPage, hargaNormalSort).totalPages}
                        onPageChange={setHargaNormalPage}
                    />
                </Box>

                {/* Harga Fulltime - Promo Section */}
                <Box className="table-section">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            Reminder Harga Fulltime - Promo
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Total: {hargaData.promo?.length || 0}
                        </Text>
                    </Flex>
                    <Box className="table-container">
                        <Box as="table" className="data-table" width="100%">
                            <Box as="thead">
                                <Box as="tr">
                                    <TableHeader>Nomor</TableHeader>
                                    <TableHeader sortKey="kode_faktur" sortConfig={hargaPromoSort} onSort={handleHargaPromoSort}>Kode Faktur</TableHeader>
                                    <TableHeader sortKey="nama" sortConfig={hargaPromoSort} onSort={handleHargaPromoSort}>Nama</TableHeader>
                                    <TableHeader sortKey="total_tagihan" sortConfig={hargaPromoSort} onSort={handleHargaPromoSort}>Total Tagihan</TableHeader>
                                    <TableHeader sortKey="sisa_biaya" sortConfig={hargaPromoSort} onSort={handleHargaPromoSort}>Sisa Biaya</TableHeader>
                                    <TableHeader sortKey="pembayaran_terakhir" sortConfig={hargaPromoSort} onSort={handleHargaPromoSort}>Pembayaran Terakhir</TableHeader>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {hargaLoading ? (
                                    <TableSkeleton columns={6} />
                                ) : hargaData.promo?.length === 0 ? (
                                    <Box as="tr">
                                        <TableCell colSpan={6} textAlign="center">
                                            Tidak ada data
                                        </TableCell>
                                    </Box>
                                ) : (
                                    paginateData(hargaData.promo, hargaPromoPage, hargaPromoSort).paginatedData.map((item, idx) => (
                                        <Box as="tr" key={idx}>
                                            <TableCell>{(hargaPromoPage - 1) * itemsPerPage + idx + 1}</TableCell>
                                            <TableCell>{item.kode_faktur}</TableCell>
                                            <TableCell wrap>{item.nama}</TableCell>
                                            <TableCell>{item.total_tagihan}</TableCell>
                                            <TableCell>{item.sisa_biaya || '-'}</TableCell>
                                            <TableCell>{item.pembayaran_terakhir}</TableCell>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <PaginationControls
                        currentPage={hargaPromoPage}
                        totalPages={paginateData(hargaData.promo || [], hargaPromoPage, hargaPromoSort).totalPages}
                        onPageChange={setHargaPromoPage}
                    />
                </Box>
            </StyledDashboardReminder>
        </ContainerCarrot>
    );
}

export default DashboardReminder;
