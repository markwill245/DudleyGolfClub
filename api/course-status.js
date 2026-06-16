import { savedCourseStatus } from "./set-course-status.js";

export default function handler(req, res) {
  const override = process.env.COURSE_STATUS_OVERRIDE;

  const now = new Date();

  const ukTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);

  const [hour, minute] = ukTime.split(":").map(Number);
  const minutesNow = hour * 60 + minute;

  const openTime = 8 * 60;
  const closeTime = 17 * 60 + 52;

  let status = "closed";

  if (minutesNow >= openTime && minutesNow < closeTime) {
    status = "open";
  }

  const allowedOverrides = [
    "open",
    "closed",
    "frost",
    "temporary-greens",
    "preferred-lies",
    "maintenance"
  ];

  if (override && allowedOverrides.includes(override)) {
    status = override;
  }

  res.status(200).json({
    status,
    time: ukTime,
    override: override || "automatic"
  });
}