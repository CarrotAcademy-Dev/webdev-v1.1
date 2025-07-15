import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import Loading from "@/components/Loading";
import { LuTicket, LuTicketCheck} from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getTicketExternal, postTicketExternal } from "@/features/cso/csoApiService";
import { StyledTicketExternalPage } from "./TicketExternal.styled";

const tabItems = [
    {key: 'dataOpen', label: 'Ticket Open'},
    {key: 'dataClose', label: 'Ticket Close'}
];

function TicketExternalPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: ticketExternal, isLoading, isError, error } = useQuery({
        queryKey: ['ticketExternal'],
        queryFn: getTicketExternal,
        initialData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: ({ rowData }) => postTicketExternal({ rowData }),
        onMutate: async (variables) => {
            const { rowData: updatedRow } = variables;

            await queryClient.cancelQueries({ queryKey: ['ticketExternal'] });
            const previousData = queryClient.getQueryData(['ticketExternal']);

            queryClient.setQueryData(['ticketExternal'], (oldData) => {
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
                queryClient.setQueryData(['ticketExternal'], context.previousData);
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
                queryClient.invalidateQueries({ queryKey: ['ticketExternal'] });
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

        queryClient.setQueryData(['ticketExternal'], (oldData) => ({
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
        { key: 'nomor_hp', label: 'Nomor HP' },
        { key: 'media', label: 'Media' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'subKategori', label: 'Sub Kategori' },
        { key: 'detail', label: 'Detail' },
        { key: 'pic', label: 'PIC' },
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

    if (isLoading) return <Loading />
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledTicketExternalPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Ticket External - Overview</h1>
                        <div className="stats-grid">
                            <InfoCard>
                                <LuTicket size="30px" />
                                <p>Total ticket yang masih Open</p>
                                <p className="card__points">{ticketExternal.dataOpen.length}</p>
                            </InfoCard>
                            <InfoCard>
                                <LuTicketCheck size="30px" />
                                <p>Total ticket yang sudah closed</p>
                                <p className="card__points">{ticketExternal.dataClose.length}</p>
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={ticketExternal} headerItems={headerItems} />
                </ContainerCarrot>
            </div>
        </StyledTicketExternalPage>
    );
}

export default TicketExternalPage;
