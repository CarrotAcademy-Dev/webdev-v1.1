import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getStockData, editStockData, addStockData } from "@/features/hr/stockApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
    Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiPlus, FiSearch, FiPackage, FiUser,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

// Field yang tidak boleh diedit (otomatis di backend)
const READONLY_FIELDS = [
    "kode_barang", "no_urut", "des_1", "des_2", "des_3",
    "jumlah_masuk", "jumlah_keluar", "jumlah_akhir",
];

const EDITABLE_FIELDS = [
    "no_gambar", "stock", "nama_barang", "kelompok", "jenis",
    "keterangan_merek", "keterangan_ketebalan", "keterangan_ukuran",
    "keterangan_tipe", "keterangan_warna", "keterangan_lainnya",
    "notes", "unit", "ruang", "area", "jumlah_barang",
    "link_foto", "tanggal_beli", "nilai_awal",
    "vendor_nama", "vendor_alamat", "vendor_link_toko",
    "jumlah_awal", "jumlah_minimum",
];

const EMPTY_FORM = EDITABLE_FIELDS.reduce((acc, key) => ({ ...acc, [key]: "" }), {
    kode_barang: "", // untuk edit (readonly)
});

const StockPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: stockData = [], isLoading, isError } = useQuery({
        queryKey: ["stockData"],
        queryFn: getStockData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addStockData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stockData"] });
            toaster.create({ title: "Berhasil tambah data stock", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editStockData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stockData"] });
            toaster.create({ title: "Berhasil update data stock", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = stockData.length;
        const uniqueKelompok = new Set(stockData.map(i => i.kelompok).filter(Boolean)).size;
        const uniqueArea = new Set(stockData.map(i => i.area).filter(Boolean)).size;
        const minimumAlert = stockData.filter(i => {
            const akhir = Number(i.jumlah_akhir) || 0;
            const min = Number(i.jumlah_minimum) || 0;
            return min > 0 && akhir <= min;
        }).length;
        return { total, uniqueKelompok, uniqueArea, minimumAlert };
    }, [stockData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return stockData;
        const lower = searchQuery.toLowerCase();
        return stockData.filter(i =>
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.kode_barang && String(i.kode_barang).toLowerCase().includes(lower)) ||
            (i.kelompok && String(i.kelompok).toLowerCase().includes(lower)) ||
            (i.area && String(i.area).toLowerCase().includes(lower))
        );
    }, [stockData, searchQuery]);

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
        const form = { kode_barang: item.kode_barang || "" };
        EDITABLE_FIELDS.forEach(key => { form[key] = item[key] || ""; });
        setFormData(form);
        onEditOpen();
    };

    const handleOpenDetail = (item) => {
        setSelectedItem(item);
        onDetailOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        const filled = EDITABLE_FIELDS.filter(k => formData[k]?.trim());
        if (filled.length === 0) {
            toaster.create({ title: "Isi minimal satu field", type: "warning", duration: 2000 });
            return;
        }
        // Kirim hanya field yang diisi
        const payload = {};
        filled.forEach(k => { payload[k] = formData[k]; });
        addMutation.mutate(payload);
    };

    const handleEditSubmit = () => {
        if (!formData.kode_barang) {
            toaster.create({ title: "Kode Barang wajib ada", type: "warning", duration: 2000 });
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

    const InputField = ({ label, name, value, type = "text", isReadOnly }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Input
                name={name}
                value={value}
                onChange={handleInputChange}
                type={type}
                size="sm"
                isReadOnly={isReadOnly}
                bg={isReadOnly ? (colorMode === "dark" ? "gray.700" : "gray.100") : undefined}
            />
        </Box>
    );

    const TextareaField = ({ label, name, value }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Textarea name={name} value={value} onChange={handleInputChange} rows={3} size="sm" />
        </Box>
    );

    const DetailRow = ({ label, value, isLink }) => (
        <Box borderBottom="1px solid" borderColor="gray.100" pb={2}>
            <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
            {isLink && isValidUrl(value) ? (
                <Flex align="center" gap={2}>
                    <Text fontSize="sm" color="blue.400" noOfLines={1}>{String(value)}</Text>
                    <Box as="a" href={String(value)} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink size={14} />
                    </Box>
                </Flex>
            ) : (
                <Text fontSize="sm" fontWeight="medium">{value ? String(value) : "-"}</Text>
            )}
        </Box>
    );

    // Form section yang dipakai di Add dan Edit modal
    const FormFields = ({ isEdit }) => (
        <Stack gap={5}>
            {isEdit && (
                <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                        Identitas (Read-only)
                    </Text>
                    <InputField label="Kode Barang" name="kode_barang" value={formData.kode_barang} isReadOnly />
                </Box>
            )}

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                    Info Barang
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <InputField label="No Gambar" name="no_gambar" value={formData.no_gambar || ""} />
                    <InputField label="Stock" name="stock" value={formData.stock || ""} />
                    <InputField label="Nama Barang" name="nama_barang" value={formData.nama_barang || ""} />
                    <InputField label="Kelompok" name="kelompok" value={formData.kelompok || ""} />
                    <InputField label="Jenis" name="jenis" value={formData.jenis || ""} />
                    <InputField label="Unit" name="unit" value={formData.unit || ""} />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                    Keterangan
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <InputField label="Merek" name="keterangan_merek" value={formData.keterangan_merek || ""} />
                    <InputField label="Ketebalan" name="keterangan_ketebalan" value={formData.keterangan_ketebalan || ""} />
                    <InputField label="Ukuran" name="keterangan_ukuran" value={formData.keterangan_ukuran || ""} />
                    <InputField label="Tipe" name="keterangan_tipe" value={formData.keterangan_tipe || ""} />
                    <InputField label="Warna" name="keterangan_warna" value={formData.keterangan_warna || ""} />
                    <InputField label="Lainnya" name="keterangan_lainnya" value={formData.keterangan_lainnya || ""} />
                </Grid>
                <Box mt={3}><TextareaField label="Notes" name="notes" value={formData.notes || ""} /></Box>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                    Lokasi & Jumlah
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <InputField label="Ruang" name="ruang" value={formData.ruang || ""} />
                    <InputField label="Area" name="area" value={formData.area || ""} />
                    <InputField label="Jumlah Barang" name="jumlah_barang" value={formData.jumlah_barang || ""} />
                    <InputField label="Jumlah Awal" name="jumlah_awal" value={formData.jumlah_awal || ""} />
                    <InputField label="Jumlah Minimum" name="jumlah_minimum" value={formData.jumlah_minimum || ""} />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                    Pembelian & Vendor
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <InputField label="Tanggal Beli" name="tanggal_beli" value={formData.tanggal_beli || ""} type="date" />
                    <InputField label="Nilai Awal" name="nilai_awal" value={formData.nilai_awal || ""} />
                    <InputField label="Nama Vendor" name="vendor_nama" value={formData.vendor_nama || ""} />
                    <InputField label="Alamat Vendor" name="vendor_alamat" value={formData.vendor_alamat || ""} />
                    <InputField label="Link Toko Vendor" name="vendor_link_toko" value={formData.vendor_link_toko || ""} />
                    <InputField label="Link Foto" name="link_foto" value={formData.link_foto || ""} />
                </Grid>
            </Box>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Data Stock</h1>
                    <Text className="subtitle">Kelola data inventaris stock barang</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Barang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Jumlah Kelompok</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueKelompok}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Jumlah Area</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueArea}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Stok Minimum</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: stats.minimumAlert > 0 ? "#f56565" : "inherit" }}>
                                {stats.minimumAlert}
                            </p>
                        )}
                    </InfoCard>
                </Box>

                {/* Search + Add */}
                <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama barang, kode, kelompok, area..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Stock
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data stock</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data stock"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="kode_barang" label="Kode Barang" minWidth="120px" />
                                        <SortableHeader column="nama_barang" label="Nama Barang" minWidth="180px" />
                                        <SortableHeader column="kelompok" label="Kelompok" minWidth="130px" />
                                        <SortableHeader column="jenis" label="Jenis" minWidth="120px" />
                                        <th style={{ minWidth: "100px" }}>Merek</th>
                                        <SortableHeader column="area" label="Area" minWidth="120px" />
                                        <SortableHeader column="ruang" label="Ruang" minWidth="120px" />
                                        <th style={{ minWidth: "100px", textAlign: "center" }}>Jml Masuk</th>
                                        <th style={{ minWidth: "100px", textAlign: "center" }}>Jml Keluar</th>
                                        <th style={{ minWidth: "100px", textAlign: "center" }}>Jml Akhir</th>
                                        <th style={{ minWidth: "100px", textAlign: "center" }}>Jml Min</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>Foto</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => {
                                        const akhir = Number(item.jumlah_akhir) || 0;
                                        const min = Number(item.jumlah_minimum) || 0;
                                        const isBelowMin = min > 0 && akhir <= min;
                                        return (
                                            <tr key={item.kode_barang || index}
                                                style={{ background: isBelowMin
                                                    ? colorMode === "dark" ? "rgba(245,101,101,0.08)" : "rgba(245,101,101,0.05)"
                                                    : undefined
                                                }}
                                            >
                                                <td>{startIndex + index + 1}</td>
                                                <td>{item.kode_barang || "-"}</td>
                                                <td>{item.nama_barang || "-"}</td>
                                                <td>{item.kelompok || "-"}</td>
                                                <td>{item.jenis || "-"}</td>
                                                <td>{item.keterangan_merek || "-"}</td>
                                                <td>{item.area || "-"}</td>
                                                <td>{item.ruang || "-"}</td>
                                                <td style={{ textAlign: "center" }}>{item.jumlah_masuk || "-"}</td>
                                                <td style={{ textAlign: "center" }}>{item.jumlah_keluar || "-"}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <Text
                                                        fontWeight={isBelowMin ? "bold" : "normal"}
                                                        color={isBelowMin ? "red.500" : "inherit"}
                                                    >
                                                        {item.jumlah_akhir || "-"}
                                                    </Text>
                                                </td>
                                                <td style={{ textAlign: "center" }}>{item.jumlah_minimum || "-"}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    {isValidUrl(item.link_foto) ? (
                                                        <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                            onClick={() => window.open(String(item.link_foto), "_blank", "noopener,noreferrer")}>
                                                            <FiExternalLink />
                                                        </IconButton>
                                                    ) : "-"}
                                                </td>
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    <Flex gap={1}>
                                                        <IconButton size="sm" variant="ghost" colorScheme="teal"
                                                            onClick={() => handleOpenDetail(item)}>
                                                            <FiUser />
                                                        </IconButton>
                                                        <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                            onClick={() => handleOpenEdit(item)}>
                                                            <FiEdit2 />
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

                {/* Detail Modal */}
                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Detail Stock — {selectedItem?.nama_barang}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedItem && (
                                <Stack gap={5}>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Identitas</Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Kode Barang" value={selectedItem.kode_barang} />
                                            <DetailRow label="No Urut" value={selectedItem.no_urut} />
                                            <DetailRow label="Nama Barang" value={selectedItem.nama_barang} />
                                            <DetailRow label="Stock" value={selectedItem.stock} />
                                            <DetailRow label="Kelompok" value={selectedItem.kelompok} />
                                            <DetailRow label="Jenis" value={selectedItem.jenis} />
                                            <DetailRow label="Unit" value={selectedItem.unit} />
                                        </Grid>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Keterangan</Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Merek" value={selectedItem.keterangan_merek} />
                                            <DetailRow label="Ketebalan" value={selectedItem.keterangan_ketebalan} />
                                            <DetailRow label="Ukuran" value={selectedItem.keterangan_ukuran} />
                                            <DetailRow label="Tipe" value={selectedItem.keterangan_tipe} />
                                            <DetailRow label="Warna" value={selectedItem.keterangan_warna} />
                                            <DetailRow label="Lainnya" value={selectedItem.keterangan_lainnya} />
                                            <DetailRow label="Notes" value={selectedItem.notes} />
                                        </Grid>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Lokasi & Jumlah</Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Ruang" value={selectedItem.ruang} />
                                            <DetailRow label="Area" value={selectedItem.area} />
                                            <DetailRow label="Jumlah Barang" value={selectedItem.jumlah_barang} />
                                            <DetailRow label="Jumlah Awal" value={selectedItem.jumlah_awal} />
                                            <DetailRow label="Jumlah Masuk" value={selectedItem.jumlah_masuk} />
                                            <DetailRow label="Jumlah Keluar" value={selectedItem.jumlah_keluar} />
                                            <DetailRow label="Jumlah Akhir" value={selectedItem.jumlah_akhir} />
                                            <DetailRow label="Jumlah Minimum" value={selectedItem.jumlah_minimum} />
                                        </Grid>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Pembelian & Vendor</Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Tanggal Beli" value={selectedItem.tanggal_beli} />
                                            <DetailRow label="Nilai Awal" value={selectedItem.nilai_awal} />
                                            <DetailRow label="Nama Vendor" value={selectedItem.vendor_nama} />
                                            <DetailRow label="Alamat Vendor" value={selectedItem.vendor_alamat} />
                                            <DetailRow label="Link Toko" value={selectedItem.vendor_link_toko} isLink />
                                            <DetailRow label="Link Foto" value={selectedItem.link_foto} isLink />
                                        </Grid>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Des</Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                                            <DetailRow label="Des 1" value={selectedItem.des_1} />
                                            <DetailRow label="Des 2" value={selectedItem.des_2} />
                                            <DetailRow label="Des 3" value={selectedItem.des_3} />
                                        </Grid>
                                    </Box>
                                </Stack>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Data Stock</ModalHeader>
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
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Stock — {formData.nama_barang}</ModalHeader>
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

export default StockPage;