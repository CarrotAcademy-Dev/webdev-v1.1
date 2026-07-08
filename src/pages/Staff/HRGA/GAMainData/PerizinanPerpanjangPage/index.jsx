import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getPerizinanPerpanjang, editPerizinanPerpanjang, deletePerizinanPerpanjang } from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, Tooltip, useColorMode, useDisclosure,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiSearch, FiTrash2, FiFileText, FiAlertTriangle,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

// Cek apakah masa berlaku sudah dekat (< 30 hari) atau expired
const getExpirStatus = (masaBerlakuSampai) => {
    if (!masaBerlakuSampai) return null;
    try {
        const exp = new Date(masaBerlakuSampai);
        const now = new Date();
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "expired";
        if (diffDays <= 30) return "soon";
        return "ok";
    } catch { return null; }
};

const PerizinanPerpanjangPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({
        row: "", nama_perizinan: "", no_dokumen: "", tanggal_terbit: "",
        masa_berlaku_dari: "", masa_berlaku_sampai: "", instansi_terkait: "", link: "",
    });

    const { data: perizinanData = [], isLoading, isError } = useQuery({
        queryKey: ["perizinanPerpanjang"],
        queryFn: getPerizinanPerpanjang,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editPerizinanPerpanjang,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["perizinanPerpanjang"] });
            toaster.create({ title: "Berhasil update perizinan", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePerizinanPerpanjang,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["perizinanPerpanjang"] });
            toaster.create({ title: "Berhasil hapus perizinan", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = perizinanData.length;
        const expired = perizinanData.filter(i => getExpirStatus(i.masa_berlaku_sampai) === "expired").length;
        const soon = perizinanData.filter(i => getExpirStatus(i.masa_berlaku_sampai) === "soon").length;
        return { total, expired, soon };
    }, [perizinanData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return perizinanData;
        const lower = searchQuery.toLowerCase();
        return perizinanData.filter(i =>
            (i.nama_perizinan && String(i.nama_perizinan).toLowerCase().includes(lower)) ||
            (i.no_dokumen && String(i.no_dokumen).toLowerCase().includes(lower)) ||
            (i.instansi_terkait && String(i.instansi_terkait).toLowerCase().includes(lower))
        );
    }, [perizinanData, searchQuery]);

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
        setEditForm({
            row: String(item.row || ""),
            nama_perizinan: item.nama_perizinan || "",
            no_dokumen: item.no_dokumen || "",
            tanggal_terbit: item.tanggal_terbit || "",
            masa_berlaku_dari: item.masa_berlaku_dari || "",
            masa_berlaku_sampai: item.masa_berlaku_sampai || "",
            instansi_terkait: item.instansi_terkait || "",
            link: item.links?.[0] || "",
        });
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

    const InputField = ({ label, name, value, type = "text" }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Input
                name={name}
                value={value}
                onChange={(e) => setEditForm(prev => ({ ...prev, [name]: e.target.value }))}
                type={type}
                size="sm"
            />
        </Box>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Perizinan Perpanjang</h1>
                    <Text className="subtitle">Kelola data perizinan dan masa berlakunya</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Perizinan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiFileText size={28} />
                        <p>Segera Expired</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.soon > 0 ? "#ed8936" : "inherit" }}>
                                {stats.soon}
                            </p>
                        )}
                    </InfoCard>
                    <InfoCard>
                        <FiAlertTriangle size={28} />
                        <p>Sudah Expired</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.expired > 0 ? "#f56565" : "inherit" }}>
                                {stats.expired}
                            </p>
                        )}
                    </InfoCard>
                </Box>

                {/* Search */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama perizinan, no dokumen, instansi..."
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
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data perizinan</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data perizinan"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="nama_perizinan" label="Nama Perizinan" minWidth="180px" />
                                        <SortableHeader column="no_dokumen" label="No Dokumen" minWidth="140px" />
                                        <SortableHeader column="tanggal_terbit" label="Tgl Terbit" minWidth="130px" />
                                        <SortableHeader column="masa_berlaku_dari" label="Berlaku Dari" minWidth="130px" />
                                        <SortableHeader column="masa_berlaku_sampai" label="Berlaku Sampai" minWidth="140px" />
                                        <th style={{ minWidth: "160px" }}>Instansi Terkait</th>
                                        <th style={{ minWidth: "100px" }}>Links</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => {
                                        const expirStatus = getExpirStatus(item.masa_berlaku_sampai);
                                        return (
                                            <tr key={item.row || index} style={{
                                                background: expirStatus === "expired"
                                                    ? colorMode === "dark" ? "rgba(245,101,101,0.08)" : "rgba(245,101,101,0.05)"
                                                    : expirStatus === "soon"
                                                        ? colorMode === "dark" ? "rgba(237,137,54,0.08)" : "rgba(237,137,54,0.05)"
                                                        : undefined,
                                            }}>
                                                <td>{startIndex + index + 1}</td>
                                                <td>
                                                    <Flex align="center" gap={2}>
                                                        {expirStatus === "expired" && <FiAlertTriangle size={14} color="#f56565" />}
                                                        {expirStatus === "soon" && <FiAlertTriangle size={14} color="#ed8936" />}
                                                        {item.nama_perizinan || "-"}
                                                    </Flex>
                                                </td>
                                                <td>{item.no_dokumen || "-"}</td>
                                                <td>{String(item.tanggal_terbit || "-")}</td>
                                                <td>{String(item.masa_berlaku_dari || "-")}</td>
                                                <td style={{ color: expirStatus === "expired" ? "#f56565" : expirStatus === "soon" ? "#ed8936" : "inherit", fontWeight: expirStatus ? "bold" : "normal" }}>
                                                    {String(item.masa_berlaku_sampai || "-")}
                                                </td>
                                                <td>{item.instansi_terkait || "-"}</td>
                                                <td>
                                                    <Flex gap={1} wrap="wrap">
                                                        {item.links?.filter(isValidUrl).map((link, i) => (
                                                            <IconButton key={i} size="sm" variant="ghost" colorScheme="blue"
                                                                onClick={() => window.open(link, "_blank", "noopener,noreferrer")}>
                                                                <FiExternalLink />
                                                            </IconButton>
                                                        )) || "-"}
                                                    </Flex>
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
                                        );
                                    })}
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

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Perizinan — {selectedItem?.nama_perizinan}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                    <InputField label="Nama Perizinan" name="nama_perizinan" value={editForm.nama_perizinan} />
                                    <InputField label="No Dokumen" name="no_dokumen" value={editForm.no_dokumen} />
                                    <InputField label="Tanggal Terbit" name="tanggal_terbit" value={editForm.tanggal_terbit} type="date" />
                                    <InputField label="Instansi Terkait" name="instansi_terkait" value={editForm.instansi_terkait} />
                                    <InputField label="Masa Berlaku Dari" name="masa_berlaku_dari" value={editForm.masa_berlaku_dari} type="date" />
                                    <InputField label="Masa Berlaku Sampai" name="masa_berlaku_sampai" value={editForm.masa_berlaku_sampai} type="date" />
                                </Grid>
                                <InputField label="Link (utama)" name="link" value={editForm.link} />
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                        ℹ️ Edit hanya mengubah link utama (baris pertama). Link tambahan di baris lanjutan tidak terpengaruh.
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
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Perizinan</AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus perizinan{" "}
                                <strong>{selectedItem?.nama_perizinan}</strong>?
                                Baris lanjutan (link tambahan) juga akan ikut terhapus.
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

export default PerizinanPerpanjangPage;