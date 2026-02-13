const Notification = require("../models/Notification");

exports.createNotification = async ({
  userId,
  companyId,
  type,
  message
}) => {
  await Notification.create({
    userId,
    companyId,
    type,
    message
  });
};
