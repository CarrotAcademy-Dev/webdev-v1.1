import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Input,
    Select,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Textarea,
    Tooltip,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import {
    FiInbox,
    FiCheckCircle,
    FiClock,
    FiExternalLink,
    FiSearch,
    FiChevronUp,
    FiChevronDown,
    FiCheckSquare,
} from "react-icons/fi";
import ContainerCarrot from "../../../../../components/Container";
import InfoCard from "../../../../../components/InfoCard";
import {
    doneTicketExternalEso,
    getDataTicketExternalEso,
} from "../../../../../features/eso/esoApiService";
import usePagination from "../../../../../hooks/usePagination";
import Pagination from "../../../../../components/Pagination/";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { TicketExternalStyled } from "./TicketExternal.styled";
import { toaster } from "../../../../../components/ui/toaster";

const TicketExternalPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [activeTab, setActiveTab] = useState("open");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState({
        id_ticket: "",
        nama: "",
        result: "",
    });

    const { data: ticketData = { dataOpen: [], dataClose: [] }, isLoading, isError } = useQuery({
        queryKey: ["ticketExternalEso"],
        queryFn: getDataTicketExternalEso,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const doneMutation = useMutation({
        mutationFn: doneTicketExternalEso,
        onSuccess: () => {
            queryClient.invalidateQueries(["ticketExternalEso"]);
            toaster.create({
                title: "Ticket berhasil diselesaikan",
                type: "success",
                duration: 3000,
            });
            handleModalClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal menyelesaikan ticket",
                description: error.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    const openTickets = useMemo(() => ticketData.dataOpen || [], [ticketData.dataOpen]);
    const closeTickets = useMemo(() => ticketData.dataClose || [], [ticketData.dataClose]);

    const stats = useMemo(() => ({
        total: openTickets.length + closeTickets.length,
        open: openTickets.length,
        close: closeTickets.length,
        completionRate:
            openTickets.length + closeTickets.length > 0
                ? Math.round((closeTickets.length / (openTickets.length + closeTickets.length)) * 100)
                : 0,
    }), [openTickets.length, closeTickets.length]);

    const currentTabData = useMemo(() => (
        activeTab === "open" ? openTickets : closeTickets
    ), [activeTab, openTickets, closeTickets]);

    const extractYear = (timestamp) => {
        if (!timestamp) return null;

        const parsed = new Date(timestamp);
        if (!Number.isNaN(parsed.getTime())) {
            return String(parsed.getFullYear());
        }

        const parts = String(timestamp).match(/(\d{4})/g);
        if (parts && parts.length > 0) {
            return parts[parts.length - 1];
        }

        return null;
    };

    const availableYears = useMemo(() => {
        const years = new Set();
        [...openTickets, ...closeTickets].forEach((item) => {
            const year = extractYear(item.timestamp);
            if (year) years.add(year);
        });
        return [...years].sort((a, b) => Number(b) - Number(a));
    }, [openTickets, closeTickets]);

    const filteredData = useMemo(() => {
        let data = currentTabData;

        if (selectedYear !== "all") {
            data = data.filter((item) => extractYear(item.timestamp) === selectedYear);
        }

        if (!searchQuery) return data;

        const searchLower = searchQuery.toLowerCase();
        return data.filter((item) => (
            (item.id_ticket && item.id_ticket.toLowerCase().includes(searchLower)) ||
            (item.nama && item.nama.toLowerCase().includes(searchLower)) ||
            (item.kategori && item.kategori.toLowerCase().includes(searchLower)) ||
            (item.request && item.request.toLowerCase().includes(searchLower))
        ));
    }, [currentTabData, searchQuery, selectedYear]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleOpenDoneModal = (item) => {
        setFormData({
            id_ticket: item.id_ticket || "",
            nama: item.nama || "",
            result: item.hasil || "",
        });
        onOpen();
    };

    const handleModalClose = () => {
        setFormData({
            id_ticket: "",
            nama: "",
            result: "",
        });
        onClose();
    };

    const handleSubmit = () => {
        if (!formData.id_ticket) {
            toaster.create({
                title: "ID Ticket wajib diisi",
                type: "error",
                duration: 3000,
            });
            return;
        }

        doneMutation.mutate({
            id_ticket: formData.id_ticket,
            result: formData.result,
        });
    };

    const isValidUrl = (urlString) => {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th
            onClick={() => handleSort(column)}
            style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}
        >
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
            <TicketExternalStyled colorMode={colorMode}>
                <Box className="header">
                    <h1>Ticketing External</h1>
                    <Text className="subtitle">
                        Monitor ticket external ESO (open/close) dan selesaikan ticket open
                    </Text>
                </Box>

                <Box className="stats-grid">
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Open Ticket</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.open}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Closed Ticket</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.close}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiInbox size={28} />
                        <p>Total Ticket</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckSquare size={28} />
                        <p>Completion Rate</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.completionRate}%</p>}
                    </InfoCard>
                </Box>

                <Flex mt={12} mb={8} gap={2} wrap="wrap" justify="center">
                    <Button
                        variant={activeTab === "open" ? "solid" : "outline"}
                        colorScheme={activeTab === "open" ? "teal" : "gray"}
                        onClick={() => {
                            setActiveTab("open");
                            setCurrentPage(1);
                        }}
                        borderRadius="full"
                        px={5}
                        _hover={activeTab === "open" ? undefined : { bg: colorMode === "dark" ? "gray.700" : "gray.100" }}
                    >
                        <FiClock style={{ marginRight: "8px" }} />
                        Open ({stats.open})
                    </Button>
                    <Button
                        variant={activeTab === "close" ? "solid" : "outline"}
                        colorScheme={activeTab === "close" ? "teal" : "gray"}
                        onClick={() => {
                            setActiveTab("close");
                            setCurrentPage(1);
                        }}
                        borderRadius="full"
                        px={5}
                        _hover={activeTab === "close" ? undefined : { bg: colorMode === "dark" ? "gray.700" : "gray.100" }}
                    >
                        <FiCheckCircle style={{ marginRight: "8px" }} />
                        Closed ({stats.close})
                    </Button>
                </Flex>

                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth= "420px">
                        <Input
                            placeholder="Cari ID ticket, nama, kategori, atau request..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            pl="40px"
                        />
                        <Box
                            position="absolute"
                            left="12px"
                            top="50%"
                            transform="translateY(-50%)"
                            pointerEvents="none"
                        >
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select
                        maxW="180px"
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Semua Tahun</option>
                        {availableYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Select>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}>
                            <Skeleton count={20} height={40} style={{ marginBottom: "8px" }} />
                        </Box>
                    ) : isError ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>Gagal memuat data. Silakan refresh halaman.</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>
                                {searchQuery
                                    ? "Tidak ada data yang sesuai dengan pencarian"
                                    : `Belum ada ticket ${activeTab}`}
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>No</th>
                                        <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <SortableHeader column="nama" label="Nama" minWidth="170px" />
                                        <SortableHeader column="kategori" label="Kategori" minWidth="140px" />
                                        <th style={{ minWidth: "180px" }}>Request</th>
                                        <th style={{ minWidth: "220px" }}>Request Detail</th>
                                        <SortableHeader column="deadline" label="Deadline" minWidth="140px" />
                                        <SortableHeader column="status" label="Status" minWidth="100px" />
                                        <th style={{ minWidth: "170px" }}>Responsible</th>
                                        <th style={{ minWidth: "130px" }}>PIC</th>
                                        <th style={{ minWidth: "90px" }}>Lampiran</th>
                                        {activeTab === "open" ? (
                                            <th style={{ width: "110px", position: "sticky", right: 0 }}>Action</th>
                                        ) : (
                                            <th style={{ minWidth: "170px", position: "sticky", right: 0 }}>Hasil</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={`${item.id_ticket}-${index}`}>
                                            <td>{(currentPage - 1) * 20 + index + 1}</td>
                                            <td>{item.id_ticket || "-"}</td>
                                            <td>{item.timestamp || "-"}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.kategori || "-"}</td>
                                            <td>
                                                {item.request && item.request.length > 30 ? (
                                                    <Tooltip label={item.request}>
                                                        <span>{item.request.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.request || "-"
                                                )}
                                            </td>
                                            <td>
                                                {item.request_detail && item.request_detail.length > 35 ? (
                                                    <Tooltip label={item.request_detail}>
                                                        <span>{item.request_detail.substring(0, 35)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.request_detail || "-"
                                                )}
                                            </td>
                                            <td>{item.deadline || "-"}</td>
                                            <td>{item.status || "-"}</td>
                                            <td>{item.responsible || "-"}</td>
                                            <td>{item.pic || "-"}</td>
                                            <td>
                                                {isValidUrl(item.lampiran) ? (
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() => window.open(item.lampiran, "_blank")}
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            {activeTab === "open" ? (
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="teal"
                                                        variant="solid"
                                                        onClick={() => handleOpenDoneModal(item)}
                                                    >
                                                        Done
                                                    </Button>
                                                </td>
                                            ) : (
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    {item.hasil && item.hasil.length > 30 ? (
                                                        <Tooltip label={item.hasil}>
                                                            <span>{item.hasil.substring(0, 30)}...</span>
                                                        </Tooltip>
                                                    ) : (
                                                        item.hasil || "-"
                                                    )}
                                                </td>
                                            )}
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

                <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Selesaikan Ticket External</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>ID Ticket</Text>
                                    <Input
                                        value={formData.id_ticket}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama</Text>
                                    <Input
                                        value={formData.nama}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Result</Text>
                                    <Textarea
                                        value={formData.result}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, result: e.target.value }))}
                                        placeholder="Isi hasil penyelesaian ticket"
                                        rows={4}
                                    />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleModalClose}>
                                Batal
                            </Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleSubmit}
                                isLoading={doneMutation.isPending}
                            >
                                Submit Done
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </TicketExternalStyled>
        </ContainerCarrot>
    );
};

export default TicketExternalPage;
