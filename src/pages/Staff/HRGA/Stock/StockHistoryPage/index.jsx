import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getStockHistory, editStockHistory, addStockHistory, getStockNamaBarang } from "@/features/hr/stockApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Skeleton, Stack, Switch, Text, Textarea, Tooltip, useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiPlus, FiSearch, FiTrendingUp, FiTrendingDown,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isTruthy = (val) => val === true || String(val).toUpperCase() === "TRUE";

const EMPTY_FORM = {
    row: "",
    tanggal: "", nama: "", id_barang: "", nama_barang: "",
    area: "", unit: "", harga_beli: "",
    in_qty: "", out_qty: "", keterangan: "",
    untuk_siswa: "FALSE", untuk_kantor: "FALSE",
};

const StockHistoryPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterBulan, setFilterBulan] = useState("all");
    const [filterTahun, setFilterTahun] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: historyData = [], isLoading, isError } = useQuery({
        queryKey: ["stockHistory"],
        queryFn: getStockHistory,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Ambil daftar nama barang untuk dropdown
    const { data: namaBarangList = [] } = useQuery({
        queryKey: ["stockNamaBarang"],
        queryFn: getStockNamaBarang,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addStockHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stockHistory"] });
            toaster.create({ title: "Berhasil tambah history", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editStockHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stockHistory"] });
            toaster.create({ title: "Berhasil update history", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = historyData.length;
        const totalIn = historyData.reduce((sum, i) => sum + (Number(i.in_qty) || 0), 0);
        const totalOut = historyData.reduce((sum, i) => sum + (Number(i.out_qty) || 0), 0);
        const untukSiswa = historyData.filter(i => isTruthy(i.untuk_siswa)).length;
        return { total, totalIn, totalOut, untukSiswa };
    }, [historyData]);

    const availableBulan = useMemo(() => {
        const set = new Set(historyData.map(i => i.bulan).filter(Boolean));
        return [...set].sort();
    }, [historyData]);

    const availableTahun = useMemo(() => {
        const set = new Set(historyData.map(i => String(i.tahun)).filter(Boolean));
        return [...set].sort((a, b) => Number(b) - Number(a));
    }, [historyData]);

    const filteredData = useMemo(() => {
        let data = historyData;
        if (filterBulan !== "all") data = data.filter(i => i.bulan === filterBulan);
        if (filterTahun !== "all") data = data.filter(i => String(i.tahun) === filterTahun);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.id_barang && String(i.id_barang).toLowerCase().includes(lower)) ||
            (i.keterangan && String(i.keterangan).toLowerCase().includes(lower))
        );
    }, [historyData, searchQuery, filterBulan, filterTahun]);

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
        setFormData({
            row: String(item.row || ""),
            tanggal: item.tanggal || "",
            nama: item.nama || "",
            id_barang: item.id_barang || "",
            nama_barang: item.nama_barang || "",
            area: item.area || "",
            unit: item.unit || "",
            harga_beli: item.harga_beli || "",
            in_qty: item.in_qty || "",
            out_qty: item.out_qty || "",
            keterangan: item.keterangan || "",
            untuk_siswa: isTruthy(item.untuk_siswa) ? "TRUE" : "FALSE",
            untuk_kantor: isTruthy(item.untuk_kantor) ? "TRUE" : "FALSE",
        });
        onEditOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked ? "TRUE" : "FALSE" }));
    };

    const handleAddSubmit = () => {
        const { untuk_siswa, untuk_kantor, ...rest } = formData;
        const payload = { untuk_siswa, untuk_kantor };
        Object.entries(rest).forEach(([k, v]) => { if (v?.trim()) payload[k] = v; });
        addMutation.mutate(payload);
    };

    const handleEditSubmit = () => {
        if (!formData.row) {
            toaster.create({ title: "Row tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(formData);
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

    const FormFields = ({ isEdit }) => (
        <Stack gap={4}>
            {isEdit && (
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Row (Read-only)</Text>
                    <Input value={formData.row} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} size="sm" />
                </Box>
            )}

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Tanggal</Text>
                    <Input name="tanggal" type="date" value={formData.tanggal} onChange={handleInputChange} size="sm" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Nama (PIC)</Text>
                    <Input name="nama" value={formData.nama} onChange={handleInputChange} placeholder="Nama yang input" size="sm" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">ID Barang</Text>
                    <Input name="id_barang" value={formData.id_barang} onChange={handleInputChange} placeholder="ID Barang" size="sm" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Nama Barang</Text>
                    <Select name="nama_barang" value={formData.nama_barang} onChange={handleInputChange} size="sm"
                        placeholder="- Pilih nama barang -">
                        {namaBarangList.map((nama, i) => (
                            <option key={i} value={nama}>{nama}</option>
                        ))}
                    </Select>
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Area</Text>
                    <Input name="area" value={formData.area} onChange={handleInputChange} placeholder="Area" size="sm" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Unit</Text>
                    <Input name="unit" value={formData.unit} onChange={handleInputChange} placeholder="Unit" size="sm" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Harga Beli</Text>
                    <Input name="harga_beli" value={formData.harga_beli} onChange={handleInputChange} placeholder="Harga Beli" size="sm" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">IN Qty</Text>
                    <Input name="in_qty" value={formData.in_qty} onChange={handleInputChange} placeholder="Jumlah masuk" size="sm" type="number" />
                </Box>
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">OUT Qty</Text>
                    <Input name="out_qty" value={formData.out_qty} onChange={handleInputChange} placeholder="Jumlah keluar" size="sm" type="number" />
                </Box>
            </Grid>

            <Box>
                <Text fontWeight="medium" mb={2} fontSize="sm">Keterangan</Text>
                <Textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows={3} size="sm" />
            </Box>

            {/* Boolean fields */}
            <Grid templateColumns="1fr 1fr" gap={4}>
                <Flex align="center" justify="space-between" p={3} borderRadius="md" border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                    <Text fontSize="sm" fontWeight="medium">Untuk Siswa</Text>
                    <Switch
                        isChecked={formData.untuk_siswa === "TRUE"}
                        onChange={(e) => handleSwitchChange("untuk_siswa", e.target.checked)}
                        colorScheme="teal"
                    />
                </Flex>
                <Flex align="center" justify="space-between" p={3} borderRadius="md" border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
                    <Text fontSize="sm" fontWeight="medium">Untuk Kantor</Text>
                    <Switch
                        isChecked={formData.untuk_kantor === "TRUE"}
                        onChange={(e) => handleSwitchChange("untuk_kantor", e.target.checked)}
                        colorScheme="teal"
                    />
                </Flex>
            </Grid>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Stock History</h1>
                    <Text className="subtitle">Riwayat pergerakan IN/OUT stock barang</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Transaksi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTrendingUp size={28} />
                        <p>Total IN</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalIn}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTrendingDown size={28} />
                        <p>Total OUT</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalOut}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Untuk Siswa</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.untukSiswa}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filters + Add */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" justify="space-between" align="center">
                    <Flex gap={3} wrap="wrap" flex={1}>
                        <Box position="relative" width="100%" maxWidth="300px">
                            <Input
                                placeholder="Cari nama barang, PIC, keterangan..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                pl="40px"
                            />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <FiSearch size={18} />
                            </Box>
                        </Box>
                        <Select maxW="150px" value={filterBulan} onChange={(e) => { setFilterBulan(e.target.value); setCurrentPage(1); }}>
                            <option value="all">Semua Bulan</option>
                            {availableBulan.map(b => <option key={b} value={b}>{b}</option>)}
                        </Select>
                        <Select maxW="130px" value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(1); }}>
                            <option value="all">Semua Tahun</option>
                            {availableTahun.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    </Flex>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah History
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data stock history</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data stock history"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="tanggal" label="Tanggal" minWidth="120px" />
                                        <SortableHeader column="bulan" label="Bulan" minWidth="100px" />
                                        <SortableHeader column="tahun" label="Tahun" minWidth="80px" />
                                        <SortableHeader column="nama" label="Nama (PIC)" minWidth="140px" />
                                        <th style={{ minWidth: "120px" }}>ID Barang</th>
                                        <SortableHeader column="nama_barang" label="Nama Barang" minWidth="180px" />
                                        <th style={{ minWidth: "120px" }}>Area</th>
                                        <th style={{ minWidth: "100px" }}>Unit</th>
                                        <th style={{ minWidth: "110px" }}>Harga Beli</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>IN</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>OUT</th>
                                        <th style={{ minWidth: "160px" }}>Keterangan</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Siswa</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Kantor</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.tanggal || "-")}</td>
                                            <td>{item.bulan || "-"}</td>
                                            <td>{item.tahun || "-"}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.id_barang || "-"}</td>
                                            <td>{item.nama_barang || "-"}</td>
                                            <td>{item.area || "-"}</td>
                                            <td>{item.unit || "-"}</td>
                                            <td>{item.harga_beli || "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                {item.in_qty && String(item.in_qty) !== "0" ? (
                                                    <Text color="green.500" fontWeight="bold">{String(item.in_qty)}</Text>
                                                ) : "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {item.out_qty && String(item.out_qty) !== "0" ? (
                                                    <Text color="red.500" fontWeight="bold">{String(item.out_qty)}</Text>
                                                ) : "-"}
                                            </td>
                                            <td>
                                                {item.keterangan?.length > 30 ? (
                                                    <Tooltip label={item.keterangan}>
                                                        <span>{item.keterangan.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.keterangan || "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{isTruthy(item.untuk_siswa) ? "✅" : "❌"}</td>
                                            <td style={{ textAlign: "center" }}>{isTruthy(item.untuk_kantor) ? "✅" : "❌"}</td>
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

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Stock History</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields isEdit={false} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>
                                Tambah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Stock History</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields isEdit={true} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
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

export default StockHistoryPage;