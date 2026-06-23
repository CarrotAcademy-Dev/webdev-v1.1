import ContainerCarrot from "@/components/Container";
import { DaftarKirimMerchFinStyled } from "./DaftarKirimFin.styled";
import { Box, Button, Flex, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Stack, Text, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react";
import InfoCard from "@/components/InfoCard";
import { FiDollarSign, FiEdit2, FiInbox, FiList, FiPackage, FiSearch, FiTruck } from "react-icons/fi";
import Pagination from "@/components/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getDaftarKirimMerchandise, updateBiayaPengirimanMerch } from "@/features/finance/financeApiService";
import { toaster } from "@/components/ui/toaster";
import usePagination from "@/hooks/usePagination";

const EMPTY_FORM = {
    nis_siswa: "",
    biaya_pengiriman: "",
    // readonly
    merch: "",
    timestamp: "",
    nama_siswa: "",
    alamat: "",
    catatan_alamat: "",
    program: "",
    jenis_kelas: "",
    pdf: "",
    tanggal_kirim: "",
};

const KirimMerchandisePage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: merchData, isLoading, isError } = useQuery({
        queryKey: ["daftarKirimMerchandise"],
        queryFn: getDaftarKirimMerchandise,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const updateMutation = useMutation({
        mutationFn: updateBiayaPengirimanMerch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["daftarKirimMerchandise"] });
            toaster.create({ title: "Berhasil update data", type: "success", duration: 3000 });
            handleModalClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal update data",
                description: error?.message || "Terjadi kesalahan",
                type: "error",
                duration: 3000,
            });
        },
    });

    const stats = useMemo(() => {
        const data = merchData || [];
        const total = data.length;
        const sudahKirim = data.filter(i => i.tanggal_kirim && i.tanggal_kirim !== "").length;
        const belumKirim = total - sudahKirim;
        const sudahAdaBiaya = data.filter(i => i.biaya_pengiriman && i.biaya_pengiriman !== "").length;
        return { total, sudahKirim, belumKirim, sudahAdaBiaya };
    }, [merchData]);

    const filteredData = useMemo(() => {
        const data = merchData || [];
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(item =>
            (item.nama_siswa && item.nama_siswa.toLowerCase().includes(lower)) ||
            (item.nis && item.nis.toLowerCase().includes(lower)) ||
            (item.program && item.program.toLowerCase().includes(lower)) ||
            (item.merch && item.merch.toLowerCase().includes(lower))
        );
    }, [merchData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key] || "";
            const bVal = b[sortConfig.key] || "";
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

    const handleEdit = (item) => {
        setFormData({
            nis_siswa: item.nis || "",
            biaya_pengiriman: item.biaya_pengiriman || "",
            // readonly
            merch: item.merch || "",
            timestamp: item.timestamp || "",
            nama_siswa: item.nama_siswa || "",
            alamat: item.alamat || "",
            catatan_alamat: item.catatan_alamat || "",
            program: item.program || "",
            jenis_kelas: item.jenis_kelas || "",
            pdf: item.pdf || "",
            tanggal_kirim: item.tanggal_kirim || "",
        });
        onOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => updateMutation.mutate(formData);

    const handleModalClose = () => {
        setFormData(EMPTY_FORM);
        onClose();
    };

     const ReadOnlyField = ({ label, value }) => (
        <Box>
            <Text fontWeight="medium" mb={2}>{label}</Text>
            <Input value={value || "-"} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
        </Box>
    );

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
            <DaftarKirimMerchFinStyled colorMode={colorMode}>
                <Box className="header">
                    <h1>Kirim Merchandise</h1>
                    <Text className="subtitle">Kelola data pengiriman merchandise siswa</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid-daftar-kirim-merch" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Data</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTruck size={28} />
                        <p>Sudah Kirim</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahKirim}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Belum Kirim</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.belumKirim}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Ada Biaya</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahAdaBiaya}</p>}
                    </InfoCard>
                </Box>

                {/* Search */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama, NIS, program, atau merch..."
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
                        <Box p={4}><Skeleton count={20} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>Gagal memuat data merchandise</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data merchandise"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table style={{ minWidth: "1800px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="merch" label="Merch" minWidth="120px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <SortableHeader column="nis" label="NIS" minWidth="100px" />
                                        <SortableHeader column="nama_siswa" label="Nama Siswa" minWidth="180px" />
                                        <th style={{ minWidth: "200px" }}>Alamat</th>
                                        <th style={{ minWidth: "160px" }}>Catatan Alamat</th>
                                        <SortableHeader column="program" label="Program" minWidth="120px" />
                                        <SortableHeader column="jenis_kelas" label="Jenis Kelas" minWidth="120px" />
                                        <th style={{ minWidth: "80px" }}>PDF</th>
                                        <SortableHeader column="tanggal_kirim" label="Tgl Kirim" minWidth="130px" />
                                        <th style={{ minWidth: "130px" }}>Biaya Pengiriman</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.nis || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.merch}</td>
                                            <td>{item.timestamp}</td>
                                            <td>{item.nis}</td>
                                            <td>{item.nama_siswa}</td>
                                            <td>
                                                {item.alamat && item.alamat.length > 30 ? (
                                                    <Tooltip label={item.alamat}>
                                                        <span>{item.alamat.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.alamat || "-"}
                                            </td>
                                            <td>
                                                {item.catatan_alamat && item.catatan_alamat.length > 20 ? (
                                                    <Tooltip label={item.catatan_alamat}>
                                                        <span>{item.catatan_alamat.substring(0, 20)}...</span>
                                                    </Tooltip>
                                                ) : item.catatan_alamat || "-"}
                                            </td>
                                            <td>{item.program}</td>
                                            <td>{item.jenis_kelas}</td>
                                            <td>
                                                {item.pdf ? (
                                                    <a href={item.pdf} target="_blank" rel="noopener noreferrer">Lihat PDF</a>
                                                ) : "-"}
                                            </td>
                                            <td>{item.tanggal_kirim || "-"}</td>
                                            <td>{item.biaya_pengiriman || "-"}</td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <IconButton
                                                    size="sm"
                                                    backgroundColor="teal.400"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(item)}
                                                >
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

                {/* Edit Modal - hanya edit biaya pengiriman */}
                <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Biaya Pengiriman</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <ReadOnlyField label="NIS" value={formData.nis_siswa} />
                                <ReadOnlyField label="Nama Siswa" value={formData.nama_siswa} />
                                <ReadOnlyField label="Merch" value={formData.merch} />
                                <ReadOnlyField label="Program" value={formData.program} />
                                <ReadOnlyField label="Jenis Kelas" value={formData.jenis_kelas} />
                                <ReadOnlyField label="Alamat" value={formData.alamat} />
                                <ReadOnlyField label="Catatan Alamat" value={formData.catatan_alamat} />
                                <ReadOnlyField label="Tanggal Kirim" value={formData.tanggal_kirim} />

                                {/* Editable */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Biaya Pengiriman</Text>
                                    <Input
                                        name="biaya_pengiriman"
                                        value={formData.biaya_pengiriman}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 25000"
                                    />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleModalClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleSubmit} isLoading={updateMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </DaftarKirimMerchFinStyled>
        </ContainerCarrot>
    );
}

export default KirimMerchandisePage;