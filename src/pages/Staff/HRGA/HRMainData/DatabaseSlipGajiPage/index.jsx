import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import {
    getDatabaseSlipGaji, editDatabaseSlipGaji,
    tambahDatabaseSlipGaji, deleteDatabaseSlipGaji,
} from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Switch, Text, Tooltip, useColorMode, useDisclosure,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiPlus, FiSearch, FiTrash2, FiCheckCircle, FiDollarSign,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isTruthy = (val) => val === true || String(val).toUpperCase() === "TRUE";

const EMPTY_FORM = {
    id_karyawan: "", nama: "", nama_jabatan: "", tingkat_pekerjaan: "",
    status: "", npwp: "", email: "", durasi_kerja: "", periode_gaji: "",
    jumlah: "", hari_kerja: "", jam_kerja: "", checklist: false,
};

const DatabaseSlipGajiPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: slipData = [], isLoading, isError } = useQuery({
        queryKey: ["databaseSlipGaji"],
        queryFn: getDatabaseSlipGaji,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: tambahDatabaseSlipGaji,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseSlipGaji"] });
            toaster.create({ title: "Berhasil tambah slip gaji", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editDatabaseSlipGaji,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseSlipGaji"] });
            toaster.create({ title: "Berhasil update slip gaji", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDatabaseSlipGaji,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseSlipGaji"] });
            toaster.create({ title: "Berhasil hapus slip gaji", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Quick toggle checklist langsung dari tabel
    const toggleMutation = useMutation({
        mutationFn: editDatabaseSlipGaji,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseSlipGaji"] });
        },
    });

    const stats = useMemo(() => {
        const total = slipData.length;
        const sudahChecklist = slipData.filter(i => isTruthy(i.checklist)).length;
        const sudahTransfer = slipData.filter(i => isTruthy(i.done_transfer)).length;
        return { total, sudahChecklist, sudahTransfer };
    }, [slipData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return slipData;
        const lower = searchQuery.toLowerCase();
        return slipData.filter(i =>
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.id_karyawan && String(i.id_karyawan).toLowerCase().includes(lower)) ||
            (i.nama_jabatan && String(i.nama_jabatan).toLowerCase().includes(lower)) ||
            (i.periode_gaji && String(i.periode_gaji).toLowerCase().includes(lower))
        );
    }, [slipData, searchQuery]);

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
        setFormData({
            id_karyawan: item.id_karyawan || "",
            nama: item.nama || "",
            nama_jabatan: item.nama_jabatan || "",
            tingkat_pekerjaan: item.tingkat_pekerjaan || "",
            status: item.status || "",
            npwp: item.npwp || "",
            email: item.email || "",
            durasi_kerja: item.durasi_kerja || "",
            periode_gaji: item.periode_gaji || "",
            jumlah: item.jumlah || "",
            hari_kerja: item.hari_kerja || "",
            jam_kerja: item.jam_kerja || "",
            checklist: isTruthy(item.checklist),
        });
        onEditOpen();
    };

    const handleOpenDelete = (item) => { setSelectedItem(item); onDeleteOpen(); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        if (!formData.id_karyawan?.trim()) {
            toaster.create({ title: "ID Karyawan wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate({
            ...formData,
            checklist: formData.checklist ? "TRUE" : "FALSE",
        });
    };

    const handleEditSubmit = () => {
        if (!formData.id_karyawan) {
            toaster.create({ title: "ID Karyawan tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate({
            id_karyawan: formData.id_karyawan,
            nama: formData.nama,
            checklist: formData.checklist ? "TRUE" : "FALSE",
        });
    };

    const handleQuickToggle = (item) => {
        toggleMutation.mutate({
            id_karyawan: item.id_karyawan,
            checklist: isTruthy(item.checklist) ? "FALSE" : "TRUE",
        });
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const FormFields = ({ isEdit }) => (
        <Stack gap={4}>
            <Box>
                <Text fontWeight="medium" mb={2} fontSize="sm">ID Karyawan {!isEdit && <Text as="span" color="red.500">*</Text>}</Text>
                <Input name="id_karyawan" value={formData.id_karyawan} onChange={handleInputChange} size="sm"
                    isReadOnly={isEdit} bg={isEdit ? (colorMode === "dark" ? "gray.700" : "gray.100") : undefined} />
            </Box>
            {!isEdit && (
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    {[
                        { label: "Nama", name: "nama" }, { label: "Nama Jabatan", name: "nama_jabatan" },
                        { label: "Tingkat Pekerjaan", name: "tingkat_pekerjaan" }, { label: "Status", name: "status" },
                        { label: "NPWP", name: "npwp" }, { label: "Email", name: "email" },
                        { label: "Durasi Kerja", name: "durasi_kerja" }, { label: "Periode Gaji", name: "periode_gaji" },
                        { label: "Jumlah", name: "jumlah" }, { label: "Hari Kerja", name: "hari_kerja" },
                        { label: "Jam Kerja", name: "jam_kerja" },
                    ].map(({ label, name }) => (
                        <Box key={name}>
                            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
                            <Input name={name} value={formData[name] ?? ""} onChange={handleInputChange} size="sm" />
                        </Box>
                    ))}
                </Grid>
            )}
            {isEdit && (
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Nama</Text>
                    <Input name="nama" value={formData.nama} onChange={handleInputChange} size="sm" />
                </Box>
            )}
            <Flex align="center" justify="space-between" p={3} borderRadius="md" border="1px solid"
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                <Box>
                    <Text fontSize="sm" fontWeight="medium">Checklist</Text>
                    <Text fontSize="xs" color="gray.500">Tandai sudah dicek</Text>
                </Box>
                <Switch
                    isChecked={formData.checklist}
                    onChange={(e) => setFormData(prev => ({ ...prev, checklist: e.target.checked }))}
                    colorScheme="teal"
                />
            </Flex>
            {isEdit && (
                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                        ℹ️ Hanya Nama dan Checklist yang bisa diedit sesuai backend.
                    </Text>
                </Box>
            )}
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Database Slip Gaji</h1>
                    <Text className="subtitle">Kelola data slip gaji seluruh karyawan</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard><FiList size={28} /><p>Total Data</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard><FiCheckCircle size={28} /><p>Sudah Checklist</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahChecklist}</p>}
                    </InfoCard>
                    <InfoCard><FiDollarSign size={28} /><p>Done Transfer</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahTransfer}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input placeholder="Cari nama, ID, jabatan, periode..."
                            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} pl="40px" />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none"><FiSearch size={18} /></Box>
                    </Box>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah
                    </Button>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data slip gaji"}</Text></Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="id_karyawan" label="ID Karyawan" minWidth="120px" />
                                        <SortableHeader column="nama" label="Nama" minWidth="160px" />
                                        <th style={{ minWidth: "150px" }}>Nama Jabatan</th>
                                        <SortableHeader column="tingkat_pekerjaan" label="Tingkat" minWidth="120px" />
                                        <th style={{ minWidth: "100px" }}>Status</th>
                                        <SortableHeader column="periode_gaji" label="Periode" minWidth="130px" />
                                        <th style={{ minWidth: "130px", textAlign: "right" }}>Jumlah</th>
                                        <th style={{ minWidth: "90px", textAlign: "center" }}>Hari Kerja</th>
                                        <th style={{ minWidth: "100px" }}>Jam Kerja</th>
                                        <th style={{ minWidth: "100px", textAlign: "center" }}>Checklist</th>
                                        <th style={{ minWidth: "110px", textAlign: "center" }}>Done Transfer</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id_karyawan || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.id_karyawan || "-"}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.nama_jabatan || "-"}</td>
                                            <td>{item.tingkat_pekerjaan || "-"}</td>
                                            <td>{item.status || "-"}</td>
                                            <td>{item.periode_gaji || "-"}</td>
                                            <td style={{ textAlign: "right" }}>{item.jumlah || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{item.hari_kerja || "-"}</td>
                                            <td>{item.durasi_kerja || "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <Switch isChecked={isTruthy(item.checklist)} onChange={() => handleQuickToggle(item)}
                                                    colorScheme="teal" isDisabled={toggleMutation.isPending} />
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {isTruthy(item.done_transfer) ? "✅" : "❌"}
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

                <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Tambah Slip Gaji</ModalHeader><ModalCloseButton />
                        <ModalBody><FormFields isEdit={false} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>Tambah</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Edit Slip Gaji — {formData.nama}</ModalHeader><ModalCloseButton />
                        <ModalBody><FormFields isEdit={true} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>Simpan</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Slip Gaji</AlertDialogHeader>
                            <AlertDialogBody>Yakin hapus slip gaji <strong>{selectedItem?.nama}</strong>? Tidak bisa dibatalkan.</AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>Batal</Button>
                                <Button colorScheme="red" onClick={() => deleteMutation.mutate(selectedItem?.id_karyawan)} ml={3} isLoading={deleteMutation.isPending}>Hapus</Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default DatabaseSlipGajiPage;