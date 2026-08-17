const Event = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const { title, description, category, location, date, time, price, totalSeats, availableSeats, image } = req.body;
    const seats = Number(totalSeats);
    const available = availableSeats === undefined ? seats : Number(availableSeats);
    const event = await Event.create({
      title: String(title || "").trim(), description: String(description || "").trim(),
      category: String(category || "").trim(), location: String(location || "").trim(),
      date, time, price: Number(price), totalSeats: seats, availableSeats: available, image: image || "",
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, message: "Event Created", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { search = "", category, location } = req.query;
    const filter = {};
    if (search.trim()) {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ];
    }
    if (category?.trim()) filter.category = { $regex: category.trim(), $options: "i" };
    if (location?.trim()) filter.location = { $regex: location.trim(), $options: "i" };
    const events = await Event.find(filter).sort({ date: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch events", error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.price !== undefined) update.price = Number(update.price);
    if (update.totalSeats !== undefined) update.totalSeats = Number(update.totalSeats);
    if (update.availableSeats !== undefined) update.availableSeats = Number(update.availableSeats);
    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event updated successfully", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update event", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete event", error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
