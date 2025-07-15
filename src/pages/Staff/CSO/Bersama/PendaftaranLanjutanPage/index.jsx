import ContainerCarrot from "@/components/Container";
import Loading from "@/components/Loading";
import { Button, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPendaftaranLanjutan, postTanggalKirimPendaftaran } from "@/features/cso/csoApiService";
import { StyledPendaftaranLanjutanPage } from "./PendaftaranLanjutan.styled";
import { LuExternalLink } from "react-icons/lu";

function PendaftaranLanjutanPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: pendaftaranData, isLoading, isError, error } = useQuery({
        queryKey: ['pendaftaranLanjutan'],
        queryFn: getPendaftaranLanjutan,
        initialData: { dataOpen: [] }
    });

    const { mutate: markSentMutation } = useMutation({
        mutationFn: ({ rowData }) => postTanggalKirimPendaftaran({ rowData }),
        onMutate: async (variables) => {
            const { rowData: updatedRow } = variables;

            await queryClient.cancelQueries({ queryKey: ['pendaftaranLanjutan'] });
            const previousData = queryClient.getQueryData(['pendaftaranLanjutan']);

            queryClient.setQueryData(['pendaftaranLanjutan'], (oldData) => {
                if (!oldData) return { dataOpen: [] };
                
                const newDataOpen = oldData.dataOpen.map(item => {
                    if (item.nis === updatedRow.nis) {
                        return { ...item, tanggalKirim: new Date().toLocaleDateString() };
                    }
                    return item;
                });

                return {
                    ...oldData,
                    dataOpen: newDataOpen
                };
            });
            return { previousData };
        },
        onError: (error, updatedRow, context) => {
            if (context.previousData) {
                queryClient.setQueryData(['pendaftaranLanjutan'], context.previousData);
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
                title: 'Tanggal Kirim Updated!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['pendaftaranLanjutan'] });
            }, 500);
        },
    });

    const handleMarkAsSent = (rowData) => {
        if (!rowData.nis) {
            toast({
                title: 'Error',
                description: 'NIS tidak ditemukan',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        markSentMutation({ rowData });
    };

    const headerItems = [
        { key: 'nis', label: 'NIS' },
        { key: 'nama', label: 'Nama' },
        { 
            key: 'linkPendaftaran', 
            label: 'Link Pendaftaran',
            render: (item) => (
                <Button
                    leftIcon={<LuExternalLink />}
                    colorScheme="blue"
                    variant="link"
                    onClick={() => window.open(item.linkPendaftaran, '_blank')}
                >
                    Open Link
                </Button>
            )
        },
        {
            key: 'tanggalKirim',
            label: 'Tanggal Kirim',
            render: (item) => (
                <Button
                    isDisabled={item.tanggalKirim}
                    onClick={() => handleMarkAsSent(item)}
                    colorScheme="orange"
                    size="sm"
                >
                    {item.tanggalKirim || 'Mark as Sent'}
                </Button>
            )
        }
    ];

    if (isLoading) return <Loading />
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledPendaftaranLanjutanPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Pendaftaran Lanjutan</h1>
                    </div>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {headerItems.map((header) => (
                                    <th key={header.key}>{header.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pendaftaranData.dataOpen.map((item, index) => (
                                <tr key={item.nis || index}>
                                    {headerItems.map((header) => (
                                        <td key={header.key}>
                                            {header.render ? header.render(item) : item[header.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ContainerCarrot>
        </StyledPendaftaranLanjutanPage>
    );
}

export default PendaftaranLanjutanPage;
