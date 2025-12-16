import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { LuTicket, LuTicketCheck} from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getJanjiTemu, postJanjiTemu } from "@/features/cso/csoApiService";
import { StyledJanjiTemuPage } from "./JanjiTemu.styled";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const tabItems = [
    {key: 'dataOpen', label: 'Ticket Open'},
    {key: 'dataClose', label: 'Ticket Close'}
];

function JanjiTemuPage() {
    const { colorMode } = useColorMode();
    const checkboxBg = useColorModeValue('white', 'gray.700');
    const checkboxBorderColor = useColorModeValue('orange.200', 'orange.400');
    const checkboxCheckedBg = useColorModeValue('#f9dbcfff', 'orange.700');
    const checkboxCheckedHover = useColorModeValue('#FE7743', 'orange.600');
    
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: janjiTemu, isLoading, isError, error } = useQuery({
        queryKey: ['janjiTemu'],
        queryFn: getJanjiTemu,
        placeholderData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: ({ rowData }) => postJanjiTemu({ rowData }),
        onMutate: async (variables) => {
            const { rowData: updatedRow } = variables;

            await queryClient.cancelQueries({ queryKey: ['janjiTemu'] });
            const previousData = queryClient.getQueryData(['janjiTemu']);

            queryClient.setQueryData(['janjiTemu'], (oldData) => {
                if (!oldData) return { dataOpen: [], dataClose: [] };
                
                const newDataOpen = oldData.dataOpen.map(item => {
                    if (item.idTicket === updatedRow.idTicket) {
                        return { ...item, done: true };
                    }
                    return item;
                });

                const itemToMove = oldData.dataOpen.find(item => item.idTicket === updatedRow.idTicket);
                const newDataClose = itemToMove 
                    ? [...oldData.dataClose, { ...itemToMove, done: true }]
                    : oldData.dataClose;

                return {
                    ...oldData,
                    dataOpen: newDataOpen.filter(item => !item.done),
                    dataClose: newDataClose
                };
            });
            return { previousData };
        },
        onError: (error, updatedRow, context) => {
            if (context.previousData) {
                queryClient.setQueryData(['janjiTemu'], context.previousData);
            }
            toast({
                title: 'Action Failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        },
        onSuccess: () => {
            toast({
                title: 'Update Sukses!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['janjiTemu'] });
            }, 500);
        },
    });

    const handleActionDone = (rowData) => {
        if (!rowData.idTicket) {
            toast({
                title: 'Error',
                description: 'ID Ticket tidak ditemukan',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        queryClient.setQueryData(['janjiTemu'], (oldData) => ({
            ...oldData,
            dataOpen: oldData.dataOpen.map(item => ({
                ...item,
                isUpdating: item.idTicket === rowData.idTicket
            }))
        }));

        setTimeout(() => {
            markDoneMutation({ rowData });
        }, 300);
    }

    const headerItems = [
        { key: 'idTicket', label: 'ID Ticket' },
        { key: 'nama', label: 'Nama' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'nomor_hp', label: 'Nomor HP' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'detail', label: 'Detail' },
        { key: 'pic', label: 'PIC' },
        { key: 'lampiran', label: 'Lampiran' },
        { key: 'hasil', label: 'Hasil' },
        { 
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    key={item.idTicket}
                    isChecked={item.done || item.isUpdating}
                    isDisabled={item.done || item.isUpdating} 
                    onChange={() => handleActionDone(item)}
                    colorScheme="orange"
                    sx={{
                        borderColor: checkboxBorderColor, 
                        bg: checkboxBg,
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: checkboxCheckedBg,
                                borderColor: checkboxCheckedBg,
                            },
                            '&[data-checked]:hover': {
                                bg: checkboxCheckedHover,
                                borderColor: checkboxCheckedHover,
                            }
                        }
                    }}
                />
            )
        }
    ];

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledJanjiTemuPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Janji Temu - Overview</h1>
                        <div className="stats-grid">
                            <InfoCard>
                                <LuTicket size="30px" />
                                <p>Total ticket yang masih Open</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{janjiTemu.dataOpen.length}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuTicketCheck size="30px" />
                                <p>Total ticket yang sudah closed</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{janjiTemu.dataClose.length}</p>}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={janjiTemu} headerItems={headerItems} isLoading={isLoading} />
                </ContainerCarrot>
            </div>
        </StyledJanjiTemuPage>
    );
}

export default JanjiTemuPage;
