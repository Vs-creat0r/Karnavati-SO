import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Check, X, Search } from "lucide-react";
import { callApi } from "../api/client";
import { cn } from "../lib/utils";

const BUILDINGS = Array.from({ length: 14 }, (_, i) => String.fromCharCode(65 + i));
const FLATS = [101, 102, 103, 104, 105, 106];

// Helper to calculate total
const calculateTotal = (items) => items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

export default function NavratriManager() {
    const [expenses, setExpenses] = useState([]);
    const [collections, setCollections] = useState({}); // { "A-101": { status: "PAID", notes: "..." } }
    const [loading, setLoading] = useState(false);

    // Accordion State
    const [expandedBuilding, setExpandedBuilding] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [expData, colData] = await Promise.all([
            callApi("GET_NAVRA_EXPENSES"),
            callApi("GET_NAVRA_COLLECTIONS")
        ]);

        if (expData && Array.isArray(expData)) setExpenses(expData);

        if (colData && Array.isArray(colData)) {
            const map = {};
            colData.forEach(item => {
                if (item.home_id) map[item.home_id] = item;
            });
            setCollections(map);
        }
        setLoading(false);
    }

    const handleToggle = (building) => {
        setExpandedBuilding(expandedBuilding === building ? null : building);
    };

    const handleStatusToggle = async (homeId) => {
        const current = collections[homeId];
        const newStatus = current?.status === "PAID" ? "UNPAID" : "PAID";

        // Optimistic
        setCollections(prev => ({
            ...prev,
            [homeId]: { ...prev[homeId], status: newStatus }
        }));

        const response = await callApi("UPDATE_NAVRA_COLLECTION", {
            home_id: homeId,
            status: newStatus,
            notes: current?.notes || ""
        });

        if (!response) {
            // Revert
            setCollections(prev => ({
                ...prev,
                [homeId]: current
            }));
        }
    };

    const handleNotesBlur = async (homeId, notes) => {
        const current = collections[homeId];
        if (current?.notes === notes) return; // No change

        // Optimistic (already typed in input, but sync logic)
        setCollections(prev => ({
            ...prev,
            [homeId]: { ...prev[homeId], notes }
        }));

        await callApi("UPDATE_NAVRA_COLLECTION", {
            home_id: homeId,
            status: current?.status || "UNPAID",
            notes
        });
    };

    const totalExpense = useMemo(() => calculateTotal(expenses), [expenses]);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-slate-800">Navratri Event Manager</h1>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Left Column: Expenses */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Expenses</h2>
                        <span className="text-sm font-medium bg-red-100 text-red-700 px-3 py-1 rounded-full">
                            Total: ₹{totalExpense.toLocaleString()}
                        </span>
                    </div>

                    <div className="p-0 overflow-y-auto flex-1">
                        {expenses.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                No expenses recorded yet.
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Item Name</th>
                                        <th className="px-6 py-3 font-semibold text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-700">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-900 font-medium text-right">
                                                {Number(item.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column: Collections */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Donations & Collections</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {BUILDINGS.map(building => {
                            const isExpanded = expandedBuilding === building;
                            // stats
                            const totalFlats = FLATS.length;
                            const paidFlats = FLATS.filter(f => collections[`${building}-${f}`]?.status === "PAID").length;

                            return (
                                <div key={building} className="border border-slate-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => handleToggle(building)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors",
                                            isExpanded && "bg-slate-100 border-b border-slate-200"
                                        )}
                                    >
                                        <span className="font-bold text-slate-700">Block {building}</span>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs font-medium bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                                                {paidFlats}/{totalFlats} Paid
                                            </span>
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="bg-white divide-y divide-slate-100">
                                            {FLATS.map(flat => {
                                                const homeId = `${building}-${flat}`;
                                                const data = collections[homeId] || {};
                                                const isPaid = data.status === "PAID";

                                                return (
                                                    <div key={flat} className="p-3 flex items-center gap-4">
                                                        <div className="w-16 font-medium text-slate-700">
                                                            {flat}
                                                        </div>

                                                        <button
                                                            onClick={() => handleStatusToggle(homeId)}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                                                isPaid
                                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                                            )}
                                                        >
                                                            {isPaid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                            {isPaid ? "PAID" : "UNPAID"}
                                                        </button>

                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Add notes..."
                                                                defaultValue={data.notes || ""}
                                                                onBlur={(e) => handleNotesBlur(homeId, e.target.value)}
                                                                className="w-full text-sm border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-0 px-0 py-1 bg-transparent transition-colors placeholder:text-slate-300 text-slate-600"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
