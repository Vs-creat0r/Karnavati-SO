import { useState, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    getDay,
    startOfWeek,
    endOfWeek,
    addMonths,
    subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight, X, Save } from "lucide-react";
import { callApi } from "../api/client";
import { cn } from "../lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function GarbageTracker() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logs, setLogs] = useState({}); // { "2023-10-01": { status: "PRESENT", notes: "" } }
    const [selectedDate, setSelectedDate] = useState(null); // Date obj
    const [modalOpen, setModalOpen] = useState(false);

    // Modal State
    const [editStatus, setEditStatus] = useState("PRESENT");
    const [editNotes, setEditNotes] = useState("");

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const monthYearStr = format(currentDate, "MM-yyyy");

    useEffect(() => {
        fetchLogs();
    }, [monthYearStr]);

    async function fetchLogs() {
        const data = await callApi("GET_GARBAGE_LOGS", { month_year: monthYearStr });
        if (data && Array.isArray(data)) {
            const map = {};
            data.forEach(item => {
                map[item.date] = item;
            });
            setLogs(map);
        } else {
            setLogs({});
        }
    }

    const handleDayClick = (day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const log = logs[dateStr];

        setSelectedDate(day);
        setEditStatus(log?.status || "PRESENT"); // Default to present
        setEditNotes(log?.notes || "");
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        // Optimistic Update
        const newEntry = { date: dateStr, status: editStatus, notes: editNotes };
        setLogs(prev => ({ ...prev, [dateStr]: newEntry }));
        setModalOpen(false);

        const response = await callApi("UPDATE_GARBAGE_LOG", newEntry);

        if (!response) {
            alert("Failed to save log. Reverting UI.");
            fetchLogs(); // Revert by re-fetching
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">Garbage Collection</h1>
                <div className="flex items-center space-x-4 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <span className="font-semibold text-slate-700 w-32 text-center select-none">
                        {format(currentDate, "MMMM yyyy")}
                    </span>
                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all"
                    >
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {calendarDays.map((day, idx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const log = logs[dateStr];
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "min-h-[100px] p-2 border-b border-r border-slate-100 relative cursor-pointer transition-colors group",
                                    !isCurrentMonth && "bg-slate-50/50 text-slate-400",
                                    isCurrentMonth && "bg-white hover:bg-blue-50/30"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                        isTodayDate ? "bg-blue-600 text-white" : "text-slate-700 group-hover:bg-white/80"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {log && (
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                            log.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {log.status === "PRESENT" ? "P" : "A"}
                                        </span>
                                    )}
                                </div>

                                {log && (
                                    <div className={cn(
                                        "mt-2 p-1.5 rounded text-xs border-l-2",
                                        log.status === "PRESENT"
                                            ? "bg-green-50 border-green-400 text-green-800"
                                            : "bg-red-50 border-red-400 text-red-800"
                                    )}>
                                        <div className="font-semibold text-[10px] leading-tight">
                                            {log.status}
                                        </div>
                                        {log.notes && (
                                            <p className="mt-1 truncate opacity-80 text-[10px]">{log.notes}</p>
                                        )}
                                    </div>
                                )}

                                {/* Hover Add Prompt if Empty */}
                                {!log && isCurrentMonth && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                        <span className="bg-slate-900/10 text-slate-500 text-xs px-2 py-1 rounded">Add Log</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">
                                Log for {format(selectedDate, "MMMM d, yyyy")}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Status</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={cn(
                                        "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all",
                                        editStatus === "PRESENT" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                                    )}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="PRESENT"
                                            checked={editStatus === "PRESENT"}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="w-4 h-4 rounded-full border border-green-600 bg-green-600" />
                                        <span className="font-bold text-green-700">Present</span>
                                    </label>

                                    <label className={cn(
                                        "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all",
                                        editStatus === "ABSENT" ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300"
                                    )}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="ABSENT"
                                            checked={editStatus === "ABSENT"}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="w-4 h-4 rounded-full border border-red-600 bg-red-600" />
                                        <span className="font-bold text-red-700">Absent</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Any issues or comments..."
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
