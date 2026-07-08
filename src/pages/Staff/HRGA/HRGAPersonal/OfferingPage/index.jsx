import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getOffering, editOffering } from "@/features/hr/hrgaPersonalApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Text, useColorMode, useDisclosure, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiSearch, FiDollarSign, FiCheckCircle,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_OPTIONS = ["Join", "Tidak Join"];
const STATUS_COLORS = { "Join": "green", "Tidak Join": "red" };

const formatRupiah = (val) => {
    const num = Number(val) || 0;
    if (num === 0) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
};

const OfferingPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editForm, setEditForm] = useState({
        unique_id: "", full_name: "", gaji_pokok: "", tunjangan_makan: "", tunjangan_transport: "", status: "",
    });

    const { data: offeringData = [], isLoading, isError } = useQuery({
        queryKey: ["offering"],
        queryFn: getOffering,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editOffering,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offering"] });
            toaster.create({ title: "Berhasil update offering", type: "success", duration: 3000 });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = offeringData.length;
        const join = offeringData.filter(i => i.status === "Join").length;
        const tidakJoin = offeringData.filter(i => i.status === "Tidak Join").length;
        const totalGaji = offeringData.reduce((sum, i) => sum + (Number(i.gaji_pokok) || 0), 0);
        return { total, join, tidakJoin, totalGaji };
    }, [offeringData]);

    const filteredData = useMemo(() => {
        let data = offeringData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.full_name && String(i.full_name).toLowerCase().includes(lower)) ||
            (i.position && String(i.position).toLowerCase().includes(lower)) ||
            (i.email && String(i.email).toLowerCase().includes(lower))
        );
    }, [offeringData, searchQuery, filterStatus]);

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
            unique_id: item.unique_id || "",
            full_name: item.full_name || "",
            gaji_pokok: item.gaji_pokok ?? "",
            tunjangan_makan: item.tunjangan_makan ?? "",
            tunjangan_transport: item.tunjangan_transport ?? "",
            status: item.status || "",
        });
        onOpen();
    };

    const handleEditSubmit = () => {
        if (!editForm.unique_id) {
            toaster.create({ title: "Unique ID tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        const payload = { unique_id: editForm.unique_id };
        if (editForm.gaji_pokok !== "") payload.gaji_pokok = Number(editForm.gaji_pokok);
        if (editForm.tunjangan_makan !== "") payload.tunjangan_makan = Number(editForm.tunjangan_makan);
        if (editForm.tunjangan_transport !== "") payload.tunjangan_transport = Number(editForm.tunjangan_transport);
        if (editForm.status) payload.status = editForm.status;
        editMutation.mutate(payload);
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
                    <h1>Offering</h1>
                    <Text className="subtitle">Kelola data offering kandidat: gaji, tunjangan, dan status join</Text>
                </Box>=

                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Offering</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Join</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.join}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Tidak Join</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.tidakJoin}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Total Gaji Pokok</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points" style={{ fontSize: "13px" }}>{formatRupiah(stats.totalGaji)}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input
                            placeholder="Cari nama, posisi, email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="170px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data offering</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data offering"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="full_name" label="Nama Lengkap" minWidth="160px" />
                                        <th style={{ minWidth: "170px" }}>Email</th>
                                        <th style={{ minWidth: "130px" }}>Phone</th>
                                        <SortableHeader column="position" label="Posisi" minWidth="140px" />
                                        <th style={{ minWidth: "120px" }}>Tgl Offering</th>
                                        <th style={{ minWidth: "100px" }}>Waktu</th>
                                        <th style={{ minWidth: "130px", textAlign: "right" }}>Gaji Pokok</th>
                                        <th style={{ minWidth: "140px", textAlign: "right" }}>Tunj. Makan</th>
                                        <th style={{ minWidth: "150px", textAlign: "right" }}>Tunj. Transport</th>
                                        <th style={{ minWidth: "120px" }}>Status</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.unique_id || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.full_name || "-"}</td>
                                            <td>{item.email || "-"}</td>
                                            <td>{item.phone || "-"}</td>
                                            <td>{item.position || "-"}</td>
                                            <td>{String(item.offering_date || "-")}</td>
                                            <td>{item.offering_time || "-"}</td>
                                            <td style={{ textAlign: "right" }}>{formatRupiah(item.gaji_pokok)}</td>
                                            <td style={{ textAlign: "right" }}>{formatRupiah(item.tunjangan_makan)}</td>
                                            <td style={{ textAlign: "right" }}>{formatRupiah(item.tunjangan_transport)}</td>
                                            <td>
                                                {item.status ? (
                                                    <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>{item.status}</Badge>
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

                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Offering — {editForm.full_name}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Gaji Pokok</Text>
                                    <Input
                                        type="number"
                                        value={editForm.gaji_pokok}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, gaji_pokok: e.target.value }))}
                                        placeholder="Contoh: 5000000"
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Tunjangan Makan</Text>
                                    <Input
                                        type="number"
                                        value={editForm.tunjangan_makan}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, tunjangan_makan: e.target.value }))}
                                        placeholder="Contoh: 500000"
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Tunjangan Transport</Text>
                                    <Input
                                        type="number"
                                        value={editForm.tunjangan_transport}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, tunjangan_transport: e.target.value }))}
                                        placeholder="Contoh: 300000"
                                    />
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
                                        ℹ️ Gaji/tunjangan wajib numerik. Status hanya "Join" atau "Tidak Join".
                                    </Text>
                                </Box>
                            </Stack>
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

export default OfferingPage;