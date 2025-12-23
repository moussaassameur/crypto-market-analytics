const priceRepository = require("../repositories/price.repository");

const getLatest = async (req, res, next) => {
  try {
    const data = await priceRepository.getLatestPrices();
    res.json(data);
  } catch (e) {
    next(e);
  }
};

module.exports = { getLatest };
