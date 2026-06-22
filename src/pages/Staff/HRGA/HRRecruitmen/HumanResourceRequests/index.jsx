import ContainerCarrot from "@/components/Container";
import { getDataHRRequest, editStatusHRRequest } from "@/features/hr/hrApiService";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
    ModalOverlay, Select, Stack, Text, Tooltip,
    useColorMode, useDisclosure, Badge, Grid,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiCheckCircle, FiClock,
    FiExternalLink, FiInbox, FiList, FiSearch, FiUser,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { toaster } from "@/components/ui/toaster";
import { StyledDashboardReport } from "../DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const HRRequestPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
    const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();

    const [activeTab, setActiveTab] = useState("open");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);
    const [statusForm, setStatusForm] = useState({ id: "", status: "CLOSED" });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["hrRequest"],
        queryFn: getDataHRRequest,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const openData = useMemo(() => data?.dataOpen || [], [data]);
    const closeData = useMemo(() => data?.dataClose || [], [data]);

    const editMutation = useMutation({
        mutationFn: editStatusHRRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrRequest"] });
            toaster.create({ title: "Status berhasil diupdate", type: "success", duration: 3000 });
            onStatusClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update status", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        open: openData.length,
        close: closeData.length,
        total: openData.length + closeData.length,
    }), [openData, closeData]);

    const currentTabData = activeTab === "open" ? openData : closeData;

    const filteredData = useMemo(() => {
        if (!searchQuery) return currentTabData;
        const lower = searchQuery.toLowerCase();
        return currentTabData.filter(i =>
            (i.nama_staff && String(i.nama_staff).toLowerCase().includes(lower)) ||
            (i.permintaan_posisi && String(i.permintaan_posisi).toLowerCase().includes(lower)) ||
            (i.kebutuhan && String(i.kebutuhan).toLowerCase().includes(lower))
        );
    }, [currentTabData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = String(a[sortConfig.key] || "").toLowerCase();
            const bVal = String(b[sortConfig.key] || "").toLowerCase();
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleOpenDetail = (item) => {
        setSelectedItem(item);
        onDetailOpen();
    };

    const handleOpenStatus = (item, index) => {
        // uniqueId di backend = row index (0-based dari A2)
        // Backend: row = Number(id) + 1, karena mulai dari row 2
        setStatusForm({
            id: String(index + 1), // index dari data array (0-based dari A2)
            status: item.status_final === "OPENED" ? "CLOSED" : "OPENED",
        });
        setSelectedItem(item);
        onStatusOpen();
    };

    const handleStatusSubmit = () => {
        editMutation.mutate(statusForm);
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (
                    sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                )}
            </Flex>
        </th>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Human Resources Request</h1>
                    <Text className="subtitle">Kelola permintaan kebutuhan SDM dari setiap divisi</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Request</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Open</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.open}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Closed</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.close}</p>}
                    </InfoCard>
                </Box>

                {/* Tab Buttons */}
                <Flex mb={4} gap={2} wrap="wrap" justify="center">
                    {["open", "close"].map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "solid" : "outline"}
                            colorScheme={activeTab === tab ? "teal" : "gray"}
                            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            borderRadius="full"
                            px={5}
                        >
                            {tab === "open"
                                ? <><FiClock style={{ marginRight: "8px" }} />Open ({stats.open})</>
                                : <><FiCheckCircle style={{ marginRight: "8px" }} />Closed ({stats.close})</>
                            }
                        </Button>
                    ))}
                </Flex>

                {/* Search */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama staff, posisi, kebutuhan..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : `Belum ada request ${activeTab}`}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="150px" />
                                        <SortableHeader column="nama_staff" label="Nama Staff" minWidth="160px" />
                                        <SortableHeader column="permintaan_posisi" label="Posisi" minWidth="160px" />
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>Kuantitas</th>
                                        <SortableHeader column="kebutuhan" label="Kebutuhan" minWidth="130px" />
                                        <SortableHeader column="jenis_kelamin" label="Jenis Kelamin" minWidth="120px" />
                                        <th style={{ minWidth: "130px" }}>Pengalaman</th>
                                        <SortableHeader column="date_opened" label="Date Opened" minWidth="130px" />
                                        <SortableHeader column="date_closed" label="Date Closed" minWidth="130px" />
                                        <th style={{ minWidth: "120px" }}>Alasan</th>
                                        <th style={{ minWidth: "80px" }}>PDF</th>
                                        <th style={{ minWidth: "100px" }}>Status</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.timestamp || "-")}</td>
                                            <td>{item.nama_staff || "-"}</td>
                                            <td>{item.permintaan_posisi || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{item.kuantitas || "-"}</td>
                                            <td>{item.kebutuhan || "-"}</td>
                                            <td>{item.jenis_kelamin || "-"}</td>
                                            <td>
                                                {item.pengalaman?.length > 25 ? (
                                                    <Tooltip label={item.pengalaman}>
                                                        <span>{item.pengalaman.substring(0, 25)}...</span>
                                                    </Tooltip>
                                                ) : item.pengalaman || "-"}
                                            </td>
                                            <td>{String(item.date_opened || "-")}</td>
                                            <td>{String(item.date_closed || "-")}</td>
                                            <td>
                                                {item.alasan_permintaan?.length > 25 ? (
                                                    <Tooltip label={item.alasan_permintaan}>
                                                        <span>{item.alasan_permintaan.substring(0, 25)}...</span>
                                                    </Tooltip>
                                                ) : item.alasan_permintaan || "-"}
                                            </td>
                                            <td>
                                                {isValidUrl(item.link_pdf) ? (
                                                    <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                        onClick={() => window.open(String(item.link_pdf), "_blank", "noopener,noreferrer")}>
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
                                            </td>
                                            <td>
                                                <Badge colorScheme={item.status_final === "OPENED" ? "green" : "gray"}>
                                                    {item.status_final || "-"}
                                                </Badge>
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Flex gap={1}>
                                                    <IconButton size="sm" variant="ghost" colorScheme="teal"
                                                        onClick={() => handleOpenDetail(item)}>
                                                        <FiUser />
                                                    </IconButton>
                                                    <Button size="sm" colorScheme={item.status_final === "OPENED" ? "red" : "green"} variant="ghost"
                                                        onClick={() => handleOpenStatus(item, startIndex + index)}>
                                                        {item.status_final === "OPENED" ? "Close" : "Open"}
                                                    </Button>
                                                </Flex>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <Flex justify="center" mt={4}>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={goToPage}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        totalItems={totalItems}
                                    />
                                </Flex>
                            )}
                        </>
                    )}
                </Box>

                {/* Detail Modal */}
                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Detail HR Request — {selectedItem?.permintaan_posisi}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedItem && (
                                <Stack gap={3}>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                        {[
                                            { label: "Timestamp", key: "timestamp" },
                                            { label: "Nama Staff", key: "nama_staff" },
                                            { label: "Posisi Diminta", key: "permintaan_posisi" },
                                            { label: "Kuantitas", key: "kuantitas" },
                                            { label: "Jenis Kelamin", key: "jenis_kelamin" },
                                            { label: "Pengalaman", key: "pengalaman" },
                                            { label: "Kebutuhan", key: "kebutuhan" },
                                            { label: "Status", key: "status" },
                                            { label: "Status Final", key: "status_final" },
                                            { label: "Date Opened", key: "date_opened" },
                                            { label: "Date Closed", key: "date_closed" },
                                        ].map(({ label, key }) => (
                                            <Box key={key} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {selectedItem[key] ? String(selectedItem[key]) : "-"}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Grid>

                                    {/* Long text fields */}
                                    {[
                                        { label: "Alasan Permintaan", key: "alasan_permintaan" },
                                        { label: "Jika Penggantian — Nama & Alasan", key: "jika_penggantian_nama_karyawan_digantikan_alasan" },
                                        { label: "Jika Posisi Baru — Alasan Izin Struktur", key: "jika_posisi_baru_alasan_izin_struktur" },
                                        { label: "Uraian Tugas & Tanggung Jawab", key: "uraian_tugas_tanggung_jawab" },
                                    ].map(({ label, key }) => selectedItem[key] && (
                                        <Box key={key} borderBottom="1px solid" borderColor="gray.100" pb={3}>
                                            <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                                            <Text fontSize="sm">{selectedItem[key]}</Text>
                                        </Box>
                                    ))}

                                    {/* PDF Link */}
                                    {isValidUrl(selectedItem.link_pdf) && (
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>PDF</Text>
                                            <Flex align="center" gap={2}>
                                                <Text fontSize="sm" color="blue.400" noOfLines={1}>{selectedItem.link_pdf}</Text>
                                                <Box as="a" href={String(selectedItem.link_pdf)} target="_blank" rel="noopener noreferrer">
                                                    <FiExternalLink size={14} />
                                                </Box>
                                            </Flex>
                                        </Box>
                                    )}
                                </Stack>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>

                {/* Konfirmasi Ubah Status Modal */}
                <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="sm">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Ubah Status</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text mb={3}>
                                Ubah status request <strong>{selectedItem?.permintaan_posisi}</strong> dari{" "}
                                <Badge colorScheme={selectedItem?.status_final === "OPENED" ? "green" : "gray"}>
                                    {selectedItem?.status_final}
                                </Badge>{" "}
                                menjadi{" "}
                                <Badge colorScheme={statusForm.status === "OPENED" ? "green" : "gray"}>
                                    {statusForm.status}
                                </Badge>?
                            </Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onStatusClose}>Batal</Button>
                            <Button
                                colorScheme={statusForm.status === "CLOSED" ? "red" : "green"}
                                onClick={handleStatusSubmit}
                                isLoading={editMutation.isPending}
                            >
                                Ya, Ubah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default HRRequestPage;