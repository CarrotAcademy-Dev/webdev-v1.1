import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getDraftKasKeluar, deleteDraftKasKeluar } from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, IconButton, Input, Select, Text, Tooltip,
    useColorMode, useDisclosure, Badge,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiInbox,
    FiList, FiSearch, FiTrash2, FiDollarSign, FiClock,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_COLORS = {
    "Done": "green",
    "Pending": "orange",
    "Cancelled": "red",
    "In Progress": "blue",
};

const DraftKasKeluarPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterKategori, setFilterKategori] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: kasData = [], isLoading, isError } = useQuery({
        queryKey: ["draftKasKeluar"],
        queryFn: getDraftKasKeluar,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDraftKasKeluar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["draftKasKeluar"] });
            toaster.create({ title: "Berhasil hapus draft kas keluar", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = kasData.length;
        const totalBiaya = kasData.reduce((sum, i) => {
            const num = parseFloat(String(i.biaya || "0").replace(/[^0-9.-]/g, "")) || 0;
            return sum + num;
        }, 0);
        const pending = kasData.filter(i => !i.status || i.status === "Pending").length;
        const uniqueKategori = new Set(kasData.map(i => i.kategori).filter(Boolean)).size;
        return { total, totalBiaya, pending, uniqueKategori };
    }, [kasData]);

    const availableStatus = useMemo(() => {
        const set = new Set(kasData.map(i => i.status).filter(Boolean));
        return [...set].sort();
    }, [kasData]);

    const availableKategori = useMemo(() => {
        const set = new Set(kasData.map(i => i.kategori).filter(Boolean));
        return [...set].sort();
    }, [kasData]);

    const filteredData = useMemo(() => {
        let data = kasData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (filterKategori !== "all") data = data.filter(i => i.kategori === filterKategori);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_barang_jasa && String(i.nama_barang_jasa).toLowerCase().includes(lower)) ||
            (i.vendor && String(i.vendor).toLowerCase().includes(lower)) ||
            (i.kode && String(i.kode).toLowerCase().includes(lower)) ||
            (i.detail_keterangan && String(i.detail_keterangan).toLowerCase().includes(lower))
        );
    }, [kasData, searchQuery, filterStatus, filterKategori]);

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

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        onDeleteOpen();
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedItem.row);
    };

    const formatBiaya = (val) => {
        if (!val) return "-";
        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
        if (isNaN(num)) return String(val);
        return `Rp ${num.toLocaleString("id-ID")}`;
    };

    const formatBiayaShort = (val) => {
        if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}Jt`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}Rb`;
        return String(val);
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
                    <h1>Draft Kas Keluar</h1>
                    <Text className="subtitle">Data draft pengeluaran kas</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Draft</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Total Biaya</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ fontSize: "14px" }}>
                                {formatBiayaShort(stats.totalBiaya)}
                            </p>
                        )}
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
                        <FiList size={28} />
                        <p>Jumlah Kategori</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueKategori}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filters */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="320px">
                        <Input
                            placeholder="Cari nama barang, vendor, kode..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="180px" value={filterKategori} onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Kategori</option>
                        {availableKategori.map(k => <option key={k} value={k}>{k}</option>)}
                    </Select>
                    <Select maxW="160px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        {availableStatus.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data kas keluar</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada draft kas keluar"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="kode" label="Kode" minWidth="100px" />
                                        <SortableHeader column="kategori" label="Kategori" minWidth="130px" />
                                        <SortableHeader column="tanggal_transaksi" label="Tgl Transaksi" minWidth="140px" />
                                        <SortableHeader column="nama_barang_jasa" label="Nama Barang/Jasa" minWidth="180px" />
                                        <th style={{ minWidth: "180px" }}>Detail Keterangan</th>
                                        <SortableHeader column="vendor" label="Vendor" minWidth="140px" />
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>Jumlah</th>
                                        <SortableHeader column="biaya" label="Biaya" minWidth="130px" />
                                        <th style={{ minWidth: "150px" }}>Tgl Kebutuhan Selesai</th>
                                        <SortableHeader column="status" label="Status" minWidth="120px" />
                                        <th style={{ width: "70px", position: "sticky", right: 0 }}>Hapus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.kode || "-"}</td>
                                            <td>{item.kategori || "-"}</td>
                                            <td>{String(item.tanggal_transaksi || "-")}</td>
                                            <td>{item.nama_barang_jasa || "-"}</td>
                                            <td>
                                                {item.detail_keterangan?.length > 35 ? (
                                                    <Tooltip label={item.detail_keterangan}>
                                                        <span>{item.detail_keterangan.substring(0, 35)}...</span>
                                                    </Tooltip>
                                                ) : item.detail_keterangan || "-"}
                                            </td>
                                            <td>{item.vendor || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{item.jumlah || "-"}</td>
                                            <td>{formatBiaya(item.biaya)}</td>
                                            <td>{String(item.tanggal_kebutuhan_selesai || "-")}</td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>
                                                    {item.status || "-"}
                                                </Badge>
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <IconButton size="sm" colorScheme="red" variant="ghost"
                                                    onClick={() => handleOpenDelete(item)}>
                                                    <FiTrash2 />
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

                {/* Delete Confirmation */}
                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Hapus Draft Kas Keluar
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus draft{" "}
                                <strong>{selectedItem?.nama_barang_jasa}</strong>?
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

export default DraftKasKeluarPage;