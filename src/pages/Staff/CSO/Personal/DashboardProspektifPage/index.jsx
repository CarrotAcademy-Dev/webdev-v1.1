import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import SistemTabs from "@/components/SistemTabs";
import { Input, Flex, Text, Checkbox, useToast, useColorModeValue } from "@chakra-ui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getDashboardProspektifPersonal, ceklisDashboardProspektif } from "@/features/cso/csoApiService";
import { StyledDashboardProspektifPage } from "./DashboardProspektif.styled";
import { useState, useMemo } from "react";
import { FiUsers, FiCalendar, FiMessageSquare } from "react-icons/fi";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function DashboardProspektifPage() {
    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
    
    const currentDate = new Date();
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(formatDateForInput(currentDate));
    const toast = useToast();

    // Track checked items locally per tanggal
    const [checkedItems, setCheckedItems] = useState({});

    // Fetch dashboard data
    const { data: dashboardData, isLoading, refetch } = useQuery({
        queryKey: ['dashboardProspektifPersonal', selectedDate],
        queryFn: () => getDashboardProspektifPersonal(selectedDate),
        enabled: !!selectedDate
    });

    // Mutation untuk checklist
    const checklistMutation = useMutation({
        mutationFn: ceklisDashboardProspektif,
        onSuccess: (message) => {
            toast({
                title: "Berhasil",
                description: message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: "Gagal",
                description: error.message || "Terjadi kesalahan saat update checklist",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const handleChecklist = async (target, psid) => {
        const itemKey = `${target}-${psid}`;
        
        // Tambahkan ke checkedItems untuk tanggal ini
        setCheckedItems(prev => {
            const dateChecked = prev[selectedDate] || new Set();
            const newDateChecked = new Set(dateChecked);
            newDateChecked.add(itemKey);
            
            return {
                ...prev,
                [selectedDate]: newDateChecked
            };
        });

        await checklistMutation.mutateAsync({
            target,
            psid: psid.toString()
        });
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const angka = dashboardData?.angka || {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const rawData = dashboardData?.data || {};

    // Transform data untuk SistemTabs
    const tableData = useMemo(() => {
        const transformTrialFirstClass = (dataArray, targetType) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [psid, nama, tanggal, nomorSiswa, nomorOrtu] = row;
                const itemKey = `${targetType}-${psid}`;
                const dateChecked = checkedItems[selectedDate] || new Set();
                
                return {
                    id: psid,
                    no: index + 1,
                    psid,
                    nama,
                    tanggal,
                    noHp: nomorSiswa || nomorOrtu || '-',
                    targetType,
                    itemKey,
                    isChecked: dateChecked.has(itemKey)
                };
            });
        };

        const transformFollowUp = (dataArray, targetType) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [tanggal, psid, nama, nomorSiswa, nomorOrtu] = row;
                const itemKey = `${targetType}-${psid}`;
                const dateChecked = checkedItems[selectedDate] || new Set();
                
                return {
                    id: psid,
                    no: index + 1,
                    tanggal,
                    psid,
                    nama,
                    noHp: nomorSiswa || nomorOrtu || '-',
                    targetType,
                    itemKey,
                    isChecked: dateChecked.has(itemKey)
                };
            });
        };

        return {
            trialClass: transformTrialFirstClass(rawData.daftar_trial_class, 'trial-class'),
            firstClass: transformTrialFirstClass(rawData.daftar_first_class, 'first-class'),
            followUp1: transformFollowUp(rawData.list_ongoing_fu1, 'follow-up1'),
            followUp2: transformFollowUp(rawData.list_ongoing_fu2, 'follow-up2'),
            followUp3: transformFollowUp(rawData.list_ongoing_fu3, 'follow-up3')
        };
    }, [rawData, checkedItems, selectedDate]);

    // Define tabs
    const tabItems = [
        { key: 'trialClass', label: 'Trial Class' },
        { key: 'firstClass', label: 'First Class' },
        { key: 'followUp1', label: 'FU 1' },
        { key: 'followUp2', label: 'FU 2' },
        { key: 'followUp3', label: 'FU 3' }
    ];

    // Define header items untuk Trial Class & First Class
    const headerItemsClass = [
        { key: 'no', label: 'No' },
        { key: 'psid', label: 'PSID' },
        { key: 'nama', label: 'Nama' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'noHp', label: 'No. Handphone' },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isChecked}
                    isDisabled={checklistMutation.isPending || item.isChecked}
                    onChange={() => handleChecklist(item.targetType, item.psid)}
                    sx={{
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#48BB78',
                                borderColor: '#48BB78',
                            }
                        }
                    }}
                />
            )
        }
    ];

    // Define header items untuk Follow Up
    const headerItemsFollowUp = [
        { key: 'no', label: 'No' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'psid', label: 'PSID' },
        { key: 'nama', label: 'Nama' },
        { key: 'noHp', label: 'No. Handphone' },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isChecked}
                    isDisabled={checklistMutation.isPending || item.isChecked}
                    onChange={() => handleChecklist(item.targetType, item.psid)}
                    sx={{
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#48BB78',
                                borderColor: '#48BB78',
                            }
                        }
                    }}
                />
            )
        }
    ];

    // Gunakan header yang sesuai per tab
    const getHeaderItems = (tabKey) => {
        if (tabKey === 'trialClass' || tabKey === 'firstClass') {
            return headerItemsClass;
        }
        return headerItemsFollowUp;
    };

    return (
        <StyledDashboardProspektifPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Dashboard Prospektif - Overview</h1>
                        
                        {/* Filter Tanggal */}
                        <Flex gap={3} align="center" mb={6}>
                            <Text fontWeight="semibold">Filter Tanggal:</Text>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                maxW="200px"
                                bg={cardBg}
                                borderColor="gray.300"
                            />
                        </Flex>

                        {/* KPI Cards Grid */}
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <FiCalendar size="30px" color="#FE7743" />
                                <p>Trial Class hari ini</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{angka.trial_class || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiUsers size="30px" color="#FE7743" />
                                <p>First Class hari ini</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{angka.first_class || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiMessageSquare size="30px" color="#FE7743" />
                                <p>Follow Up 1</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="80px" />
                                ) : (
                                    <p className="card__points">{angka.followup_1 || '0 / 0'}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiMessageSquare size="30px" color="#FE7743" />
                                <p>Follow Up 2</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="80px" />
                                ) : (
                                    <p className="card__points">{angka.followup_2 || '0 / 0'}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiMessageSquare size="30px" color="#FE7743" />
                                <p>Follow Up 3</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="80px" />
                                ) : (
                                    <p className="card__points">{angka.followup_3 || '0 / 0'}</p>
                                )}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>

            {/* Tabs Section */}
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs 
                        tabItems={tabItems}
                        tableData={tableData}
                        headerItems={headerItemsClass}
                        isLoading={isLoading}
                        getHeaderItemsForTab={getHeaderItems}
                    />
                </ContainerCarrot>
            </div>
        </StyledDashboardProspektifPage>
    );
}

export default DashboardProspektifPage;
