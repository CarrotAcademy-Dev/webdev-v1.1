import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getPeminjamanBarang, editPeminjamanBarang } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, IconButton, Input, Select, Text, Badge,
    Tooltip, useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiSearch, FiUser, FiAlertTriangle,
    FiExternalLink,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const RUSAK_OPTIONS = ["Pribadi", "Pekerjaan"];

const RUSAK_COLORS = {
    "Pribadi": "orange",
    "Pekerjaan": "purple",
};

const PeminjamanBarangPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterRusak, setFilterRusak] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editForm, setEditForm] = useState({ index_peminjaman: "", rusak: "", nama_karyawan: "" });

    const { data: peminjamanData = [], isLoading, isError } = useQuery({
        queryKey: ["peminjamanBarang"],
        queryFn: getPeminjamanBarang,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editPeminjamanBarang,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peminjamanBarang"] });
            toaster.create({ title: "Berhasil update data", type: "success", duration: 3000 });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Kolom dinamis dari A2:R (18 kolom), kecuali index_peminjaman (P/_indexPeminjaman) dan rusak (Q)
    const columns = useMemo(() => {
        if (!peminjamanData.length) return [];
        return Object.keys(peminjamanData[0]).filter(k =>
            k !== "rusak" && k !== "index_peminjaman" && k !== "_indexPeminjaman"
        );
    }, [peminjamanData]);

    const stats = useMemo(() => {
        const total = peminjamanData.length;
        const rusakPribadi = peminjamanData.filter(i => i.rusak === "Pribadi").length;
        const rusakPekerjaan = peminjamanData.filter(i => i.rusak === "Pekerjaan").length;
        const belumDitandai = total - rusakPribadi - rusakPekerjaan;
        return { total, rusakPribadi, rusakPekerjaan, belumDitandai };
    }, [peminjamanData]);

    const filteredData = useMemo(() => {
        let data = peminjamanData;
        if (filterRusak !== "all") data = data.filter(i => i.rusak === filterRusak);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(item =>
            Object.values(item).some(val => val && String(val).toLowerCase().includes(lower))
        );
    }, [peminjamanData, searchQuery, filterRusak]);

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
            index_peminjaman: item.index_peminjaman || item._indexPeminjaman || "",
            rusak: item.rusak || "",
            nama_karyawan: item.nama_karyawan || "",
        });
        onOpen();
    };

    const handleEditSubmit = () => {
        if (!editForm.index_peminjaman) {
            toaster.create({ title: "Index Peminjaman tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        if (!editForm.rusak) {
            toaster.create({ title: "Pilih kategori rusak terlebih dahulu", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate({ index_peminjaman: editForm.index_peminjaman, rusak: editForm.rusak });
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

    const isValidUrl = (url) => {
        if (!url) return false;
        try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
        catch { return false; }
    };

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Peminjaman Barang</h1>
                    <Text className="subtitle">Kelola data peminjaman asset oleh karyawan</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Peminjaman</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiAlertTriangle size={28} />
                        <p>Rusak Pribadi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.rusakPribadi}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiAlertTriangle size={28} />
                        <p>Rusak Pekerjaan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.rusakPekerjaan}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUser size={28} />
                        <p>Belum Ditandai</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.belumDitandai}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filter */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input
                            placeholder="Cari di semua kolom..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="200px" value={filterRusak} onChange={(e) => { setFilterRusak(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Kategori Rusak</option>
                        {RUSAK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data peminjaman</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data peminjaman"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        {columns.map(col => (
                                            <SortableHeader
                                                key={col}
                                                column={col}
                                                label={col.replace(/_/g, " ").toUpperCase()}
                                                minWidth="140px"
                                            />
                                        ))}
                                        <th style={{ minWidth: "130px" }}>Rusak</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.index_peminjaman || item._indexPeminjaman || index}>
                                            <td>{startIndex + index + 1}</td>
                                            {columns.map(col => {
                                                const val = item[col];
                                                if (isValidUrl(val)) {
                                                    return (
                                                        <td key={col}>
                                                            <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                                onClick={() => window.open(String(val), "_blank", "noopener,noreferrer")}>
                                                                <FiExternalLink />
                                                            </IconButton>
                                                        </td>
                                                    );
                                                }
                                                const str = val ? String(val) : "-";
                                                return (
                                                    <td key={col}>
                                                        {str.length > 30 ? (
                                                            <Tooltip label={str}><span>{str.substring(0, 30)}...</span></Tooltip>
                                                        ) : str}
                                                    </td>
                                                );
                                            })}
                                            <td>
                                                {item.rusak ? (
                                                    <Badge colorScheme={RUSAK_COLORS[item.rusak] || "gray"}>
                                                        {item.rusak}
                                                    </Badge>
                                                ) : "-"}
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                    onClick={() => handleOpenEdit(item)}>
                                                    <FiEdit2 />
                                                </IconButton>
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

                {/* Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tandai Rusak — {editForm.nama_karyawan}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Box>
                                <Text fontWeight="medium" mb={2} fontSize="sm">Kategori Rusak</Text>
                                <Select
                                    value={editForm.rusak}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, rusak: e.target.value }))}
                                >
                                    <option value="">- Pilih Kategori -</option>
                                    {RUSAK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </Select>
                            </Box>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default PeminjamanBarangPage;