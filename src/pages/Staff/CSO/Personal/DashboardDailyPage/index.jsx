import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import SistemTabs from "@/components/SistemTabs";
import { Input, Flex, Text, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getDashboardDailySiswaBaru,
    getDashboardDailySiswaRetention,
    getDashboardDailyBirthday,
    getDashboardDailyLastDay,
    getDashboardDailySiswaNaikLevel,
    getDashboardDailySiswaPindahModul,
    submitDoneSiswaBaru,
    submitDoneSiswaRetention,
    submitDoneBirthday
} from "@/features/cso/csoApiService";
import { StyledDashboardDaily } from "./DashboardDaily.styled";
import { useState, useMemo } from "react";
import { FiUsers, FiUserCheck, FiGift, FiUserX, FiTrendingUp, FiRepeat } from "react-icons/fi";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function DashboardDailyPage() {
    const currentDate = new Date();

    // Format bulan tahun untuk birthday (mmm yyyy)
    const formatMonthYear = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const [selectedMonthYear, setSelectedMonthYear] = useState(formatMonthYear(currentDate));
    const toast = useToast();
    const queryClient = useQueryClient();

    // Track checked items locally
    const [checkedItems, setCheckedItems] = useState({});

    // Fetch data
    const { data: siswaBaru, isLoading: loadingSiswaBaru } = useQuery({
        queryKey: ['dashboardDailySiswaBaru'],
        queryFn: getDashboardDailySiswaBaru,
        staleTime: 5 * 60 * 1000
    });

    const { data: retention, isLoading: loadingRetention } = useQuery({
        queryKey: ['dashboardDailyRetention'],
        queryFn: getDashboardDailySiswaRetention,
        staleTime: 5 * 60 * 1000
    });

    const { data: birthday, isLoading: loadingBirthday } = useQuery({
        queryKey: ['dashboardDailyBirthday', selectedMonthYear],
        queryFn: () => getDashboardDailyBirthday(selectedMonthYear),
        enabled: !!selectedMonthYear,
        staleTime: 5 * 60 * 1000
    });

    const { data: lastDay, isLoading: loadingLastDay } = useQuery({
        queryKey: ['dashboardDailyLastDay'],
        queryFn: getDashboardDailyLastDay,
        staleTime: 5 * 60 * 1000
    });

    const { data: naikLevel, isLoading: loadingNaikLevel } = useQuery({
        queryKey: ['dashboardDailyNaikLevel'],
        queryFn: getDashboardDailySiswaNaikLevel,
        staleTime: 5 * 60 * 1000
    });

    const { data: pindahModul, isLoading: loadingPindahModul } = useQuery({
        queryKey: ['dashboardDailyPindahModul'],
        queryFn: getDashboardDailySiswaPindahModul,
        staleTime: 5 * 60 * 1000
    });

    // Mutations for checkboxes
    const doneSiswaBaruMutation = useMutation({
        mutationFn: submitDoneSiswaBaru,
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Siswa Baru ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailySiswaBaru']);
        },
        onError: (error) => {
            toast({
                title: "Gagal",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const doneRetentionMutation = useMutation({
        mutationFn: submitDoneSiswaRetention,
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Retention ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailyRetention']);
        },
        onError: (error) => {
            toast({
                title: "Gagal",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const doneBirthdayMutation = useMutation({
        mutationFn: submitDoneBirthday,
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Birthday ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailyBirthday']);
        },
        onError: (error) => {
            toast({
                title: "Gagal",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    // Handle checklist
    const handleChecklist = async (target, sid, mapStatus, doneStatus) => {
        const itemKey = `${target}-${sid}`;
        
        // Validasi: done harus map dulu
        if (target.includes('done') && mapStatus !== 'yes') {
            toast({
                title: "Peringatan",
                description: "Harap centang 'Map' terlebih dahulu",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Skip jika sudah checked
        if (doneStatus === 'yes' && target.includes('done')) {
            return;
        }

        setCheckedItems(prev => ({
            ...prev,
            [itemKey]: true
        }));

        // Execute mutation based on target
        if (target === 'done-siswa-baru') {
            await doneSiswaBaruMutation.mutateAsync({ sid, map: 'no', done: 'yes' });
        } else if (target === 'done-siswa-retention') {
            await doneRetentionMutation.mutateAsync({ sid, map: 'no', done: 'yes' });
        } else if (target === 'done-birthday') {
            await doneBirthdayMutation.mutateAsync({ sid, map: 'no', done: 'yes' });
        }
    };

    const handleMonthYearChange = (e) => {
        setSelectedMonthYear(e.target.value);
    };

    // Transform data untuk tabs
    const tableData = useMemo(() => {
        const transformSiswaBaru = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [sid, nama, nomorHP, statusMap, statusDone] = row;
                return {
                    id: sid,
                    no: index + 1,
                    sid,
                    nama,
                    nomorHP: nomorHP || '-',
                    statusMap,
                    statusDone,
                    targetType: 'done-siswa-baru',
                    isDoneChecked: statusDone === 'yes',
                    isMapChecked: statusMap === 'yes'
                };
            });
        };

        const transformRetention = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [sid, nama, nomorHP, statusMap, statusDone] = row;
                return {
                    id: sid,
                    no: index + 1,
                    sid,
                    nama,
                    nomorHP: nomorHP || '-',
                    statusMap,
                    statusDone,
                    targetType: 'done-siswa-retention',
                    isDoneChecked: statusDone === 'yes',
                    isMapChecked: statusMap === 'yes'
                };
            });
        };

        const transformBirthday = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [sid, nama, nomorHP, tanggalLahir, statusMap, statusDone] = row;
                return {
                    id: sid,
                    no: index + 1,
                    sid,
                    nama,
                    nomorHP: nomorHP || '-',
                    tanggalLahir,
                    statusMap,
                    statusDone,
                    targetType: 'done-birthday',
                    isDoneChecked: statusDone === 'yes',
                    isMapChecked: statusMap === 'yes'
                };
            });
        };

        const transformLastDay = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [sid, nama, nomorHP, lastClassDate] = row;
                return {
                    id: sid,
                    no: index + 1,
                    sid,
                    nama,
                    nomorHP: nomorHP || '-',
                    lastClassDate
                };
            });
        };

        const transformNaikLevel = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [sid, nama, nomorHP, levelLama, levelBaru] = row;
                return {
                    id: sid,
                    no: index + 1,
                    sid,
                    nama,
                    nomorHP: nomorHP || '-',
                    levelLama,
                    levelBaru
                };
            });
        };

        const transformPindahModul = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((row, index) => {
                const [sid, nama, nomorHP, modulLama, modulBaru] = row;
                return {
                    id: sid,
                    no: index + 1,
                    sid,
                    nama,
                    nomorHP: nomorHP || '-',
                    modulLama,
                    modulBaru
                };
            });
        };

        return {
            siswaBaru: transformSiswaBaru(siswaBaru?.data || []),
            retention: transformRetention(retention?.data || []),
            birthday: transformBirthday(birthday?.data || []),
            lastDay: transformLastDay(lastDay?.data || []),
            naikLevel: transformNaikLevel(naikLevel?.data || []),
            pindahModul: transformPindahModul(pindahModul?.data || [])
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siswaBaru, retention, birthday, lastDay, naikLevel, pindahModul, checkedItems]);

    // Define tabs
    const tabItems = [
        { key: 'siswaBaru', label: 'Siswa Baru' },
        { key: 'retention', label: 'Retention' },
        { key: 'birthday', label: 'Birthday' },
        { key: 'lastDay', label: 'Last Day' },
        { key: 'naikLevel', label: 'Naik Level' },
        { key: 'pindahModul', label: 'Pindah Modul' }
    ];

    // Header untuk Siswa Baru & Retention
    const headerItemsWithCheckbox = [
        { key: 'no', label: 'No' },
        { key: 'sid', label: 'SID' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomorHP', label: 'No. HP' },
        {
            key: 'map',
            label: 'Map?',
            render: (item) => (
                <Checkbox
                    colorScheme="orange"
                    isChecked={item.isMapChecked}
                    isDisabled={true}
                    sx={{
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#FE7743',
                                borderColor: '#FE7743',
                            }
                        }
                    }}
                />
            )
        },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked || !item.isMapChecked}
                    onChange={() => handleChecklist(item.targetType, item.sid, item.statusMap, item.statusDone)}
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

    // Header untuk Birthday
    const headerItemsBirthday = [
        { key: 'no', label: 'No' },
        { key: 'sid', label: 'SID' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomorHP', label: 'No. HP' },
        { key: 'tanggalLahir', label: 'Tanggal Lahir' },
        {
            key: 'map',
            label: 'Map?',
            render: (item) => (
                <Checkbox
                    colorScheme="orange"
                    isChecked={item.isMapChecked}
                    isDisabled={true}
                    sx={{
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#FE7743',
                                borderColor: '#FE7743',
                            }
                        }
                    }}
                />
            )
        },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked || !item.isMapChecked}
                    onChange={() => handleChecklist(item.targetType, item.sid, item.statusMap, item.statusDone)}
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

    // Header untuk Last Day
    const headerItemsLastDay = [
        { key: 'no', label: 'No' },
        { key: 'sid', label: 'SID' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomorHP', label: 'No. HP' },
        { key: 'lastClassDate', label: 'Last Class Date' }
    ];

    // Header untuk Naik Level
    const headerItemsNaikLevel = [
        { key: 'no', label: 'No' },
        { key: 'sid', label: 'SID' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomorHP', label: 'No. HP' },
        { key: 'levelLama', label: 'Level Lama' },
        { key: 'levelBaru', label: 'Level Baru' }
    ];

    // Header untuk Pindah Modul
    const headerItemsPindahModul = [
        { key: 'no', label: 'No' },
        { key: 'sid', label: 'SID' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomorHP', label: 'No. HP' },
        { key: 'modulLama', label: 'Modul Lama' },
        { key: 'modulBaru', label: 'Modul Baru' }
    ];

    // Get header based on tab
    const getHeaderItems = (tabKey) => {
        switch(tabKey) {
            case 'siswaBaru':
            case 'retention':
                return headerItemsWithCheckbox;
            case 'birthday':
                return headerItemsBirthday;
            case 'lastDay':
                return headerItemsLastDay;
            case 'naikLevel':
                return headerItemsNaikLevel;
            case 'pindahModul':
                return headerItemsPindahModul;
            default:
                return [];
        }
    };

    const isLoading = loadingSiswaBaru || loadingRetention || loadingBirthday || loadingLastDay || loadingNaikLevel || loadingPindahModul;

    return (
        <StyledDashboardDaily>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Dashboard Daily - Overview</h1>
                        
                        {/* Filter Bulan untuk Birthday */}
                        <Flex gap={3} align="center" mb={6}>
                            <Select
                                value={selectedMonthYear}
                                onChange={handleMonthYearChange}
                                maxW="200px"
                                bg="white"
                                borderColor="gray.300"
                            >
                                {Array.from({ length: 12 }, (_, i) => {
                                    const date = new Date(currentDate.getFullYear(), i, 1);
                                    const value = formatMonthYear(date);
                                    return (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    );
                                })}
                            </Select>
                        </Flex>

                        {/* KPI Cards Grid */}
                        <div className="stats-grid-daily">
                            <InfoCard>
                                <FiUsers size="30px" color="#FE7743" />
                                <p>Siswa Baru</p>
                                {loadingSiswaBaru ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.siswaBaru?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiUserCheck size="30px" color="#FE7743" />
                                <p>Retention</p>
                                {loadingRetention ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.retention?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiGift size="30px" color="#FE7743" />
                                <p>Birthday</p>
                                {loadingBirthday ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.birthday?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiUserX size="30px" color="#FE7743" />
                                <p>Last Day</p>
                                {loadingLastDay ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.lastDay?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiTrendingUp size="30px" color="#FE7743" />
                                <p>Naik Level</p>
                                {loadingNaikLevel ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.naikLevel?.length || 0}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiRepeat size="30px" color="#FE7743" />
                                <p>Pindah Modul</p>
                                {loadingPindahModul ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.pindahModul?.length || 0}</p>
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
                        headerItems={headerItemsWithCheckbox}
                        isLoading={isLoading}
                        getHeaderItemsForTab={getHeaderItems}
                    />
                </ContainerCarrot>
            </div>
        </StyledDashboardDaily>
    );
}

export default DashboardDailyPage;
