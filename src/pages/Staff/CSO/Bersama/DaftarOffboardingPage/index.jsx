import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import Loading from "@/components/Loading";
import { getDaftarOffboarding, postOffboardingData } from "@/features/cso/csoApiService";
import DataTableComponent from "@/components/Table";
import StyledDaftarOffboardingPage from "./DaftarOffboarding.styled";
import { BiTask, BiTaskX } from "react-icons/bi";
import { Checkbox, Input, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

function DaftarOffboardingPage() {
    const queryClient = useQueryClient();       
    const toast = useToast();

    const { data: offboarding = [], isLoading, isError, error } = useQuery({
        queryKey: ['offboarding'],
        queryFn: getDaftarOffboarding,
    });

    const { mutate: updateOffboarding } = useMutation({
        mutationFn: postOffboardingData,
        onMutate: async (updatedRow) => {
            await queryClient.cancelQueries({ queryKey: ['offboarding'] });
            const previousData = queryClient.getQueryData(['offboarding']);
            
            queryClient.setQueryData(['offboarding'], (oldData = []) => {
                return oldData.map(item => 
                    item.id_ticket === updatedRow.id_ticket ? { ...item, ...updatedRow } : item
                );
            });

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['offboarding'], context.previousData);
            }
            toast({
                title: 'Action Failed',
                description: err.message,
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
            queryClient.invalidateQueries({ queryKey: ['offboarding'] });
        }
    });

    const headerItems = [
        { key: 'id_ticket', label: 'ID' },
        { key: 'pic', label: 'PIC' },
        { key: 'nama', label: 'Nama' },
        { 
            key: 'program',
            label: 'Program',
            render: (item) => (
                <Input 
                    value={item.program}
                    onChange={(e) => handleCellChange(e.target.value, item.id_ticket, 'program')}
                    width="10rem"
                />
            )
        },
        { 
            key: 'modul',
            label: 'Label',
            render: (item) => (
                <Input 
                    value={item.modul}
                    onChange={(e) => handleCellChange(e.target.value, item.id_ticket, 'modul')}
                    width="10rem"
                />
            )
        },
        { 
            key: 'level',
            label: 'Level',
            render: (item) => (
                <Input 
                    value={item.level}
                    onChange={(e) => handleCellChange(e.target.value, item.id_ticket, 'level')}
                    width="10rem"
                />
            )
        },
        { key: 'keterangan', label: 'keterangan'},
        { key: 'keteranganDetail', label: 'Keterangan Detail'},
        { 
            key: 'tanggalMulaiCuti',
            label: 'Tanggal Mulai Cuti',
            render: (item) => (
                <Input 
                    value={item.tanggalMulaiCuti}
                    onChange={(e) => handleCellChange(e.target.value, item.id_ticket, 'tanggalMulaiCuti')}
                    width="10rem"
                />
            )
        },
        { 
            key: 'tanggalAkhirCuti',
            label: 'Tanggal Akhir Cuti',
            render: (item) => (
                <Input 
                    value={item.tanggalAkhirCuti}
                    onChange={(e) => handleCellChange(e.target.value, item.id_ticket, 'tanggalAkhirCuti')}
                    width="10rem"
                />
            )
        },
        { 
            key: 'lastDay',
            label: 'Last Day',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_lastDay}
                    onChange={() => handleCellChange(!item.done_lastDay, item.id_ticket, 'done_lastDay')}
                    colorScheme="blue"
                />
            )
        },
        { 
            key: 'done_scheduleSudahDirapihkan',
            label: 'Schedule Sudah Dirapihkan?',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_scheduleSudahDirapihkan}
                    onChange={() => handleCellChange(!item.done_scheduleSudahDirapihkan, item.id_ticket, 'done_scheduleSudahDirapihkan')}
                    colorScheme="blue"
                />
            )
        },
        { 
            key: 'reminderWhatsapp',
            label: 'Reminder Whatsapp',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderWhatsapp}
                    onChange={() => handleCellChange(!item.done_reminderWhatsapp, item.id_ticket, 'done_reminderWhatsapp')}
                    colorScheme="blue"
                />
            )
        },
        { 
            key: 'sertifSudahDikirim',
            label: 'Sertifikat Sudah Dikirim?',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_sertifSudahDikirim}
                    onChange={() => handleCellChange(!item.done_sertifSudahDikirim, item.id_ticket, 'done_sertifSudahDikirim')}
                    colorScheme="blue"
                />
            )
        },
        { 
            key: 'progressReportSudahDikirim',
            label: 'Progress Report Sudah Dikirim?',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_progressReportSudahDikirim}
                    onChange={() => handleCellChange(!item.done_progressReportSudahDikirim, item.id_ticket, 'done_progressReportSudahDikirim')}
                    colorScheme="blue"
                />
            )
        },
        { key: 'done', label: 'ALL DONE?'}
    ];

    const handleCellChange = (newValue, rowId, columnKey) => {
        const itemToUpdate = offboarding.find(item => item.id_ticket === rowId);
        if (itemToUpdate) {
            updateOffboarding({
                ...itemToUpdate,
                [columnKey]: newValue
            });
        }
    };

    const handleDoneAction = async (rowData) => {
        updateOffboarding(rowData);
    };

    if (isLoading) return <Loading />
    if (isError) return <div>Error: {error.message}</div>;

    const doneCount = offboarding.filter(item => item.done).length;
    const notDoneCount = offboarding.length - doneCount;

    return (
        <StyledDaftarOffboardingPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daftar Offboarding - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard><BiTask size="30px" /> <p>Done</p> <p className="card__points">{doneCount}</p></InfoCard>
                            <InfoCard><BiTaskX size="30px" /> <p>Not Done</p> <p className="card__points">{notDoneCount}</p></InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <ContainerCarrot>
                <div className="main-content-section">
                    <DataTableComponent 
                        tableData={offboarding} 
                        headerItems={headerItems} 
                        onAction={handleDoneAction}
                    />
                </div>
            </ContainerCarrot>
        </StyledDaftarOffboardingPage>
    );
}

export default DaftarOffboardingPage;