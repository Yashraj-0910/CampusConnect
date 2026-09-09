const {
  User,
  Student,
  Club,
  ClubCoordinator,
  ClubRegistration,
  Event,
  EventRegistration,
  sequelize
} = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalClubs = await Club.count();
    const totalEvents = await Event.count();
    const openRegistrations = await Club.count({ where: { registration_status: 'open' } });
    const pendingApplications = await ClubRegistration.count({ where: { status: 'pending' } });

    // Analytics: Student registrations over time
    const studentRegistrationsTrend = await Student.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('created_at')), 'date'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('date_trunc', 'day', sequelize.col('created_at'))],
      order: [[sequelize.fn('date_trunc', 'day', sequelize.col('created_at')), 'ASC']],
      limit: 30
    });

    // Analytics: Popular clubs (by number of active members)
    const popularClubs = await Club.findAll({
      attributes: [
        'id',
        'name',
        'category',
        [sequelize.literal('(SELECT COUNT(*) FROM club_members WHERE club_members.club_id = "Club"."id")'), 'memberCount']
      ],
      order: [[sequelize.literal('"memberCount"'), 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalStudents,
        totalClubs,
        totalEvents,
        openRegistrations,
        pendingApplications
      },
      analytics: {
        studentRegistrationsTrend,
        popularClubs
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

const assignCoordinator = async (req, res) => {
  const { email, clubId, roleTitle } = req.body;

  try {
    if (!email || !clubId) {
      return res.status(400).json({ message: 'Email and clubId are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const club = await Club.findByPk(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Update user role to coordinator
    user.role = 'coordinator';
    await user.save();

    // Check if coordinator mapping already exists
    let coord = await ClubCoordinator.findOne({
      where: { user_id: user.id, club_id: clubId }
    });

    if (!coord) {
      coord = await ClubCoordinator.create({
        user_id: user.id,
        club_id: clubId,
        role_title: roleTitle || 'Coordinator'
      });
    }

    res.json({
      message: 'Coordinator assigned successfully',
      coordinator: {
        userId: user.id,
        name: user.name,
        email: user.email,
        roleTitle: coord.role_title
      }
    });
  } catch (error) {
    console.error('Error assigning coordinator:', error);
    res.status(500).json({ message: 'Server error assigning coordinator' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: students } = await Student.findAndCountAll({
      limit,
      offset,
      include: { model: User, attributes: ['name', 'email', 'status'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      students,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting student list:', error);
    res.status(500).json({ message: 'Server error fetching student list' });
  }
};

const createClub = async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json(club);
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Server error creating club' });
  }
};

const updateClub = async (req, res) => {
  const { id } = req.params;
  try {
    const club = await Club.findByPk(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    await club.update(req.body);
    res.json(club);
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ message: 'Server error updating club' });
  }
};

const deleteClub = async (req, res) => {
  const { id } = req.params;
  try {
    const club = await Club.findByPk(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    await club.destroy();
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ message: 'Server error deleting club' });
  }
};

module.exports = {
  getDashboardStats,
  assignCoordinator,
  getAllStudents,
  createClub,
  updateClub,
  deleteClub
};
