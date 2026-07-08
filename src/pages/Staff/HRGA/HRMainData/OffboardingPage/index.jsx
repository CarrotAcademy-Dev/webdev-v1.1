import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getOffboarding, editOffboarding, tambahOffboarding, deleteOffboarding } from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Checkbox, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Text, useColorMode, useDisclosure, Badge,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox, FiList,
    FiPlus, FiSearch, FiTrash2, FiCheckCircle, FiClock,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isTruthy = (val) => val === true || String(val).toUpperCase() === "TRUE";

const STATUS_OPTIONS = ["Finished", "Unfinished", "Rejected"];
const STATUS_COLORS = { "Finished": "green", "Unfinished": "orange", "Rejected": "red" };

const EMPTY_ADD = {
    name: "", position: "", email_address: "", phone: "",
    offboarding_date: "", offboarding_time: "", pic: "",
};

const EMPTY_EDIT = {
    row: "", offboarding_time: "", pic: "",
    surat_offboarding: false, pp: false, paklaring: false, status: "",
};

const OffboardingPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [addForm, setAddForm] = useState(EMPTY_ADD);
    const [editForm, setEditForm] = useState(EMPTY_EDIT);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: offboardingData = [], isLoading, isError } = useQuery({
        queryKey: ["offboarding"],
        queryFn: getOffboarding,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: tambahOffboarding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offboarding"] });
            toaster.create({ title: "Berhasil tambah offboarding", type: "success", duration: 3000 });
            setAddForm(EMPTY_ADD);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editOffboarding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offboarding"] });
            toaster.create({ title: "Berhasil update offboarding", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOffboarding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offboarding"] });
            toaster.create({ title: "Berhasil hapus offboarding", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        total: offboardingData.length,
        finished: offboardingData.filter(i => i.status === "Finished").length,
        unfinished: offboardingData.filter(i => i.status === "Unfinished").length,
        allDone: offboardingData.filter(i => isTruthy(i.all_done)).length,
    }), [offboardingData]);

    const filteredData = useMemo(() => {
        let data = offboardingData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.name && String(i.name).toLowerCase().includes(lower)) ||
            (i.position && String(i.position).toLowerCase().includes(lower)) ||
            (i.pic && String(i.pic).toLowerCase().includes(lower))
        );
    }, [offboardingData, searchQuery, filterStatus]);

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

    const handleOpenEdit = (item) => {
        setEditForm({
            row: String(item.row || ""),
            offboarding_time: item.offboarding_time || "",
            pic: item.pic || "",
            surat_offboarding: isTruthy(item.surat_offboarding),
            pp: isTruthy(item.pp),
            paklaring: isTruthy(item.paklaring),
            status: item.status || "",
        });
        onEditOpen();
    };

    const handleOpenDelete = (item) => { setSelectedItem(item); onDeleteOpen(); };

    const handleEditSubmit = () => {
        if (!editForm.row) {
            toaster.create({ title: "Row tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate({
            row: editForm.row,
            offboarding_time: editForm.offboarding_time,
            pic: editForm.pic,
            surat_offboarding: editForm.surat_offboarding ? "TRUE" : "FALSE",
            pp: editForm.pp ? "TRUE" : "FALSE",
            paklaring: editForm.paklaring ? "TRUE" : "FALSE",
            status: editForm.status,
        });
    };

    const handleAddSubmit = () => {
        if (!addForm.name?.trim()) {
            toaster.create({ title: "Nama wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(addForm);
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Offboarding</h1>
                    <Text className="subtitle">Kelola proses offboarding karyawan</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard><FiList size={28} /><p>Total</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard><FiClock size={28} /><p>Unfinished</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.unfinished > 0 ? "#ed8936" : "inherit" }}>{stats.unfinished}</p>
                        )}
                    </InfoCard>
                    <InfoCard><FiCheckCircle size={28} /><p>Finished</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.finished}</p>}
                    </InfoCard>
                    <InfoCard><FiCheckCircle size={28} /><p>All Done</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.allDone}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Flex gap={3} wrap="wrap" flex={1}>
                        <Box position="relative" maxWidth="320px" width="100%">
                            <Input placeholder="Cari nama, posisi, PIC..."
                                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} pl="40px" />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none"><FiSearch size={18} /></Box>
                        </Box>
                        <Select maxW="180px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                            <option value="all">Semua Status</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Flex>
                    <Button colorScheme="teal" onClick={() => { setAddForm(EMPTY_ADD); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah
                    </Button>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>{searchQuery ? "Tidak ada hasil" : "Belum ada data offboarding"}</Text></Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="name" label="Nama" minWidth="160px" />
                                        <SortableHeader column="position" label="Posisi" minWidth="140px" />
                                        <th style={{ minWidth: "130px" }}>Email</th>
                                        <th style={{ minWidth: "120px" }}>Phone</th>
                                        <th style={{ minWidth: "130px" }}>Tgl Offboarding</th>
                                        <th style={{ minWidth: "100px" }}>Waktu</th>
                                        <th style={{ minWidth: "100px" }}>PIC</th>
                                        <th style={{ minWidth: "90px", textAlign: "center" }}>Surat</th>
                                        <th style={{ minWidth: "70px", textAlign: "center" }}>PP</th>
                                        <th style={{ minWidth: "90px", textAlign: "center" }}>Paklaring</th>
                                        <th style={{ minWidth: "90px", textAlign: "center" }}>All Done</th>
                                        <SortableHeader column="status" label="Status" minWidth="120px" />
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.name || "-"}</td>
                                            <td>{item.position || "-"}</td>
                                            <td>{item.email_address || "-"}</td>
                                            <td>{item.phone || "-"}</td>
                                            <td>{item.offboarding_date || "-"}</td>
                                            <td>{item.offboarding_time || "-"}</td>
                                            <td>{item.pic || "-"}</td>
                                            {["surat_offboarding", "pp", "paklaring", "all_done"].map(k => (
                                                <td key={k} style={{ textAlign: "center" }}>{isTruthy(item[k]) ? "✅" : "❌"}</td>
                                            ))}
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>{item.status || "-"}</Badge>
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Flex gap={1}>
                                                    <IconButton size="sm" backgroundColor="teal.400" variant="ghost" onClick={() => handleOpenEdit(item)}>
                                                        <FiEdit2 />
                                                    </IconButton>
                                                    <IconButton size="sm" colorScheme="red" variant="ghost" onClick={() => handleOpenDelete(item)}>
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </Flex>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <Flex justify="center" mt={4}>
                                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage}
                                        startIndex={startIndex} endIndex={endIndex} totalItems={totalItems} />
                                </Flex>
                            )}
                        </>
                    )}
                </Box>

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Tambah Offboarding</ModalHeader><ModalCloseButton />
                        <ModalBody>
                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                {[
                                    { label: "Nama *", name: "name" }, { label: "Posisi", name: "position" },
                                    { label: "Email", name: "email_address", type: "email" }, { label: "Phone", name: "phone" },
                                    { label: "Offboarding Date", name: "offboarding_date", type: "date" },
                                    { label: "Offboarding Time", name: "offboarding_time", type: "time" },
                                    { label: "PIC", name: "pic" },
                                ].map(({ label, name, type = "text" }) => (
                                    <Box key={name}>
                                        <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
                                        <Input name={name} value={addForm[name] || ""} type={type}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, [name]: e.target.value }))} size="sm" />
                                    </Box>
                                ))}
                            </Grid>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>Tambah</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Edit Offboarding</ModalHeader><ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Grid templateColumns="1fr 1fr" gap={3}>
                                    <Box>
                                        <Text fontWeight="medium" mb={2} fontSize="sm">Offboarding Time</Text>
                                        <Input type="time" value={editForm.offboarding_time}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, offboarding_time: e.target.value }))} size="sm" />
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" mb={2} fontSize="sm">PIC</Text>
                                        <Input value={editForm.pic}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, pic: e.target.value }))} size="sm" />
                                    </Box>
                                </Grid>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Status</Text>
                                    <Select value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))} size="sm"
                                        placeholder="- Pilih Status -">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Select>
                                </Box>
                                <Grid templateColumns="1fr 1fr 1fr" gap={2}>
                                    {[
                                        { key: "surat_offboarding", label: "Surat Offboarding" },
                                        { key: "pp", label: "PP" },
                                        { key: "paklaring", label: "Paklaring" },
                                    ].map(({ key, label }) => (
                                        <Flex key={key} align="center" gap={2} p={2} borderRadius="md" border="1px solid"
                                            borderColor={editForm[key] ? "teal.400" : (colorMode === "dark" ? "gray.600" : "gray.200")}
                                            bg={editForm[key] ? (colorMode === "dark" ? "teal.900" : "teal.50") : "transparent"}
                                            cursor="pointer" onClick={() => setEditForm(prev => ({ ...prev, [key]: !prev[key] }))}>
                                            <Checkbox isChecked={editForm[key]} colorScheme="teal"
                                                onChange={() => setEditForm(prev => ({ ...prev, [key]: !prev[key] }))}
                                                onClick={(e) => e.stopPropagation()} />
                                            <Text fontSize="sm">{label}</Text>
                                        </Flex>
                                    ))}
                                </Grid>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>Simpan</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Offboarding</AlertDialogHeader>
                            <AlertDialogBody>Yakin hapus offboarding <strong>{selectedItem?.name}</strong>?</AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>Batal</Button>
                                <Button colorScheme="red" onClick={() => deleteMutation.mutate(selectedItem?.row)} ml={3}
                                    isLoading={deleteMutation.isPending}>Hapus</Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default OffboardingPage;