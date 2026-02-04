import { useState } from 'react';
import { Box, Flex, Text, Button, useToast, useColorMode } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createTicketingInternal } from '@/features/eso/esoApiService';
import { StyledCreateTicketingInternal } from './CreateTicketingInternal.styled';
import ContainerCarrot from '@/components/Container';
import { FiSave, FiX } from 'react-icons/fi';

function CreateTicketingInternalPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        label: '',
        responsible: '',
        accountable: '',
        consulted: '',
        informed: ''
    });

    const createMutation = useMutation({
        mutationFn: createTicketingInternal,
        onSuccess: () => {
            toast({
                title: 'Berhasil!',
                description: 'Ticketing internal berhasil dibuat',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // Reset form
            setFormData({
                title: '',
                description: '',
                deadline: '',
                label: '',
                responsible: '',
                accountable: '',
                consulted: '',
                informed: ''
            });
        },
        onError: (error) => {
            toast({
                title: 'Gagal membuat ticket',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <ContainerCarrot>
            <StyledCreateTicketingInternal data-theme={colorMode}>
                <Flex justify="space-between" align="center" mb={6}>
                    <Text fontSize="2xl" fontWeight="bold">
                        Create Ticketing Internal
                    </Text>
                </Flex>

                <Box className="main-content-section">
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <div className="form-group full-width">
                                <label>
                                    Title <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Request Foto Tes"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>
                                    Description <span className="required">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Jelaskan detail task..."
                                    rows={4}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Deadline <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Label <span className="required">*</span>
                                    </label>
                                    <select
                                        name="label"
                                        value={formData.label}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Pilih label</option>
                                        <option value="Administration">Administration</option>
                                        <option value="Review">Review</option>
                                        <option value="Research">Research</option>
                                        <option value="Procedure">Procedure</option>
                                        <option value="Recruitment">Recruitment</option>
                                        <option value="Schedule">Schedule</option>
                                        <option value="Query">Query</option>
                                        <option value="Complaint">Complaint</option>
                                        <option value="Request">Request</option>
                                        <option value="Billing">Billing</option>
                                        <option value="Feedback">Feedback</option>
                                        <option value="Offboarding">Offboarding</option>
                                        <option value="Payment">Payment</option>
                                        <option value="Artist Journal">Artist Journal</option>
                                        <option value="Presensi Online">Presensi Online</option>
                                        <option value="Lost and Found">Lost and Found</option>
                                        <option value="Siswa Tidak Proaktif">Siswa Tidak Proaktif</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Responsible <span className="required">*</span>
                                    </label>
                                    <select
                                        name="responsible"
                                        value={formData.responsible}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Pilih responsible</option>
                                        <option value="Marcom">Marcom</option>
                                        <option value="ESO">ESO</option>
                                        <option value="Finance - EDS">Finance - EDS</option>
                                        <option value="Finance - AR">Finance - AR</option>
                                        <option value="CSO - CM">CSO - CM</option>
                                        <option value="CSO - YS">CSO - YS</option>
                                        <option value="JSD">JSD</option>
                                        <option value="PAS">PAS</option>
                                        <option value="LC">LC</option>
                                        <option value="NV">NV</option>
                                        <option value="MAF">MAF</option>
                                        <option value="DN">DN</option>
                                        <option value="AS">AS</option>
                                        <option value="APH">APH</option>
                                        <option value="BA">BA</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Accountable (optional)</label>
                                    <select
                                        name="accountable"
                                        value={formData.accountable}
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih accountable</option>
                                        <option value="Marcom">Marcom</option>
                                        <option value="ESO">ESO</option>
                                        <option value="Finance - EDS">Finance - EDS</option>
                                        <option value="Finance - AR">Finance - AR</option>
                                        <option value="CSO - CM">CSO - CM</option>
                                        <option value="CSO - YS">CSO - YS</option>
                                        <option value="JSD">JSD</option>
                                        <option value="PAS">PAS</option>
                                        <option value="LC">LC</option>
                                        <option value="NV">NV</option>
                                        <option value="MAF">MAF</option>
                                        <option value="DN">DN</option>
                                        <option value="AS">AS</option>
                                        <option value="APH">APH</option>
                                        <option value="BA">BA</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Consulted (optional)</label>
                                    <select
                                        name="consulted"
                                        value={formData.consulted}
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih consulted</option>
                                        <option value="Marcom">Marcom</option>
                                        <option value="ESO">ESO</option>
                                        <option value="Finance - EDS">Finance - EDS</option>
                                        <option value="Finance - AR">Finance - AR</option>
                                        <option value="CSO - CM">CSO - CM</option>
                                        <option value="CSO - YS">CSO - YS</option>
                                        <option value="JSD">JSD</option>
                                        <option value="PAS">PAS</option>
                                        <option value="LC">LC</option>
                                        <option value="NV">NV</option>
                                        <option value="MAF">MAF</option>
                                        <option value="DN">DN</option>
                                        <option value="AS">AS</option>
                                        <option value="APH">APH</option>
                                        <option value="BA">BA</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Informed (optional)</label>
                                    <select
                                        name="informed"
                                        value={formData.informed}
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih informed</option>
                                        <option value="Marcom">Marcom</option>
                                        <option value="ESO">ESO</option>
                                        <option value="Finance - EDS">Finance - EDS</option>
                                        <option value="Finance - AR">Finance - AR</option>
                                        <option value="CSO - CM">CSO - CM</option>
                                        <option value="CSO - YS">CSO - YS</option>
                                        <option value="JSD">JSD</option>
                                        <option value="PAS">PAS</option>
                                        <option value="LC">LC</option>
                                        <option value="NV">NV</option>
                                        <option value="MAF">MAF</option>
                                        <option value="DN">DN</option>
                                        <option value="AS">AS</option>
                                        <option value="APH">APH</option>
                                        <option value="BA">BA</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <Button 
                                    leftIcon={<FiX />}
                                    variant="outline"
                                    colorScheme="gray"
                                    onClick={handleCancel}
                                    size="lg"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    leftIcon={<FiSave />}
                                    type="submit" 
                                    colorScheme="orange"
                                    isLoading={createMutation.isPending}
                                    loadingText="Creating..."
                                    size="lg"
                                >
                                    Create Ticket
                                </Button>
                            </div>
                        </div>
                    </form>
                </Box>
            </StyledCreateTicketingInternal>
        </ContainerCarrot>
    );
}

export default CreateTicketingInternalPage;
