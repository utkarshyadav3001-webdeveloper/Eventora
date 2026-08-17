import React from "react";
import { Link } from "react-router-dom";
const PaymentFailed = () => <div className="max-w-xl mx-auto mt-16 bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center"><div className="text-5xl mb-4">!</div><h1 className="text-3xl font-black text-gray-900">Payment Failed</h1><p className="text-gray-500 mt-3">The payment could not be completed. Please try again.</p><Link to="/dashboard" className="inline-block mt-7 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">Back to Dashboard</Link></div>;
export default PaymentFailed;
