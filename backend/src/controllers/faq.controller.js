const { Op } = require('sequelize');
const { FAQ } = require('../models');

const getFAQs = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { question: { [Op.iLike]: `%${search}%` } },
        { answer: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const faqs = await FAQ.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['question', 'ASC']]
    });

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Server error fetching FAQs' });
  }
};

module.exports = { getFAQs };
