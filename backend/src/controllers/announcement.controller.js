const { Announcement, Club } = require('../models');

const getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: announcements } = await Announcement.findAndCountAll({
      limit,
      offset,
      include: {
        model: Club,
        attributes: ['name', 'logo_url']
      },
      order: [['is_important', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      announcements,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error fetching announcements' });
  }
};

const createAnnouncement = async (req, res) => {
  const { title, content, category, is_important, club_id } = req.body;

  try {
    const announcement = await Announcement.create({
      title,
      content,
      category,
      is_important: is_important || false,
      club_id: club_id || null
    });
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error creating announcement' });
  }
};

module.exports = { getAnnouncements, createAnnouncement };
