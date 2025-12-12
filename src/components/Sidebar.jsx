import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Droplets,
    Trash2,
    PartyPopper,
    FileText,
    Menu,
    X,
    LayoutDashboard
} from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
    { label: "Water Bill", path: "/water-bill", icon: Droplets },
    { label: "Garbage Tracker", path: "/garbage-tracker", icon: Trash2 },
    { label: "Navratri Manager", path: "/navratri-manager", icon: PartyPopper },
    { label: "Reports & Settings", path: "/reports", icon: FileText },
];

export function Sidebar({ isOpen, onClose }) {
    return (
        <>
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                        <LayoutDashboard className="h-6 w-6 text-blue-400" />
                        <h1 className="text-xl font-bold">Society Mgr</h1>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose()} // Close sidebar on mobile when clicked
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                        : "hover:bg-slate-800 text-slate-400 hover:text-white"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
        </>
    );
}
