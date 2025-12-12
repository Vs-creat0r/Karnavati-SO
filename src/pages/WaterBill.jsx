import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowLeft, Check, X } from "lucide-react";
import { callApi } from "../api/client";
import { cn } from "../lib/utils";

const BUILDINGS = Array.from({ length: 14 }, (_, i) => String.fromCharCode(65 + i)); // A-N
const FLATS = [101, 102, 103, 104, 105, 106];

export default function WaterBill() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [payments, setPayments] = useState({}); // { "A-101": true/false }
    const [loading, setLoading] = useState(false);

    const monthYear = format(currentDate, "MM-yyyy");
    const displayDate = format(currentDate, "MMMM yyyy");

    // Fetch data on mount or date change
    useEffect(() => {
        fetchData();
    }, [monthYear]);

    async function fetchData() {
        setLoading(true);
        const data = await callApi("GET_WATER_BILLS", { month_year: monthYear });
        if (data && Array.isArray(data)) {
            // Transform generic list to map { "A-101": true }
            const map = {};
            data.forEach((item) => {
                // Assuming item has home_id "A-101" and status "PAID"
                if (item.home_id && item.status === "PAID") {
                    map[item.home_id] = true;
                }
            });
            setPayments(map);
        } else if (data === null) {
            // Handle empty response implies no payments yet
            setPayments({});
        }
        setLoading(false);
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
        setSelectedBuilding(null); // Return to master view
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
        setSelectedBuilding(null);
    };

    const togglePayment = async (building, flat) => {
        const homeId = `${building}-${flat}`;
        const previousStatus = payments[homeId] || false;
        const newStatus = !previousStatus;

        // Optimistic Update
        setPayments((prev) => ({
            ...prev,
            [homeId]: newStatus,
        }));

        // API Call
        const response = await callApi("UPDATE_WATER_BILL", {
            home_id: homeId,
            month_year: monthYear,
            status: newStatus ? "PAID" : "UNPAID",
        });

        // Revert if failed
        if (!response) {
            setPayments((prev) => ({
                ...prev,
                [homeId]: previousStatus,
            }));
            alert("Failed to update payment status. Please try again.");
        }
    };

    // Calculate stats per building
    const buildingStats = useMemo(() => {
        const stats = {};
        BUILDINGS.forEach((b) => {
            let paidCount = 0;
            FLATS.forEach((f) => {
                if (payments[`${b}-${f}`]) paidCount++;
            });
            stats[b] = {
                paid: paidCount,
                total: FLATS.length,
                percentage: (paidCount / FLATS.length) * 100,
            };
        });
        return stats;
    }, [payments]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header & Date Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedBuilding && (
                        <button
                            onClick={() => setSelectedBuilding(null)}
                            className="p-1 hover:bg-slate-100 rounded-full mr-2"
                        >
                            <ArrowLeft className="h-6 w-6 text-slate-500" />
                        </button>
                    )}
                    {selectedBuilding ? `Building ${selectedBuilding} Details` : "Water Bill Tracker"}
                </h1>

                <div className="flex items-center space-x-4 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <span className="font-semibold text-slate-700 w-32 text-center select-none">
                        {displayDate}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {loading && Object.keys(payments).length === 0 && !selectedBuilding ? (
                // Simple loading skeleton
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
            ) : selectedBuilding ? (
                // Detail View
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {FLATS.map((flat) => {
                        const isPaid = payments[`${selectedBuilding}-${flat}`];
                        return (
                            <button
                                key={flat}
                                onClick={() => togglePayment(selectedBuilding, flat)}
                                className={cn(
                                    "relative p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3",
                                    isPaid
                                        ? "bg-green-50 border-green-500 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                                )}
                            >
                                <span className="text-lg font-bold text-slate-700">Flat {flat}</span>
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                    isPaid ? "bg-green-500 text-white" : "bg-red-100 text-red-500"
                                )}>
                                    {isPaid ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                                </div>
                                <span className={cn("text-sm font-medium", isPaid ? "text-green-700" : "text-slate-400")}>
                                    {isPaid ? "Paid" : "Not Paid"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                // Master View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {BUILDINGS.map((building) => {
                        const stats = buildingStats[building];
                        return (
                            <button
                                key={building}
                                onClick={() => setSelectedBuilding(building)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-left group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xl font-bold text-slate-800">Block {building}</span>
                                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                        {stats.paid}/{stats.total}
                                    </span>
                                </div>

                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-2.5 rounded-full transition-all duration-500",
                                            stats.percentage === 100 ? "bg-green-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${stats.percentage}%` }}
                                    ></div>
                                </div>

                                <p className="text-xs text-slate-400 mt-2 group-hover:text-blue-500 transition-colors">
                                    View Details &rarr;
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
