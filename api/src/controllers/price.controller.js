const priceRepository = require('../repositories/price.repository');

const getLatest = async (req, res, next) => {
  try {
    const prices = await priceRepository.getLatestPrices();
    res.json(prices);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLatest,
};
