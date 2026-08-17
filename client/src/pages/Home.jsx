import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaTicketAlt } from "react-icons/fa";
import api from "../utils/axios";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true); setError("");
        const { data } = await api.get("/events", { params: { search } });
        setEvents(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load events."); setEvents([]);
      } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gray-950 text-white px-6 py-16 sm:px-10 md:px-16 md:py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest mb-6"><FaTicketAlt /> Eventora</div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight">Find your next unforgettable experience.</h1>
          <p className="mt-6 text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">Discover conferences, workshops, concerts and experiences. Search, verify and book your next event securely.</p>
          <div className="mt-10 max-w-2xl mx-auto relative"><FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, category or location..." className="w-full rounded-2xl bg-white text-gray-900 py-4 pl-12 pr-5 outline-none ring-0 focus:ring-4 focus:ring-white/20" /></div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6"><div><p className="text-sm font-bold uppercase tracking-widest text-gray-500">Explore</p><h2 className="text-3xl font-extrabold text-gray-900">Upcoming Events</h2></div><span className="text-gray-500">{events.length} result{events.length === 1 ? "" : "s"}</span></div>
        {loading ? <div className="py-20 text-center text-gray-500">Loading events...</div> : error ? <div className="py-20 text-center text-red-500">{error}</div> : events.length === 0 ? <div className="py-20 text-center text-gray-500 border border-dashed rounded-2xl">No events found.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => <article key={event._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-52 bg-gray-100 overflow-hidden">{event.image ? <img src={event.image} alt={event.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-4xl font-black">{event.category?.charAt(0) || "E"}</div>}</div>
            <div className="p-6 flex flex-col flex-1"><span className="text-xs font-bold uppercase tracking-widest text-gray-500">{event.category}</span><h3 className="text-xl font-bold mt-2 text-gray-900">{event.title}</h3><p className="text-gray-500 text-sm mt-2 line-clamp-2">{event.description}</p><div className="mt-5 space-y-2 text-sm text-gray-600"><div className="flex gap-2 items-center"><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()} · {event.time}</div><div className="flex gap-2 items-center"><FaMapMarkerAlt /> {event.location}</div></div><div className="mt-auto pt-5 flex items-center justify-between"><span className="font-bold text-gray-900">{event.price === 0 ? "FREE" : `₹${event.price}`}</span><Link to={`/events/${event._id}`} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-black">View Event</Link></div></div>
          </article>)}
        </div>}
      </section>
    </div>
  );
};
export default Home;
