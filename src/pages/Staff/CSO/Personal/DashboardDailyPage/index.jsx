import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import SistemTabs from "@/components/SistemTabs";
import { Flex, Checkbox, useToast, Select, useColorModeValue } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getDashboardDailySiswaBaru,
    getDashboardDailySiswaRetention,
    getDashboardDailyBirthday,
    getDashboardDailyLastDay,
    getDashboardDailySiswaNaikLevel,
    getDashboardDailySiswaPindahModul,
    getDashboardDailyComplaintWA,
    getDashboardDailySertifikat,
    submitDoneSiswaBaru,
    submitDoneSiswaRetention,
    submitDoneBirthday,
    submitDoneSertifikat,
    submitDoneLastDay,
    submitDoneNaikLevel,
    submitDonePindahModul
} from "@/features/cso/csoApiService";
import { StyledDashboardDaily } from "./DashboardDaily.styled";
import { useState, useMemo } from "react";
import { FiUsers, FiUserCheck, FiGift, FiUserX, FiTrendingUp, FiRepeat, FiAlertCircle, FiAward } from "react-icons/fi";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function DashboardDailyPage() {
    const currentDate = new Date();

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');

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

    const { data: complaintWA, isLoading: loadingComplaintWA } = useQuery({
        queryKey: ['dashboardDailyComplaintWA'],
        queryFn: getDashboardDailyComplaintWA,
        staleTime: 5 * 60 * 1000
    });

    const { data: sertifikat, isLoading: loadingSertifikat } = useQuery({
        queryKey: ['dashboardDailySertifikat'],
        queryFn: getDashboardDailySertifikat,
        staleTime: 5 * 60 * 1000
    });

    // Mutations for checkboxes
    const doneSiswaBaruMutation = useMutation({
        mutationFn: ({ uniqueId, mapStatus, doneStatus }) => submitDoneSiswaBaru(uniqueId, mapStatus, doneStatus),
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
        mutationFn: ({ uniqueId, mapStatus, doneStatus }) => submitDoneSiswaRetention(uniqueId, mapStatus, doneStatus),
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

    const doneSertifikatMutation = useMutation({
        mutationFn: ({ tahun, id }) => submitDoneSertifikat(tahun, id),
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Sertifikat ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailySertifikat']);
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

    const doneLastDayMutation = useMutation({
        mutationFn: (uniqueId) => submitDoneLastDay(uniqueId),
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Last Day ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailyLastDay']);
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

    const doneNaikLevelMutation = useMutation({
        mutationFn: ({ id, mapStatus, doneStatus, modul }) => submitDoneNaikLevel(id, mapStatus, doneStatus, modul),
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Naik Level ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailyNaikLevel']);
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

    const donePindahModulMutation = useMutation({
        mutationFn: ({ id, mapStatus, doneStatus, modulBaru }) => submitDonePindahModul(id, mapStatus, doneStatus, modulBaru),
        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Pindah Modul ditandai selesai",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries(['dashboardDailyPindahModul']);
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
        
        // Skip jika sudah checked
        if (doneStatus === 'true' && target.includes('done')) {
            return;
        }

        if (mapStatus === 'true' && target.includes('map')) {
            return;
        }

        setCheckedItems(prev => ({
            ...prev,
            [itemKey]: true
        }));

        // Execute mutation based on target
        if (target === 'map-siswa-baru') {
            await doneSiswaBaruMutation.mutateAsync({ uniqueId: sid, mapStatus: 'true', doneStatus: 'false' });
        } else if (target === 'map-siswa-retention') {
            await doneRetentionMutation.mutateAsync({ uniqueId: sid, mapStatus: 'true', doneStatus: 'false' });
        } else if (target === 'done-siswa-baru') {
            await doneSiswaBaruMutation.mutateAsync({ uniqueId: sid, mapStatus: 'true', doneStatus: 'true' });
        } else if (target === 'done-siswa-retention') {
            await doneRetentionMutation.mutateAsync({ uniqueId: sid, mapStatus: 'true', doneStatus: 'true' });
        } else if (target === 'done-birthday') {
            await doneBirthdayMutation.mutateAsync(sid);
        } else if (target === 'done-last-day') {
            await doneLastDayMutation.mutateAsync(sid);
        } else if (target === 'map-naik-level') {
            const item = tableData.naikLevel?.find(item => item.id === sid);
            await doneNaikLevelMutation.mutateAsync({ id: sid, mapStatus: 'true', doneStatus: 'false', modul: item?.modul });
        } else if (target === 'done-naik-level') {
            const item = tableData.naikLevel?.find(item => item.id === sid);
            const needsMap = ['foundation', 'drawing'].includes(item?.modul?.toLowerCase());
            const finalMapStatus = needsMap ? 'true' : 'false';
            await doneNaikLevelMutation.mutateAsync({ id: sid, mapStatus: finalMapStatus, doneStatus: 'true', modul: item?.modul });
        } else if (target === 'map-pindah-modul') {
            const item = tableData.pindahModul?.find(item => item.id === sid);
            await donePindahModulMutation.mutateAsync({ id: sid, mapStatus: 'true', doneStatus: 'false', modulBaru: item?.modulBaru });
        } else if (target === 'done-pindah-modul') {
            const item = tableData.pindahModul?.find(item => item.id === sid);
            const needsMap = ['foundation', 'drawing'].includes(item?.modulBaru?.toLowerCase());
            const finalMapStatus = needsMap ? 'true' : 'false';
            await donePindahModulMutation.mutateAsync({ id: sid, mapStatus: finalMapStatus, doneStatus: 'true', modulBaru: item?.modulBaru });
        } else if (target.startsWith('done-sertifikat-')) {
            const tahun = target.split('-')[2]; // Extract year from target
            await doneSertifikatMutation.mutateAsync({ tahun, id: sid });
        }
    };

    const handleMonthYearChange = (e) => {
        setSelectedMonthYear(e.target.value);
    };

    // Define current year
    const currentYear = new Date().getFullYear();

    // Transform data untuk tabs
    const tableData = useMemo(() => {
        const transformSiswaBaru = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((item, index) => {
                const doneItemKey = `done-siswa-baru-${item.unique_id}`;
                const mapItemKey = `map-siswa-baru-${item.unique_id}`;
                const isDoneChecked = checkedItems[doneItemKey];
                const isMapChecked = item.map_status || checkedItems[mapItemKey];
                return {
                    id: item.unique_id,
                    no: index + 1,
                    tanggal: item.tanggal,
                    nama: item.nama,
                    modul: item.modul,
                    statusMap: isMapChecked ? 'true' : 'false',
                    statusDone: isDoneChecked ? 'true' : 'false',
                    targetType: 'done-siswa-baru',
                    isDoneChecked: isDoneChecked || false,
                    isMapChecked: isMapChecked || false
                };
            });
        };

        const transformRetention = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((item, index) => {
                const doneItemKey = `done-siswa-retention-${item.unique_id}`;
                const mapItemKey = `map-siswa-retention-${item.unique_id}`;
                const isDoneChecked = checkedItems[doneItemKey];
                const isMapChecked = item.map_status || checkedItems[mapItemKey];
                return {
                    id: item.unique_id,
                    no: index + 1,
                    tanggal: item.tanggal,
                    nama: item.nama,
                    modul: item.modul,
                    statusMap: isMapChecked ? 'true' : 'false',
                    statusDone: isDoneChecked ? 'true' : 'false',
                    targetType: 'done-siswa-retention',
                    isDoneChecked: isDoneChecked || false,
                    isMapChecked: isMapChecked || false
                };
            });
        };

        const transformBirthday = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((item, index) => {
                const doneItemKey = `done-birthday-${item.nama}`;
                const isDoneChecked = checkedItems[doneItemKey];
                return {
                    id: item.nama,
                    no: index + 1,
                    nama: item.nama,
                    umur: item.umur,
                    tanggalKelasLahir: item.tanggal_kelas_terdekat || '-',
                    targetType: 'done-birthday',
                    isDoneChecked: isDoneChecked || false
                };
            });
        };

        const transformLastDay = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((item, index) => {
                const doneItemKey = `done-last-day-${item.fullconcat}`;
                const isDoneChecked = checkedItems[doneItemKey];
                return {
                    id: item.fullconcat,
                    no: index + 1,
                    tanggalKelas: item.tanggal_kelas,
                    nama: item.nama_siswa,
                    modul: item.modul,
                    level: item.level,
                    targetType: 'done-last-day',
                    isDoneChecked: isDoneChecked || false
                };
            });
        };

        const transformNaikLevel = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((item, index) => {
                const doneItemKey = `done-naik-level-${item.id}`;
                const mapItemKey = `map-naik-level-${item.id}`;
                const isDoneChecked = checkedItems[doneItemKey];
                const isMapChecked = item.map_status || checkedItems[mapItemKey];
                return {
                    id: item.id,
                    no: index + 1,
                    timestamp: item.timestamp,
                    nama: item.nama_siswa,
                    modul: item.modul,
                    age: item.age,
                    level: item.level,
                    statusMap: isMapChecked ? 'true' : 'false',
                    statusDone: isDoneChecked ? 'true' : 'false',
                    targetType: 'done-naik-level',
                    isDoneChecked: isDoneChecked || false,
                    isMapChecked: isMapChecked || false
                };
            });
        };

        const transformPindahModul = (dataArray) => {
            if (!dataArray || dataArray.length === 0) return [];
            return dataArray.map((item, index) => {
                const doneItemKey = `done-pindah-modul-${item.id}`;
                const mapItemKey = `map-pindah-modul-${item.id}`;
                const isDoneChecked = checkedItems[doneItemKey];
                const isMapChecked = item.map_status || checkedItems[mapItemKey];
                return {
                    id: item.id,
                    no: index + 1,
                    date: item.date,
                    nama: item.nama,
                    modulLama: item.modul_lama,
                    modulBaru: item.modul_baru,
                    statusMap: isMapChecked ? 'true' : 'false',
                    statusDone: isDoneChecked ? 'true' : 'false',
                    targetType: 'done-pindah-modul',
                    isDoneChecked: isDoneChecked || false,
                    isMapChecked: isMapChecked || false
                };
            });
        };

        const transformSertifikat = (dataObject, tahun) => {
            if (!dataObject || !Array.isArray(dataObject)) return [];
            return dataObject.map((item, index) => {
                const doneItemKey = `done-sertifikat-${tahun}-${item.id}`;
                const isDoneChecked = checkedItems[doneItemKey];
                return {
                    id: item.id,
                    no: index + 1,
                    tanggal_kelas: item.tanggal_kelas,
                    nama: item.nama,
                    modul: item.modul,
                    level: item.level,
                    status_sertifikat: item.status_sertifikat,
                    tahun: tahun,
                    targetType: `done-sertifikat-${tahun}`,
                    isDoneChecked: isDoneChecked || false
                };
            });
        };

        return {
            siswaBaru: transformSiswaBaru(siswaBaru || []),
            retention: transformRetention(retention || []),
            birthday: transformBirthday(birthday || []),
            lastDay: transformLastDay(lastDay || []),
            naikLevel: transformNaikLevel(naikLevel || []),
            pindahModul: transformPindahModul(pindahModul || []),
            sertifikat: transformSertifikat(sertifikat?.[`res_${currentYear}`] || [], currentYear.toString())
        };
    }, [siswaBaru, retention, birthday, lastDay, naikLevel, pindahModul, sertifikat, checkedItems, currentYear]);

    // Define tabs
    const tabItems = [
        { key: 'siswaBaru', label: 'Siswa Baru' },
        { key: 'retention', label: 'Retention' },
        { key: 'birthday', label: 'Birthday' },
        { key: 'lastDay', label: 'Last Day' },
        { key: 'naikLevel', label: 'Naik Level' },
        { key: 'pindahModul', label: 'Pindah Modul' },
        { key: 'sertifikat', label: `Sertifikat ${currentYear}` }
    ];

    // Header untuk Siswa Baru
    const headerItemsSiswaBaru = [
        { key: 'no', label: 'No' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        {
            key: 'map',
            label: 'Map?',
            render: (item) => (
                <Checkbox
                    colorScheme="orange"
                    isChecked={item.isMapChecked}
                    isDisabled={item.isMapChecked}
                    onChange={() => handleChecklist('map-siswa-baru', item.id, item.statusMap, item.statusDone)}
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
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, item.statusMap, item.statusDone)}
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

    // Header untuk Retention
    const headerItemsRetention = [
        { key: 'no', label: 'No' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        {
            key: 'map',
            label: 'Map?',
            render: (item) => (
                <Checkbox
                    colorScheme="orange"
                    isChecked={item.isMapChecked}
                    isDisabled={item.isMapChecked}
                    onChange={() => handleChecklist('map-siswa-retention', item.id, item.statusMap, item.statusDone)}
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
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, item.statusMap, item.statusDone)}
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
        { key: 'nama', label: 'Nama' },
        { key: 'umur', label: 'Umur' },
        { key: 'tanggalKelasLahir', label: 'Tanggal Kelas Terdekat' },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, 'no', 'no')}
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
        { key: 'tanggalKelas', label: 'Tanggal Kelas' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        { key: 'level', label: 'Level' },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, 'true', 'false')}
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

    // Header untuk Naik Level
    const headerItemsNaikLevel = [
        { key: 'no', label: 'No' },
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        { key: 'age', label: 'Umur' },
        { key: 'level', label: 'Level' },
        {
            key: 'map',
            label: 'Map?',
            render: (item) => {
                const needsMap = ['foundation', 'drawing'].includes(item.modul?.toLowerCase());
                if (!needsMap) return '-';
                return (
                    <Checkbox
                        colorScheme="orange"
                        isChecked={item.isMapChecked}
                        isDisabled={item.isMapChecked}
                        onChange={() => handleChecklist('map-naik-level', item.id, item.statusMap, item.statusDone)}
                        sx={{
                            '.chakra-checkbox__control': {
                                '&[data-checked]': {
                                    bg: '#FE7743',
                                    borderColor: '#FE7743',
                                }
                            }
                        }}
                    />
                );
            }
        },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, item.statusMap, item.statusDone)}
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

    // Header untuk Pindah Modul
    const headerItemsPindahModul = [
        { key: 'no', label: 'No' },
        { key: 'date', label: 'Tanggal' },
        { key: 'nama', label: 'Nama' },
        { key: 'modulLama', label: 'Modul Lama' },
        { key: 'modulBaru', label: 'Modul Baru' },
        {
            key: 'map',
            label: 'Map?',
            render: (item) => {
                const needsMap = ['foundation', 'drawing'].includes(item.modulBaru?.toLowerCase());
                if (!needsMap) return '-';
                return (
                    <Checkbox
                        colorScheme="orange"
                        isChecked={item.isMapChecked}
                        isDisabled={item.isMapChecked}
                        onChange={() => handleChecklist('map-pindah-modul', item.id, item.statusMap, item.statusDone)}
                        sx={{
                            '.chakra-checkbox__control': {
                                '&[data-checked]': {
                                    bg: '#FE7743',
                                    borderColor: '#FE7743',
                                }
                            }
                        }}
                    />
                );
            }
        },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, item.statusMap, item.statusDone)}
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

    // Header untuk Sertifikat
    const headerItemsSertifikat = [
        { key: 'no', label: 'No' },
        { key: 'tanggal_kelas', label: 'Tanggal Kelas' },
        { key: 'nama', label: 'Nama' },
        { key: 'modul', label: 'Modul' },
        { key: 'level', label: 'Level' },
        { key: 'status_sertifikat', label: 'Status Sertifikat' },
        {
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    colorScheme="green"
                    isChecked={item.isDoneChecked}
                    isDisabled={item.isDoneChecked}
                    onChange={() => handleChecklist(item.targetType, item.id, 'true', 'false')}
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

    // Get header based on tab
    const getHeaderItems = (tabKey) => {
        switch(tabKey) {
            case 'siswaBaru':
                return headerItemsSiswaBaru;
            case 'retention':
                return headerItemsRetention;
            case 'birthday':
                return headerItemsBirthday;
            case 'lastDay':
                return headerItemsLastDay;
            case 'naikLevel':
                return headerItemsNaikLevel;
            case 'pindahModul':
                return headerItemsPindahModul;
            case 'sertifikat':
                return headerItemsSertifikat;
            default:
                return [];
        }
    };

    const isLoading = loadingSiswaBaru || loadingRetention || loadingBirthday || loadingLastDay || loadingNaikLevel || loadingPindahModul || loadingComplaintWA || loadingSertifikat;

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
                                bg={cardBg}
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
                            <InfoCard>
                                <FiAlertCircle size="30px" color="#FE7743" />
                                <p>Complaint WA</p>
                                {loadingComplaintWA ? (
                                    <Skeleton height="40px" width="100px" />
                                ) : (
                                    <>
                                        <p style={{ fontSize: '14px', margin: '5px 0' }}>Hari: {complaintWA?.hari_terbanyak?.hari || '-'} ({complaintWA?.hari_terbanyak?.jumlah || 0})</p>
                                        <p style={{ fontSize: '14px' }}>Kategori: {complaintWA?.complaint_terbanyak?.kategori || '-'} ({complaintWA?.complaint_terbanyak?.jumlah || 0})</p>
                                    </>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiAward size="30px" color="#FE7743" />
                                <p>Sertifikat {currentYear}</p>
                                {loadingSertifikat ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{tableData.sertifikat?.length || 0}</p>
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
                        headerItems={headerItemsSiswaBaru}
                        isLoading={isLoading}
                        getHeaderItemsForTab={getHeaderItems}
                    />
                </ContainerCarrot>
            </div>
        </StyledDashboardDaily>
    );
}

export default DashboardDailyPage;
