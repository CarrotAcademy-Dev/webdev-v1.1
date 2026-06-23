import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import {
    createTicketingInternalFinance,
    getDataTicketInternalFinance,
    doneTicketInternalFinance,
} from "@/features/finance/financeApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Input, Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Stack, Text,
    Textarea, Tooltip, useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiClock, FiCheckCircle,
    FiInbox, FiList, FiSearch, FiPlus,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledTicketingInternalFin } from "./TicketingInternalFin.styled";

const EMPTY_SUBMIT_FORM = { id_ticket: "", nama_ticket: "", result: "", notes_input: "" };
const EMPTY_CREATE_FORM = {
    title: "", description: "", deadline: "", label: "",
    responsible: "", accountable: "", consulted: "", informed: "",
};

const PERSON_OPTIONS = [
    "Marcom", "ESO", "Finance - EDS", "Finance - AR",
    "CSO - CM", "CSO - YS", "JSD", "PAS", "LC",
    "NV", "MAF", "DN", "AS", "APH", "BA"
];

const LABEL_OPTIONS = [
    "Administration", "Review", "Research", "Procedure",
    "Recruitment", "Schedule", "Query", "Complaint",
    "Request", "Billing", "Feedback", "Offboarding",
    "Payment", "Artist Journal", "Siswa Tidak Proaktif",
    "Presensi Online", "Lost and Found", "Other"
];

const TicketingInternalFinancePage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();

    const {
        isOpen: isSubmitOpen, onOpen: onSubmitOpen, onClose: onSubmitClose,
    } = useDisclosure();
    const {
        isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose,
    } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [submitForm, setSubmitForm] = useState(EMPTY_SUBMIT_FORM);
    const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);

    const { data: ticketData = [], isLoading, isError } = useQuery({
        queryKey: ["ticketingInternalFinance"],
        queryFn: getDataTicketInternalFinance,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const submitMutation = useMutation({
        mutationFn: doneTicketInternalFinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketingInternalFinance"] });
            toaster.create({ title: "Ticket berhasil diselesaikan", type: "success", duration: 3000 });
            setSubmitForm(EMPTY_SUBMIT_FORM);
            onSubmitClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal menyelesaikan ticket",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    const createMutation = useMutation({
        mutationFn: createTicketingInternalFinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketingInternalFinance"] });
            toaster.create({ title: "Ticket berhasil dibuat", type: "success", duration: 3000 });
            setCreateForm(EMPTY_CREATE_FORM);
            onCreateClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal membuat ticket",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    const stats = useMemo(() => {
        const data = ticketData;
        return {
            total: data.length,
            open: data.filter(i => i.status === "Open").length,
            highPriority: data.filter(i => i.priority?.toLowerCase() === "high").length,
        };
    }, [ticketData]);

    const filteredData = useMemo(() => {
        const data = ticketData;
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.id_ticket && i.id_ticket.toLowerCase().includes(lower)) ||
            (i.nama_ticket && i.nama_ticket.toLowerCase().includes(lower)) ||
            (i.from_who && i.from_who.toLowerCase().includes(lower)) ||
            (i.label && i.label.toLowerCase().includes(lower))
        );
    }, [ticketData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key] || "";
            const bVal = b[sortConfig.key] || "";
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

    const handleOpenSubmit = (item) => {
        setSubmitForm({
            id_ticket: item.id_ticket || "",
            nama_ticket: item.nama_ticket || "",
            result: "",
            notes_input: "",
        });
        onSubmitOpen();
    };

    const handleSubmitDone = () => {
        if (!submitForm.id_ticket) {
            toaster.create({ title: "ID Ticket wajib diisi", type: "error", duration: 3000 });
            return;
        }
        submitMutation.mutate(submitForm);
    };

    const handleCreateSubmit = () => {
        const required = ["title", "description", "deadline", "label", "responsible"];
        const missing = required.find(k => !createForm[k]);
        if (missing) {
            toaster.create({ title: `Field "${missing}" wajib diisi`, type: "error", duration: 3000 });
            return;
        }
        createMutation.mutate(createForm);
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

    const ReadOnlyField = ({ label, value }) => (
        <Box>
            <Text fontWeight="medium" mb={2}>{label}</Text>
            <Input value={value || "-"} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
        </Box>
    );

    return (
        <ContainerCarrot>
            <StyledTicketingInternalFin colorMode={colorMode} data-theme={colorMode}>
                <Box className="header">
                    <h1>Ticketing Internal</h1>
                    <Text className="subtitle">Kelola ticket internal yang menjadi tanggung jawab Finance</Text>
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
                        <p>Open</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.open}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>High Priority</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.highPriority}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Create Button */}
                <Flex className="search-container" mb={4} justify="space-between" align="center" wrap="wrap" gap={3}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari ID, nama ticket, from, label..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={onCreateOpen} leftIcon={<FiPlus />}>
                        Buat Ticket
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={20} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data ticket</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada ticket open saat ini"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table style={{ minWidth: "2000px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                        <SortableHeader column="timeline" label="Timestamp" minWidth="160px" />
                                        <SortableHeader column="nama_ticket" label="Nama Ticket" minWidth="200px" />
                                        <th style={{ minWidth: "220px" }}>Description</th>
                                        <SortableHeader column="status" label="Status" minWidth="100px" />
                                        <SortableHeader column="deadline" label="Deadline" minWidth="130px" />
                                        <SortableHeader column="label" label="Label" minWidth="120px" />
                                        <SortableHeader column="priority" label="Priority" minWidth="100px" />
                                        <th style={{ minWidth: "140px" }}>From</th>
                                        <th style={{ minWidth: "160px" }}>Responsible</th>
                                        <th style={{ minWidth: "140px" }}>Accountable</th>
                                        <th style={{ minWidth: "140px" }}>Consulted</th>
                                        <th style={{ minWidth: "140px" }}>Informed</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={`${item.id_ticket}-${index}`}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.id_ticket || "-"}</td>
                                            <td>{item.timeline || "-"}</td>
                                            <td>
                                                {item.nama_ticket?.length > 30
                                                    ? <Tooltip label={item.nama_ticket}><span>{item.nama_ticket.substring(0, 30)}...</span></Tooltip>
                                                    : item.nama_ticket || "-"}
                                            </td>
                                            <td>
                                                {item.description?.length > 35
                                                    ? <Tooltip label={item.description}><span>{item.description.substring(0, 35)}...</span></Tooltip>
                                                    : item.description || "-"}
                                            </td>
                                            <td>{item.status || "-"}</td>
                                            <td>{item.deadline || "-"}</td>
                                            <td>{item.label || "-"}</td>
                                            <td>{item.priority || "-"}</td>
                                            <td>{item.from_who || "-"}</td>
                                            <td>{item.responsible || "-"}</td>
                                            <td>{item.accountable || "-"}</td>
                                            <td>{item.consulted || "-"}</td>
                                            <td>{item.informed || "-"}</td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Button
                                                    size="sm"
                                                    colorScheme="teal"
                                                    onClick={() => handleOpenSubmit(item)}
                                                >
                                                    Done
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

                {/* Submit Done Modal */}
                <Modal isOpen={isSubmitOpen} onClose={onSubmitClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Selesaikan Ticket</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <ReadOnlyField label="ID Ticket" value={submitForm.id_ticket} />
                                <ReadOnlyField label="Nama Ticket" value={submitForm.nama_ticket} />
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Result</Text>
                                    <Textarea
                                        value={submitForm.result}
                                        onChange={(e) => setSubmitForm(prev => ({ ...prev, result: e.target.value }))}
                                        placeholder="Isi hasil penyelesaian ticket"
                                        rows={3}
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Notes</Text>
                                    <Textarea
                                        value={submitForm.notes_input}
                                        onChange={(e) => setSubmitForm(prev => ({ ...prev, notes_input: e.target.value }))}
                                        placeholder="Catatan tambahan (opsional)"
                                        rows={3}
                                    />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onSubmitClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleSubmitDone} isLoading={submitMutation.isPending}>
                                Submit Done
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Create Ticket Modal */}
                <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Buat Ticket Baru</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Title */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Judul Ticket <Text as="span" color="red.500">*</Text></Text>
                                    <Input
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Contoh: Request Data Tagihan Siswa"
                                    />
                                </Box>

                                {/* Description */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Description <Text as="span" color="red.500">*</Text></Text>
                                    <Textarea
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Jelaskan detail task..."
                                        rows={4}
                                    />
                                </Box>

                                {/* Deadline + Label */}
                                <Flex gap={4}>
                                    <Box flex={1}>
                                        <Text fontWeight="medium" mb={2}>Deadline <Text as="span" color="red.500">*</Text></Text>
                                        <Input
                                            type="date"
                                            value={createForm.deadline}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, deadline: e.target.value }))}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Text fontWeight="medium" mb={2}>Label <Text as="span" color="red.500">*</Text></Text>
                                        <select
                                            value={createForm.label}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, label: e.target.value }))}
                                            style={{
                                                width: "100%", padding: "8px 12px", borderRadius: "6px",
                                                border: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
                                                background: colorMode === "dark" ? "#2d3748" : "#ffffff",
                                                color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <option value="">Pilih label</option>
                                            {LABEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </Box>
                                </Flex>

                                {/* Responsible */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Responsible <Text as="span" color="red.500">*</Text></Text>
                                    <select
                                        value={createForm.responsible}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, responsible: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "8px 12px", borderRadius: "6px",
                                            border: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
                                            background: colorMode === "dark" ? "#2d3748" : "#ffffff",
                                            color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <option value="">Pilih responsible</option>
                                        {PERSON_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </Box>

                                {/* Accountable + Consulted */}
                                <Flex gap={4}>
                                    <Box flex={1}>
                                        <Text fontWeight="medium" mb={2}>Accountable <Text as="span" color="gray.400" fontSize="sm">(opsional)</Text></Text>
                                        <select
                                            value={createForm.accountable}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, accountable: e.target.value }))}
                                            style={{
                                                width: "100%", padding: "8px 12px", borderRadius: "6px",
                                                border: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
                                                background: colorMode === "dark" ? "#2d3748" : "#ffffff",
                                                color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <option value="">Pilih accountable</option>
                                            {PERSON_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </Box>
                                    <Box flex={1}>
                                        <Text fontWeight="medium" mb={2}>Consulted <Text as="span" color="gray.400" fontSize="sm">(opsional)</Text></Text>
                                        <select
                                            value={createForm.consulted}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, consulted: e.target.value }))}
                                            style={{
                                                width: "100%", padding: "8px 12px", borderRadius: "6px",
                                                border: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
                                                background: colorMode === "dark" ? "#2d3748" : "#ffffff",
                                                color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <option value="">Pilih consulted</option>
                                            {PERSON_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </Box>
                                </Flex>

                                {/* Informed */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Informed <Text as="span" color="gray.400" fontSize="sm">(opsional)</Text></Text>
                                    <select
                                        value={createForm.informed}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, informed: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "8px 12px", borderRadius: "6px",
                                            border: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
                                            background: colorMode === "dark" ? "#2d3748" : "#ffffff",
                                            color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <option value="">Pilih informed</option>
                                        {PERSON_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onCreateClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleCreateSubmit} isLoading={createMutation.isPending}>
                                Buat Ticket
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledTicketingInternalFin>
        </ContainerCarrot>
    );
};

export default TicketingInternalFinancePage;