export const formatTime = (minutes) => {
  if (!minutes && minutes !== 0) return "-";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

export default formatTime;