import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axios";

const BookingDetails = () => {
  const { id } = useParams(); const navigate = useNavigate(); const [booking, setBooking] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const fetchBooking = async () => { try { const { data } = await api.get(`/bookings/${id}`); setBooking(data.data); } catch (err) { setError(err.response?.data?.message || "Booking not found"); } finally { setLoading(false); } };
  useEffect(() => { fetchBooking(); }, [id]);
  const cancelBooking = async () => { if (!window.confirm("Cancel this booking?")) return; try { await api.delete(`/bookings/${id}`); await fetchBooking(); } catch (err) { alert(err.response?.data?.message || "Unable to cancel booking"); } };
  if (loading) return <div className="py-20 text-center text-gray-500">Loading booking...</div>;
  if (!booking) return <div className="py-20 text-center text-red-500">{error || "Booking not found"}<div><button onClick={() => navigate("/dashboard")} className="mt-4 underline">Back to dashboard</button></div></div>;
  const event = booking.eventId;
  return <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10"><div className="flex justify-between gap-4 items-start"><div><p className="text-xs uppercase tracking-widest text-gray-500">Booking Details</p><h1 className="text-3xl font-black mt-2">{event?.title || "Event"}</h1></div><span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase">{booking.status}</span></div>{event?.image && <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-2xl mt-8" />}<div className="grid sm:grid-cols-2 gap-6 mt-8 text-sm"><div><b>Date</b><p className="text-gray-600 mt-1">{event?.date ? new Date(event.date).toLocaleDateString() : "—"}</p></div><div><b>Time</b><p className="text-gray-600 mt-1">{event?.time || "—"}</p></div><div><b>Location</b><p className="text-gray-600 mt-1">{event?.location || "—"}</p></div><div><b>Category</b><p className="text-gray-600 mt-1">{event?.category || "—"}</p></div><div><b>Tickets</b><p className="text-gray-600 mt-1">{booking.numberOfTickets}</p></div><div><b>Total amount</b><p className="text-gray-600 mt-1">{booking.amount === 0 ? "Free" : `₹${booking.amount}`}</p></div><div><b>Payment</b><p className="text-gray-600 mt-1 font-bold">{booking.paymentStatus}</p></div><div><b>Requested</b><p className="text-gray-600 mt-1">{new Date(booking.createdAt).toLocaleString()}</p></div></div>{booking.status !== "cancelled" && <button onClick={cancelBooking} className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold">Cancel Booking</button>}</div>;
};
export default BookingDetails;
