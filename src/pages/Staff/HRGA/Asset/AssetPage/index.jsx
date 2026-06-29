import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getAssetData, editAssetData } from "@/features/hr/assetApiServices";
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
    FiInbox, FiList, FiSearch, FiPackage, FiUser,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const EMPTY_EDIT_FORM = {
    kode_barang: "", no_gambar: "", asset: "", nama_barang: "", kelompok: "", jenis: "",
    keterangan_merek: "", keterangan_ukuran: "", keterangan_tipe: "", keterangan_warna: "",
    keterangan_lainnya: "", notes: "", unit: "", ruang: "", area: "", no_urut: "",
    dek_1: "", dek_2: "", dek_3: "", dek_4: "", link_foto: "",
    tanggal_beli: "", tanggal_instalasi: "", tanggal_service: "", nilai_awal: "",
    vendor_nama: "", vendor_alamat: "", vendor_link_toko: "", umur_manfaat: "",
    services_rutin: "", maintenance_rutin: "", notes_2: "", barcode: "",
};

const AssetPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: assetData = [], isLoading, isError } = useQuery({
        queryKey: ["assetData"],
        queryFn: getAssetData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editAssetData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assetData"] });
            toaster.create({ title: "Berhasil update data asset", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = assetData.length;
        const uniqueKelompok = new Set(assetData.map(i => i.kelompok).filter(Boolean)).size;
        const uniqueArea = new Set(assetData.map(i => i.area).filter(Boolean)).size;
        const adaFoto = assetData.filter(i => isValidUrl(i.link_foto)).length;
        return { total, uniqueKelompok, uniqueArea, adaFoto };
    }, [assetData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return assetData;
        const lower = searchQuery.toLowerCase();
        return assetData.filter(i =>
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.kode_barang && String(i.kode_barang).toLowerCase().includes(lower)) ||
            (i.kelompok && String(i.kelompok).toLowerCase().includes(lower)) ||
            (i.area && String(i.area).toLowerCase().includes(lower)) ||
            (i.ruang && String(i.ruang).toLowerCase().includes(lower))
        );
    }, [assetData, searchQuery]);

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
            kode_barang: item.kode_barang || "",
            no_gambar: item.no_gambar || "",
            asset: item.asset || "",
            nama_barang: item.nama_barang || "",
            kelompok: item.kelompok || "",
            jenis: item.jenis || "",
            keterangan_merek: item.keterangan_merek || "",
            keterangan_ukuran: item.keterangan_ukuran || "",
            keterangan_tipe: item.keterangan_tipe || "",
            keterangan_warna: item.keterangan_warna || "",
            keterangan_lainnya: item.keterangan_lainnya || "",
            notes: item.notes || "",
            unit: item.unit || "",
            ruang: item.ruang || "",
            area: item.area || "",
            no_urut: item.no_urut || "",
            dek_1: item.dek_1 || "",
            dek_2: item.dek_2 || "",
            dek_3: item.dek_3 || "",
            dek_4: item.dek_4 || "",
            link_foto: item.link_foto || "",
            tanggal_beli: item.tanggal_beli || "",
            tanggal_instalasi: item.tanggal_instalasi || "",
            tanggal_service: item.tanggal_service || "",
            nilai_awal: item.nilai_awal || "",
            vendor_nama: item.vendor_nama || "",
            vendor_alamat: item.vendor_alamat || "",
            vendor_link_toko: item.vendor_link_toko || "",
            umur_manfaat: item.umur_manfaat || "",
            services_rutin: item.services_rutin || "",
            maintenance_rutin: item.maintenance_rutin || "",
            notes_2: item.notes_2 || "",
            barcode: item.barcode || "",
        });
        onEditOpen();
    };

    const handleOpenDetail = (item) => {
        setSelectedItem(item);
        onDetailOpen();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = () => {
        if (!editForm.kode_barang) {
            toaster.create({ title: "Kode Barang wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(editForm);
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
            <Input name={name} value={value} onChange={handleEditChange} type={type} size="sm" />
        </Box>
    );

    const TextareaField = ({ label, name, value }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Textarea name={name} value={value} onChange={handleEditChange} rows={3} size="sm" />
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

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Data Asset</h1>
                    <Text className="subtitle">Kelola data inventaris asset perusahaan</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Asset</p>
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
                        <FiExternalLink size={28} />
                        <p>Ada Foto</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaFoto}</p>}
                    </InfoCard>
                </Box>

                {/* Search */}
                <Flex className="search-container" mb={4}>
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
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data asset</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data asset"}</Text>
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
                                        <th style={{ minWidth: "120px" }}>Merek</th>
                                        <SortableHeader column="ruang" label="Ruang" minWidth="120px" />
                                        <SortableHeader column="area" label="Area" minWidth="120px" />
                                        <th style={{ minWidth: "120px" }}>Tanggal Beli</th>
                                        <th style={{ minWidth: "130px" }}>Nilai Awal</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>Foto</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.kode_barang || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.kode_barang || "-"}</td>
                                            <td>{item.nama_barang || "-"}</td>
                                            <td>{item.kelompok || "-"}</td>
                                            <td>{item.jenis || "-"}</td>
                                            <td>{item.keterangan_merek || "-"}</td>
                                            <td>{item.ruang || "-"}</td>
                                            <td>{item.area || "-"}</td>
                                            <td>{String(item.tanggal_beli || "-")}</td>
                                            <td>{item.nilai_awal || "-"}</td>
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

                {/* Detail Modal */}
                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Detail Asset — {selectedItem?.nama_barang}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedItem && (
                                <Stack gap={5}>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                            Identitas Barang
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Kode Barang" value={selectedItem.kode_barang} />
                                            <DetailRow label="Nama Barang" value={selectedItem.nama_barang} />
                                            <DetailRow label="Asset" value={selectedItem.asset} />
                                            <DetailRow label="Kelompok" value={selectedItem.kelompok} />
                                            <DetailRow label="Jenis" value={selectedItem.jenis} />
                                            <DetailRow label="Barcode" value={selectedItem.barcode} />
                                            <DetailRow label="No Gambar" value={selectedItem.no_gambar} />
                                            <DetailRow label="No Urut" value={selectedItem.no_urut} />
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                            Keterangan
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Merek" value={selectedItem.keterangan_merek} />
                                            <DetailRow label="Ukuran" value={selectedItem.keterangan_ukuran} />
                                            <DetailRow label="Tipe" value={selectedItem.keterangan_tipe} />
                                            <DetailRow label="Warna" value={selectedItem.keterangan_warna} />
                                            <DetailRow label="Lainnya" value={selectedItem.keterangan_lainnya} />
                                            <DetailRow label="Notes" value={selectedItem.notes} />
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                            Lokasi
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Unit" value={selectedItem.unit} />
                                            <DetailRow label="Ruang" value={selectedItem.ruang} />
                                            <DetailRow label="Area" value={selectedItem.area} />
                                            <DetailRow label="Dek 1" value={selectedItem.dek_1} />
                                            <DetailRow label="Dek 2" value={selectedItem.dek_2} />
                                            <DetailRow label="Dek 3" value={selectedItem.dek_3} />
                                            <DetailRow label="Dek 4" value={selectedItem.dek_4} />
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                            Tanggal & Nilai
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Tanggal Beli" value={selectedItem.tanggal_beli} />
                                            <DetailRow label="Tanggal Instalasi" value={selectedItem.tanggal_instalasi} />
                                            <DetailRow label="Tanggal Service" value={selectedItem.tanggal_service} />
                                            <DetailRow label="Nilai Awal" value={selectedItem.nilai_awal} />
                                            <DetailRow label="Umur Manfaat" value={selectedItem.umur_manfaat} />
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                            Vendor
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Nama Vendor" value={selectedItem.vendor_nama} />
                                            <DetailRow label="Alamat Vendor" value={selectedItem.vendor_alamat} />
                                            <DetailRow label="Link Toko" value={selectedItem.vendor_link_toko} isLink />
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                            Rutinitas & Lainnya
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                            <DetailRow label="Services Rutin" value={selectedItem.services_rutin} />
                                            <DetailRow label="Maintenance Rutin" value={selectedItem.maintenance_rutin} />
                                            <DetailRow label="Notes 2" value={selectedItem.notes_2} />
                                            <DetailRow label="Link Foto" value={selectedItem.link_foto} isLink />
                                        </Grid>
                                    </Box>
                                </Stack>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Asset — {editForm.nama_barang}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={5}>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        Identitas (Kode Barang Read-only)
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Kode Barang</Text>
                                            <Input value={editForm.kode_barang} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} size="sm" />
                                        </Box>
                                        <InputField label="No Gambar" name="no_gambar" value={editForm.no_gambar} />
                                        <InputField label="Asset" name="asset" value={editForm.asset} />
                                        <InputField label="Nama Barang" name="nama_barang" value={editForm.nama_barang} />
                                        <InputField label="Kelompok" name="kelompok" value={editForm.kelompok} />
                                        <InputField label="Jenis" name="jenis" value={editForm.jenis} />
                                        <InputField label="Barcode" name="barcode" value={editForm.barcode} />
                                        <InputField label="No Urut" name="no_urut" value={editForm.no_urut} />
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Keterangan</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Merek" name="keterangan_merek" value={editForm.keterangan_merek} />
                                        <InputField label="Ukuran" name="keterangan_ukuran" value={editForm.keterangan_ukuran} />
                                        <InputField label="Tipe" name="keterangan_tipe" value={editForm.keterangan_tipe} />
                                        <InputField label="Warna" name="keterangan_warna" value={editForm.keterangan_warna} />
                                        <InputField label="Lainnya" name="keterangan_lainnya" value={editForm.keterangan_lainnya} />
                                    </Grid>
                                    <Box mt={3}><TextareaField label="Notes" name="notes" value={editForm.notes} /></Box>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Lokasi</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Unit" name="unit" value={editForm.unit} />
                                        <InputField label="Ruang" name="ruang" value={editForm.ruang} />
                                        <InputField label="Area" name="area" value={editForm.area} />
                                        <InputField label="Dek 1" name="dek_1" value={editForm.dek_1} />
                                        <InputField label="Dek 2" name="dek_2" value={editForm.dek_2} />
                                        <InputField label="Dek 3" name="dek_3" value={editForm.dek_3} />
                                        <InputField label="Dek 4" name="dek_4" value={editForm.dek_4} />
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Tanggal & Nilai</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Tanggal Beli" name="tanggal_beli" value={editForm.tanggal_beli} type="date" />
                                        <InputField label="Tanggal Instalasi" name="tanggal_instalasi" value={editForm.tanggal_instalasi} type="date" />
                                        <InputField label="Tanggal Service" name="tanggal_service" value={editForm.tanggal_service} type="date" />
                                        <InputField label="Nilai Awal" name="nilai_awal" value={editForm.nilai_awal} />
                                        <InputField label="Umur Manfaat" name="umur_manfaat" value={editForm.umur_manfaat} />
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Vendor</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Nama Vendor" name="vendor_nama" value={editForm.vendor_nama} />
                                        <InputField label="Alamat Vendor" name="vendor_alamat" value={editForm.vendor_alamat} />
                                        <InputField label="Link Toko" name="vendor_link_toko" value={editForm.vendor_link_toko} />
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Rutinitas & Lainnya</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Services Rutin" name="services_rutin" value={editForm.services_rutin} />
                                        <InputField label="Maintenance Rutin" name="maintenance_rutin" value={editForm.maintenance_rutin} />
                                        <InputField label="Link Foto" name="link_foto" value={editForm.link_foto} />
                                    </Grid>
                                    <Box mt={3}><TextareaField label="Notes 2" name="notes_2" value={editForm.notes_2} /></Box>
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
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default AssetPage;