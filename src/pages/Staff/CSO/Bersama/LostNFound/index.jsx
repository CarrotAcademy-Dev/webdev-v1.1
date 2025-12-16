import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { LuTicket, LuTicketCheck} from "react-icons/lu";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast, useColorModeValue } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery, } from "@tanstack/react-query";
import { getLostnFound, postLostNFound } from "@/features/cso/csoApiService";
import { StyledLostNFoundPage } from "./LostNFound.styled";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const tabItems = [
    {key: 'dataOpen', label: 'Ticket Open'},
    {key: 'dataClose', label: 'Ticket Close'}
];

function LostNFoundPage() {
    const checkboxBg = useColorModeValue('white', 'gray.700');
    const checkboxBorderColor = useColorModeValue('orange.200', 'orange.400');
    const checkboxCheckedBg = useColorModeValue('#f9dbcfff', 'orange.700');
    const checkboxCheckedHover = useColorModeValue('#FE7743', 'orange.600');
    
    const { currentUser } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: lostnfound, isLoading, isError, error } = useQuery({
        queryKey: ['lostNFound'],
        queryFn: getLostnFound,
        placeholderData: { dataOpen: [], dataClose: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: (rowData) => postLostNFound(rowData),
        onMutate: async (updatedRow) => {
            await queryClient.cancelQueries({ queryKey: ['lostNFound'] });

            const previousLostNFoundData = queryClient.getQueryData(['lostNFound']);

            // First update: Show checkbox as checked
            queryClient.setQueryData(['lostNFound'], (oldData) => {
                if (!oldData) return { dataOpen: [], dataClose: [] };
                
                const newDataOpen = oldData.dataOpen.map(item => {
                    if (item.idTicket === updatedRow.idTicket) {
                        return { ...item, done: true, pic: currentUser?.nama || '' };
                    }
                    return item;
                });
                
                return { 
                    ...oldData,
                    dataOpen: newDataOpen
                };
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
        onSuccess: (data, updatedRow) => {
            toast({
                title: 'Update Sukses!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            // Wait 1 second before moving the item to Close tab
            setTimeout(() => {
                queryClient.setQueryData(['lostNFound'], (oldData) => {
                    if (!oldData) return { dataOpen: [], dataClose: [] };
                    
                    // Find and remove from dataOpen
                    const itemToMove = oldData.dataOpen.find(item => item.idTicket === updatedRow.idTicket);
                    const newDataOpen = oldData.dataOpen.filter(item => item.idTicket !== updatedRow.idTicket);
                    
                    // Add to dataClose
                    const newDataClose = itemToMove 
                        ? [itemToMove, ...oldData.dataClose]
                        : oldData.dataClose;
                    
                    return { 
                        dataOpen: newDataOpen,
                        dataClose: newDataClose
                    };
                });
            }, 1000);

            // Refresh data after transition
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['lostNFound'] });
            }, 1500);
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
        <StyledLostNFoundPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Lost And Found - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <LuTicket size="30px" />
                                <p>Total ticket yang masih Open</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{lostnfound.dataOpen.length}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuTicketCheck size="30px" />
                                <p>Total ticket yang sudah closed</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{lostnfound.dataClose.length}</p>}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={lostnfound} headerItems={headerItems} isLoading={isLoading} />
                </ContainerCarrot>
            </div>
        </StyledLostNFoundPage>
    );
}

export default LostNFoundPage;
