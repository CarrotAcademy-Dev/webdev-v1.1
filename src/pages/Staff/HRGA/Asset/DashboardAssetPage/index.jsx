import ContainerCarrot from "@/components/Container";
import { getDashboardData } from "@/features/hr/assetApiServices";
import {
    Box, Flex, IconButton, Input, Text, useColorMode,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiTool, FiPackage, FiClock, FiInbox, FiExternalLink, FiSearch,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const DashboardPage = () => {
    const { colorMode } = useColorMode();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["assetDashboard"],
        queryFn: getDashboardData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const reminderService = useMemo(() => data?.reminder_service || [], [data]);
    const assetHabisPakai = useMemo(() => data?.asset_habis_pakai || [], [data]);
    const reminderMaintenance = useMemo(() => data?.reminder_maintenance || [], [data]);

    const jumlahReminderService = data?.jumlah_reminder_service || reminderService.length;
    const jumlahAssetHabisPakai = data?.jumlah_asset_habis_pakai || assetHabisPakai.length;
    const jumlahReminderMaintenance = reminderMaintenance.length;

    // ============================================
    // Reusable searchable + paginated table block
    // ============================================
    const SearchableListTable = ({ data, columns, emptyText, searchPlaceholder, searchKeys }) => {
        const [searchQuery, setSearchQuery] = useState("");

        const filteredData = useMemo(() => {
            if (!searchQuery) return data;
            const lower = searchQuery.toLowerCase();
            return data.filter(item =>
                searchKeys.some(key => item[key] && String(item[key]).toLowerCase().includes(lower))
            );
        }, [data, searchQuery, searchKeys]);

        const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
            usePagination(filteredData, 10);

        return (
            <>
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {filteredData.length === 0 ? (
                    <Flex className="empty-state">
                        <FiInbox size={40} />
                        <Text>{searchQuery ? "Tidak ada hasil pencarian" : emptyText}</Text>
                    </Flex>
                ) : (
                    <>
                        <Box className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        {columns.map(col => (
                                            <th key={col.key} style={{ minWidth: col.minWidth || "140px" }}>{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{startIndex + index + 1}</td>
                                            {columns.map(col => (
                                                <td key={col.key}>
                                                    {col.isLink && isValidUrl(item[col.key]) ? (
                                                        <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                            onClick={() => window.open(String(item[col.key]), "_blank", "noopener,noreferrer")}>
                                                            <FiExternalLink />
                                                        </IconButton>
                                                    ) : (
                                                        item[col.key] ? String(item[col.key]) : "-"
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>

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
            </>
        );
    };

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Dashboard Asset</h1>
                    <Text className="subtitle">Ringkasan reminder service, maintenance, dan asset habis pakai</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiTool size={28} />
                        <p>Reminder Service</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{jumlahReminderService}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Reminder Maintenance</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{jumlahReminderMaintenance}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Asset Habis Pakai</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{jumlahAssetHabisPakai}</p>}
                    </InfoCard>
                </Box>

                {isError ? (
                    <Flex className="empty-state">
                        <FiInbox size={48} />
                        <Text>Gagal memuat data dashboard</Text>
                    </Flex>
                ) : isLoading ? (
                    <Box p={4}><Skeleton count={8} height={40} style={{ marginBottom: "8px" }} /></Box>
                ) : (
                    <Tabs colorScheme="teal">
                        <TabList mb={4}>
                            <Tab fontWeight="600">Reminder Service</Tab>
                            <Tab fontWeight="600">Reminder Maintenance</Tab>
                            <Tab fontWeight="600">Asset Habis Pakai</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel px={0}>
                                <SearchableListTable
                                    data={reminderService}
                                    emptyText="Tidak ada reminder service"
                                    searchPlaceholder="Cari nama barang..."
                                    searchKeys={["nama_barang"]}
                                    columns={[
                                        { key: "nama_barang", label: "Nama Barang", minWidth: "200px" },
                                        { key: "tanggal_service", label: "Tanggal Service", minWidth: "150px" },
                                    ]}
                                />
                            </TabPanel>

                            <TabPanel px={0}>
                                <SearchableListTable
                                    data={reminderMaintenance}
                                    emptyText="Tidak ada reminder maintenance"
                                    searchPlaceholder="Cari nama barang..."
                                    searchKeys={["nama_barang"]}
                                    columns={[
                                        { key: "nama_barang", label: "Nama Barang", minWidth: "200px" },
                                        { key: "tanggal_maintenance", label: "Tanggal Maintenance", minWidth: "170px" },
                                    ]}
                                />
                            </TabPanel>

                            <TabPanel px={0}>
                                <SearchableListTable
                                    data={assetHabisPakai}
                                    emptyText="Tidak ada asset habis pakai"
                                    searchPlaceholder="Cari nama barang atau lokasi..."
                                    searchKeys={["nama_barang", "lokasi"]}
                                    columns={[
                                        { key: "nama_barang", label: "Nama Barang", minWidth: "200px" },
                                        { key: "tanggal_pembelian", label: "Tanggal Pembelian", minWidth: "160px" },
                                        { key: "lokasi", label: "Lokasi", minWidth: "150px" },
                                        { key: "expired", label: "Expired", minWidth: "130px" },
                                    ]}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default DashboardPage;