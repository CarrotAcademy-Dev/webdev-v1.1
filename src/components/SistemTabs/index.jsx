import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Box, useBreakpointValue, Button, Menu, MenuButton, MenuList, MenuItem, useColorModeValue } from '@chakra-ui/react';
import DataTableComponent from '../Table';
import { FiChevronDown } from 'react-icons/fi';

function SistemTabs({ tabItems, tableData, headerItems, onAction, onCellChange, isLoading, getHeaderItemsForTab }) {
    const boxBg = useColorModeValue('white', 'dark.bg.card');
    const tabColor = useColorModeValue('gray.500', 'gray.400');
    const tabSelectedBg = useColorModeValue('gray.800', 'orange.500');
    const tabHoverBg = useColorModeValue('gray.100', 'dark.bg.hover');
    
    const [tabIndex, setTabIndex] = useState(0);

    const isDesktop = useBreakpointValue({ base: false, md: true });
    const handleTabChange = (index) => {
        setTabIndex(index);
    };

    // Helper untuk mendapatkan header items yang tepat untuk tab
    const getHeaderForTab = (tabKey) => {
        if (getHeaderItemsForTab) {
            return getHeaderItemsForTab(tabKey);
        }
        return headerItems;
    };

    return (
        <Box 
            bg={boxBg}
            borderRadius="24px"
            p={6}
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
        >
            <Tabs 
                variant="unstyled"
                index={tabIndex} 
                onChange={(index) => setTabIndex(index)}
            >
                {isDesktop ? (
                    <TabList justifyContent="center">
                        {tabItems.map((tabName) => (
                            <Tab 
                                key={tabName.key}
                                mr={4}
                                px={5}
                                py={2}
                                fontWeight="semibold"
                                color={tabColor}
                                borderRadius="full"
                                _selected={{ 
                                    color: 'white', 
                                    bg: tabSelectedBg, 
                                    boxShadow: 'md' 
                                }}
                                _hover={{
                                    bg: tabHoverBg
                                }}
                            >
                                {tabName.label}
                            </Tab>
                        ))}
                    </TabList>
                ) : (
                    <Menu>
                        <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                            {tabItems[tabIndex].label}
                        </MenuButton>
                        <MenuList>
                            {tabItems.map((tabName, index) => (
                                <MenuItem 
                                    key={tabName.key} 
                                    onClick={() => handleTabChange(index)}
                                >
                                    {tabName.label}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                )}
                <TabPanels mt={6}>
                    {tabItems.map(tabName => (
                        <TabPanel key={`${tabName.key}-panel`} p={0}>
                            <DataTableComponent 
                                tableData={tableData[tabName.key] || []} 
                                headerItems={getHeaderForTab(tabName.key)} 
                                onAction={onAction} 
                                onCellChange={onCellChange}
                                isLoading={isLoading}
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default SistemTabs;