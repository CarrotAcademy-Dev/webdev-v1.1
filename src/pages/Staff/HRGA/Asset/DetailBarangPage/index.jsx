import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getDetailBarang } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, Input, Skeleton, Text, useColorMode,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
    FiSearch, FiPackage, FiInbox, FiClock, FiMapPin, FiBox,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const DetailBarangPage = () => {
    const { colorMode } = useColorMode();
    const [searchInput, setSearchInput] = useState("");
    const [detailData, setDetailData] = useState(null);

    const searchMutation = useMutation({
        mutationFn: getDetailBarang,
        onSuccess: (data) => {
            setDetailData(data);
        },
        onError: (error) => {
            toaster.create({
                title: "Barang tidak ditemukan",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
            setDetailData(null);
        },
    });

    const handleSearch = () => {
        if (!searchInput.trim()) {
            toaster.create({ title: "Masukkan nama barang", type: "warning", duration: 2000 });
            return;
        }
        searchMutation.mutate(searchInput.trim());
    };

    const historyServices = detailData?.history_services || [];

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "#4a5568" : "#e2e8f0";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Detail Barang</h1>
                    <Text className="subtitle">Cari dan lihat detail lengkap suatu barang/asset</Text>
                </Box>

                {/* Search Bar */}
                <Flex gap={3} mb={6} maxW="500px">
                    <Box position="relative" flex={1}>
                        <Input
                            placeholder="Cari nama barang..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button
                        colorScheme="teal"
                        onClick={handleSearch}
                        isLoading={searchMutation.isPending}
                        minW="90px"
                    >
                        Cari
                    </Button>
                </Flex>

                {/* Loading State */}
                {searchMutation.isPending && (
                    <Box>
                        <Skeleton height="36px" width="300px" style={{ marginBottom: "8px" }} />
                        <Skeleton height="20px" width="150px" style={{ marginBottom: "24px" }} />

                        {/* Stats skeleton */}
                        <Box className="stats-grid" mb={6}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Box key={i} p={4} borderRadius="12px" border="1px solid" borderColor={borderCol}>
                                    <Skeleton height="28px" width="28px" style={{ marginBottom: "8px" }} />
                                    <Skeleton height="16px" width="80px" style={{ marginBottom: "8px" }} />
                                    <Skeleton height="32px" width="60px" />
                                </Box>
                            ))}
                        </Box>

                        {/* Table skeleton */}
                        <Box borderRadius="12px" border="1px solid" borderColor={borderCol} overflow="hidden">
                            <Box p={4} borderBottom="1px solid" borderColor={borderCol}>
                                <Skeleton height="24px" width="150px" />
                            </Box>
                            <Box p={4}>
                                <Skeleton count={5} height={40} style={{ marginBottom: "8px" }} />
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Empty State — belum pernah search */}
                {!detailData && !searchMutation.isPending && !searchMutation.isError && (
                    <Flex className="empty-state">
                        <FiPackage size={48} />
                        <Text>Cari nama barang untuk melihat detail</Text>
                    </Flex>
                )}

                {/* Error State */}
                {searchMutation.isError && !searchMutation.isPending && (
                    <Flex className="empty-state">
                        <FiInbox size={48} />
                        <Text>Barang tidak ditemukan atau terjadi kesalahan</Text>
                    </Flex>
                )}

                {/* Detail Content */}
                {detailData && !searchMutation.isPending && (
                    <>
                        {/* Header */}
                        <Box mb={6}>
                            <Text fontSize="2xl" fontWeight="bold">{detailData.nama_barang}</Text>
                            <Text color="gray.500" fontSize="sm" mt={1}>
                                Kode: {detailData.kode_barang || "-"}
                            </Text>
                        </Box>

                        {/* Stats Cards */}
                        <Box className="stats-grid" mb={6}>
                            <InfoCard>
                                <FiBox size={28} />
                                <p>Sisa Stock</p>
                                <p className="card__points">{detailData.sisa_stock ?? "-"}</p>
                            </InfoCard>
                            <InfoCard>
                                <FiClock size={28} />
                                <p>Sisa Umur Manfaat</p>
                                <p className="card__points" style={{ fontSize: "16px" }}>
                                    {detailData.sisa_umur_manfaat || "-"}
                                </p>
                            </InfoCard>
                            <InfoCard>
                                <FiMapPin size={28} />
                                <p>Lokasi Barang</p>
                                <p className="card__points" style={{ fontSize: "16px" }}>
                                    {detailData.lokasi_barang || "-"}
                                </p>
                            </InfoCard>
                            <InfoCard>
                                <FiPackage size={28} />
                                <p>Tanggal Instalasi</p>
                                <p className="card__points" style={{ fontSize: "14px" }}>
                                    {detailData.tanggal_instalasi || "-"}
                                </p>
                            </InfoCard>
                        </Box>

                        {/* History Services */}
                        <Box
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderCol}
                            borderRadius="12px"
                            overflow="hidden"
                        >
                            <Box p={4} borderBottom="1px solid" borderColor={borderCol}>
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" fontSize="lg">Riwayat Service</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {historyServices.length} record
                                    </Text>
                                </Flex>
                            </Box>

                            {historyServices.length === 0 ? (
                                <Flex direction="column" align="center" py={10} gap={3} color="gray.500">
                                    <FiInbox size={40} />
                                    <Text>Belum ada riwayat service untuk barang ini</Text>
                                </Flex>
                            ) : (
                                <Box overflowX="auto">
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc" }}>
                                                {[
                                                    "No",
                                                    "Tanggal Pengajuan",
                                                    "Kategori",
                                                    "Biaya Services",
                                                    "PIC",
                                                ].map(h => (
                                                    <th key={h} style={{
                                                        padding: "12px 16px",
                                                        textAlign: "left",
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                        borderBottom: `2px solid ${borderCol}`,
                                                        whiteSpace: "nowrap",
                                                        color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                                                    }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyServices.map((h, i) => (
                                                <tr
                                                    key={i}
                                                    style={{
                                                        borderBottom: `1px solid ${borderCol}`,
                                                        background: i % 2 === 0
                                                            ? "transparent"
                                                            : colorMode === "dark"
                                                                ? "rgba(255,255,255,0.02)"
                                                                : "rgba(0,0,0,0.01)",
                                                    }}
                                                >
                                                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                                                        {i + 1}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                                                        {String(h.tanggal_pengajuan_services || "-")}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                                                        {h.kategori || "-"}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                                                        {h.biaya_services || "-"}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                                                        {h.pic || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default DetailBarangPage;