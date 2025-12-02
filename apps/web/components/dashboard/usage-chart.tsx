'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface UsageChartProps {
    data: {
        date: string
        count: number
    }[]
}

export function UsageChart({ data }: UsageChartProps) {
    // We can use CSS variables for colors to match theme
    // But for Recharts we often need hex values. 
    // Since we are using CSS variables in globals.css, we might need to extract them or use hardcoded brand colors that match.
    // Let's use the brand colors directly.

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Enhancement Usage</CardTitle>
                <CardDescription>
                    Your daily text enhancement activity over the last 30 days
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return `${date.getMonth() + 1}/${date.getDate()}`
                                }}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    borderColor: 'var(--border)',
                                    borderRadius: 'var(--radius)',
                                }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--primary)" // Using CSS variable for primary color
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, style: { fill: 'var(--primary)', opacity: 0.8 } }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
