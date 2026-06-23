import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getKelompokBarang, addKelompokBarangKategori } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, Grid, Input, Text, Textarea, Badge,
    useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
    ModalHeader, ModalOverlay, Stack,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiInbox, FiList, FiPlus, FiSearch, FiPackage, FiGrid,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const KelompokBarangPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [addForm, setAddForm] = useState({ nama_kategori: "", items: "" });

    const { data: kelompokData = [], isLoading, isError } = useQuery({
        queryKey: ["kelompokBarang"],
        queryFn: getKelompokBarang,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addKelompokBarangKategori,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kelompokBarang"] });
            toaster.create({ title: "Berhasil tambah kategori", type: "success", duration: 3000 });
            setAddForm({ nama_kategori: "", items: "" });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah kategori", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const totalKategori = kelompokData.length;
        const totalBarang = kelompokData.reduce((sum, k) => sum + (k.items?.length || 0), 0);
        return { totalKategori, totalBarang };
    }, [kelompokData]);

    // Filter kategori berdasarkan search
    const filteredKelompok = useMemo(() => {
        if (!searchQuery) return kelompokData;
        const lower = searchQuery.toLowerCase();
        return kelompokData
            .map(kategori => {
                // Cek apakah nama kategori match
                const namaMatch = kategori.nama_kategori?.toLowerCase().includes(lower);
                // Filter items yang match
                const filteredItems = kategori.items?.filter(item =>
                    item.nama_barang?.toLowerCase().includes(lower)
                ) || [];

                if (namaMatch) return kategori; // tampilkan semua items kalau nama kategori match
                if (filteredItems.length > 0) return { ...kategori, items: filteredItems }; // tampilkan items yang match saja
                return null;
            })
            .filter(Boolean);
    }, [kelompokData, searchQuery]);

    const handleAddSubmit = () => {
        if (!addForm.nama_kategori.trim()) {
            toaster.create({ title: "Nama kategori wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(addForm);
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";
    const hoverBg = colorMode === "dark" ? "gray.700" : "gray.50";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Kelompok Barang</h1>
                    <Text className="subtitle">Kelola kategori dan pengelompokan asset/barang</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiGrid size={28} />
                        <p>Total Kategori</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalKategori}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Total Barang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalBarang}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Add */}
                <Flex className="search-container" mb={6} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari kategori atau nama barang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={onOpen}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Kategori
                    </Button>
                </Flex>

                {/* Content */}
                {isLoading ? (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Box key={i} borderRadius="12px" border="1px solid" borderColor={borderCol} overflow="hidden">
                                <Box p={4} borderBottom="1px solid" borderColor={borderCol}>
                                    <Skeleton height="24px" width="150px" />
                                </Box>
                                <Box p={4}>
                                    <Skeleton count={5} height={28} style={{ marginBottom: "6px" }} />
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                ) : isError ? (
                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data kelompok barang</Text></Flex>
                ) : filteredKelompok.length === 0 ? (
                    <Flex className="empty-state">
                        <FiInbox size={48} />
                        <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data kelompok barang"}</Text>
                    </Flex>
                ) : (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {filteredKelompok.map((kategori) => (
                            <Box
                                key={kategori.kode_kategori}
                                bg={cardBg}
                                border="1px solid"
                                borderColor={selectedKategori?.kode_kategori === kategori.kode_kategori ? "teal.400" : borderCol}
                                borderRadius="12px"
                                overflow="hidden"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ borderColor: "teal.300", shadow: "md" }}
                                onClick={() => setSelectedKategori(
                                    selectedKategori?.kode_kategori === kategori.kode_kategori ? null : kategori
                                )}
                            >
                                {/* Kategori Header */}
                                <Flex
                                    p={4}
                                    borderBottom="1px solid"
                                    borderColor={borderCol}
                                    align="center"
                                    justify="space-between"
                                    bg={selectedKategori?.kode_kategori === kategori.kode_kategori
                                        ? colorMode === "dark" ? "teal.900" : "teal.50"
                                        : "transparent"}
                                >
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">{kategori.nama_kategori}</Text>
                                        <Text fontSize="xs" color="gray.500">Kode: {kategori.kode_kategori}</Text>
                                    </Box>
                                    <Badge colorScheme="teal" borderRadius="full">
                                        {kategori.items?.length || 0} item
                                    </Badge>
                                </Flex>

                                {/* Items List */}
                                <Box p={4} maxH="240px" overflowY="auto">
                                    {kategori.items?.length === 0 ? (
                                        <Text fontSize="sm" color="gray.500">Belum ada item</Text>
                                    ) : (
                                        kategori.items?.map((item, i) => (
                                            <Flex
                                                key={i}
                                                align="center"
                                                gap={2}
                                                py={1}
                                                px={2}
                                                borderRadius="md"
                                                _hover={{ bg: hoverBg }}
                                            >
                                                <Text fontSize="xs" color="gray.400" minW="24px">{item.no}.</Text>
                                                <Text fontSize="sm">{item.nama_barang}</Text>
                                            </Flex>
                                        ))
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                )}

                {/* Selected Kategori Detail Panel */}
                {selectedKategori && (
                    <Box
                        mt={6}
                        bg={cardBg}
                        border="1px solid"
                        borderColor="teal.400"
                        borderRadius="12px"
                        overflow="hidden"
                    >
                        <Flex p={4} borderBottom="1px solid" borderColor={borderCol} align="center" justify="space-between">
                            <Box>
                                <Text fontWeight="bold" fontSize="lg">{selectedKategori.nama_kategori}</Text>
                                <Text fontSize="sm" color="gray.500">Kode: {selectedKategori.kode_kategori} · {selectedKategori.items?.length} item</Text>
                            </Box>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedKategori(null)}>✕ Tutup</Button>
                        </Flex>
                        <Box p={4}>
                            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} gap={2}>
                                {selectedKategori.items?.map((item, i) => (
                                    <Flex
                                        key={i}
                                        align="center"
                                        gap={2}
                                        p={2}
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor={borderCol}
                                        bg={hoverBg}
                                    >
                                        <Text fontSize="xs" color="gray.400" minW="20px">{item.no}.</Text>
                                        <Text fontSize="sm" fontWeight="medium">{item.nama_barang}</Text>
                                    </Flex>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                )}

                {/* Add Kategori Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Kategori Baru</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama Kategori <Text as="span" color="red.500">*</Text></Text>
                                    <Input
                                        value={addForm.nama_kategori}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, nama_kategori: e.target.value }))}
                                        placeholder="Contoh: Cleaning Tools"
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={1}>Daftar Item</Text>
                                    <Text fontSize="xs" color="gray.500" mb={2}>
                                        Satu nama barang per baris. Kode kategori di-generate otomatis.
                                    </Text>
                                    <Textarea
                                        value={addForm.items}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, items: e.target.value }))}
                                        placeholder={"Sapu\nKemoceng\nPel Lantai"}
                                        rows={8}
                                        fontFamily="mono"
                                        fontSize="sm"
                                    />
                                    {addForm.items && (
                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                            {addForm.items.split("\n").filter(l => l.trim()).length} item
                                        </Text>
                                    )}
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>
                                Tambah Kategori
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default KelompokBarangPage;