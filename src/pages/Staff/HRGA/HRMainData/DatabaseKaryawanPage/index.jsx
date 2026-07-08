import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import {
    getDatabaseKaryawan, editDatabaseKaryawan,
    deleteDatabaseKaryawan, tambahDatabaseKaryawan,
} from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
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
    FiInbox, FiList, FiPlus, FiSearch, FiTrash2, FiUser, FiUsers,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const STATUS_COLORS = {
    "Aktif": "green",
    "Tidak Aktif": "red",
    "aktif": "green",
    "tidak aktif": "red",
};

const DIVISI_OPTIONS = ["CSO", "ESO", "Finance", "HRGA", "Academic", "Marketing", "IT", "Management"];
const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"];
const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const STATUS_KAWIN_OPTIONS = ["Belum Menikah", "Menikah", "Cerai Hidup", "Cerai Mati"];

const EDITABLE_FIELDS = [
    "code_name", "nama", "tanggal_masuk", "masa_kerja", "divisi", "jabatan", "level",
    "npwp", "no_ktp", "jenis_kelamin", "agama", "aktif_tidak_aktif", "status",
    "nama_jabatan_sekarang", "tingkat_pekerjaan_sekarang", "tanggal_lahir",
    "jam_masuk", "durasi_kerja", "tanggal_selesai_magang",
    "h1_bulan_selesai_probation", "tanggal_selesai_probation",
    "h3_bulan_selesai_kontrak", "tanggal_selesai_kontrak",
    "tanggal_keluar", "jatah_cuti", "email", "no_telp",
    "domisili", "alamat_ktp", "status_kawin", "jumlah_anak",
    "akun_bank", "no_rekening", "note",
    "foto_ktp", "foto_kartu_keluarga", "foto_npwp", "link_sheet_absensi",
];

const EMPTY_FORM = EDITABLE_FIELDS.reduce((acc, k) => ({ ...acc, [k]: "" }), { id_karyawan: "" });

const DatabaseKaryawanPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterDivisi, setFilterDivisi] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: karyawanData = [], isLoading, isError } = useQuery({
        queryKey: ["databaseKaryawan"],
        queryFn: getDatabaseKaryawan,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: tambahDatabaseKaryawan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseKaryawan"] });
            toaster.create({ title: "Berhasil tambah karyawan", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah karyawan", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editDatabaseKaryawan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseKaryawan"] });
            toaster.create({ title: "Berhasil update data karyawan", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDatabaseKaryawan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["databaseKaryawan"] });
            toaster.create({ title: "Berhasil hapus karyawan", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = karyawanData.length;
        const aktif = karyawanData.filter(i => String(i.aktif_tidak_aktif || "").toLowerCase() === "aktif").length;
        const uniqueDivisi = new Set(karyawanData.map(i => i.divisi).filter(Boolean)).size;
        const magang = karyawanData.filter(i => String(i.status || "").toLowerCase().includes("magang")).length;
        return { total, aktif, uniqueDivisi, magang };
    }, [karyawanData]);

    const availableDivisi = useMemo(() => {
        const set = new Set(karyawanData.map(i => i.divisi).filter(Boolean));
        return [...set].sort();
    }, [karyawanData]);

    const filteredData = useMemo(() => {
        let data = karyawanData;
        if (filterDivisi !== "all") data = data.filter(i => i.divisi === filterDivisi);
        if (filterStatus !== "all") data = data.filter(i => String(i.aktif_tidak_aktif || "").toLowerCase() === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.code_name && String(i.code_name).toLowerCase().includes(lower)) ||
            (i.id_karyawan && String(i.id_karyawan).toLowerCase().includes(lower)) ||
            (i.jabatan && String(i.jabatan).toLowerCase().includes(lower))
        );
    }, [karyawanData, searchQuery, filterDivisi, filterStatus]);

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
        const form = { id_karyawan: item.id_karyawan || "" };
        EDITABLE_FIELDS.forEach(k => { form[k] = item[k] ?? ""; });
        setFormData(form);
        onEditOpen();
    };

    const handleOpenDetail = (item) => { setSelectedItem(item); onDetailOpen(); };
    const handleOpenDelete = (item) => { setSelectedItem(item); onDeleteOpen(); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        if (!formData.id_karyawan?.trim()) {
            toaster.create({ title: "ID Karyawan wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(formData);
    };

    const handleEditSubmit = () => {
        if (!formData.id_karyawan) {
            toaster.create({ title: "ID Karyawan tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(formData);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedItem.id_karyawan);
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    // Reusable form field components
    const F = ({ label, name, type = "text", required }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">
                {label} {required && <Text as="span" color="red.500">*</Text>}
            </Text>
            <Input name={name} value={formData[name] ?? ""} onChange={handleInputChange} type={type} size="sm" />
        </Box>
    );

    const FS = ({ label, name, options }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Select name={name} value={formData[name] ?? ""} onChange={handleInputChange} size="sm" placeholder="- Pilih -">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
        </Box>
    );

    const FormBody = ({ isEdit }) => (
        <Stack gap={5}>
            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Identitas</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <Box>
                        <Text fontWeight="medium" mb={2} fontSize="sm">ID Karyawan {!isEdit && <Text as="span" color="red.500">*</Text>}</Text>
                        <Input name="id_karyawan" value={formData.id_karyawan} onChange={handleInputChange} size="sm"
                            isReadOnly={isEdit} bg={isEdit ? (colorMode === "dark" ? "gray.700" : "gray.100") : undefined} />
                    </Box>
                    <F label="Code Name" name="code_name" />
                    <F label="Nama" name="nama" />
                    <F label="Jabatan" name="jabatan" />
                    <FS label="Divisi" name="divisi" options={availableDivisi.length > 0 ? availableDivisi : DIVISI_OPTIONS} />
                    <F label="Level" name="level" />
                    <FS label="Jenis Kelamin" name="jenis_kelamin" options={JENIS_KELAMIN_OPTIONS} />
                    <FS label="Agama" name="agama" options={AGAMA_OPTIONS} />
                    <FS label="Status Aktif" name="aktif_tidak_aktif" options={["Aktif", "Tidak Aktif"]} />
                    <F label="Status" name="status" />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Tanggal Penting</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <F label="Tanggal Masuk" name="tanggal_masuk" type="date" />
                    <F label="Tanggal Lahir" name="tanggal_lahir" type="date" />
                    <F label="Selesai Magang" name="tanggal_selesai_magang" type="date" />
                    <F label="H-1 Selesai Probation" name="h1_bulan_selesai_probation" type="date" />
                    <F label="Selesai Probation" name="tanggal_selesai_probation" type="date" />
                    <F label="H-3 Selesai Kontrak" name="h3_bulan_selesai_kontrak" type="date" />
                    <F label="Selesai Kontrak" name="tanggal_selesai_kontrak" type="date" />
                    <F label="Tanggal Keluar" name="tanggal_keluar" type="date" />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Kontak & Alamat</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <F label="Email" name="email" type="email" />
                    <F label="No Telp" name="no_telp" />
                    <F label="Domisili" name="domisili" />
                    <F label="Alamat KTP" name="alamat_ktp" />
                    <FS label="Status Kawin" name="status_kawin" options={STATUS_KAWIN_OPTIONS} />
                    <F label="Jumlah Anak" name="jumlah_anak" />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Keuangan & Dokumen</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <F label="NPWP" name="npwp" />
                    <F label="No KTP" name="no_ktp" />
                    <F label="Akun Bank" name="akun_bank" />
                    <F label="No Rekening" name="no_rekening" />
                    <F label="Jatah Cuti" name="jatah_cuti" />
                    <F label="Jam Masuk" name="jam_masuk" />
                    <F label="Durasi Kerja" name="durasi_kerja" />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Link Dokumen</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    <F label="Foto KTP (URL)" name="foto_ktp" />
                    <F label="Foto KK (URL)" name="foto_kartu_keluarga" />
                    <F label="Foto NPWP (URL)" name="foto_npwp" />
                    <F label="Link Sheet Absensi" name="link_sheet_absensi" />
                </Grid>
            </Box>

            <Box>
                <Text fontWeight="medium" mb={2} fontSize="sm">Note</Text>
                <Textarea name="note" value={formData.note ?? ""} onChange={handleInputChange} rows={3} size="sm" />
            </Box>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Database Karyawan</h1>
                    <Text className="subtitle">Kelola data lengkap seluruh karyawan</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard><FiUsers size={28} /><p>Total Karyawan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard><FiUser size={28} /><p>Aktif</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.aktif}</p>}
                    </InfoCard>
                    <InfoCard><FiList size={28} /><p>Divisi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueDivisi}</p>}
                    </InfoCard>
                    <InfoCard><FiUser size={28} /><p>Magang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.magang}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4} gap={3} wrap="wrap" justify="space-between" align="center">
                    <Flex gap={3} wrap="wrap" flex={1}>
                        <Box position="relative" maxWidth="320px" width="100%">
                            <Input placeholder="Cari nama, ID, code name, jabatan..."
                                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} pl="40px" />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <FiSearch size={18} />
                            </Box>
                        </Box>
                        <Select maxW="180px" value={filterDivisi} onChange={(e) => { setFilterDivisi(e.target.value); setCurrentPage(1); }}>
                            <option value="all">Semua Divisi</option>
                            {availableDivisi.map(d => <option key={d} value={d}>{d}</option>)}
                        </Select>
                        <Select maxW="160px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                            <option value="all">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="tidak aktif">Tidak Aktif</option>
                        </Select>
                    </Flex>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Karyawan
                    </Button>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data karyawan</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data karyawan"}</Text></Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="id_karyawan" label="ID" minWidth="100px" />
                                        <SortableHeader column="code_name" label="Code" minWidth="80px" />
                                        <SortableHeader column="nama" label="Nama" minWidth="160px" />
                                        <SortableHeader column="divisi" label="Divisi" minWidth="100px" />
                                        <SortableHeader column="jabatan" label="Jabatan" minWidth="140px" />
                                        <th style={{ minWidth: "80px" }}>Level</th>
                                        <SortableHeader column="aktif_tidak_aktif" label="Status" minWidth="100px" />
                                        <th style={{ minWidth: "120px" }}>Tgl Masuk</th>
                                        <th style={{ minWidth: "130px" }}>Email</th>
                                        <th style={{ minWidth: "120px" }}>No Telp</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>Absensi</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id_karyawan || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.id_karyawan || "-"}</td>
                                            <td>{item.code_name || "-"}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.divisi || "-"}</td>
                                            <td>{item.jabatan || "-"}</td>
                                            <td>{item.level || "-"}</td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.aktif_tidak_aktif] || "gray"}>
                                                    {item.aktif_tidak_aktif || "-"}
                                                </Badge>
                                            </td>
                                            <td>{item.tanggal_masuk || "-"}</td>
                                            <td>{item.email?.length > 25 ? (
                                                <Tooltip label={item.email}><span>{item.email.substring(0, 25)}...</span></Tooltip>
                                            ) : item.email || "-"}</td>
                                            <td>{item.no_telp || "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                {isValidUrl(item.link_sheet_absensi) ? (
                                                    <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                        onClick={() => window.open(String(item.link_sheet_absensi), "_blank", "noopener,noreferrer")}>
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Flex gap={1}>
                                                    <IconButton size="sm" variant="ghost" colorScheme="teal" onClick={() => handleOpenDetail(item)}>
                                                        <FiUser />
                                                    </IconButton>
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

                {/* Detail Modal */}
                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="3xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Detail Karyawan — {selectedItem?.nama}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedItem && (
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    {Object.entries(selectedItem)
                                        .filter(([k]) => k !== "row")
                                        .map(([key, val]) => {
                                            const isLink = ["foto_ktp", "foto_kartu_keluarga", "foto_npwp", "link_sheet_absensi"].includes(key) && isValidUrl(String(val));
                                            return (
                                                <Box key={key} borderBottom="1px solid" borderColor={borderCol} pb={2}>
                                                    <Text fontSize="xs" color="gray.500" mb={1}>{key.replace(/_/g, " ").toUpperCase()}</Text>
                                                    {isLink ? (
                                                        <Flex align="center" gap={2}>
                                                            <Text fontSize="sm" color="blue.400" noOfLines={1}>{String(val)}</Text>
                                                            <Box as="a" href={String(val)} target="_blank" rel="noopener noreferrer"><FiExternalLink size={14} /></Box>
                                                        </Flex>
                                                    ) : (
                                                        <Text fontSize="sm" fontWeight="medium">{val !== null && val !== undefined && val !== "" ? String(val) : "-"}</Text>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </Grid>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Tambah Karyawan Baru</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormBody isEdit={false} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>Tambah</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Edit Karyawan — {formData.nama}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormBody isEdit={true} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>Simpan</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation */}
                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Karyawan</AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus karyawan <strong>{selectedItem?.nama}</strong>?
                                Semua data akan terhapus permanen.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>Batal</Button>
                                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3} isLoading={deleteMutation.isPending}>Hapus</Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default DatabaseKaryawanPage;