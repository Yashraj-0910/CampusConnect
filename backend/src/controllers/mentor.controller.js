const { Op } = require('sequelize');
const { Mentor, MentorQuestion, Student, User } = require('../models');

const getMentors = async (req, res) => {
  try {
    const { department, interest, club, search } = req.query;
    const whereClause = {};

    if (department) {
      whereClause.department = department;
    }
    if (interest) {
      whereClause.interests = { [Op.iLike]: `%${interest}%` };
    }
    if (club) {
      whereClause.clubs = { [Op.iLike]: `%${club}%` };
    }
    if (search) {
      whereClause[Op.or] = [
        { department: { [Op.iLike]: `%${search}%` } },
        { interests: { [Op.iLike]: `%${search}%` } },
        { clubs: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const mentors = await Mentor.findAll({
      where: whereClause,
      include: {
        model: User,
        attributes: ['name', 'email']
      },
      order: [['created_at', 'DESC']]
    });

    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Server error fetching mentors' });
  }
};

const askQuestion = async (req, res) => {
  const { id: mentorId } = req.params;
  const { question } = req.body;

  try {
    if (!question) {
      return res.status(400).json({ message: 'Question content is required' });
    }

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const mentorExists = await Mentor.findByPk(mentorId);
    if (!mentorExists) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const q = await MentorQuestion.create({
      student_id: student.id,
      mentor_id: mentorId,
      question
    });

    res.status(201).json(q);
  } catch (error) {
    console.error('Error asking question:', error);
    res.status(500).json({ message: 'Server error posting question' });
  }
};

const answerQuestion = async (req, res) => {
  const { qId } = req.params;
  const { answer } = req.body;

  try {
    if (!answer) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    // Find mentor associated with current user
    const mentor = await Mentor.findOne({ where: { user_id: req.user.id } });
    if (!mentor) {
      return res.status(403).json({ message: 'Only registered mentors can answer questions' });
    }

    const q = await MentorQuestion.findOne({
      where: { id: qId, mentor_id: mentor.id }
    });

    if (!q) {
      return res.status(404).json({ message: 'Question not found or not assigned to you' });
    }

    q.answer = answer;
    q.answered_at = new Date();
    await q.save();

    res.json(q);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ message: 'Server error answering question' });
  }
};

const getMentorQuestions = async (req, res) => {
  const { id: mentorId } = req.params;

  try {
    const qas = await MentorQuestion.findAll({
      where: { mentor_id: mentorId },
      include: {
        model: Student,
        include: { model: User, attributes: ['name'] }
      },
      order: [['asked_at', 'DESC']]
    });
    res.json(qas);
  } catch (error) {
    console.error('Error fetching mentor QA:', error);
    res.status(500).json({ message: 'Server error fetching QA history' });
  }
};

module.exports = {
  getMentors,
  askQuestion,
  answerQuestion,
  getMentorQuestions
};
