import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import Loading from "@/components/Loading";
import { LuTicket, LuTicketCheck} from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery, } from "@tanstack/react-query";
import { getLostnFound, postLostNFound } from "@/features/cso/csoApiService";
import { StyledLostNFoundPage } from "./LostNFound.styled";

const tabItems = [
    {key: 'dataOpen', label: 'Ticket Open'},
    {key: 'dataClose', label: 'Ticket Close'}
];

function LostNFoundPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: lostnfound, isLoading, isError, error } = useQuery({
        queryKey: ['lostNFound'],
        queryFn: getLostnFound,
        initialData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: (rowData) => postLostNFound(rowData),
        onMutate: async (updatedRow) => {
            await queryClient.cancelQueries({ queryKey: ['lostNFound'] });

            const previousLostNFoundData = queryClient.getQueryData(['lostNFound']);

            queryClient.setQueryData(['lostNFound'], (oldData) => {
                if (!oldData) return { dataOpen: [], dataClose: [] };
                const newUndone = oldData.dataOpen.map(item => {
                    if (item.id === updatedRow.id) {
                        return { ...item, dataOpen: true };
                    }
                    return item;
                });
                return { ...oldData, dataOpen: newUndone };
            });
            return { previousLostNFoundData };
        },
        onError: (error, updatedRow, context) => {
            if (context.previousLostNFoundData) {
                queryClient.setQueryData(['lostNFound'], context.previousLostNFoundData);
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
                queryClient.invalidateQueries({ queryKey: ['lostNFound'] });
            }, 500);
        },
    });

    const handleActionDone = (rowData) => {
       markDoneMutation(rowData);
    }

    const headerItems = [
        { key: 'idTicket', label: 'ID Ticket' },
        { key: 'nama', label: 'Nama' },
        { key: 'nomor', label: 'Nomor' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'requestDetail', label: 'Request Detail' },
        { key: 'pic', label: 'PIC' },
        { key: 'lampiran', label: 'Lampiran' },
        { key: 'hasil', label: 'Hasil' },
        { 
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    isChecked={item.done}
                    isDisabled={item.done} 
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
        <StyledLostNFoundPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Lost And Found - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard><LuTicket size="30px" /> <p>Total ticket yang masih Open</p> <p className="card__points">{lostnfound.dataOpen.length}</p></InfoCard>
                            <InfoCard><LuTicketCheck size="30px" /> <p>Total ticket yang sudah closed</p> <p className="card__points">{lostnfound.dataClose.length}</p></InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={lostnfound} headerItems={headerItems} />
                </ContainerCarrot>
            </div>
        </StyledLostNFoundPage>
    );
}

export default LostNFoundPage;
