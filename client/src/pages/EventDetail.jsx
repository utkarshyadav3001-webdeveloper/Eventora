import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt, FaChair, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";

const EventDetail = () => {
  const { id } = useParams(); const navigate = useNavigate(); const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null); const [tickets, setTickets] = useState(1); const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false); const [loading, setLoading] = useState(true); const [bookingLoading, setBookingLoading] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");

  useEffect(() => { (async () => { try { const { data } = await api.get(`/events/${id}`); setEvent(data.data); } catch { setError("Event not found."); } finally { setLoading(false); } })(); }, [id]);

  const handleBooking = async () => {
    if (!user) return navigate("/login");
    setBookingLoading(true); setError(""); setMessage("");
    try {
      if (!showOTP) { await api.post("/bookings/send-otp"); setShowOTP(true); setMessage("OTP sent to your email. It expires in 5 minutes."); }
      else {
        const { data } = await api.post("/bookings/verify", { eventId: event._id, otp, numberOfTickets: tickets });
        setEvent((current) => ({ ...current, availableSeats: data.availableSeats })); setShowOTP(false); setOtp(""); setMessage("Booking created successfully.");
        if (data.data?._id) navigate(`/booking/${data.data._id}`);
      }
    } catch (err) { setError(err.response?.data?.message || "Booking failed."); }
    finally { setBookingLoading(false); }
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Loading event...</div>;
  if (!event) return <div className="py-20 text-center text-red-500">{error || "Event not found"}</div>;
  const soldOut = event.availableSeats < 1;
  const total = Number(event.price || 0) * tickets;

  return <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="h-64 sm:h-80 bg-gray-900">{event.image ? <img src={event.image} alt={event.title} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-white text-6xl font-black">{event.category?.charAt(0) || "E"}</div>}</div>
    <div className="p-6 sm:p-10 grid lg:grid-cols-[1fr_360px] gap-10">
      <div><span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-gray-600">{event.category}</span><h1 className="text-4xl font-black text-gray-900 mt-4">{event.title}</h1><p className="text-gray-600 text-lg leading-8 mt-5">{event.description}</p><div className="mt-8 grid sm:grid-cols-2 gap-4 text-gray-700"><div className="flex gap-3 items-center"><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()} · {event.time}</div><div className="flex gap-3 items-center"><FaMapMarkerAlt /> {event.location}</div><div className="flex gap-3 items-center"><FaChair /> {event.availableSeats} seats left</div><div className="flex gap-3 items-center"><FaMoneyBillWave /> {event.price === 0 ? "Free" : `₹${event.price} per ticket`}</div></div></div>
      <aside className="bg-gray-50 rounded-2xl border border-gray-100 p-6 h-fit"><h2 className="text-xl font-bold">Book your spot</h2><label className="block text-sm font-semibold text-gray-700 mt-6 mb-2">Tickets</label><input type="number" min="1" max={Math.max(1, event.availableSeats)} value={tickets} disabled={showOTP} onChange={(e) => setTickets(Math.min(Math.max(1, Number(e.target.value)), event.availableSeats))} className="w-full px-4 py-3 rounded-xl border border-gray-300" />
      <div className="flex justify-between mt-5 text-gray-600"><span>Total</span><strong className="text-gray-900">₹{total}</strong></div>
      {showOTP && <div className="mt-5"><label className="block text-sm font-semibold text-gray-700 mb-2">Booking OTP</label><input inputMode="numeric" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-center tracking-widest font-bold" /></div>}
      <button disabled={soldOut || bookingLoading || (showOTP && otp.length !== 6)} onClick={handleBooking} className="w-full mt-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black disabled:bg-gray-300 disabled:text-gray-500">{bookingLoading ? "Processing..." : showOTP ? "Verify OTP & Book" : soldOut ? "Sold Out" : "Request Booking OTP"}</button>
      {message && <p className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{message}</p>}{error && <p className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}</aside>
    </div>
  </div>;
};
export default EventDetail;
