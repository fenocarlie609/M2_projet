const sendSuccess = (res, payload = {}, statusCode = 200) => {
  const response = { status: "success" };

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return res.status(statusCode).json({ ...response, ...payload });
  }

  return res.status(statusCode).json({
    ...response,
    data: payload,
  });
};

const sendCreated = (res, payload = {}) => sendSuccess(res, payload, 201);
const sendDeleted = (res) =>
  res.status(204).json({ status: "success", data: null });

module.exports = {
  sendSuccess,
  sendCreated,
  sendDeleted,
};
