import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaTimesCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";

const UserDashboard = () => {
  const { user } = useContext(AuthContext); const navigate = useNavigate();
  const [bookings, setBookings] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const fetchBookings = async () => { try { const { data } = await api.get("/bookings/my"); setBookings(data.data || []); } catch (err) { setError(err.response?.data?.message || "Unable to load bookings."); } finally { setLoading(false); } };
  useEffect(() => { if (!user) navigate("/login"); else fetchBookings(); }, [user, navigate]);
  const cancelBooking = async (id) => { if (!window.confirm("Are you sure you want to cancel this booking?")) return; try { await api.delete(`/bookings/${id}`); fetchBookings(); } catch (err) { alert(err.response?.data?.message || "Error cancelling booking"); } };
  if (loading) return <div className="py-20 text-center text-gray-500">Loading dashboard...</div>;
  return <div className="max-w-6xl mx-auto space-y-8"><section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex items-center gap-5"><div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-black">{user?.name?.charAt(0)?.toUpperCase()}</div><div><p className="text-sm uppercase tracking-widest text-gray-500">User Dashboard</p><h1 className="text-2xl sm:text-3xl font-black text-gray-900">Welcome, {user?.name}</h1></div></section>
  <div className="flex justify-between items-center"><h2 className="text-2xl font-bold flex items-center gap-3"><FaTicketAlt /> My Bookings</h2><Link to="/" className="text-sm font-semibold underline">Browse Events</Link></div>
  {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>}
  {bookings.length === 0 ? <div className="bg-white border border-dashed rounded-2xl p-16 text-center text-gray-500">You haven't booked any events yet.</div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{bookings.map((booking) => <article key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><div className="flex justify-between gap-3"><h3 className="font-bold text-lg">{booking.eventId?.title || "Event unavailable"}</h3><span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded h-fit">{booking.status}</span></div>{booking.eventId && <><p className="text-sm text-gray-500 mt-4">{new Date(booking.eventId.date).toLocaleDateString()} · {booking.eventId.location}</p><p className="text-sm text-gray-500 mt-2">Tickets: {booking.numberOfTickets} · Amount: ₹{booking.amount}</p><p className="text-sm text-gray-500 mt-2">Payment: {booking.paymentStatus}</p></>}<div className="mt-6 flex justify-between items-center">{booking.status !== "cancelled" ? <><Link to={`/booking/${booking._id}`} className="font-semibold hover:underline">View Booking</Link><button onClick={() => cancelBooking(booking._id)} className="text-red-600 font-semibold flex items-center gap-1"><FaTimesCircle /> Cancel</button></> : <span className="text-gray-500 text-sm">Booking cancelled</span>}</div></article>)}</div>}
  </div>;
};
export default UserDashboard;
