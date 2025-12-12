import { useState } from "react";
import { User, Mail, Phone, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { callApi } from "../api/client";
import { cn } from "../lib/utils";

export default function Reports() {
    const [status, setStatus] = useState("IDLE"); // IDLE, LOADING, SUCCESS, ERROR

    const handleGenerateReport = async () => {
        setStatus("LOADING");
        // Simulate delay for better UX if API is too fast, or just real wait
        const response = await callApi("GENERATE_MONTHLY_REPORT", {
            timestamp: new Date().toISOString()
        });

        if (response && response.success !== false) {
            setStatus("SUCCESS");
            // Reset after 3 seconds
            setTimeout(() => setStatus("IDLE"), 3000);
        } else {
            setStatus("ERROR");
            setTimeout(() => setStatus("IDLE"), 3000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Reports & Settings</h1>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 h-24 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="h-20 w-20 bg-white rounded-full p-1 shadow-md">
                            <div className="h-full w-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                <User className="h-10 w-10" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-12 pb-6 px-8">
                    <h2 className="text-xl font-bold text-slate-800">Admin Contact</h2>
                    <p className="text-slate-500 text-sm">Society Chairman / Secretary</p>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center space-x-3 text-slate-600">
                            <Mail className="h-5 w-5 text-slate-400" />
                            <span>admin@karnavati-society.com</span>
                        </div>
                        <div className="flex items-center space-x-3 text-slate-600">
                            <Phone className="h-5 w-5 text-slate-400" />
                            <span>+91 98765 43210</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Monthly Summary Report</h3>
                    </div>
                    <p className="text-slate-500 max-w-md">
                        Generate and email the comprehensive monthly report including water bills, garbage logs, and event finances to the registered admin email.
                    </p>
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={status === "LOADING" || status === "SUCCESS"}
                    className={cn(
                        "w-full md:w-auto px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 min-w-[180px]",
                        status === "IDLE" && "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-900/20",
                        status === "LOADING" && "bg-slate-100 text-slate-400 cursor-not-allowed",
                        status === "SUCCESS" && "bg-green-500 text-white shadow-green-500/30 cursor-default",
                        status === "ERROR" && "bg-red-500 text-white shadow-red-500/30"
                    )}
                >
                    {status === "IDLE" && (
                        <>
                            <span>Generate Report</span>
                        </>
                    )}
                    {status === "LOADING" && (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                        </>
                    )}
                    {status === "SUCCESS" && (
                        <>
                            <CheckCircle className="h-5 w-5" />
                            <span>Sent!</span>
                        </>
                    )}
                    {status === "ERROR" && (
                        <>
                            <AlertCircle className="h-5 w-5" />
                            <span>Failed</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
