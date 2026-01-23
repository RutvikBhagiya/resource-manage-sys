"use client"

import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Card } from "@/components/ui/card" // Assuming you have a basic Card or we can use div
import { User, Mail, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
    const { name, email, role, isLoading } = useAuth()

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto animate-fade-in">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your preferences and specific account settings.</p>
            </div>

            <div className="grid gap-6">
                {/* Appearance Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Palette className="size-5 text-violet-500" />
                        Appearance
                    </h2>
                    <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Theme Preference</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Choose between light and dark mode for the dashboard.
                            </p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                            <ThemeToggle />
                        </div>
                    </div>
                </section>

                {/* Profile Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <User className="size-5 text-cyan-500" />
                        Profile Information
                    </h2>
                    <div className="glass-card rounded-2xl p-6 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
                                    <User className="size-4 text-slate-400" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
                                    <Mail className="size-4 text-slate-400" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
                                    <Shield className="size-4 text-slate-400" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
