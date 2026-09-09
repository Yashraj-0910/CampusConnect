const sequelize = require('../config/db');
const User = require('./User');
const Student = require('./Student');
const Club = require('./Club');
const ClubCoordinator = require('./ClubCoordinator');
const ClubMember = require('./ClubMember');
const ClubRegistration = require('./ClubRegistration');
const Event = require('./Event');
const EventRegistration = require('./EventRegistration');
const Announcement = require('./Announcement');
const Notification = require('./Notification');
const Mentor = require('./Mentor');
const MentorQuestion = require('./MentorQuestion');
const FAQ = require('./FAQ');
const StudentInterest = require('./StudentInterest');
const Achievement = require('./Achievement');
const EventGallery = require('./EventGallery');

// User <-> Student (One-to-One)
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Mentor (One-to-One)
User.hasOne(Mentor, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Mentor.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Notification (One-to-Many)
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Club <-> ClubCoordinator (One-to-Many)
Club.hasMany(ClubCoordinator, { foreignKey: 'club_id', onDelete: 'CASCADE' });
ClubCoordinator.belongsTo(Club, { foreignKey: 'club_id' });

// User <-> ClubCoordinator (One-to-Many)
User.hasMany(ClubCoordinator, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ClubCoordinator.belongsTo(User, { foreignKey: 'user_id' });

// Student <-> ClubMember (One-to-Many)
Student.hasMany(ClubMember, { foreignKey: 'student_id', onDelete: 'CASCADE' });
ClubMember.belongsTo(Student, { foreignKey: 'student_id' });

// Club <-> ClubMember (One-to-Many)
Club.hasMany(ClubMember, { foreignKey: 'club_id', onDelete: 'CASCADE' });
ClubMember.belongsTo(Club, { foreignKey: 'club_id' });

// Student <-> ClubRegistration (One-to-Many)
Student.hasMany(ClubRegistration, { foreignKey: 'student_id', onDelete: 'CASCADE' });
ClubRegistration.belongsTo(Student, { foreignKey: 'student_id' });

// Club <-> ClubRegistration (One-to-Many)
Club.hasMany(ClubRegistration, { foreignKey: 'club_id', onDelete: 'CASCADE' });
ClubRegistration.belongsTo(Club, { foreignKey: 'club_id' });

// Club <-> Event (One-to-Many)
Club.hasMany(Event, { foreignKey: 'club_id', onDelete: 'SET NULL' });
Event.belongsTo(Club, { foreignKey: 'club_id' });

// Student <-> EventRegistration (One-to-Many)
Student.hasMany(EventRegistration, { foreignKey: 'student_id', onDelete: 'CASCADE' });
EventRegistration.belongsTo(Student, { foreignKey: 'student_id' });

// Event <-> EventRegistration (One-to-Many)
Event.hasMany(EventRegistration, { foreignKey: 'event_id', onDelete: 'CASCADE' });
EventRegistration.belongsTo(Event, { foreignKey: 'event_id' });

// Club <-> Announcement (One-to-Many)
Club.hasMany(Announcement, { foreignKey: 'club_id', onDelete: 'SET NULL' });
Announcement.belongsTo(Club, { foreignKey: 'club_id' });

// Student <-> MentorQuestion (One-to-Many)
Student.hasMany(MentorQuestion, { foreignKey: 'student_id', onDelete: 'CASCADE' });
MentorQuestion.belongsTo(Student, { foreignKey: 'student_id' });

// Mentor <-> MentorQuestion (One-to-Many)
Mentor.hasMany(MentorQuestion, { foreignKey: 'mentor_id', onDelete: 'CASCADE' });
MentorQuestion.belongsTo(Mentor, { foreignKey: 'mentor_id' });

// Student <-> StudentInterest (One-to-Many)
Student.hasMany(StudentInterest, { foreignKey: 'student_id', onDelete: 'CASCADE' });
StudentInterest.belongsTo(Student, { foreignKey: 'student_id' });

// Club <-> Achievement (One-to-Many)
Club.hasMany(Achievement, { foreignKey: 'club_id', onDelete: 'CASCADE' });
Achievement.belongsTo(Club, { foreignKey: 'club_id' });

// Event <-> EventGallery (One-to-Many)
Event.hasMany(EventGallery, { foreignKey: 'event_id', onDelete: 'CASCADE' });
EventGallery.belongsTo(Event, { foreignKey: 'event_id' });

module.exports = {
  sequelize,
  User,
  Student,
  Club,
  ClubCoordinator,
  ClubMember,
  ClubRegistration,
  Event,
  EventRegistration,
  Announcement,
  Notification,
  Mentor,
  MentorQuestion,
  FAQ,
  StudentInterest,
  Achievement,
  EventGallery
};
