import { createStandaloneToast } from '@chakra-ui/react'

const { ToastContainer, toast } = createStandaloneToast({
  defaultOptions: {
    position: 'bottom-right',
    duration: 5000,
    isClosable: true,
  },
})

export const toaster = {
  create: ({ title, description, type = 'info', duration = 5000 }) => {
    toast({
      title,
      description,
      status: type === 'loading' ? 'info' : type,
      duration,
      isClosable: true,
    })
  },
  success: (title, description) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  },
  error: (title, description) => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  },
  warning: (title, description) => {
    toast({
      title,
      description,
      status: 'warning',
      duration: 5000,
      isClosable: true,
    })
  },
  info: (title, description) => {
    toast({
      title,
      description,
      status: 'info',
      duration: 5000,
      isClosable: true,
    })
  },
}

export const Toaster = ToastContainer
