/* eslint-disable react-hooks/exhaustive-deps */
import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getOnboarding, editOnboarding, tambahOnboarding, deleteOnboarding } from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Checkbox, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, useColorMode, useDisclosure, Badge,
    Tabs, TabList, Tab, TabPanels, TabPanel,
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

const CHECKBOX_FIELDS = [
    { key: "finished", label: "Finished" },
    { key: "h_7", label: "H-7" },
    { key: "h_3", label: "H-3" },
    { key: "h_1", label: "H-1" },
    { key: "offering_letter", label: "Offering Letter" },
    { key: "kartu_absensi", label: "Kartu Absensi" },
    { key: "pasfoto", label: "Pasfoto" },
    { key: "fotocopy_ktp", label: "Fotocopy KTP" },
    { key: "fotocopy_kk", label: "Fotocopy KK" },
    { key: "fotocopy_ijazah", label: "Fotocopy Ijazah" },
    { key: "no_rekening", label: "No Rekening" },
    { key: "link_dropbox", label: "Link Dropbox" },
    { key: "email_login", label: "Email Login" },
    { key: "pp", label: "PP" },
    { key: "spk", label: "SPK" },
];

const EMPTY_ADD_FORM = {
    full_name: "", email_address: "", phone: "", position: "",
    onboarding_date: "", jam_kehadiran: "", notes: "", shift: "",
    unique_id: "", pic: "",
};

const EMPTY_EDIT_FORM = CHECKBOX_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: false }), { unique_id: "" });

const OnboardingPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
    const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["onboarding"],
        queryFn: getOnboarding,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const unfinished = useMemo(() => data?.unfinished || [], [data]);
    const finished = useMemo(() => data?.finished || [], [data]);

    const addMutation = useMutation({
        mutationFn: tambahOnboarding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            toaster.create({ title: "Berhasil tambah onboarding", type: "success", duration: 3000 });
            setAddForm(EMPTY_ADD_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editOnboarding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            toaster.create({ title: "Berhasil update onboarding", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOnboarding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            toaster.create({ title: "Berhasil hapus onboarding", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        total: unfinished.length + finished.length,
        unfinished: unfinished.length,
        finished: finished.length,
    }), [unfinished, finished]);

    const filterSort = (arr) => {
        let data = arr;
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            data = data.filter(i =>
                (i.full_name && String(i.full_name).toLowerCase().includes(lower)) ||
                (i.position && String(i.position).toLowerCase().includes(lower)) ||
                (i.unique_id && String(i.unique_id).toLowerCase().includes(lower))
            );
        }
        if (sortConfig.key) {
            data = [...data].sort((a, b) => {
                const aVal = String(a[sortConfig.key] || "").toLowerCase();
                const bVal = String(b[sortConfig.key] || "").toLowerCase();
                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return data;
    };

    const filteredUnfinished = useMemo(() => filterSort(unfinished), [unfinished, searchQuery, sortConfig]);
    const filteredFinished = useMemo(() => filterSort(finished), [finished, searchQuery, sortConfig]);

    const unfinishedPagination = usePagination(filteredUnfinished, 20);
    const finishedPagination = usePagination(filteredFinished, 20);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

    const handleOpenEdit = (item) => {
        const form = { unique_id: item.unique_id || "" };
        CHECKBOX_FIELDS.forEach(({ key }) => { form[key] = isTruthy(item[key]); });
        setEditForm(form);
        onEditOpen();
    };

    const handleOpenDelete = (item) => { setSelectedItem(item); onDeleteOpen(); };

    const handleAddSubmit = () => {
        if (!addForm.full_name?.trim() || !addForm.unique_id?.trim()) {
            toaster.create({ title: "Nama dan Unique ID wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(addForm);
    };

    const handleEditSubmit = () => {
        if (!editForm.unique_id) {
            toaster.create({ title: "Unique ID tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        const payload = { unique_id: editForm.unique_id };
        CHECKBOX_FIELDS.forEach(({ key }) => { payload[key] = editForm[key] ? "TRUE" : "FALSE"; });
        editMutation.mutate(payload);
    };

    const handleCheckboxToggle = (key) => {
        setEditForm(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const OnboardingTable = ({ pagination }) => {
        const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = pagination;
        return (
            <Box className="table-wrapper">
                {currentItems.length === 0 ? (
                    <Flex className="empty-state"><FiInbox size={48} /><Text>{searchQuery ? "Tidak ada hasil" : "Tidak ada data"}</Text></Flex>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "50px" }}>No</th>
                                    <SortableHeader column="full_name" label="Nama" minWidth="160px" />
                                    <SortableHeader column="position" label="Posisi" minWidth="140px" />
                                    <th style={{ minWidth: "130px" }}>Tgl Onboarding</th>
                                    <th style={{ minWidth: "120px" }}>Jam Kehadiran</th>
                                    <th style={{ minWidth: "100px" }}>Shift</th>
                                    <th style={{ minWidth: "100px" }}>PIC</th>
                                    <th style={{ minWidth: "80px", textAlign: "center" }}>H-7</th>
                                    <th style={{ minWidth: "80px", textAlign: "center" }}>H-3</th>
                                    <th style={{ minWidth: "80px", textAlign: "center" }}>H-1</th>
                                    <th style={{ minWidth: "100px", textAlign: "center" }}>Offering</th>
                                    <th style={{ minWidth: "90px", textAlign: "center" }}>Finished</th>
                                    <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={item.unique_id || index}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{item.full_name || "-"}</td>
                                        <td>{item.position || "-"}</td>
                                        <td>{item.onboarding_date || "-"}</td>
                                        <td>{item.jam_kehadiran || "-"}</td>
                                        <td>{item.shift || "-"}</td>
                                        <td>{item.pic || "-"}</td>
                                        {["h_7", "h_3", "h_1", "offering_letter", "finished"].map(k => (
                                            <td key={k} style={{ textAlign: "center" }}>
                                                {isTruthy(item[k]) ? "✅" : "❌"}
                                            </td>
                                        ))}
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
        );
    };

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Onboarding</h1>
                    <Text className="subtitle">Kelola proses onboarding karyawan baru</Text>
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
                </Box>

                <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input placeholder="Cari nama, posisi, unique ID..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} pl="40px" />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none"><FiSearch size={18} /></Box>
                    </Box>
                    <Button colorScheme="teal" onClick={() => { setAddForm(EMPTY_ADD_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Onboarding
                    </Button>
                </Flex>

                {isLoading ? (
                    <Box p={4}><Skeleton count={8} height={40} style={{ marginBottom: "8px" }} /></Box>
                ) : isError ? (
                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data onboarding</Text></Flex>
                ) : (
                    <Tabs colorScheme="teal">
                        <TabList mb={4}>
                            <Tab fontWeight="600">Unfinished ({stats.unfinished})</Tab>
                            <Tab fontWeight="600">Finished ({stats.finished})</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}><OnboardingTable pagination={unfinishedPagination} /></TabPanel>
                            <TabPanel px={0}><OnboardingTable pagination={finishedPagination} /></TabPanel>
                        </TabPanels>
                    </Tabs>
                )}

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Tambah Onboarding Baru</ModalHeader><ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                    {[
                                        { label: "Full Name *", name: "full_name" },
                                        { label: "Unique ID *", name: "unique_id" },
                                        { label: "Email Address", name: "email_address", type: "email" },
                                        { label: "Phone", name: "phone" },
                                        { label: "Position", name: "position" },
                                        { label: "PIC", name: "pic" },
                                        { label: "Onboarding Date", name: "onboarding_date", type: "date" },
                                        { label: "Jam Kehadiran", name: "jam_kehadiran" },
                                        { label: "Shift", name: "shift" },
                                    ].map(({ label, name, type = "text" }) => (
                                        <Box key={name}>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
                                            <Input name={name} value={addForm[name] || ""} type={type}
                                                onChange={(e) => setAddForm(prev => ({ ...prev, [name]: e.target.value }))} size="sm" />
                                        </Box>
                                    ))}
                                </Grid>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Notes</Text>
                                    <Input name="notes" value={addForm.notes || ""}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, notes: e.target.value }))} size="sm" />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>Tambah</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal — Checklist */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Update Checklist Onboarding</ModalHeader><ModalCloseButton />
                        <ModalBody>
                            <Stack gap={3}>
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                        ℹ️ Hanya kolom checklist yang bisa diedit (J-Y kecuali PIC).
                                    </Text>
                                </Box>
                                <Grid templateColumns="1fr 1fr" gap={2}>
                                    {CHECKBOX_FIELDS.map(({ key, label }) => (
                                        <Flex key={key} align="center" gap={2} p={2} borderRadius="md"
                                            bg={editForm[key] ? (colorMode === "dark" ? "teal.900" : "teal.50") : "transparent"}
                                            border="1px solid"
                                            borderColor={editForm[key] ? "teal.400" : (colorMode === "dark" ? "gray.600" : "gray.200")}
                                            cursor="pointer" onClick={() => handleCheckboxToggle(key)}>
                                            <Checkbox isChecked={editForm[key]} onChange={() => handleCheckboxToggle(key)}
                                                colorScheme="teal" onClick={(e) => e.stopPropagation()} />
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
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Onboarding</AlertDialogHeader>
                            <AlertDialogBody>Yakin hapus onboarding <strong>{selectedItem?.full_name}</strong>?</AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>Batal</Button>
                                <Button colorScheme="red" onClick={() => deleteMutation.mutate(selectedItem?.unique_id)} ml={3}
                                    isLoading={deleteMutation.isPending}>Hapus</Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default OnboardingPage;