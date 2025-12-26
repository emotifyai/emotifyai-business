import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { Check, Zap, Star, Crown, CheckCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LifetimeSlotCounter } from '@/components/LifetimeSlotCounter'
import { PricingButton } from '@/components/pricing-button'
import { SUBSCRIPTION_TIERS, getSortedTiers, calculateAnnualSavings, getMonthlyEquivalent } from '@/lib/subscription/types'
import { getLifetimeSlotInfo } from '@/lib/subscription/lifetime-slots'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionTier } from '@/lib/subscription/types'

export const metadata: Metadata = {
    title: 'Pricing - EmotifyAI',
    description: 'Simple, transparent pricing for everyone',
}

interface PricingPageProps {
    searchParams: Promise<{ from?: string }>
}

function PricingCard({ 
    tier, 
    isPopular = false, 
    fromNewUser = false, 
    soldOut = false, 
    isAuthenticated = false,
    currentSubscription = null,
    userHasLifetime = false
}: {
    tier: SubscriptionTier
    isPopular?: boolean
    fromNewUser?: boolean
    soldOut?: boolean
    isAuthenticated?: boolean
    currentSubscription?: { tier: string; status: string } | null
    userHasLifetime?: boolean
}) {
    const config = SUBSCRIPTION_TIERS[tier]
    const isLifetime = tier === 'lifetime_launch'
    const isAnnual = tier.includes('annual')
    const isFree = tier === 'trial'

    // Check if user already has this plan or a better one
    const isCurrentPlan = currentSubscription?.tier === tier
    const isDowngrade = userHasLifetime && !isLifetime
    const shouldDisable = isCurrentPlan || isDowngrade

    const monthlyPrice = isAnnual ? getMonthlyEquivalent(tier) : config.price
    const annualSavings = isAnnual ? calculateAnnualSavings(tier) : 0

    const getIcon = () => {
        if (isLifetime) return <Crown className="h-5 w-5 text-yellow-500" />
        if (isPopular) return <Star className="h-5 w-5 text-blue-500" />
        if (isFree) return <Zap className="h-5 w-5 text-green-500" />
        return null
    }

    const getButtonText = () => {
        if (isCurrentPlan) return 'Current Plan'
        if (isDowngrade) return 'Not Available'
        if (isFree && fromNewUser) return 'Continue with Free Plan'
        if (isFree) return 'Start Free Trial'
        if (isLifetime) return 'Secure Lifetime Access'
        return 'Get Started'
    }

    const getButtonVariant = () => {
        if (isLifetime) return 'default'
        if (isPopular) return 'default'
        return 'outline'
    }

    return (
        <Card className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${isLifetime ? 'border-yellow-500 shadow-yellow-100' : ''} ${isCurrentPlan ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''} ${isDowngrade ? 'opacity-60' : ''}`}>
            {/* Badge */}
            {(config.badge || isPopular || isCurrentPlan) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant={isCurrentPlan ? 'default' : isLifetime ? 'destructive' : 'default'} className="px-3 py-1">
                        {isCurrentPlan ? 'Current Plan' : config.badge || 'Most Popular'}
                    </Badge>
                </div>
            )}

            {/* Current Plan Indicator */}
            {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
            )}

            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    {getIcon()}
                    <CardTitle className="text-xl">{config.name}</CardTitle>
                </div>

                <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">${config.price}</span>
                        {!isFree && !isLifetime && (
                            <span className="text-muted-foreground">
                                /{config.duration === 'year' ? 'year' : 'month'}
                            </span>
                        )}
                        {isLifetime && (
                            <span className="text-muted-foreground text-sm">one-time</span>
                        )}
                    </div>

                    {isAnnual && (
                        <div className="text-sm text-muted-foreground">
                            ${monthlyPrice}/month • Save ${annualSavings}/year
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="text-2xl font-semibold text-primary">
                        {config.generations.toLocaleString()} credits
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {config.duration === 'trial' ? 'for 10 days' :
                            config.duration === 'lifetime' ? 'per month, forever' :
                                `per ${config.duration}`}
                    </div>
                </div>

                <ul className="space-y-2 text-sm">
                    {config.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                <PricingButton
                    tier={tier}
                    fromNewUser={fromNewUser}
                    isFree={isFree}
                    isLifetime={isLifetime}
                    buttonText={getButtonText()}
                    variant={getButtonVariant()}
                    soldOut={soldOut}
                    isAuthenticated={isAuthenticated}
                    disabled={shouldDisable}
                    isCurrentPlan={isCurrentPlan}
                    isDowngrade={isDowngrade}
                />
            </CardFooter>
        </Card>
    )
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
    const params = await searchParams
    const fromNewUser = params.from === 'new_user'

    // Check authentication and get user subscription
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAuthenticated = !!user

    let currentSubscription = null
    let userHasLifetime = false

    if (user) {
        // Get user's active subscriptions
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (subscriptions && subscriptions.length > 0) {
            // Define subscription tier priority (higher number = higher priority)
            const tierPriority: Record<string, number> = {
                'free': 1,
                'trial': 2,
                'basic_monthly': 3,
                'basic_annual': 4,
                'pro_monthly': 5,
                'pro_annual': 6,
                'business_monthly': 7,
                'business_annual': 8,
                'lifetime_launch': 10, // Highest priority
            }

            // Select the best subscription (highest priority, then latest)
            // @ts-ignore - Safe to ignore as we know subscriptions array is not empty at this point
            const bestSubscription = subscriptions.reduce((best, current) => {
                // @ts-ignore - Safe to ignore as we know these objects have tier property from database
                const currentPriority = tierPriority[current.tier] || 0
                // @ts-ignore - Safe to ignore as we know these objects have tier property from database
                const bestPriority = tierPriority[best.tier] || 0
                
                if (currentPriority > bestPriority) {
                    return current
                } else if (currentPriority === bestPriority) {
                    // Same priority, choose the latest one
                    // @ts-ignore - Safe to ignore as we know these objects have created_at property from database
                    return new Date(current.created_at) > new Date(best.created_at) ? current : best
                }
                return best
            })

            currentSubscription = {
                // @ts-ignore - Safe to ignore as we know bestSubscription has tier property from database
                tier: bestSubscription.tier,
                // @ts-ignore - Safe to ignore as we know bestSubscription has status property from database
                status: bestSubscription.status
            }

            // @ts-ignore - Safe to ignore as we know bestSubscription has tier property from database
            userHasLifetime = bestSubscription.tier === 'lifetime_launch'
        }
    }

    // Check lifetime slot availability
    const lifetimeSlotInfo = await getLifetimeSlotInfo()
    const lifetimeSoldOut = !lifetimeSlotInfo.available

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section className="container py-24">
                    <div className="mx-auto max-w-4xl text-center mb-16">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
                            Choose Your Plan
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Flexible credit-based pricing that scales with your needs.
                            All plans include our powerful browser extension.
                        </p>

                        {fromNewUser && (
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                                <p className="text-blue-800 dark:text-blue-200 font-medium">
                                    Welcome! Start with our free plan or choose a paid plan for more credits.
                                </p>
                            </div>
                        )}

                        {userHasLifetime && (
                            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
                                <p className="text-green-800 dark:text-green-200 font-medium">
                                    🎉 You have lifetime access! You get 1000 credits every month, forever.
                                </p>
                            </div>
                        )}

                        {currentSubscription && !userHasLifetime && (
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                                <p className="text-blue-800 dark:text-blue-200 font-medium">
                                    Current Plan: {currentSubscription.tier.replace('_', ' ').toUpperCase()} • You can upgrade anytime
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Lifetime Offer Section */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                                    🚀 Limited Launch Offer
                                </h2>
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    Get lifetime access for a one-time payment. Only 500 spots available!
                                </p>
                            </div>

                            <Suspense fallback={
                                <div className="flex justify-center">
                                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 w-80 rounded-lg" />
                                </div>
                            }>
                                <LifetimeSlotCounter compact={false} />
                            </Suspense>
                        </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-3 max-w-7xl mx-auto">
                        {/* Free Plan */}
                        <PricingCard
                            tier="trial"
                            fromNewUser={fromNewUser}
                            isAuthenticated={isAuthenticated}
                            currentSubscription={currentSubscription}
                            userHasLifetime={userHasLifetime}
                        />

                        {/* Lifetime Launch Offer */}
                        <PricingCard
                            tier="lifetime_launch"
                            isPopular={!userHasLifetime}
                            fromNewUser={fromNewUser}
                            soldOut={lifetimeSoldOut}
                            isAuthenticated={isAuthenticated}
                            currentSubscription={currentSubscription}
                            userHasLifetime={userHasLifetime}
                        />

                        {/* Pro Monthly (Most Popular) */}
                        <PricingCard
                            tier="pro_monthly"
                            isPopular={false}
                            fromNewUser={fromNewUser}
                            isAuthenticated={isAuthenticated}
                            currentSubscription={currentSubscription}
                            userHasLifetime={userHasLifetime}
                        />
                    </div>

                    {/* Additional Plans */}
                    <div className="mt-16 max-w-7xl mx-auto">
                        <h3 className="text-2xl font-bold text-center mb-8">More Options</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <PricingCard 
                                tier="basic_monthly" 
                                fromNewUser={fromNewUser} 
                                isAuthenticated={isAuthenticated}
                                currentSubscription={currentSubscription}
                                userHasLifetime={userHasLifetime}
                            />
                            <PricingCard 
                                tier="business_monthly" 
                                fromNewUser={fromNewUser} 
                                isAuthenticated={isAuthenticated}
                                currentSubscription={currentSubscription}
                                userHasLifetime={userHasLifetime}
                            />
                            <PricingCard 
                                tier="pro_annual" 
                                fromNewUser={fromNewUser} 
                                isAuthenticated={isAuthenticated}
                                currentSubscription={currentSubscription}
                                userHasLifetime={userHasLifetime}
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 mt-6 max-w-2xl mx-auto">
                            <PricingCard 
                                tier="basic_annual" 
                                fromNewUser={fromNewUser} 
                                isAuthenticated={isAuthenticated}
                                currentSubscription={currentSubscription}
                                userHasLifetime={userHasLifetime}
                            />
                            <PricingCard 
                                tier="business_annual" 
                                fromNewUser={fromNewUser} 
                                isAuthenticated={isAuthenticated}
                                currentSubscription={currentSubscription}
                                userHasLifetime={userHasLifetime}
                            />
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-24 max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
                        <div className="space-y-6">
                            <div className="border rounded-lg p-6">
                                <h4 className="font-semibold mb-2">What are credits?</h4>
                                <p className="text-muted-foreground">
                                    Credits are used for AI text enhancements. Each enhancement typically uses 1 credit.
                                    Credits reset monthly for subscription plans.
                                </p>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h4 className="font-semibold mb-2">What happens when I run out of credits?</h4>
                                <p className="text-muted-foreground">
                                    You can upgrade your plan anytime or wait for your credits to reset next month.
                                    The lifetime plan gives you 500 credits every month forever.
                                </p>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h4 className="font-semibold mb-2">Can I change plans later?</h4>
                                <p className="text-muted-foreground">
                                    Yes! You can upgrade your plan anytime. If you have a lifetime plan, you already have the best deal and don't need to upgrade.
                                    Changes take effect immediately for upgrades.
                                </p>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h4 className="font-semibold mb-2">What if I already have a subscription?</h4>
                                <p className="text-muted-foreground">
                                    The pricing page will show your current plan and only allow upgrades that make sense.
                                    If you have lifetime access, you're all set - no need to purchase anything else!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
