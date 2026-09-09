const { Op } = require('sequelize');
const { Event, EventRegistration, Student, User, Club, EventGallery } = require('../models');

const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { tab, search } = req.query;
    const today = new Date();
    const whereClause = {};

    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    if (tab === 'this_week') {
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      whereClause.event_date = { [Op.between]: [today, nextWeek] };
    } else if (tab === 'this_month') {
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      whereClause.event_date = { [Op.between]: [today, nextMonth] };
    } else if (tab === 'completed') {
      whereClause.event_date = { [Op.lt]: today };
    } else if (tab === 'upcoming' || !tab) {
      whereClause.event_date = { [Op.gte]: today };
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: {
        model: Club,
        attributes: ['name', 'logo_url']
      },
      order: [['event_date', 'ASC']]
    });

    res.json({
      events,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findByPk(id, {
      include: [
        { model: Club, attributes: ['name', 'logo_url'] },
        { model: EventGallery }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ message: 'Server error fetching event details' });
  }
};

const registerForEvent = async (req, res) => {
  const { id: eventId } = req.params;

  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Register first.' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check deadline
    if (new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check duplicate
    const existingReg = await EventRegistration.findOne({
      where: {
        student_id: student.id,
        event_id: eventId
      }
    });

    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check max participants
    if (event.max_participants) {
      const regCount = await EventRegistration.count({ where: { event_id: eventId } });
      if (regCount >= event.max_participants) {
        return res.status(400).json({ message: 'Event registrations are full' });
      }
    }

    const registration = await EventRegistration.create({
      student_id: student.id,
      event_id: eventId,
      status: 'registered'
    });

    res.status(201).json({
      message: 'Successfully registered for event',
      registrationId: registration.id
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error registering for event' });
  }
};

const getRegisteredEvents = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.json([]);
    }

    const registrations = await EventRegistration.findAll({
      where: { student_id: student.id },
      include: {
        model: Event,
        include: { model: Club, attributes: ['name', 'logo_url'] }
      },
      order: [[Event, 'event_date', 'ASC']]
    });

    res.json(registrations.map(r => r.Event));
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ message: 'Server error fetching registered events' });
  }
};

module.exports = {
  getEvents,
  getEventById,
  registerForEvent,
  getRegisteredEvents
};
