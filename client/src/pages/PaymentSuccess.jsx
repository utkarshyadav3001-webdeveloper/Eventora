import React from "react";
import { Link } from "react-router-dom";
const PaymentSuccess = () => <div className="max-w-xl mx-auto mt-16 bg-white rounded-2xl border border-green-100 shadow-sm p-10 text-center"><div className="text-5xl mb-4">✓</div><h1 className="text-3xl font-black text-gray-900">Payment Successful</h1><p className="text-gray-500 mt-3">Your payment was completed successfully.</p><Link to="/dashboard" className="inline-block mt-7 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">Go to Dashboard</Link></div>;
export default PaymentSuccess;
