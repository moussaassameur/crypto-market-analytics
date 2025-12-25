const cryptoRepository = require("../repositories/crypto.repository");

const getCryptos = async (req, res, next) => {
  try {
    const cryptos = await cryptoRepository.getAllCryptos();
    res.json(cryptos);
  } catch (e) {
    next(e);
  }
};

module.exports = { getCryptos };
