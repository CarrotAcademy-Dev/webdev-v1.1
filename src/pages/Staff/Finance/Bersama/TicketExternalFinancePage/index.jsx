import { toaster } from "@/components/ui/toaster";
import { doneTicketExternalFinance, getDataTicketExternalFinance } from "@/features/finance/financeApiService";
import { Box, Button, Flex, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Skeleton, Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiCheckCircle, FiCheckSquare, FiChevronDown, FiChevronUp, FiClock, FiExternalLink, FiInbox, FiSearch } from "react-icons/fi";
import ContainerCarrot from "@/components/Container";
import { TicketExternalFinStyled } from "./TicketExternalPageFin.styled";
import InfoCard from "@/components/InfoCard";
import usePagination from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";

const TicketExternalFinancePage = () => {
    const {colorMode} = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [activeTab, setActiveTab] = useState("open");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: "null", direction: "asc" });
    const [formData, setFormData] = useState({
        id_ticket: "",
        nama: "",
        result: ""
    });

    const { data: ticketData = { dataOpen: [], dataClose: []} , isLoading, isError } = useQuery({
        queryKey: ["ticketExternalFinance"],
        queryFn: getDataTicketExternalFinance,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const doneMutation = useMutation({
        mutationFn: doneTicketExternalFinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketExternalFinance"] });
            toaster.create({ message: "Ticket berhasil diselesaikan", type: "success", duration: 3000 });
            handleModalClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal menyelesaikan ticket",
                description: error.message || "Terjadi kesalahan pada server.",
                type: "error",
                duration: 3000,
            });
        },
    });

    const openTickets = useMemo(() => ticketData.dataOpen || [], [ticketData.dataOpen]);
    const closeTickets = useMemo(() => ticketData.dataClose || [], [ticketData.dataClose]);

    const stats = useMemo(() => ({
        open: openTickets.length,
        close: closeTickets.length,
        total: openTickets.length + closeTickets.length,
        completionRate: openTickets.length + closeTickets.length > 0
            ? Math.round((closeTickets.length / (openTickets.length + closeTickets.length)) * 100)
            : 0,
    }), [openTickets.length, closeTickets.length]);

    const extractYears = (timestamp) => {
        if (!timestamp) return null;
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) return String(parsed.getFullYear());
        const parts = String(timestamp).match(/(\d{4})/g);
        return parts ? parts[parts.length - 1] : null;
    };

    const availableYears = useMemo(() => {
        const years = new Set();
        [...openTickets, ...closeTickets].forEach(ticket => {
            const year = extractYears(ticket.timestamp);
            if (year) years.add(year);
        });
        return [...years].sort((a, b) => Number(b) - Number(a));
    }, [openTickets, closeTickets]);

    const currentTabData = useMemo(() => (
        activeTab === "open" ? openTickets : closeTickets
    ), [activeTab, openTickets, closeTickets]);

    const filteredData = useMemo(() => {
        let data = currentTabData;
        if (selectedYear !== "all") {
            data = data.filter(ticket => extractYears(ticket.timestamp) === selectedYear);
        }
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(ticket =>
            (ticket.id_ticket && ticket.id_ticket.LowerCase().includes(lower)) ||
            (ticket.nama_siswa && ticket.nama_siswa.toLowerCase().includes(lower)) ||
            (ticket.kategori && ticket.kategori.toLowerCase().includes(lower)) ||
            (ticket.request && ticket.request.toLowerCase().includes(lower)) ||
            (ticket.responsible && ticket.responsible.toLowerCase().includes(lower))
        );
    }, [currentTabData, selectedYear, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const handleModalDoneModal = (ticket) => {
        setFormData({
            id_ticket: ticket.id_ticket || "",
            nama: ticket.nama_siswa || "",
            result: ticket.hasil || "",
        });
        onOpen();
    }

    const handleModalClose = () => {
        setFormData({ id_ticket: "", nama: "", result: "" });
        onClose();
    }

    const handleSubmit = () => {
        if (!formData.id_ticket) {
            toaster.create({
                title: "ID Ticket wajib diisi",
                type: "error",
                duration: 3000,
            });
            return;
        }
        doneMutation.mutate({ id_ticket: formData.id_ticket, result: formData.result });
    };

    const isInvalidUrl = (url) => {
        if (!url) return false;
        try { return ["http:", "https"].includes(new URL(url).protocol); }
        catch { return false }
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
            <TicketExternalFinStyled colorMode={colorMode} data-theme={colorMode}>
                <Box className="header">
                    <h1>Ticketing External</h1>
                    <Text className="subtitle">Monitor dan selesaikan ticketing external Finance</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Open Tickets</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.open}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Closed Tickets</p>
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

                {/* Tab Buttons */}
                <Flex mt={4} mb={4} gap={2} wrap="wrap" justify="center">
                    {["open", "close"].map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "solid" : "outline"}
                            colorScheme={activeTab === tab ? "teal" : "gray"}
                            onClick={() => {setActiveTab(tab); setCurrentPage(1);}}
                            borderRadius="full"
                            px={5}
                        >
                            {tab === "open" ? <FiClock style={{ marginRight: "8px" }} /> : <FiCheckCircle style={{ marginRight: "8px" }} />}
                            {tab === "open" ? `Open (${stats.open})` : `Closed (${stats.close})`}
                        </Button>
                    ))}
                </Flex>

                {/* Search + Year Filter */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="420px">
                        <Input 
                            placeholder="Cari ID ticket, nama, kategori, request..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="180px" value={selectedYear} onChange={ (e) => {setSelectedYear(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Tahun</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box><Skeleton count={20} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : `Belum ada ticket ${activeTab}`}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table style={{ minWidth: "2200px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <SortableHeader column="nama_siswa" label="Nama Siswa" minWidth="170px" />
                                        <SortableHeader column="status" label="Status" minWidth="100px" />
                                        <SortableHeader column="deadline" label="Deadline" minWidth="130px" />
                                        <th style={{ width: "130px" }}>No Hp</th>
                                        <SortableHeader column="kategori" label="Kategori" minWidth="140px" />
                                        <th style={{ minWidth: "180px" }}>Request</th>
                                        <th style={{ minWidth: "220px" }} >Request Detail</th>
                                        <th style={{ minWidth: "160px" }}>Responsible</th>
                                        <th style={{ minWidth: "140px" }}>Accountable</th>
                                        <th style={{ minWidth: "140px" }}>Consulted</th>
                                        <th style={{ minWidth: "140px" }}>Informed</th>
                                        <th style={{ minWidth: "80px" }}>Lampiran</th>
                                        {activeTab === "open"
                                            ? <th style={{ width: "110px", position: "sticky", right: 0 }}>Action</th>
                                            : <th style={{ width: "180px", position: "sticky", right: 0 }}>Hasil</th>
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((ticket, index) => (
                                        <tr key={`${ticket.id_ticket}-${index}`}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{ticket.id_ticket || "-"}</td>
                                            <td>{ticket.timestamp || "-"}</td>
                                            <td>{ticket.nama_siswa || "-"}</td>
                                            <td>{ticket.status || "-"}</td>
                                            <td>{ticket.deadline || "-"}</td>
                                            <td>{ticket.no_hp || "-"}</td>
                                            <td>{ticket.kategori || "-"}</td>
                                            <td>
                                                {ticket.request?.length > 30
                                                    ? <Tooltip label={ticket.request}><span>{ticket.request.substring(0, 30)}...</span></Tooltip>
                                                    : ticket.request || "-"
                                                }
                                            </td>
                                            <td>
                                                {ticket.request_detail?.length > 35
                                                    ? <Tooltip label={ticket.request_detail}><span>{ticket.request_detail.substring(0, 35)}...</span></Tooltip>
                                                    : ticket.request_detail || "-"
                                                }
                                            </td>
                                            <td>{ticket.responsible || "-"}</td>
                                            <td>{ticket.accountable || "-"}</td>
                                            <td>{ticket.consulted || "-"}</td>
                                            <td>{ticket.informed || "-"}</td>
                                            <td>
                                                {isInvalidUrl(ticket.lampiran) ? (
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() => window.open(ticket.lampiran, "_blank", "noopener, noreferrer")}
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
                                            </td>
                                            {activeTab === "open" ? (
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    <Button size="sm" colorScheme="teal" onClick={() => handleModalDoneModal(ticket)}>
                                                        Done
                                                    </Button>
                                                </td>
                                            ) : (
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    {ticket.hasil.length > 30
                                                        ? <Tooltip label={ticket.hasil}><span>{ticket.hasil.substring(0, 30)}...</span></Tooltip>
                                                        : ticket.hasil || "-"
                                                    }
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

                {/* Done Modal */}
                <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Mark as Done</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>ID Ticket</Text>
                                    <Input value={formData.id_ticket} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama Siswa</Text>
                                    <Input value={formData.nama} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Result</Text>
                                    <Textarea
                                        value={formData.result}
                                         onChange={(e) => setFormData(prev => ({ ...prev, result: e.target.value }))}
                                        placeholder="Masukkan hasil penyelesaian ticket..."
                                        rows={4}
                                    />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleModalClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleSubmit} isLoading={doneMutation.isPending}>Submit Done</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </TicketExternalFinStyled>
        </ContainerCarrot>
    );
}

export default TicketExternalFinancePage;