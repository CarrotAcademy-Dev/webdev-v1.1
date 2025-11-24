import ContainerCarrot from "@/components/Container";
import { Box, Grid, GridItem, Input, Flex, Text, Checkbox, useToast, IconButton } from "@chakra-ui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getDashboardProspektifPersonal, ceklisDashboardProspektif } from "@/features/cso/csoApiService";
import { StyledDashboardProspektifPage } from "./DashboardProspektif.styled";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function DashboardProspektifPage() {
    const currentDate = new Date();
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(formatDateForInput(currentDate));
    const toast = useToast();

    // Pagination states
    const [trialClassPage, setTrialClassPage] = useState(1);
    const [firstClassPage, setFirstClassPage] = useState(1);
    const [fu1Page, setFu1Page] = useState(1);
    const [fu2Page, setFu2Page] = useState(1);
    const [fu3Page, setFu3Page] = useState(1);
    const itemsPerPage = 5;

    // Track checked items locally per tanggal
    const [checkedItems, setCheckedItems] = useState({});

    // Fetch dashboard data
    const { data: dashboardData, isLoading, refetch } = useQuery({
        queryKey: ['dashboardProspektifPersonal', selectedDate],
        queryFn: () => getDashboardProspektifPersonal(selectedDate),
        enabled: !!selectedDate
    });

    // Mutation untuk checklist
    const checklistMutation = useMutation({
        mutationFn: ceklisDashboardProspektif,
        onSuccess: (message) => {
            toast({
                title: "Berhasil",
                description: message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: "Gagal",
                description: error.message || "Terjadi kesalahan saat update checklist",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const handleChecklist = async (target, psid) => {
        const itemKey = `${target}-${psid}`;
        
        // Tambahkan ke checkedItems untuk tanggal ini
        setCheckedItems(prev => {
            const dateChecked = prev[selectedDate] || new Set();
            const newDateChecked = new Set(dateChecked);
            newDateChecked.add(itemKey);
            
            return {
                ...prev,
                [selectedDate]: newDateChecked
            };
        });

        await checklistMutation.mutateAsync({
            target,
            psid: psid.toString()
        });
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const angka = dashboardData?.angka || {};
    const data = dashboardData?.data || {};

    // Helper untuk pagination
    const paginateData = (dataArray, currentPage) => {
        if (!dataArray || dataArray.length === 0) {
            return { paginatedData: [], totalPages: 1 };
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            paginatedData: dataArray.slice(startIndex, endIndex),
            totalPages: Math.ceil(dataArray.length / itemsPerPage)
        };
    };

    // Helper untuk render table header
    const TableHeader = ({ children, ...props }) => (
        <Box as="th" p={3} bg="#fcf7ecff" color="#3b3b43ff" fontWeight="bold" textAlign="center" whiteSpace="nowrap" {...props}>
            {children}
        </Box>
    );

    // Helper untuk render table cell
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
                        aria-label="Next page"
                    />
                </Flex>
            </Flex>
        );
    };

    // Component untuk tabel Follow Up
    const FollowUpTable = ({ title, data, targetType, angkaText, currentPage, onPageChange }) => {
        const { paginatedData, totalPages } = paginateData(data || [], currentPage);
        const startIndex = (currentPage - 1) * itemsPerPage;

        return (
            <Box className="table-section" mb={8}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="xl" fontWeight="bold" color="brand.primary">
                        {isLoading ? <Skeleton width={200} height={28} /> : title}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.accent">
                        {isLoading ? <Skeleton width={80} height={24} /> : angkaText}
                    </Text>
                </Flex>
                <Box className="table-container" overflowX="auto">
                    <Box as="table" width="100%" className="data-table">
                        <Box as="thead">
                            <Box as="tr">
                                <TableHeader>No</TableHeader>
                                <TableHeader>Tanggal</TableHeader>
                                <TableHeader>PSID</TableHeader>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>No HP</TableHeader>
                                <TableHeader>Done?</TableHeader>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {isLoading ? (
                                Array(5).fill(0).map((_, idx) => (
                                    <Box as="tr" key={idx}>
                                        <TableCell><Skeleton height={20} width={40} /></TableCell>
                                        <TableCell><Skeleton height={20} width={30} /></TableCell>
                                        <TableCell><Skeleton height={20} width={90} /></TableCell>
                                        <TableCell><Skeleton height={20} width={60} /></TableCell>
                                        <TableCell wrap><Skeleton height={20} width={150} /></TableCell>
                                        <TableCell><Skeleton height={20} width={100} /></TableCell>
                                    </Box>
                                ))
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => {
                                    const [tanggal, psid, nama, nomorSiswa, nomorOrtu] = row;
                                    const nomorHP = nomorSiswa || nomorOrtu || '-';
                                    const rowNumber = startIndex + idx + 1;
                                    const itemKey = `${targetType}-${psid}`;
                                    const dateChecked = checkedItems[selectedDate] || new Set();
                                    const isChecked = dateChecked.has(itemKey);
                                    
                                    return (
                                        <Box as="tr" key={idx} _hover={{ bg: "gray.50" }}>
                                            <TableCell textAlign="center">{rowNumber}</TableCell>
                                            <TableCell>{tanggal}</TableCell>
                                            <TableCell>{psid}</TableCell>
                                            <TableCell wrap>{nama}</TableCell>
                                            <TableCell>{nomorHP}</TableCell>
                                            <TableCell textAlign="center">
                                                <Checkbox
                                                    colorScheme="green"
                                                    isChecked={isChecked}
                                                    isDisabled={checklistMutation.isPending || isChecked}
                                                    onChange={() => handleChecklist(targetType, psid)}
                                                />
                                            </TableCell>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Box as="tr">
                                    <TableCell colSpan={6} textAlign="center" color="gray.500">
                                        Tidak ada data
                                    </TableCell>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
                <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={onPageChange} 
                />
            </Box>
        );
    };

    // Component untuk tabel Trial/First Class
    const ClassTable = ({ title, data, targetType, count, currentPage, onPageChange }) => {
        const { paginatedData, totalPages } = paginateData(data || [], currentPage);
        const startIndex = (currentPage - 1) * itemsPerPage;

        return (
            <Box className="table-section" mb={8}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="xl" fontWeight="bold" color="brand.primary">
                        {isLoading ? <Skeleton width={200} height={28} /> : title}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.accent">
                        {isLoading ? <Skeleton width={60} height={24} /> : count}
                    </Text>
                </Flex>
                <Box className="table-container" overflowX="auto">
                    <Box as="table" width="100%" className="data-table">
                        <Box as="thead">
                            <Box as="tr">
                                <TableHeader>Nomor</TableHeader>
                                <TableHeader>PSID</TableHeader>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>Tanggal</TableHeader>
                                <TableHeader>No HP</TableHeader>
                                <TableHeader>Done?</TableHeader>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {isLoading ? (
                                Array(5).fill(0).map((_, idx) => (
                                    <Box as="tr" key={idx}>
                                        <TableCell><Skeleton height={20} width={40} /></TableCell>
                                        <TableCell><Skeleton height={20} width={30} /></TableCell>
                                        <TableCell><Skeleton height={20} width={60} /></TableCell>
                                        <TableCell wrap><Skeleton height={20} width={150} /></TableCell>
                                        <TableCell><Skeleton height={20} width={90} /></TableCell>
                                        <TableCell><Skeleton height={20} width={100} /></TableCell>
                                    </Box>
                                ))
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => {
                                    const [psid, nama, tanggal, nomorSiswa, nomorOrtu] = row;
                                    const nomorHP = nomorSiswa || nomorOrtu || '-';
                                    const rowNumber = startIndex + idx + 1;
                                    const itemKey = `${targetType}-${psid}`;
                                    const dateChecked = checkedItems[selectedDate] || new Set();
                                    const isChecked = dateChecked.has(itemKey);
                                    
                                    return (
                                        <Box as="tr" key={idx} _hover={{ bg: "gray.50" }}>
                                            <TableCell textAlign="center">{rowNumber}</TableCell>
                                            <TableCell>{psid}</TableCell>
                                            <TableCell wrap>{nama}</TableCell>
                                            <TableCell>{tanggal}</TableCell>
                                            <TableCell>{nomorHP}</TableCell>
                                            <TableCell textAlign="center">
                                                <Checkbox
                                                    colorScheme="green"
                                                    isChecked={isChecked}
                                                    isDisabled={checklistMutation.isPending || isChecked}
                                                    onChange={() => handleChecklist(targetType, psid)}
                                                />
                                            </TableCell>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Box as="tr">
                                    <TableCell colSpan={6} textAlign="center" color="gray.500">
                                        Tidak ada data
                                    </TableCell>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
                <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={onPageChange} 
                />
            </Box>
        );
    };

    return (
        <ContainerCarrot>
            <StyledDashboardProspektifPage>
                <Box className="page-header" mb={6}>
                    <Text fontSize="2xl" fontWeight="bold" color="brand.primary" mb={4}>
                        Dashboard Prospektif
                    </Text>
                    
                    {/* Filter Tanggal */}
                    <Flex gap={4} align="center" mb={6}>
                        <Text fontWeight="semibold">Filter Tanggal:</Text>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            maxW="250px"
                            bg="white"
                        />
                    </Flex>

                    {/* KPI Cards */}
                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={8}>
                        <GridItem>
                            <Box className="kpi-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    {isLoading ? <Skeleton width={120} height={16} /> : "Trial Class hari ini"}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="#FE7743">
                                    {isLoading ? <Skeleton width={60} height={32} /> : angka.trial_class || 0}
                                </Text>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box className="kpi-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    {isLoading ? <Skeleton width={120} height={16} /> : "First Class hari ini"}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="#FE7743">
                                    {isLoading ? <Skeleton width={60} height={32} /> : angka.first_class || 0}
                                </Text>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box className="kpi-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    {isLoading ? <Skeleton width={100} height={16} /> : "Follow Up 1"}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="#FE7743">
                                    {isLoading ? <Skeleton width={80} height={32} /> : angka.followup_1 || "0 / 0"}
                                </Text>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box className="kpi-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    {isLoading ? <Skeleton width={100} height={16} /> : "Follow Up 2"}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="#FE7743">
                                    {isLoading ? <Skeleton width={80} height={32} /> : angka.followup_2 || "0 / 0"}
                                </Text>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <Box className="kpi-card" bg="white" p={4} borderRadius="lg" boxShadow="md">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    {isLoading ? <Skeleton width={100} height={16} /> : "Follow Up 3"}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="#FE7743">
                                    {isLoading ? <Skeleton width={80} height={32} /> : angka.followup_3 || "0 / 0"}
                                </Text>
                            </Box>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Tables */}
                <Box className="tables-section">
                    {/* Trial Class Table */}
                    <ClassTable
                        title="Trial Class"
                        data={data.daftar_trial_class}
                        targetType="trial-class"
                        count={angka.trial_class || 0}
                        currentPage={trialClassPage}
                        onPageChange={setTrialClassPage}
                    />

                    {/* First Class Table */}
                    <ClassTable
                        title="First Class"
                        data={data.daftar_first_class}
                        targetType="first-class"
                        count={angka.first_class || 0}
                        currentPage={firstClassPage}
                        onPageChange={setFirstClassPage}
                    />

                    {/* Follow Up 1 Table */}
                    <FollowUpTable
                        title="Follow Up 1"
                        data={data.list_ongoing_fu1}
                        targetType="follow-up1"
                        angkaText={angka.followup_1 || "0 / 0"}
                        currentPage={fu1Page}
                        onPageChange={setFu1Page}
                    />

                    {/* Follow Up 2 Table */}
                    <FollowUpTable
                        title="Follow Up 2"
                        data={data.list_ongoing_fu2}
                        targetType="follow-up2"
                        angkaText={angka.followup_2 || "0 / 0"}
                        currentPage={fu2Page}
                        onPageChange={setFu2Page}
                    />

                    {/* Follow Up 3 Table */}
                    <FollowUpTable
                        title="Follow Up 3"
                        data={data.list_ongoing_fu3}
                        targetType="follow-up3"
                        angkaText={angka.followup_3 || "0 / 0"}
                        currentPage={fu3Page}
                        onPageChange={setFu3Page}
                    />
                </Box>
            </StyledDashboardProspektifPage>
        </ContainerCarrot>
    );
}

export default DashboardProspektifPage;
