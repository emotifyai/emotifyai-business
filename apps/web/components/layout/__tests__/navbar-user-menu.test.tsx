import { render, screen } from '@testing-library/react'
import { NavbarUserMenu } from '../navbar-user-menu'
import { QueryClient, QueryProvider } from '@tanstack/react-query'
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
    })

    it('renders user information correctly', () => {
        // Mock the subscription hook to return data
        const mockUseSubscription = require('@/lib/hooks/use-subscription').useSubscription
        mockUseSubscription.mockReturnValue({
            data: mockSubscription,
            isLoading: false
        })

        render(
            <QueryProvider client={queryClient}>
                <NavbarUserMenu user={mockUser} />
            </QueryProvider>
        )

        // Check if user email is displayed
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        
        // Check if display name is shown
        expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('shows loading state for subscription', () => {
        // Mock the subscription hook to return loading state
        const mockUseSubscription = require('@/lib/hooks/use-subscription').useSubscription
        mockUseSubscription.mockReturnValue({
            data: null,
            isLoading: true
        })

        render(
            <QueryProvider client={queryClient}>
                <NavbarUserMenu user={mockUser} />
            </QueryProvider>
        )

        // Should show loading skeleton
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })
})