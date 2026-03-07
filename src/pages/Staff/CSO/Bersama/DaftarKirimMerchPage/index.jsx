import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { LuTruck, LuPackage } from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Button, Select, useColorMode, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getMerchandiseData, postDataKirimMerch, getJenisMerchandise } from "@/features/cso/csoApiService";
import StyledDaftarKirimMerchPage from "./DaftarKirimMerchPage.Styled";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const tabItems = [
    {key: 'belumDikirim', label: 'Not Done'},
    {key: 'sudahDikirim', label: 'Done'}
];

function DaftarKirimMerchPage() {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: merch, isLoading, isError, error } = useQuery({
        queryKey: ['merchandise'],
        queryFn: getMerchandiseData,
        placeholderData: { belumDikirim: [], sudahDikirim: [] }
    });

    // Fetch jenis merchandise dari API
    const { data: jenisMerchandise = [], isLoading: isLoadingJenis } = useQuery({
        queryKey: ['jenisMerchandise'],
        queryFn: getJenisMerchandise,
        placeholderData: []
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: postDataKirimMerch,
        onMutate: async (rowData) => {
            await queryClient.cancelQueries({ queryKey: ['merchandise'] });

            const previousData = queryClient.getQueryData(['merchandise']);

            queryClient.setQueryData(['merchandise'], (oldData) => {
                if (!oldData) return { belumDikirim: [], sudahDikirim: [] };
                
                const updatedBelumDikirim = oldData.belumDikirim.filter(item => item.nis !== rowData.nis);
                const movedItem = oldData.belumDikirim.find(item => item.nis === rowData.nis);
                
                if (movedItem) {
                    const updatedSudahDikirim = [...oldData.sudahDikirim, { ...movedItem, done: true }];
                    return {
                        belumDikirim: updatedBelumDikirim,
                        sudahDikirim: updatedSudahDikirim
                    };
                }
                return oldData;
            });

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['merchandise'], context.previousData);
            }
            toast({
                title: 'Gagal mengupdate status',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil diupdate!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['merchandise'] });
            }, 500);
        }
    });

    const handleDoneAction = (rowData) => {
        if (!rowData.jenisPaket || rowData.jenisPaket === '') {
            toast({
                title: 'Jenis Paket Kosong',
                description: 'Pilih jenis paket terlebih dahulu sebelum submit.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        markDoneMutation(rowData);
    };

    const headerItems = [
        { key: 'nis', label: 'NIS' },
        { key: 'nama', label: 'Nama' },
        { key: 'program', label: 'Program' },
        { key: 'modul', label: 'Modul' },
        { 
            key: 'jenisPaket', 
            label: 'Jenis Paket',
            render: (item) => (
                !item.done && (
                    <Select
                        value={item.jenisPaket || ''}
                        onChange={(e) => handleCellChange(e.target.value, item.nis, 'jenisPaket')}
                        placeholder="Pilih paket"
                        width="10rem"
                        isDisabled={isLoadingJenis}
                    >
                        {jenisMerchandise.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Select>
                )
            )
        },
        { 
            key: 'action',
            label: 'Action',
            render: (item) => (
                !item.done && (
                    <Button
                        onClick={() => handleDoneAction(item)}
                        colorScheme="orange"
                        size="sm"
                    >
                        Done
                    </Button>
                )
            )
        }
    ];

    const handleCellChange = (newValue, rowId, columnKey) => {
        queryClient.setQueryData(['merchandise'], (oldData) => {
            if (!oldData) return { belumDikirim: [], sudahDikirim: [] };
            
            const updatedBelumDikirim = oldData.belumDikirim.map(row => {
                if (row.nis === rowId) {
                    return { ...row, [columnKey]: newValue };
                }
                return row;
            });

            return {
                ...oldData,
                belumDikirim: updatedBelumDikirim
            };
        });
    };

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledDaftarKirimMerchPage data-theme={colorMode}>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daftar Kirim Merchandise - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <LuPackage size="30px" />
                                <p>Total yang belum dikirim</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{merch.belumDikirim.length}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuTruck size="30px" />
                                <p>Total yang sudah dikirim</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{merch.sudahDikirim.length}</p>}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs 
                        tabItems={tabItems} 
                        tableData={merch} 
                        headerItems={headerItems} 
                        onCellChange={handleCellChange}
                        isLoading={isLoading}
                    />
                </ContainerCarrot>
            </div>
        </StyledDaftarKirimMerchPage>
    );
}

export default DaftarKirimMerchPage;