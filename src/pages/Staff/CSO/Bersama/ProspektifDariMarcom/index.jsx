import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import Loading from "@/components/Loading";
import { LuTicket, LuTicketCheck} from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery, } from "@tanstack/react-query";
import { getProspektifDariMarcom, postProspektifDariMarcom} from "@/features/cso/csoApiService";
import { StyledProspektifDariMarcomPage } from "./ProspektifDariMarcom.styled";

const tabItems = [
    {key: 'dataOpen', label: 'Ticket Open'},
    {key: 'dataClose', label: 'Ticket Close'}
];

function ProspektifMarcomPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: prosMarcom, isLoading, isError, error } = useQuery({
        queryKey: ['prosMarcom'],
        queryFn: getProspektifDariMarcom,
        initialData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: ({ rowData }) => postProspektifDariMarcom({ rowData }),
        onMutate: async (variables) => {
            const { rowData: updatedRow } = variables;

            await queryClient.cancelQueries({ queryKey: ['prosMarcom'] });
            const previousData = queryClient.getQueryData(['prosMarcom']);

            queryClient.setQueryData(['prosMarcom'], (oldData) => {
                if (!oldData) return { dataOpen: [], dataClose: [] };
                
                // Update item in dataOpen to show it as done
                const newDataOpen = oldData.dataOpen.map(item => {
                    if (item.nomor_hp === updatedRow.nomor_hp) {
                        return { ...item, done: true };
                    }
                    return item;
                });

                const itemToMove = oldData.dataOpen.find(item => item.nomor_hp === updatedRow.nomor_hp);
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
                queryClient.setQueryData(['prosMarcom'], context.previousData);
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
                queryClient.invalidateQueries({ queryKey: ['prosMarcom'] });
            }, 500);
        },
    });

    const handleActionDone = (rowData) => {
        if (!rowData.nomor_hp) {
            toast({
                title: 'Error',
                description: 'Nomor HP tidak ditemukan',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        // Reset any existing isUpdating flags first
        queryClient.setQueryData(['prosMarcom'], (oldData) => ({
            ...oldData,
            dataOpen: oldData.dataOpen.map(item => ({
                ...item,
                isUpdating: item.nomor_hp === rowData.nomor_hp
            }))
        }));

        // Execute mutation after a short delay for animation
        setTimeout(() => {
            markDoneMutation({ rowData });
        }, 300);
    }

    const headerItems = [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomor_hp', label: 'Nomor HP' },
        { key: 'firstContact', label: 'First Contact' },
        { key: 'media', label: 'Media' },
        { key: 'programYangMenarik', label: 'Program Yang Menarik' },
        { key: 'referral', label: 'Referral (Optional)' },
        { key: 'keterangan', label: 'Keterangan' },
        { 
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    key={item.nomor_hp} // Add unique key to force re-render
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
        <StyledProspektifDariMarcomPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Prospektif Dari Marcom - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard><LuTicket size="30px" /> <p>Total ticket yang masih Open</p> <p className="card__points">{prosMarcom.dataOpen.length}</p></InfoCard>
                            <InfoCard><LuTicketCheck size="30px" /> <p>Total ticket yang sudah closed</p> <p className="card__points">{prosMarcom.dataClose.length}</p></InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={prosMarcom} headerItems={headerItems} />
                </ContainerCarrot>
            </div>
        </StyledProspektifDariMarcomPage>
    );
}

export default ProspektifMarcomPage;
