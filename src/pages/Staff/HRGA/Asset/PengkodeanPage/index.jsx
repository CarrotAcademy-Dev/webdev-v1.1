import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getPengkodean, addPengkodean } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, Grid, Input, Select, Text, Badge,
    useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
    ModalHeader, ModalOverlay, Stack,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiInbox, FiList, FiPlus, FiSearch, FiTag, FiGrid,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const PengkodeanPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBlok, setSelectedBlok] = useState(null);
    const [addForm, setAddForm] = useState({ deskripsi: "", nama: "", kode: "" });
    const { data: pengkodeanData = [], isLoading, isError } = useQuery({
        queryKey: ["pengkodean"],
        queryFn: getPengkodean,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addPengkodean,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pengkodean"] });
            toaster.create({
                title: "Berhasil tambah pengkodean",
                description: `${data?.nama || ""} ditambahkan ke blok ${data?.deskripsi || ""}`,
                type: "success",
                duration: 3000,
            });
            setAddForm({ deskripsi: "", nama: "", kode: "" });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah pengkodean", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const totalBlok = pengkodeanData.length;
        const totalItem = pengkodeanData.reduce((sum, b) => sum + (b.items?.length || 0), 0);
        return { totalBlok, totalItem };
    }, [pengkodeanData]);

    // Daftar deskripsi untuk dropdown di form add
    const availableDeskripsi = useMemo(() => {
        return pengkodeanData.map(b => b.deskripsi).filter(Boolean);
    }, [pengkodeanData]);

    // Filter blok berdasarkan search
    const filteredPengkodean = useMemo(() => {
        if (!searchQuery) return pengkodeanData;
        const lower = searchQuery.toLowerCase();
        return pengkodeanData
            .map(blok => {
                const deskripsiMatch = blok.deskripsi?.toLowerCase().includes(lower);
                const filteredItems = blok.items?.filter(item =>
                    item.nama?.toLowerCase().includes(lower) ||
                    item.kode?.toLowerCase().includes(lower)
                ) || [];
                if (deskripsiMatch) return blok;
                if (filteredItems.length > 0) return { ...blok, items: filteredItems };
                return null;
            })
            .filter(Boolean);
    }, [pengkodeanData, searchQuery]);

    const handleAddSubmit = () => {
        if (!addForm.deskripsi.trim() || !addForm.nama.trim()) {
            toaster.create({ title: "Deskripsi dan nama wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate({
            deskripsi: addForm.deskripsi,
            nama: addForm.nama,
            ...(addForm.kode.trim() && { kode: addForm.kode }),
        });
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";
    const hoverBg = colorMode === "dark" ? "gray.700" : "gray.50";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Pengkodean</h1>
                    <Text className="subtitle">Kelola sistem pengkodean asset berdasarkan blok deskripsi</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiGrid size={28} />
                        <p>Total Blok</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalBlok}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTag size={28} />
                        <p>Total Item</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalItem}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Add */}
                <Flex className="search-container" mb={6} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari deskripsi, nama, atau kode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={onOpen}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Item
                    </Button>
                </Flex>

                {/* Content */}
                {isLoading ? (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Box key={i} borderRadius="12px" border="1px solid" borderColor={borderCol} overflow="hidden">
                                <Box p={4} borderBottom="1px solid" borderColor={borderCol}>
                                    <Skeleton height="24px" width="180px" />
                                </Box>
                                <Box p={4}>
                                    <Skeleton count={5} height={28} style={{ marginBottom: "6px" }} />
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                ) : isError ? (
                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data pengkodean</Text></Flex>
                ) : filteredPengkodean.length === 0 ? (
                    <Flex className="empty-state">
                        <FiInbox size={48} />
                        <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data pengkodean"}</Text>
                    </Flex>
                ) : (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {filteredPengkodean.map((blok) => (
                            <Box
                                key={blok.deskripsi}
                                bg={cardBg}
                                border="1px solid"
                                borderColor={selectedBlok?.deskripsi === blok.deskripsi ? "teal.400" : borderCol}
                                borderRadius="12px"
                                overflow="hidden"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ borderColor: "teal.300", shadow: "md" }}
                                onClick={() => setSelectedBlok(
                                    selectedBlok?.deskripsi === blok.deskripsi ? null : blok
                                )}
                            >
                                {/* Blok Header */}
                                <Flex
                                    p={4}
                                    borderBottom="1px solid"
                                    borderColor={borderCol}
                                    align="center"
                                    justify="space-between"
                                    bg={selectedBlok?.deskripsi === blok.deskripsi
                                        ? colorMode === "dark" ? "teal.900" : "teal.50"
                                        : "transparent"
                                    }
                                >
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">{blok.deskripsi}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                            Kode Header: {blok.kode_header || "-"}
                                        </Text>
                                    </Box>
                                    <Badge colorScheme="teal" borderRadius="full">
                                        {blok.items?.length || 0} item
                                    </Badge>
                                </Flex>

                                {/* Items List */}
                                <Box p={4} maxH="240px" overflowY="auto">
                                    {blok.items?.length === 0 ? (
                                        <Text fontSize="sm" color="gray.500">Belum ada item</Text>
                                    ) : (
                                        blok.items?.map((item, i) => (
                                            <Flex
                                                key={i}
                                                align="center"
                                                justify="space-between"
                                                py={1}
                                                px={2}
                                                borderRadius="md"
                                                _hover={{ bg: hoverBg }}
                                            >
                                                <Text fontSize="sm">{item.nama}</Text>
                                                <Badge
                                                    colorScheme="gray"
                                                    fontSize="xs"
                                                    fontFamily="mono"
                                                >
                                                    {item.kode}
                                                </Badge>
                                            </Flex>
                                        ))
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                )}

                {/* Selected Blok Detail Panel */}
                {selectedBlok && (
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
                                <Text fontWeight="bold" fontSize="lg">{selectedBlok.deskripsi}</Text>
                                <Text fontSize="sm" color="gray.500">
                                    Kode Header: {selectedBlok.kode_header} · {selectedBlok.items?.length} item
                                </Text>
                            </Box>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedBlok(null)}>
                                ✕ Tutup
                            </Button>
                        </Flex>

                        <Box p={4} overflowX="auto">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc" }}>
                                        {["No", "Nama", "Kode"].map(h => (
                                            <th key={h} style={{
                                                padding: "10px 16px",
                                                textAlign: "left",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                borderBottom: `2px solid ${borderCol}`,
                                                color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBlok.items?.map((item, i) => (
                                        <tr
                                            key={i}
                                            style={{
                                                borderBottom: `1px solid ${borderCol}`,
                                                background: i % 2 === 0
                                                    ? "transparent"
                                                    : colorMode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                            }}
                                        >
                                            <td style={{ padding: "10px 16px", fontSize: "14px", width: "50px" }}>
                                                {i + 1}
                                            </td>
                                            <td style={{ padding: "10px 16px", fontSize: "14px" }}>
                                                {item.nama || "-"}
                                            </td>
                                            <td style={{ padding: "10px 16px", fontSize: "14px" }}>
                                                <Badge colorScheme="blue" fontFamily="mono">
                                                    {item.kode || "-"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Box>
                )}

                {/* Add Item Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Item Pengkodean</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>
                                        Blok Tujuan (Deskripsi) <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Select
                                        value={addForm.deskripsi}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                                        placeholder="- Pilih blok -"
                                    >
                                        {availableDeskripsi.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </Select>
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>
                                        Nama <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Input
                                        value={addForm.nama}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, nama: e.target.value }))}
                                        placeholder="Nama item pengkodean"
                                    />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={1}>Kode</Text>
                                    <Text fontSize="xs" color="gray.500" mb={2}>
                                        Kosongkan untuk auto-generate dari item terakhir + 1
                                    </Text>
                                    <Input
                                        value={addForm.kode}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, kode: e.target.value }))}
                                        placeholder="Contoh: 05 (opsional)"
                                        fontFamily="mono"
                                    />
                                </Box>
            
                                {/* Preview blok terpilih */}
                                {addForm.deskripsi && (
                                    <Box
                                        p={3}
                                        borderRadius="md"
                                        bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                                        border="1px solid"
                                        borderColor={borderCol}
                                    >
                                        <Text fontSize="xs" color="gray.500" mb={1}>Preview blok terpilih:</Text>
                                        <Text fontSize="sm" fontWeight="medium">{addForm.deskripsi}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {pengkodeanData.find(b => b.deskripsi === addForm.deskripsi)?.items?.length || 0} item saat ini
                                        </Text>
                                    </Box>
                                )}
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>
                                Tambah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default PengkodeanPage;