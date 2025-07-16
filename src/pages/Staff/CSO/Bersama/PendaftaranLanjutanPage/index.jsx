import ContainerCarrot from "@/components/Container";
import Loading from "@/components/Loading";
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
    TabPanel
} from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPendaftaranLanjutan, postTanggalKirimPendaftaran } from "@/features/cso/csoApiService";
import { StyledPendaftaranLanjutanPage } from "./PendaftaranLanjutan.styled";
import { LuExternalLink } from "react-icons/lu";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function PendaftaranLanjutanPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [selectedDates, setSelectedDates] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: pendaftaranData, isLoading, isError, error } = useQuery({
        queryKey: ['pendaftaranLanjutan'],
        queryFn: getPendaftaranLanjutan,
        initialData: { dataOpen: [], dataClose: [] }
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
            toast({
                title: 'Action Failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
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
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(data.length / itemsPerPage);

        return (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>PSID</th>
                            <th>Nama</th>
                            <th>Link Pendaftaran</th>
                            <th>Tanggal Kirim</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr key={item.psid}>
                                <td>{item.psid}</td>
                                <td>{item.nama}</td>
                                <td>
                                    <Button
                                        leftIcon={<LuExternalLink />}
                                        colorScheme="blue"
                                        variant="link"
                                        onClick={() => window.open(item.linkPendaftaran, '_blank')}
                                    >
                                        Open Link
                                    </Button>
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
                                        item.tanggalKirim
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <Flex justify="center" mt={4} align="center" gap={4}>
                        <IconButton
                            icon={<FiChevronLeft />}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            isDisabled={currentPage === 1}
                            aria-label="Previous page"
                        />
                        <Text>
                            Page {currentPage} of {totalPages}
                        </Text>
                        <IconButton
                            icon={<FiChevronRight />}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            isDisabled={currentPage === totalPages}
                            aria-label="Next page"
                        />
                    </Flex>
                )}
            </div>
        );
    };

    if (isLoading) return <Loading />;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledPendaftaranLanjutanPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Pendaftaran Lanjutan</h1>
                    </div>
                </div>
                <Box bg="white" borderRadius="24px" p={6} boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)">
                    <Tabs align="center" variant="soft-rounded" colorScheme="orange" onChange={() => setCurrentPage(1)}>
                        <TabList mb={4}>
                            <Tab _selected={{ color: 'white', bg: 'gray.800' }}>Belum Terkirim</Tab>
                            <Tab _selected={{ color: 'white', bg: 'gray.800' }}>Sudah Terkirim</Tab>
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
