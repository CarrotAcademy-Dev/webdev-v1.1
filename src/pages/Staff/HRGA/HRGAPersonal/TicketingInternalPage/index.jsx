import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import {
    getDataTicketingInternal, getUtilsTicketingInternal,
    createTicketingInternal, doneTicketingInternal,
} from "@/features/hr/hrgaPersonalApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Skeleton, Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiCheckCircle, FiInbox,
    FiList, FiPlus, FiSearch,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const EMPTY_CREATE_FORM = {
    title: "", description: "", deadline: "", label: "",
    responsible: "", accountable: "", consulted: "", informed: "", person: "",
};

const EMPTY_DONE_FORM = {
    id_ticket: "", pic: "", result: "", notes: "",
};

const TicketingInternalHRGAPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const { isOpen: isDoneOpen, onOpen: onDoneOpen, onClose: onDoneClose } = useDisclosure();

    const [kodeNama, setKodeNama] = useState("");
    const [appliedKodeNama, setAppliedKodeNama] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
    const [doneForm, setDoneForm] = useState(EMPTY_DONE_FORM);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch utils (dropdown data)
    const { data: utils } = useQuery({
        queryKey: ["utilsTicketingInternal"],
        queryFn: getUtilsTicketingInternal,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const labelList = utils?.label_data || [];
    const personList = utils?.person_data || [];
    const personNames = personList.map(p => p.kode_nama).filter(Boolean);

    // Fetch ticket data berdasarkan kode_nama
    const { data: ticketData = [], isLoading, isError, isFetching } = useQuery({
        queryKey: ["ticketingInternal", appliedKodeNama],
        queryFn: () => getDataTicketingInternal(appliedKodeNama),
        staleTime: 3 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!appliedKodeNama,
    });

    const createMutation = useMutation({
        mutationFn: createTicketingInternal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketingInternal"] });
            toaster.create({ title: "Berhasil buat ticket baru", type: "success", duration: 3000 });
            setCreateForm(EMPTY_CREATE_FORM);
            onCreateClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal buat ticket", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const doneMutation = useMutation({
        mutationFn: doneTicketingInternal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketingInternal"] });
            toaster.create({ title: "Ticket berhasil ditutup", type: "success", duration: 3000 });
            onDoneClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tutup ticket", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        total: ticketData.length,
        uniqueLabel: new Set(ticketData.map(i => i.label).filter(Boolean)).size,
        uniqueResponsible: new Set(ticketData.map(i => i.responsible).filter(Boolean)).size,
    }), [ticketData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return ticketData;
        const lower = searchQuery.toLowerCase();
        return ticketData.filter(i =>
            (i.nama_ticket && String(i.nama_ticket).toLowerCase().includes(lower)) ||
            (i.label && String(i.label).toLowerCase().includes(lower)) ||
            (i.responsible && String(i.responsible).toLowerCase().includes(lower))
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
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

    const handleTampilkan = () => {
        if (!kodeNama.trim()) {
            toaster.create({ title: "Masukkan kode nama", type: "warning", duration: 2000 });
            return;
        }
        setAppliedKodeNama(kodeNama.trim());
        setCurrentPage(1);
    };

    const handleOpenDone = (item) => {
        setSelectedItem(item);
        setDoneForm({ id_ticket: item.id_ticket || "", pic: kodeNama, result: "", notes: "" });
        onDoneOpen();
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = () => {
        const required = ["title", "description", "deadline", "label", "responsible"];
        const missing = required.filter(k => !createForm[k]?.trim());
        if (missing.length > 0) {
            toaster.create({ title: `Field wajib diisi: ${missing.join(", ")}`, type: "warning", duration: 3000 });
            return;
        }
        createMutation.mutate({ ...createForm, person: createForm.responsible });
    };

    const handleDoneSubmit = () => {
        if (!doneForm.id_ticket || !doneForm.pic) {
            toaster.create({ title: "ID Ticket dan PIC wajib ada", type: "warning", duration: 2000 });
            return;
        }
        doneMutation.mutate(doneForm);
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Ticketing Internal</h1>
                    <Text className="subtitle">Kelola tiket internal berdasarkan kode nama responsible</Text>
                </Box>

                {/* Filter Kode Nama */}
                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p={4} mb={6}>
                    <Flex gap={3} align="flex-end" wrap="wrap">
                        <Box flex={1} maxW="300px">
                            <Text fontWeight="medium" mb={2} fontSize="sm">Kode Nama</Text>
                            <Select
                                value={kodeNama}
                                onChange={(e) => setKodeNama(e.target.value)}
                                placeholder="- Pilih kode nama -"
                            >
                                {personNames.map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </Box>
                        <Button colorScheme="teal" onClick={handleTampilkan} isLoading={isFetching}>
                            Tampilkan
                        </Button>
                        <Button
                            colorScheme="teal"
                            variant="outline"
                            onClick={() => { setCreateForm({ ...EMPTY_CREATE_FORM, responsible: kodeNama }); onCreateOpen(); }}
                        >
                            <FiPlus style={{ marginRight: "6px" }} /> Buat Ticket
                        </Button>
                    </Flex>
                </Box>

                {!appliedKodeNama ? (
                    <Flex className="empty-state">
                        <FiList size={48} />
                        <Text>Pilih kode nama lalu klik "Tampilkan"</Text>
                    </Flex>
                ) : (
                    <>
                        <Box className="stats-grid" mb={6}>
                            <InfoCard>
                                <FiList size={28} />
                                <p>Open Tickets</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                            </InfoCard>
                            <InfoCard>
                                <FiList size={28} />
                                <p>Jumlah Label</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueLabel}</p>}
                            </InfoCard>
                            <InfoCard>
                                <FiList size={28} />
                                <p>Responsible</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{appliedKodeNama}</p>}
                            </InfoCard>
                        </Box>

                        <Flex className="search-container" mb={4}>
                            <Box position="relative" width="100%" maxWidth="400px">
                                <Input
                                    placeholder="Cari nama ticket, label..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    pl="40px"
                                />
                                <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                    <FiSearch size={18} />
                                </Box>
                            </Box>
                        </Flex>

                        <Box className="table-wrapper">
                            {isLoading ? (
                                <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                            ) : isError ? (
                                <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data ticket</Text></Flex>
                            ) : sortedData.length === 0 ? (
                                <Flex className="empty-state">
                                    <FiInbox size={48} />
                                    <Text>Tidak ada open ticket untuk {appliedKodeNama}</Text>
                                </Flex>
                            ) : (
                                <>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: "50px" }}>No</th>
                                                <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                                <SortableHeader column="nama_ticket" label="Nama Ticket" minWidth="180px" />
                                                <th style={{ minWidth: "200px" }}>Description</th>
                                                <SortableHeader column="deadline" label="Deadline" minWidth="120px" />
                                                <SortableHeader column="label" label="Label" minWidth="120px" />
                                                <th style={{ minWidth: "100px" }}>Type</th>
                                                <th style={{ minWidth: "100px" }}>Priority</th>
                                                <th style={{ minWidth: "130px" }}>From</th>
                                                <th style={{ minWidth: "130px" }}>Responsible</th>
                                                <th style={{ minWidth: "160px" }}>Result</th>
                                                <th style={{ minWidth: "160px" }}>Notes</th>
                                                <th style={{ width: "100px", position: "sticky", right: 0 }}>Done</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((item, index) => (
                                                <tr key={item.id_ticket || index}>
                                                    <td>{startIndex + index + 1}</td>
                                                    <td>{item.id_ticket || "-"}</td>
                                                    <td>{item.nama_ticket || "-"}</td>
                                                    <td>
                                                        {item.description?.length > 35 ? (
                                                            <Tooltip label={item.description}><span>{item.description.substring(0, 35)}...</span></Tooltip>
                                                        ) : item.description || "-"}
                                                    </td>
                                                    <td>{String(item.deadline || "-")}</td>
                                                    <td>{item.label || "-"}</td>
                                                    <td>{item.type || "-"}</td>
                                                    <td>{item.priority || "-"}</td>
                                                    <td>{item.from_who || "-"}</td>
                                                    <td>{item.responsible || "-"}</td>
                                                    <td>
                                                        {item.result?.length > 25 ? (
                                                            <Tooltip label={item.result}><span>{item.result.substring(0, 25)}...</span></Tooltip>
                                                        ) : item.result || "-"}
                                                    </td>
                                                    <td>
                                                        {item.notes?.length > 25 ? (
                                                            <Tooltip label={item.notes}><span>{item.notes.substring(0, 25)}...</span></Tooltip>
                                                        ) : item.notes || "-"}
                                                    </td>
                                                    <td style={{ position: "sticky", right: 0 }}>
                                                        <Button size="sm" colorScheme="green" variant="outline" onClick={() => handleOpenDone(item)}>
                                                            <FiCheckCircle style={{ marginRight: "4px" }} /> Done
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
                    </>
                )}

                {/* Create Ticket Modal */}
                <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Buat Ticket Internal Baru</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Judul Ticket <Text as="span" color="red.500">*</Text></Text>
                                    <Input name="title" value={createForm.title} onChange={handleCreateChange} placeholder="Judul ticket" />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Description <Text as="span" color="red.500">*</Text></Text>
                                    <Textarea name="description" value={createForm.description} onChange={handleCreateChange} rows={3} />
                                </Box>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                    <Box>
                                        <Text fontWeight="medium" mb={2}>Deadline <Text as="span" color="red.500">*</Text></Text>
                                        <Input name="deadline" type="date" value={createForm.deadline} onChange={handleCreateChange} />
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" mb={2}>Label <Text as="span" color="red.500">*</Text></Text>
                                        <Select name="label" value={createForm.label} onChange={handleCreateChange} placeholder="- Pilih Label -">
                                            {labelList.map(l => <option key={l} value={l}>{l}</option>)}
                                        </Select>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" mb={2}>Responsible <Text as="span" color="red.500">*</Text></Text>
                                        <Select name="responsible" value={createForm.responsible} onChange={handleCreateChange} placeholder="- Pilih -">
                                            {personNames.map(p => <option key={p} value={p}>{p}</option>)}
                                        </Select>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" mb={2}>Accountable</Text>
                                        <Select name="accountable" value={createForm.accountable} onChange={handleCreateChange} placeholder="- Pilih -">
                                            {personNames.map(p => <option key={p} value={p}>{p}</option>)}
                                        </Select>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" mb={2}>Consulted</Text>
                                        <Input name="consulted" value={createForm.consulted} onChange={handleCreateChange} placeholder="Kode nama" />
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" mb={2}>Informed</Text>
                                        <Input name="informed" value={createForm.informed} onChange={handleCreateChange} placeholder="Kode nama" />
                                    </Box>
                                </Grid>
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

                {/* Done Ticket Modal */}
                <Modal isOpen={isDoneOpen} onClose={onDoneClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Close Ticket — {selectedItem?.id_ticket}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                                    <Text fontSize="sm" fontWeight="bold">{selectedItem?.nama_ticket}</Text>
                                    <Text fontSize="xs" color="gray.500">{selectedItem?.description}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>PIC <Text as="span" color="red.500">*</Text></Text>
                                    <Input value={doneForm.pic} onChange={(e) => setDoneForm(prev => ({ ...prev, pic: e.target.value }))} placeholder="Kode nama PIC" />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Result</Text>
                                    <Textarea value={doneForm.result} onChange={(e) => setDoneForm(prev => ({ ...prev, result: e.target.value }))} rows={3} placeholder="Hasil pengerjaan..." />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Notes</Text>
                                    <Textarea value={doneForm.notes} onChange={(e) => setDoneForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Catatan tambahan..." />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onDoneClose}>Batal</Button>
                            <Button colorScheme="green" onClick={handleDoneSubmit} isLoading={doneMutation.isPending}>
                                Close Ticket
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default TicketingInternalHRGAPage;