import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
    Button, 
    useToast, 
    Box,
    Flex,
    IconButton,
    Text,
    Input,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    InputGroup,
    InputLeftElement,
    useColorModeValue,
    useColorMode
} from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPendaftaranLanjutan, postTanggalKirimPendaftaran } from "@/features/cso/csoApiService";
import { StyledPendaftaranLanjutanPage } from "./PendaftaranLanjutan.styled";
import { LuExternalLink, LuSend, LuCheckCheck } from "react-icons/lu";
import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { usePagination } from "@/hooks/usePagination";
import { handleError } from "@/utils/errorHandler";
import { formatDate } from "@/utils/formatters";

function PendaftaranLanjutanPage() {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const toast = useToast();
    
    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textMuted = useColorModeValue('gray.600', 'gray.400');
    const tabSelectedBg = useColorModeValue('gray.800', 'orange.500');
    
    const [selectedDates, setSelectedDates] = useState({});

    const { data: pendaftaranData, isLoading, isError, error } = useQuery({
        queryKey: ['pendaftaranLanjutan'],
        queryFn: getPendaftaranLanjutan,
        placeholderData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markSentMutation } = useMutation({
        mutationFn: ({ rowData, tanggalKirim }) => postTanggalKirimPendaftaran({ rowData, tanggalKirim }),
        onMutate: async (variables) => {
            const { rowData: updatedRow, tanggalKirim } = variables;

            await queryClient.cancelQueries({ queryKey: ['pendaftaranLanjutan'] });
            const previousData = queryClient.getQueryData(['pendaftaranLanjutan']);

            queryClient.setQueryData(['pendaftaranLanjutan'], (oldData) => {
                if (!oldData) return { dataOpen: [], dataClose: [] };
                
                const newDataOpen = oldData.dataOpen.filter(item => item.psid !== updatedRow.psid);
                const newDataClose = [...oldData.dataClose, { ...updatedRow, tanggalKirim }];

                return {
                    ...oldData,
                    dataOpen: newDataOpen,
                    dataClose: newDataClose
                };
            });
            return { previousData };
        },
        onError: (error, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['pendaftaranLanjutan'], context.previousData);
            }
            handleError(error, toast, 'markAsSent');
        },
        onSuccess: (_, variables) => {
            const { rowData } = variables;
            toast({
                title: 'Tanggal Kirim Updated!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });
            setSelectedDates(prev => {
                const newDates = { ...prev };
                delete newDates[rowData.psid];
                return newDates;
            });

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['pendaftaranLanjutan'] });
            }, 500);
        }
    });

    const handleMarkAsSent = (rowData) => {
        if (!rowData.psid) {
            toast({
                title: 'Error',
                description: 'PSID tidak ditemukan',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        const selectedDate = selectedDates[rowData.psid];
        if (!selectedDate) {
            toast({
                title: 'Error',
                description: 'Silakan pilih tanggal kirim',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        markSentMutation({ rowData, tanggalKirim: selectedDate });
    };

    const handleDateChange = (psid, date) => {
        setSelectedDates(prev => ({
            ...prev,
            [psid]: date
        }));
    };

    const DataTable = ({ data, showDatePicker = false }) => {
        const [searchQuery, setSearchQuery] = useState('');
        const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

        // Filter data berdasarkan search query
        const filteredData = useMemo(() => {
            if (!searchQuery) return data;
            
            return data.filter(item => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    item.psid?.toLowerCase().includes(searchLower) ||
                    item.nama?.toLowerCase().includes(searchLower) ||
                    item.tanggalKirim?.toLowerCase().includes(searchLower)
                );
            });
        }, [data, searchQuery]);

        // Sort data berdasarkan sortConfig
        const sortedData = useMemo(() => {
            if (!sortConfig.key) return filteredData;

            const sorted = [...filteredData].sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle null/undefined values
                if (!aValue && !bValue) return 0;
                if (!aValue) return 1;
                if (!bValue) return -1;

                // Try to parse as date
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                
                if (!isNaN(dateA) && !isNaN(dateB)) {
                    return sortConfig.direction === 'asc' 
                        ? dateA - dateB 
                        : dateB - dateA;
                }

                // String comparison
                const strA = String(aValue).toLowerCase();
                const strB = String(bValue).toLowerCase();
                
                if (sortConfig.direction === 'asc') {
                    return strA.localeCompare(strB);
                } else {
                    return strB.localeCompare(strA);
                }
            });

            return sorted;
        }, [filteredData, sortConfig]);

        const handleSort = (key) => {
            setSortConfig(prev => {
                if (prev.key === key) {
                    return {
                        key,
                        direction: prev.direction === 'asc' ? 'desc' : 'asc'
                    };
                } else {
                    return { key, direction: 'asc' };
                }
            });
        };

        const {
            currentItems,
            currentPage,
            totalPages,
            nextPage,
            prevPage,
            hasNextPage,
            hasPrevPage,
        } = usePagination(sortedData, 10);

        return (
            <div className="table-container">
                {/* Search Bar */}
                <Flex mb={4} gap={3} alignItems="center">
                    <InputGroup maxW="400px">
                        <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search by PSID, Nama, or Tanggal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            borderRadius="md"
                        />
                    </InputGroup>
                    <Text fontSize="sm" color={textMuted}>
                        {sortedData.length} results
                    </Text>
                </Flex>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th 
                                onClick={() => handleSort('psid')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                                <Flex alignItems="center" gap={1} justifyContent="center">
                                    PSID
                                    {sortConfig.key === 'psid' && (
                                        sortConfig.direction === 'asc' 
                                            ? <FiChevronUp size={14} /> 
                                            : <FiChevronDown size={14} />
                                    )}
                                </Flex>
                            </th>
                            <th 
                                onClick={() => handleSort('nama')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                                <Flex alignItems="center" gap={1} justifyContent="center">
                                    Nama
                                    {sortConfig.key === 'nama' && (
                                        sortConfig.direction === 'asc' 
                                            ? <FiChevronUp size={14} /> 
                                            : <FiChevronDown size={14} />
                                    )}
                                </Flex>
                            </th>
                            <th>Link Pendaftaran</th>
                            <th 
                                onClick={() => handleSort('tanggalKirim')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                                <Flex alignItems="center" gap={1} justifyContent="center">
                                    Tanggal Kirim
                                    {sortConfig.key === 'tanggalKirim' && (
                                        sortConfig.direction === 'asc' 
                                            ? <FiChevronUp size={14} /> 
                                            : <FiChevronDown size={14} />
                                    )}
                                </Flex>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr key={item.psid}>
                                <td>{item.psid}</td>
                                <td>{item.nama}</td>
                                <td>
                                    {item.linkPendaftaran ? (
                                        <Button
                                            leftIcon={<LuExternalLink />}
                                            colorScheme="blue"
                                            variant="link"
                                            onClick={() => {
                                                const link = item.linkPendaftaran.trim();
                                                if (link) {
                                                    window.open(link, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                        >
                                            Open Link
                                        </Button>
                                    ) : (
                                        <Text color="gray.400" fontSize="sm">No link</Text>
                                    )}
                                </td>
                                <td>
                                    {showDatePicker ? (
                                        <Flex gap={2}>
                                            <Input
                                                type="date"
                                                size="sm"
                                                value={selectedDates[item.psid] || ''}
                                                onChange={(e) => handleDateChange(item.psid, e.target.value)}
                                            />
                                            <Button
                                                onClick={() => handleMarkAsSent(item)}
                                                colorScheme="orange"
                                                size="sm"
                                                width="10rem"
                                                isDisabled={!selectedDates[item.psid]}
                                            >
                                                Mark as Sent
                                            </Button>
                                        </Flex>
                                    ) : (
                                        formatDate.toShortDate(item.tanggalKirim)
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <Flex justify="space-between" mt={4} align="center">
                        <Text fontSize="sm" color={textMuted}>
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, sortedData.length)} of {sortedData.length} entries
                        </Text>
                        <Flex align="center" gap={4}>
                            <Text fontSize="sm">
                                Page {currentPage} of {totalPages}
                            </Text>
                            <Flex gap={2}>
                                <IconButton
                                    icon={<FiChevronLeft />}
                                    onClick={prevPage}
                                    isDisabled={!hasPrevPage}
                                    aria-label="Previous page"
                                    size="sm"
                                />
                                <IconButton
                                    icon={<FiChevronRight />}
                                    onClick={nextPage}
                                    isDisabled={!hasNextPage}
                                    aria-label="Next page"
                                    size="sm"
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                )}
            </div>
        );
    };

    if (isError) return <div>Error: {error.message}</div>;

    const totalBelumTerkirim = pendaftaranData.dataOpen?.length || 0;
    const totalSudahTerkirim = pendaftaranData.dataClose?.length || 0;
    const totalKeseluruhan = totalBelumTerkirim + totalSudahTerkirim;
    const percentageComplete = totalKeseluruhan > 0 
        ? Math.round((totalSudahTerkirim / totalKeseluruhan) * 100) 
        : 0;

    return (
        <StyledPendaftaranLanjutanPage data-theme={colorMode}>
            <ContainerCarrot>
                <h1 className="page-title">Pendaftaran Lanjutan - Overview</h1>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <LuSend size="30px" /> 
                                <p>Belum Terkirim</p> 
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totalBelumTerkirim}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuCheckCheck size="30px" /> 
                                <p>Sudah Terkirim</p> 
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totalSudahTerkirim}</p>}
                            </InfoCard>
                        </div>
                    </div>
                    <div className="hero-section__right">
                        <InfoCard>
                            <div className="progress-info">
                                <h3>Progress Keseluruhan</h3>
                                <div className="progress-stats">
                                    <span className="percentage">{percentageComplete}%</span>
                                    <span className="count">{totalSudahTerkirim} dari {totalKeseluruhan}</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${percentageComplete}%` }}
                                    />
                                </div>
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </ContainerCarrot>
            <ContainerCarrot>
                <Box bg={cardBg} borderRadius="24px" p={6} boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)" mt={4}>
                    <Tabs align="center" variant="soft-rounded" colorScheme="orange">
                        <TabList mb={4}>
                            <Tab _selected={{ color: 'white', bg: tabSelectedBg }}>Belum Terkirim</Tab>
                            <Tab _selected={{ color: 'white', bg: tabSelectedBg }}>Sudah Terkirim</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel p={0}>
                                <DataTable data={pendaftaranData.dataOpen} showDatePicker={true} />
                            </TabPanel>
                            <TabPanel p={0}>
                                <DataTable data={pendaftaranData.dataClose} showDatePicker={false} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </ContainerCarrot>
        </StyledPendaftaranLanjutanPage>
    );
}

export default PendaftaranLanjutanPage;
