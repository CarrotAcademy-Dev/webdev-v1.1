import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getPengajuanCuti, editPengajuanCuti, tambahPengajuanCuti, deletePengajuanCuti } from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
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
    FiPlus, FiSearch, FiTrash2, FiCheckCircle, FiClock, FiCalendar,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_OPTIONS = ["Approved", "Rejected"];
const STATUS_COLORS = { "Approved": "green", "Rejected": "red" };

const EMPTY_ADD = {
    nama: "", tanggal_pengajuan: "", tanggal_mulai_cuti: "",
    tanggal_akhir_cuti: "", alasan_cuti: "", status: "",
};

const EMPTY_EDIT = {
    row: "", nama: "", tanggal_pengajuan: "", tanggal_mulai_cuti: "",
    tanggal_akhir_cuti: "", alasan_cuti: "", status: "",
};

const PengajuanCutiPage = () => {
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

    const { data: cutiData = [], isLoading, isError } = useQuery({
        queryKey: ["pengajuanCuti"],
        queryFn: getPengajuanCuti,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: tambahPengajuanCuti,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pengajuanCuti"] });
            toaster.create({ title: "Berhasil tambah pengajuan cuti", type: "success", duration: 3000 });
            setAddForm(EMPTY_ADD);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editPengajuanCuti,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pengajuanCuti"] });
            toaster.create({ title: "Berhasil update pengajuan cuti", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePengajuanCuti,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pengajuanCuti"] });
            toaster.create({ title: "Berhasil hapus pengajuan cuti", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        total: cutiData.length,
        approved: cutiData.filter(i => i.status === "Approved").length,
        rejected: cutiData.filter(i => i.status === "Rejected").length,
        pending: cutiData.filter(i => !i.status || (i.status !== "Approved" && i.status !== "Rejected")).length,
    }), [cutiData]);

    const filteredData = useMemo(() => {
        let data = cutiData;
        if (filterStatus === "pending") data = data.filter(i => !i.status || (i.status !== "Approved" && i.status !== "Rejected"));
        else if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.alasan_cuti && String(i.alasan_cuti).toLowerCase().includes(lower))
        );
    }, [cutiData, searchQuery, filterStatus]);

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
            nama: item.nama || "",
            tanggal_pengajuan: item.tanggal_pengajuan || "",
            tanggal_mulai_cuti: item.tanggal_mulai_cuti || "",
            tanggal_akhir_cuti: item.tanggal_akhir_cuti || "",
            alasan_cuti: item.alasan_cuti || "",
            status: item.status || "",
        });
        onEditOpen();
    };

    const handleOpenDelete = (item) => { setSelectedItem(item); onDeleteOpen(); };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        if (!addForm.nama?.trim()) {
            toaster.create({ title: "Nama wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(addForm);
    };

    const handleEditSubmit = () => {
        if (!editForm.row) {
            toaster.create({ title: "Row tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(editForm);
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const DateFields = ({ form, onChange }) => (
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
            {[
                { label: "Nama *", name: "nama", type: "text" },
                { label: "Tanggal Pengajuan", name: "tanggal_pengajuan", type: "date" },
                { label: "Tanggal Mulai Cuti", name: "tanggal_mulai_cuti", type: "date" },
                { label: "Tanggal Akhir Cuti", name: "tanggal_akhir_cuti", type: "date" },
            ].map(({ label, name, type }) => (
                <Box key={name}>
                    <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
                    <Input name={name} value={form[name] || ""} type={type} onChange={onChange} size="sm" />
                </Box>
            ))}
            <Box gridColumn="span 2">
                <Text fontWeight="medium" mb={2} fontSize="sm">Alasan Cuti</Text>
                <Input name="alasan_cuti" value={form.alasan_cuti || ""} onChange={onChange} size="sm" />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={2} fontSize="sm">Status</Text>
                <Select name="status" value={form.status || ""} onChange={onChange} size="sm" placeholder="- Pilih Status -">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
            </Box>
        </Grid>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Pengajuan Cuti</h1>
                    <Text className="subtitle">Kelola pengajuan cuti karyawan</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard><FiList size={28} /><p>Total</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard><FiClock size={28} /><p>Pending</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.pending > 0 ? "#ed8936" : "inherit" }}>{stats.pending}</p>
                        )}
                    </InfoCard>
                    <InfoCard><FiCheckCircle size={28} /><p>Approved</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.approved}</p>}
                    </InfoCard>
                    <InfoCard><FiCalendar size={28} /><p>Rejected</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.rejected}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Flex gap={3} wrap="wrap" flex={1}>
                        <Box position="relative" maxWidth="320px" width="100%">
                            <Input placeholder="Cari nama, alasan..."
                                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} pl="40px" />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none"><FiSearch size={18} /></Box>
                        </Box>
                        <Select maxW="170px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
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
                        <Flex className="empty-state"><FiInbox size={48} /><Text>{searchQuery ? "Tidak ada hasil" : "Belum ada pengajuan cuti"}</Text></Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="nama" label="Nama" minWidth="150px" />
                                        <th style={{ minWidth: "130px" }}>Tgl Pengajuan</th>
                                        <th style={{ minWidth: "120px" }}>Mulai Cuti</th>
                                        <th style={{ minWidth: "120px" }}>Akhir Cuti</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>Total</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>Jatah</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>Sisa</th>
                                        <th style={{ minWidth: "200px" }}>Alasan</th>
                                        <SortableHeader column="status" label="Status" minWidth="120px" />
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.tanggal_pengajuan || "-"}</td>
                                            <td>{item.tanggal_mulai_cuti || "-"}</td>
                                            <td>{item.tanggal_akhir_cuti || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{item.total_pengajuan_cuti || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{item.jatah_cuti || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{item.sisa_cuti || "-"}</td>
                                            <td>{item.alasan_cuti?.length > 30 ? `${item.alasan_cuti.substring(0, 30)}...` : item.alasan_cuti || "-"}</td>
                                            <td>
                                                {item.status ? (
                                                    <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>{item.status}</Badge>
                                                ) : <Badge colorScheme="orange">Pending</Badge>}
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

                <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Tambah Pengajuan Cuti</ModalHeader><ModalCloseButton />
                        <ModalBody><DateFields form={addForm} onChange={handleAddChange} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>Tambah</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Edit Pengajuan Cuti — {editForm.nama}</ModalHeader><ModalCloseButton />
                        <ModalBody><DateFields form={editForm} onChange={handleEditChange} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>Simpan</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Pengajuan Cuti</AlertDialogHeader>
                            <AlertDialogBody>Yakin hapus pengajuan cuti <strong>{selectedItem?.nama}</strong>?</AlertDialogBody>
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

export default PengajuanCutiPage;