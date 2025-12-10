import { render, screen } from '@testing-library/react'
import { NavbarUserMenu } from '../navbar-user-menu'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

// Mock the hooks
jest.mock('@/lib/hooks/use-auth')
jest.mock('@/lib/hooks/use-subscription')
jest.mock('next/navigation')

const mockUser = {
    id: '1',
    email: 'test@example.com',
    display_name: 'Test User',
    avatar_url: null
}

const mockSubscription = {
    tier_name: 'Pro Monthly'
}

// Mock useLogout hook
const mockLogout = {
    mutateAsync: jest.fn()
}

describe('NavbarUserMenu', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        })
        
        // Mock useRouter
        ;(useRouter as jest.Mock).mockReturnValue({
            push: jest.fn()
        })

        // Mock useLogout
        const mockUseAuth = require('@/lib/hooks/use-auth')
        mockUseAuth.useLogout = jest.fn().mockReturnValue(mockLogout)
    })

    it('renders user avatar button', () => {
        // Mock the subscription hook to return data
        const mockUseSubscription = require('@/lib/hooks/use-subscription').useSubscription
        mockUseSubscription.mockReturnValue({
            data: mockSubscription,
            isLoading: false
        })

        render(
            <QueryClientProvider client={queryClient}>
                <NavbarUserMenu user={mockUser} />
            </QueryClientProvider>
        )

        // Check if the dropdown trigger button is rendered
        const triggerButton = screen.getByRole('button')
        expect(triggerButton).toBeInTheDocument()
        
        // Check if User icon is displayed (since no avatar_url)
        const userIcon = document.querySelector('.lucide-user')
        expect(userIcon).toBeInTheDocument()
    })

    it('renders with subscription data', () => {
        // Mock the subscription hook to return data
        const mockUseSubscription = require('@/lib/hooks/use-subscription').useSubscription
        mockUseSubscription.mockReturnValue({
            data: mockSubscription,
            isLoading: false
        })

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <NavbarUserMenu user={mockUser} />
            </QueryClientProvider>
        )

        // Component should render without errors
        expect(container.firstChild).toBeInTheDocument()
    })

    it('renders with loading subscription state', () => {
        // Mock the subscription hook to return loading state
        const mockUseSubscription = require('@/lib/hooks/use-subscription').useSubscription
        mockUseSubscription.mockReturnValue({
            data: null,
            isLoading: true
        })

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <NavbarUserMenu user={mockUser} />
            </QueryClientProvider>
        )

        // Component should render without errors
        expect(container.firstChild).toBeInTheDocument()
    })
})