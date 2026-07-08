import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getPurchaseRequest, editPurchaseRequest, deletePurchaseRequest } from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Text, Tooltip, useColorMode, useDisclosure, Badge,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiSearch, FiTrash2, FiShoppingCart, FiClock, FiCheckCircle,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Done"];
const TIPE_PEMBAYARAN_OPTIONS = ["Cash", "Transfer", "Reimburse", "Kartu Kredit"];

const STATUS_COLORS = {
    "Pending": "orange",
    "Approved": "blue",
    "Done": "green",
    "Rejected": "red",
};

const PurchaseRequestPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({ row: "", tipe_pembayaran: "", status: "" });

    const { data: prData = [], isLoading, isError } = useQuery({
        queryKey: ["purchaseRequest"],
        queryFn: getPurchaseRequest,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editPurchaseRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchaseRequest"] });
            toaster.create({ title: "Berhasil update purchase request", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePurchaseRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchaseRequest"] });
            toaster.create({ title: "Berhasil hapus purchase request", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = prData.length;
        const pending = prData.filter(i => i.status === "Pending").length;
        const approved = prData.filter(i => i.status === "Approved").length;
        const done = prData.filter(i => i.status === "Done").length;
        return { total, pending, approved, done };
    }, [prData]);

    const filteredData = useMemo(() => {
        let data = prData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_karyawan && String(i.nama_karyawan).toLowerCase().includes(lower)) ||
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.nama_vendor && String(i.nama_vendor).toLowerCase().includes(lower)) ||
            (i.tipe_kebutuhan && String(i.tipe_kebutuhan).toLowerCase().includes(lower))
        );
    }, [prData, searchQuery, filterStatus]);

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

    const handleOpenEdit = (item) => {
        setEditForm({
            row: String(item.row || ""),
            tipe_pembayaran: item.tipe_pembayaran || "",
            status: item.status || "",
        });
        setSelectedItem(item);
        onEditOpen();
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        onDeleteOpen();
    };

    const handleEditSubmit = () => {
        if (!editForm.row) {
            toaster.create({ title: "Row tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(editForm);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedItem.row);
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
                    <h1>Purchase Request</h1>
                    <Text className="subtitle">Kelola permintaan pembelian barang dari karyawan</Text>
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
                        <p>Pending</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.pending > 0 ? "#ed8936" : "inherit" }}>
                                {stats.pending}
                            </p>
                        )}
                    </InfoCard>
                    <InfoCard>
                        <FiShoppingCart size={28} />
                        <p>Approved</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.approved}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Done</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.done}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filter */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input
                            placeholder="Cari nama karyawan, barang, vendor..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="180px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
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
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada purchase request"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="150px" />
                                        <SortableHeader column="nama_karyawan" label="Nama Karyawan" minWidth="160px" />
                                        <th style={{ minWidth: "120px" }}>Posisi</th>
                                        <SortableHeader column="nama_barang" label="Nama Barang" minWidth="160px" />
                                        <SortableHeader column="nama_vendor" label="Vendor" minWidth="140px" />
                                        <th style={{ minWidth: "160px" }}>Detail Barang</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>Jumlah</th>
                                        <th style={{ minWidth: "120px" }}>Harga</th>
                                        <th style={{ minWidth: "130px" }}>Waktu Dibutuhkan</th>
                                        <SortableHeader column="tipe_kebutuhan" label="Tipe Kebutuhan" minWidth="140px" />
                                        <th style={{ minWidth: "140px" }}>Tipe Pembayaran</th>
                                        <SortableHeader column="status" label="Status" minWidth="110px" />
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.timestamp || "-")}</td>
                                            <td>{item.nama_karyawan || "-"}</td>
                                            <td>{item.posisi || "-"}</td>
                                            <td>{item.nama_barang || "-"}</td>
                                            <td>{item.nama_vendor || "-"}</td>
                                            <td>
                                                {item.detail_barang?.length > 30 ? (
                                                    <Tooltip label={item.detail_barang}>
                                                        <span>{item.detail_barang.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.detail_barang || "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{item.jumlah_barang || "-"}</td>
                                            <td>{item.harga_barang || "-"}</td>
                                            <td>{item.waktu_dibutuhkan || "-"}</td>
                                            <td>{item.tipe_kebutuhan || "-"}</td>
                                            <td>{item.tipe_pembayaran || "-"}</td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>
                                                    {item.status || "-"}
                                                </Badge>
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Flex gap={1}>
                                                    <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                        onClick={() => handleOpenEdit(item)}>
                                                        <FiEdit2 />
                                                    </IconButton>
                                                    <IconButton size="sm" colorScheme="red" variant="ghost"
                                                        onClick={() => handleOpenDelete(item)}>
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

                {/* Edit Modal — hanya tipe_pembayaran & status */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Purchase Request</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Info read-only */}
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                                    <Text fontSize="sm" fontWeight="bold">{selectedItem?.nama_barang}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {selectedItem?.nama_karyawan} · {selectedItem?.nama_vendor}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Tipe Pembayaran</Text>
                                    <Select
                                        value={editForm.tipe_pembayaran}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, tipe_pembayaran: e.target.value }))}
                                    >
                                        <option value="">- Pilih Tipe Pembayaran -</option>
                                        {TIPE_PEMBAYARAN_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Status</Text>
                                    <Select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="">- Pilih Status -</option>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Select>
                                </Box>
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                        ℹ️ Hanya tipe pembayaran dan status yang bisa diedit.
                                    </Text>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation */}
                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Hapus Purchase Request
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus request{" "}
                                <strong>{selectedItem?.nama_barang}</strong> dari{" "}
                                <strong>{selectedItem?.nama_karyawan}</strong>?
                                Tindakan ini tidak bisa dibatalkan.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>Batal</Button>
                                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}
                                    isLoading={deleteMutation.isPending}>
                                    Hapus
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default PurchaseRequestPage;