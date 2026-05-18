// src/common/utils/catchAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // .catch(next) passe l'erreur au middleware global
  };
};
