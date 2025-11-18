import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { LuTicket, LuTicketCheck} from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPartnershipData, postPartnership } from "@/features/cso/csoApiService";
import { StyledPartnershipPage } from "./Partnership.styled";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const tabItems = [
    {key: 'dataOpen', label: 'Ticket Open'},
    {key: 'dataClose', label: 'Ticket Close'}
];

function PartnershipPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: partnershipData, isLoading, isError, error } = useQuery({
        queryKey: ['partnership'],
        queryFn: getPartnershipData,
        placeholderData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: ({ rowData }) => postPartnership({ rowData }),
        onMutate: async (variables) => {
            const { rowData: updatedRow } = variables;

            await queryClient.cancelQueries({ queryKey: ['partnership'] });
            const previousData = queryClient.getQueryData(['partnership']);

            queryClient.setQueryData(['partnership'], (oldData) => {
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
                queryClient.setQueryData(['partnership'], context.previousData);
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
                queryClient.invalidateQueries({ queryKey: ['partnership'] });
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

        queryClient.setQueryData(['partnership'], (oldData) => ({
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
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'idTicket', label: 'ID Ticket' },
        { key: 'nama', label: 'Nama' },
        { key: 'status', label: 'Status' },
        { key: 'jam', label: 'Jam' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'nomorHp', label: 'Nomor HP' },
        { key: 'media', label: 'Media' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'subKategori', label: 'Sub Kategori' },
        { key: 'detail', label: 'Detail' },
        { key: 'responsible', label: 'Responsible' },
        { key: 'accountable', label: 'Accountable' },
        { key: 'consulted', label: 'Consulted' },
        { key: 'informed', label: 'Informed' },
        { key: 'lampiran', label: 'Lampiran' },
        { key: 'hasil', label: 'Hasil' },
        { key: 'todo', label: 'To Do' },
        { key: 'comment', label: 'Comment' },
        { key: 'pic', label: 'PIC' },
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
                        borderColor: 'orange.200', 
                        bg: 'white',
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#f9dbcfff',
                                borderColor: '#f9dbcfff',
                            },
                            '&[data-checked]:hover': {
                                bg: '#FE7743',
                                borderColor: '#FE7743',
                            }
                        }
                    }}
                />
            )
        }
    ];

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledPartnershipPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Partnership - Overview</h1>
                        <div className="stats-grid">
                            <InfoCard>
                                <LuTicket size="30px" />
                                <p>Total ticket yang masih Open</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{partnershipData.dataOpen.length}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuTicketCheck size="30px" />
                                <p>Total ticket yang sudah closed</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{partnershipData.dataClose.length}</p>}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={partnershipData} headerItems={headerItems} isLoading={isLoading} />
                </ContainerCarrot>
            </div>
        </StyledPartnershipPage>
    );
}

export default PartnershipPage;
