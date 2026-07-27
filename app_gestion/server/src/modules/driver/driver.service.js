// src/features/driver/driver.service.js
const { prisma } = require("../../config/database");

const createDriver = async (data) => {
  return await prisma.driver.create({ data });
};

const updateDriver = async (id, data) => {
  return await prisma.driver.update({
    where: { id },
    data,
  });
};

const deleteDriver = async (id) => {
  return await prisma.driver.delete({
    where: { id },
  });
};

const getAllDrivers = async () => {
  return await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getDriverById = async (id) => {
  return await prisma.driver.findUnique({
    where: { id },
  });
};

module.exports = {
  createDriver,
  updateDriver,
  deleteDriver,
  getAllDrivers,
  getDriverById,
};
