import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { getDaftarOffboarding, postOffboardingData } from "@/features/cso/csoApiService";
import SistemTabs from "@/components/SistemTabs";
import StyledDaftarOffboardingPage from "./DaftarOffboarding.styled";
import { BiTask, BiTaskX } from "react-icons/bi";
import { Checkbox, Input, useToast, Button, Flex, IconButton } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useState } from 'react';
import { LuPencil, LuSave, LuX } from 'react-icons/lu';

const tabItems = [
    { key: 'notDone', label: 'Not Done' },
    { key: 'done', label: 'Done' }
];

function DaftarOffboardingPage() {
    const queryClient = useQueryClient();       
    const toast = useToast();

    // State for tracking which rows are being edited
    const [editingRows, setEditingRows] = useState({});
    const [editedData, setEditedData] = useState({});

    const { data: rawData = [], isLoading, isError, error } = useQuery({
        queryKey: ['offboarding'],
        queryFn: getDaftarOffboarding,
    });

    // Separate data into done and not done
    const offboardingData = {
        notDone: rawData.filter(item => !item.done),
        done: rawData.filter(item => item.done)
    };

    const { mutate: updateOffboarding, isPending } = useMutation({
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
        onSuccess: (data, variables) => {
            toast({
                title: 'Update Sukses!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });
            
            // Remove from editing state
            setEditingRows(prev => {
                const newState = { ...prev };
                delete newState[variables.id_ticket];
                return newState;
            });
            setEditedData(prev => {
                const newState = { ...prev };
                delete newState[variables.id_ticket];
                return newState;
            });
            
            queryClient.invalidateQueries({ queryKey: ['offboarding'] });
        }
    });

    const headerItems = [
        {
            key: 'actions',
            label: 'Actions',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                
                return (
                    <Flex gap={2}>
                        {!isEditing ? (
                            <IconButton
                                icon={<LuPencil />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleStartEdit(item)}
                                aria-label="Edit"
                                title="Edit"
                            />
                        ) : (
                            <>
                                <IconButton
                                    icon={<LuSave />}
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => handleSaveEdit(item.id_ticket)}
                                    isLoading={isPending}
                                    aria-label="Save"
                                    title="Save"
                                />
                                <IconButton
                                    icon={<LuX />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleCancelEdit(item.id_ticket)}
                                    aria-label="Cancel"
                                    title="Cancel"
                                />
                            </>
                        )}
                    </Flex>
                );
            }
        },
        { key: 'id_ticket', label: 'ID' },
        { key: 'pic', label: 'PIC' },
        { key: 'nama', label: 'Nama' },
        { 
            key: 'program',
            label: 'Program',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Input 
                        value={currentData.program || ''}
                        onChange={(e) => handleFieldChange(e.target.value, item.id_ticket, 'program')}
                        width="10rem"
                        isDisabled={!isEditing}
                        bg={isEditing ? 'yellow.50' : 'transparent'}
                    />
                );
            }
        },
        { 
            key: 'modul',
            label: 'Modul',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Input 
                        value={currentData.modul || ''}
                        onChange={(e) => handleFieldChange(e.target.value, item.id_ticket, 'modul')}
                        width="10rem"
                        isDisabled={!isEditing}
                        bg={isEditing ? 'yellow.50' : 'transparent'}
                    />
                );
            }
        },
        { 
            key: 'level',
            label: 'Level',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Input 
                        value={currentData.level || ''}
                        onChange={(e) => handleFieldChange(e.target.value, item.id_ticket, 'level')}
                        width="10rem"
                        isDisabled={!isEditing}
                        bg={isEditing ? 'yellow.50' : 'transparent'}
                    />
                );
            }
        },
        { key: 'keterangan', label: 'keterangan'},
        { key: 'keteranganDetail', label: 'Keterangan Detail'},
        { 
            key: 'tanggalMulaiCuti',
            label: 'Tanggal Mulai Cuti',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Input 
                        type="date"
                        value={currentData.tanggalMulaiCuti || ''}
                        onChange={(e) => handleFieldChange(e.target.value, item.id_ticket, 'tanggalMulaiCuti')}
                        width="10rem"
                        isDisabled={!isEditing}
                        bg={isEditing ? 'yellow.50' : 'transparent'}
                    />
                );
            }
        },
        { 
            key: 'tanggalAkhirCuti',
            label: 'Tanggal Akhir Cuti',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Input 
                        type="date"
                        value={currentData.tanggalAkhirCuti || ''}
                        onChange={(e) => handleFieldChange(e.target.value, item.id_ticket, 'tanggalAkhirCuti')}
                        width="10rem"
                        isDisabled={!isEditing}
                        bg={isEditing ? 'yellow.50' : 'transparent'}
                    />
                );
            }
        },
        { 
            key: 'lastDay',
            label: 'Last Day',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Checkbox 
                        isChecked={currentData.done_lastDay}
                        onChange={() => handleFieldChange(!currentData.done_lastDay, item.id_ticket, 'done_lastDay')}
                        colorScheme="blue"
                        isDisabled={!isEditing}
                    />
                );
            }
        },
        { 
            key: 'done_scheduleSudahDirapihkan',
            label: 'Schedule Sudah Dirapihkan?',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Checkbox 
                        isChecked={currentData.done_scheduleSudahDirapihkan}
                        onChange={() => handleFieldChange(!currentData.done_scheduleSudahDirapihkan, item.id_ticket, 'done_scheduleSudahDirapihkan')}
                        colorScheme="blue"
                        isDisabled={!isEditing}
                    />
                );
            }
        },
        { 
            key: 'reminderWhatsapp',
            label: 'Reminder Whatsapp',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Checkbox 
                        isChecked={currentData.done_reminderWhatsapp}
                        onChange={() => handleFieldChange(!currentData.done_reminderWhatsapp, item.id_ticket, 'done_reminderWhatsapp')}
                        colorScheme="blue"
                        isDisabled={!isEditing}
                    />
                );
            }
        },
        { 
            key: 'sertifSudahDikirim',
            label: 'Sertifikat Sudah Dikirim?',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Checkbox 
                        isChecked={currentData.done_sertifSudahDikirim}
                        onChange={() => handleFieldChange(!currentData.done_sertifSudahDikirim, item.id_ticket, 'done_sertifSudahDikirim')}
                        colorScheme="blue"
                        isDisabled={!isEditing}
                    />
                );
            }
        },
        { 
            key: 'progressReportSudahDikirim',
            label: 'Progress Report Sudah Dikirim?',
            render: (item) => {
                const isEditing = editingRows[item.id_ticket];
                const currentData = editedData[item.id_ticket] || item;
                
                return (
                    <Checkbox 
                        isChecked={currentData.done_progressReportSudahDikirim}
                        onChange={() => handleFieldChange(!currentData.done_progressReportSudahDikirim, item.id_ticket, 'done_progressReportSudahDikirim')}
                        colorScheme="blue"
                        isDisabled={!isEditing}
                    />
                );
            }
        },
        { key: 'done', label: 'ALL DONE?'}
    ];

    // Start editing a row
    const handleStartEdit = (item) => {
        setEditingRows(prev => ({ ...prev, [item.id_ticket]: true }));
        setEditedData(prev => ({ ...prev, [item.id_ticket]: { ...item } }));
    };

    // Update field value in local state
    const handleFieldChange = (newValue, rowId, columnKey) => {
        setEditedData(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [columnKey]: newValue
            }
        }));
    };

    // Save edited data
    const handleSaveEdit = (rowId) => {
        const dataToSave = editedData[rowId];
        if (dataToSave) {
            updateOffboarding(dataToSave);
        }
    };

    // Cancel editing
    const handleCancelEdit = (rowId) => {
        setEditingRows(prev => {
            const newState = { ...prev };
            delete newState[rowId];
            return newState;
        });
        setEditedData(prev => {
            const newState = { ...prev };
            delete newState[rowId];
            return newState;
        });
    };

    if (isError) return <div>Error: {error.message}</div>;

    const doneCount = rawData.filter(item => item.done).length;
    const notDoneCount = rawData.length - doneCount;

    return (
        <StyledDaftarOffboardingPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daftar Offboarding - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <BiTask size="30px" />
                                <p>Done</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{doneCount}</p>}
                            </InfoCard>
                            <InfoCard>
                                <BiTaskX size="30px" />
                                <p>Not Done</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{notDoneCount}</p>}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <ContainerCarrot>
                <div className="main-content-section">
                    <SistemTabs 
                        tabItems={tabItems}
                        tableData={offboardingData} 
                        headerItems={headerItems} 
                        isLoading={isLoading}
                    />
                </div>
            </ContainerCarrot>
        </StyledDaftarOffboardingPage>
    );
}

export default DaftarOffboardingPage;