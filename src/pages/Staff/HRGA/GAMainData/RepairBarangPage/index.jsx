import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getRepairBarang, editRepairBarang, deleteRepairBarang } from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure, Badge,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiSearch, FiTrash2, FiTool, FiCheckCircle, FiClock,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_COLORS = {
    "Done": "green",
    "In Progress": "orange",
    "Pending": "gray",
    "Cancelled": "red",
};

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const RepairBarangPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({ row: "", progress: "" });

    const { data: repairData = [], isLoading, isError } = useQuery({
        queryKey: ["repairBarang"],
        queryFn: getRepairBarang,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editRepairBarang,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repairBarang"] });
            toaster.create({ title: "Berhasil update progress", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRepairBarang,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repairBarang"] });
            toaster.create({ title: "Berhasil hapus data repair", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = repairData.length;
        const done = repairData.filter(i => i.status === "Done").length;
        const inProgress = repairData.filter(i => i.status === "In Progress").length;
        const pending = repairData.filter(i => !i.status || i.status === "Pending").length;
        return { total, done, inProgress, pending };
    }, [repairData]);

    // Available status dari data
    const availableStatus = useMemo(() => {
        const set = new Set(repairData.map(i => i.status).filter(Boolean));
        return [...set].sort();
    }, [repairData]);

    const filteredData = useMemo(() => {
        let data = repairData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.departemen && String(i.departemen).toLowerCase().includes(lower)) ||
            (i.lokasi_perbaikan && String(i.lokasi_perbaikan).toLowerCase().includes(lower)) ||
            (i.jenis_perbaikan && String(i.jenis_perbaikan).toLowerCase().includes(lower))
        );
    }, [repairData, searchQuery, filterStatus]);

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
        setSelectedItem(item);
        setEditForm({ row: String(item.row || ""), progress: item.progress || "" });
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
        if (!editForm.progress.trim()) {
            toaster.create({ title: "Progress tidak boleh kosong", type: "warning", duration: 2000 });
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
                    <h1>Repair Barang</h1>
                    <Text className="subtitle">Kelola data perbaikan barang/asset</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Repair</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Pending</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.pending}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTool size={28} />
                        <p>In Progress</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.inProgress > 0 ? "#ed8936" : "inherit" }}>
                                {stats.inProgress}
                            </p>
                        )}
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
                            placeholder="Cari nama, departemen, lokasi, jenis perbaikan..."
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
                        {availableStatus.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data repair</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data repair"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="150px" />
                                        <SortableHeader column="nama" label="Nama" minWidth="150px" />
                                        <SortableHeader column="departemen" label="Departemen" minWidth="130px" />
                                        <SortableHeader column="lokasi_perbaikan" label="Lokasi Perbaikan" minWidth="150px" />
                                        <SortableHeader column="status" label="Status" minWidth="120px" />
                                        <th style={{ minWidth: "150px" }}>Jenis Perbaikan</th>
                                        <th style={{ minWidth: "180px" }}>Jenis Diminta</th>
                                        <th style={{ minWidth: "160px" }}>Penyelesaian</th>
                                        <th style={{ minWidth: "180px" }}>Progress</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>PDF</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.timestamp || "-")}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.departemen || "-"}</td>
                                            <td>{item.lokasi_perbaikan || "-"}</td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>
                                                    {item.status || "-"}
                                                </Badge>
                                            </td>
                                            <td>{item.jenis_perbaikan || "-"}</td>
                                            <td>
                                                {item.jenis_perbaikan_diminta?.length > 30 ? (
                                                    <Tooltip label={item.jenis_perbaikan_diminta}>
                                                        <span>{item.jenis_perbaikan_diminta.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.jenis_perbaikan_diminta || "-"}
                                            </td>
                                            <td>{item.penyelesaian || "-"}</td>
                                            <td>
                                                {item.progress?.length > 30 ? (
                                                    <Tooltip label={item.progress}>
                                                        <span>{item.progress.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.progress || "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {isValidUrl(item.link_pdf) ? (
                                                    <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                        onClick={() => window.open(String(item.link_pdf), "_blank", "noopener,noreferrer")}>
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
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

                {/* Edit Modal — hanya progress */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Update Progress — {selectedItem?.nama}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Info read-only */}
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                                    <Text fontSize="sm" fontWeight="bold">{selectedItem?.lokasi_perbaikan}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {selectedItem?.jenis_perbaikan} · {selectedItem?.departemen}
                                    </Text>
                                    <Badge mt={1} colorScheme={STATUS_COLORS[selectedItem?.status] || "gray"}>
                                        {selectedItem?.status || "-"}
                                    </Badge>
                                </Box>

                                <Box>
                                    <Text fontWeight="medium" mb={2}>Progress <Text as="span" color="red.500">*</Text></Text>
                                    <Textarea
                                        value={editForm.progress}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, progress: e.target.value }))}
                                        placeholder="Isi progress perbaikan..."
                                        rows={4}
                                    />
                                </Box>

                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                        ℹ️ Hanya kolom progress yang bisa diedit.
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
                                Hapus Data Repair
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus data repair dari{" "}
                                <strong>{selectedItem?.nama}</strong> di{" "}
                                <strong>{selectedItem?.lokasi_perbaikan}</strong>?
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

export default RepairBarangPage;