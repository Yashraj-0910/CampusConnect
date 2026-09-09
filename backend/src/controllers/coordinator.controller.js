const {
  Club,
  ClubCoordinator,
  ClubRegistration,
  Student,
  User,
  ClubMember,
  Event,
  Announcement,
  sequelize
} = require('../models');

// Helper to check if coordinator manages the club
const checkCoordAccess = async (userId, clubId) => {
  const coord = await ClubCoordinator.findOne({
    where: { user_id: userId, club_id: clubId }
  });
  return !!coord;
};

const getCoordinatorClub = async (req, res) => {
  try {
    const coord = await ClubCoordinator.findOne({
      where: { user_id: req.user.id }
    });

    if (!coord) {
      return res.status(403).json({ message: 'Forbidden: You are not assigned to any club' });
    }

    const club = await Club.findByPk(coord.club_id, {
      include: [
        { model: ClubMember, include: { model: Student, include: { model: User, attributes: ['name', 'email'] } } },
        { model: Event },
        { model: Announcement }
      ]
    });

    res.json({ coordRole: coord.role_title, club });
  } catch (error) {
    console.error('Error fetching coordinator club:', error);
    res.status(500).json({ message: 'Server error fetching coordinator club' });
  }
};

const getClubApplicants = async (req, res) => {
  const { clubId } = req.params;

  try {
    const hasAccess = await checkCoordAccess(req.user.id, clubId);
    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not manage this club' });
    }

    const applicants = await ClubRegistration.findAll({
      where: { club_id: clubId },
      include: {
        model: Student,
        include: { model: User, attributes: ['name', 'email'] }
      },
      order: [['applied_date', 'DESC']]
    });

    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ message: 'Server error fetching applicants' });
  }
};

const manageApplicant = async (req, res) => {
  const { registrationId } = req.params;
  const { status } = req.body; // approved, rejected, waitlisted

  const transaction = await sequelize.transaction();

  try {
    const registration = await ClubRegistration.findByPk(registrationId);
    if (!registration) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Registration not found' });
    }

    const hasAccess = await checkCoordAccess(req.user.id, registration.club_id);
    if (!hasAccess && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Forbidden: You do not manage this club' });
    }

    registration.status = status;
    await registration.save({ transaction });

    // If approved, add to ClubMember
    if (status === 'approved') {
      // Check if already a member
      const existingMember = await ClubMember.findOne({
        where: {
          student_id: registration.student_id,
          club_id: registration.club_id
        }
      });

      if (!existingMember) {
        await ClubMember.create({
          student_id: registration.student_id,
          club_id: registration.club_id,
          role: 'member'
        }, { transaction });
      }
    } else if (status === 'rejected' || status === 'waitlisted') {
      // Remove from members if previously approved
      await ClubMember.destroy({
        where: {
          student_id: registration.student_id,
          club_id: registration.club_id
        }
      }, { transaction });
    }

    await transaction.commit();
    res.json({ message: `Applicant status updated to ${status}`, registration });
  } catch (error) {
    await transaction.rollback();
    console.error('Error managing applicant:', error);
    res.status(500).json({ message: 'Server error updating applicant status' });
  }
};

const createClubEvent = async (req, res) => {
  const { clubId } = req.params;

  try {
    const hasAccess = await checkCoordAccess(req.user.id, clubId);
    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not manage this club' });
    }

    const event = await Event.create({
      ...req.body,
      club_id: clubId
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating club event:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

const createClubAnnouncement = async (req, res) => {
  const { clubId } = req.params;

  try {
    const hasAccess = await checkCoordAccess(req.user.id, clubId);
    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not manage this club' });
    }

    const announcement = await Announcement.create({
      ...req.body,
      club_id: clubId,
      category: 'club'
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating club announcement:', error);
    res.status(500).json({ message: 'Server error creating announcement' });
  }
};

module.exports = {
  getCoordinatorClub,
  getClubApplicants,
  manageApplicant,
  createClubEvent,
  createClubAnnouncement
};
