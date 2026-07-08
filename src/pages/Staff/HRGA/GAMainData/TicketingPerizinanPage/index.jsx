import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getTicketingPerizinan, inputTicketingPerizinan } from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiCheckCircle, FiExternalLink,
    FiInbox, FiList, FiSearch, FiClock, FiMessageSquare,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const REQUEST_COLORS = {
    "Perizinan Buat Baru": "blue",
    "Perizinan Perpanjang": "orange",
    "Perizinan Orang Datang": "purple",
};

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const TicketingPerizinanPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketForm, setTicketForm] = useState({ id_ticket: "", comment: "", status: "" });

    const { data: ticketData = [], isLoading, isError } = useQuery({
        queryKey: ["ticketingPerizinan"],
        queryFn: getTicketingPerizinan,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const inputMutation = useMutation({
        mutationFn: inputTicketingPerizinan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketingPerizinan"] });
            toaster.create({ title: "Berhasil update ticket", type: "success", duration: 3000 });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update ticket", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = ticketData.length;
        const buatBaru = ticketData.filter(i => i.request === "Perizinan Buat Baru").length;
        const perpanjang = ticketData.filter(i => i.request === "Perizinan Perpanjang").length;
        const orangDatang = ticketData.filter(i => i.request === "Perizinan Orang Datang").length;
        return { total, buatBaru, perpanjang, orangDatang };
    }, [ticketData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return ticketData;
        const lower = searchQuery.toLowerCase();
        return ticketData.filter(i =>
            (i.id_ticket && String(i.id_ticket).toLowerCase().includes(lower)) ||
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.request && String(i.request).toLowerCase().includes(lower)) ||
            (i.request_detail && String(i.request_detail).toLowerCase().includes(lower))
        );
    }, [ticketData, searchQuery]);

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

    const handleOpenInput = (ticket) => {
        setSelectedTicket(ticket);
        setTicketForm({ id_ticket: ticket.id_ticket || "", comment: "", status: "" });
        onOpen();
    };

    const handleSubmit = () => {
        if (!ticketForm.id_ticket) {
            toaster.create({ title: "ID Ticket tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        if (!ticketForm.comment.trim() && !ticketForm.status) {
            toaster.create({ title: "Isi minimal comment atau tandai DONE", type: "warning", duration: 2000 });
            return;
        }
        const payload = { id_ticket: ticketForm.id_ticket };
        if (ticketForm.comment.trim()) payload.comment = ticketForm.comment;
        if (ticketForm.status === "DONE") payload.status = "DONE";
        inputMutation.mutate(payload);
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
                    <h1>Ticketing Perizinan</h1>
                    <Text className="subtitle">Monitor dan update ticket perizinan yang masih open</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Ticket</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Buat Baru</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.buatBaru}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Perpanjang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.perpanjang}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Orang Datang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.orangDatang}</p>}
                    </InfoCard>
                </Box>

                {/* Search */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari ID ticket, nama, request..."
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
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data ticket perizinan</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada ticket perizinan open"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="id_ticket" label="ID Ticket" minWidth="130px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="150px" />
                                        <SortableHeader column="nama" label="Nama" minWidth="150px" />
                                        <SortableHeader column="request" label="Request" minWidth="180px" />
                                        <th style={{ minWidth: "200px" }}>Request Detail</th>
                                        <SortableHeader column="deadline" label="Deadline" minWidth="130px" />
                                        <th style={{ minWidth: "130px" }}>Responsible</th>
                                        <th style={{ minWidth: "130px" }}>No HP</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>Lampiran</th>
                                        <th style={{ minWidth: "160px" }}>Hasil</th>
                                        <th style={{ width: "110px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id_ticket || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.id_ticket || "-"}</td>
                                            <td>{String(item.timestamp || "-")}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>
                                                <Badge colorScheme={REQUEST_COLORS[item.request] || "gray"} fontSize="xs">
                                                    {item.request || "-"}
                                                </Badge>
                                            </td>
                                            <td>
                                                {item.request_detail?.length > 35 ? (
                                                    <Tooltip label={item.request_detail}>
                                                        <span>{item.request_detail.substring(0, 35)}...</span>
                                                    </Tooltip>
                                                ) : item.request_detail || "-"}
                                            </td>
                                            <td>{String(item.deadline || "-")}</td>
                                            <td>{item.responsible || "-"}</td>
                                            <td>{item.nomor_handphone || "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                {isValidUrl(item.lampiran) ? (
                                                    <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                        onClick={() => window.open(String(item.lampiran), "_blank", "noopener,noreferrer")}>
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
                                            </td>
                                            <td>
                                                {item.hasil?.length > 30 ? (
                                                    <Tooltip label={item.hasil}>
                                                        <span>{item.hasil.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.hasil || "-"}
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Button size="sm" colorScheme="teal" variant="outline"
                                                    onClick={() => handleOpenInput(item)}>
                                                    <FiMessageSquare style={{ marginRight: "4px" }} /> Update
                                                </Button>
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

                {/* Input Comment & Status Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Update Ticket — {selectedTicket?.id_ticket}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Info */}
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                                    <Text fontSize="sm" fontWeight="bold">{selectedTicket?.nama}</Text>
                                    <Badge mt={1} colorScheme={REQUEST_COLORS[selectedTicket?.request] || "gray"} fontSize="xs">
                                        {selectedTicket?.request}
                                    </Badge>
                                    {selectedTicket?.request_detail && (
                                        <Text fontSize="xs" color="gray.500" mt={1}>{selectedTicket.request_detail}</Text>
                                    )}
                                </Box>

                                <Box>
                                    <Text fontWeight="medium" mb={2}>Comment</Text>
                                    <Textarea
                                        value={ticketForm.comment}
                                        onChange={(e) => setTicketForm(prev => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Masukkan comment atau progress penanganan..."
                                        rows={4}
                                    />
                                </Box>

                                {/* Tandai DONE */}
                                <Box
                                    as="button"
                                    onClick={() => setTicketForm(prev => ({
                                        ...prev,
                                        status: prev.status === "DONE" ? "" : "DONE",
                                    }))}
                                    p={3} borderRadius="md" border="2px solid"
                                    borderColor={ticketForm.status === "DONE" ? "green.400" : (colorMode === "dark" ? "gray.600" : "gray.200")}
                                    bg={ticketForm.status === "DONE" ? (colorMode === "dark" ? "green.900" : "green.50") : "transparent"}
                                    transition="all 0.2s" cursor="pointer" textAlign="left" width="100%"
                                >
                                    <Flex align="center" gap={2}>
                                        <FiCheckCircle size={20} color={ticketForm.status === "DONE" ? "#48bb78" : "gray"} />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="bold">
                                                {ticketForm.status === "DONE" ? "✅ Ditandai DONE" : "Tandai sebagai DONE"}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                Status ticket akan berubah menjadi "Close"
                                            </Text>
                                        </Box>
                                    </Flex>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleSubmit} isLoading={inputMutation.isPending}>
                                Submit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default TicketingPerizinanPage;