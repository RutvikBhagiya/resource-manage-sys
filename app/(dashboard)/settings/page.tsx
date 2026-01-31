"use client"

import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { PasswordForm } from "@/components/settings/PasswordForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
    const { isLoading } = useAuth()

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto animate-fade-in">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your preferences, account details and security.</p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password Change</CardTitle>
                            <CardDescription>Ensure your account is secure by using a strong password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PasswordForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4 py-4">
                    <Card className="flex items-center justify-between p-6">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Theme Preference</CardTitle>
                            <CardDescription>
                                Choose between light and dark mode for the dashboard.
                            </CardDescription>
                        </div>
                        <ThemeToggle />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
