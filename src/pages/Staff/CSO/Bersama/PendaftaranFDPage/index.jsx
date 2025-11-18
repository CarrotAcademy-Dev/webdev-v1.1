import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { getPendaftaranFD, postPendaftaranFD } from "@/features/cso/csoApiService";
import SistemTabs from "@/components/SistemTabs";
import { BiTask, BiTaskX } from "react-icons/bi";
import StyledPendaftaranFdPage from "./PendaftaranFd.styled";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox, useToast, Input } from "@chakra-ui/react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const tabItems = [
    { key: 'notDone', label: 'Not Done' },
    { key: 'done', label: 'Done' }
];

function PendaftaranFdPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: rawData = [], isLoading, isError, error } = useQuery({
        queryKey: ['pendaftaranFD'],
        queryFn: getPendaftaranFD
    });

    // Separate data into done and not done
    const pendaftaranData = {
        notDone: rawData.filter(item => !item.done),
        done: rawData.filter(item => item.done)
    };

    const { mutate: updatePendaftaranFD } = useMutation({
        mutationFn: postPendaftaranFD,
        onMutate: async (updatedRow) => {
            await queryClient.cancelQueries({ queryKey: ['pendaftaranFD'] });
            const previousData = queryClient.getQueryData(['pendaftaranFD']);
            
            queryClient.setQueryData(['pendaftaranFD'], (oldData = []) => {
                return oldData.map(item => 
                    item.nis === updatedRow.nis ? { ...item, ...updatedRow } : item
                );
            });

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['pendaftaranFD'], context.previousData);
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
            queryClient.invalidateQueries({ queryKey: ['pendaftaranFD'] });
        }
    });

    const handleCheckboxChange = (item, checkboxKey) => {
        const updatedItem = {
            ...item,
            [checkboxKey]: !item[checkboxKey]
        };

        // Check if all checkboxes are now checked
        const allChecked = 
            updatedItem.done_reminderH9 &&
            updatedItem.done_reminderH6 &&
            updatedItem.done_reminderH4 &&
            updatedItem.done_reminderH3 &&
            updatedItem.done_reminderH2 &&
            updatedItem.done_reminderH1 &&
            updatedItem.done_reminderHplus1 &&
            updatedItem.done_reminderHplus2;

        updatedItem.done = allChecked;

        updatePendaftaranFD(updatedItem);
    };

    const handleInputChange = (item, fieldKey, newValue) => {
        // Update optimistically in UI first
        queryClient.setQueryData(['pendaftaranFD'], (oldData = []) => {
            return oldData.map(dataItem => 
                dataItem.nis === item.nis 
                    ? { ...dataItem, [fieldKey]: newValue }
                    : dataItem
            );
        });
    };

    const handleInputBlur = (item) => {
        // Send update to backend when user finishes editing (onBlur)
        updatePendaftaranFD(item);
    };

    const headerItems = [
        { key: 'no', label: 'No' },
        { 
            key: 'angkatan', 
            label: 'Angkatan',
            render: (item) => (
                <Input 
                    value={item.angkatan || ''}
                    onChange={(e) => handleInputChange(item, 'angkatan', e.target.value)}
                    onBlur={() => handleInputBlur(item)}
                    size="sm"
                    width="8rem"
                    placeholder="Angkatan"
                />
            )
        },
        { 
            key: 'tahun', 
            label: 'Tahun',
            render: (item) => (
                <Input 
                    value={item.tahun || ''}
                    onChange={(e) => handleInputChange(item, 'tahun', e.target.value)}
                    onBlur={() => handleInputBlur(item)}
                    size="sm"
                    width="6rem"
                    placeholder="Tahun"
                />
            )
        },
        { 
            key: 'noFd', 
            label: 'No FD',
            render: (item) => (
                <Input 
                    value={item.noFd || ''}
                    onChange={(e) => handleInputChange(item, 'noFd', e.target.value)}
                    onBlur={() => handleInputBlur(item)}
                    size="sm"
                    width="5rem"
                    placeholder="No"
                />
            )
        },
        { key: 'nis', label: 'NIS'},
        { key: 'nama', label: 'Nama'},
        { key: 'linkPendaftaran', label: 'Link Pendaftaran'},
        { 
            key: 'done_reminderH9', 
            label: 'Reminder H-9',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderH9}
                    onChange={() => handleCheckboxChange(item, 'done_reminderH9')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderH6', 
            label: 'Reminder H-6',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderH6}
                    onChange={() => handleCheckboxChange(item, 'done_reminderH6')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderH4', 
            label: 'Reminder H-4',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderH4}
                    onChange={() => handleCheckboxChange(item, 'done_reminderH4')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderH3', 
            label: 'Reminder H-3',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderH3}
                    onChange={() => handleCheckboxChange(item, 'done_reminderH3')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderH2', 
            label: 'Reminder H-2',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderH2}
                    onChange={() => handleCheckboxChange(item, 'done_reminderH2')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderH1', 
            label: 'Reminder H-1',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderH1}
                    onChange={() => handleCheckboxChange(item, 'done_reminderH1')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderHplus1', 
            label: 'Reminder H+1',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderHplus1}
                    onChange={() => handleCheckboxChange(item, 'done_reminderHplus1')}
                    colorScheme="orange"
                />
            )
        },
        { 
            key: 'done_reminderHplus2', 
            label: 'Reminder H+2',
            render: (item) => (
                <Checkbox 
                    isChecked={item.done_reminderHplus2}
                    onChange={() => handleCheckboxChange(item, 'done_reminderHplus2')}
                    colorScheme="orange"
                />
            )
        }
    ];

    if (isError) return <div>Error: {error.message}</div>;

    const doneCount = rawData.filter(item => item.done).length;
    const notDoneCount = rawData.length - doneCount;
    const totalCount = rawData.length;
    const percentageComplete = totalCount > 0 
        ? Math.round((doneCount / totalCount) * 100) 
        : 0;

    return (
        <StyledPendaftaranFdPage>
            <ContainerCarrot>
                <h1 className="page-title">Daftar Pendaftaran Fulltime Course - Overview</h1>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <BiTaskX size="30px" /> 
                                <p>Not Done</p> 
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{notDoneCount}</p>}
                            </InfoCard>
                            <InfoCard>
                                <BiTask size="30px" /> 
                                <p>Done</p> 
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{doneCount}</p>}
                            </InfoCard>
                        </div>
                    </div>
                    <div className="hero-section__right">
                        <InfoCard>
                            <div className="progress-info">
                                <h3>Progress Keseluruhan</h3>
                                <div className="progress-stats">
                                    <span className="percentage">{percentageComplete}%</span>
                                    <span className="count">{doneCount} dari {totalCount}</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${percentageComplete}%` }}
                                    />
                                </div>
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </ContainerCarrot>
            <ContainerCarrot>
                <div className="main-content-section">
                    <SistemTabs 
                        tabItems={tabItems}
                        tableData={pendaftaranData} 
                        headerItems={headerItems}
                        isLoading={isLoading}
                    />
                </div>
            </ContainerCarrot>
        </StyledPendaftaranFdPage>
    );
}

export default PendaftaranFdPage;