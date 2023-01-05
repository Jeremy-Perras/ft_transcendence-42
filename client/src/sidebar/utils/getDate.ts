export const getDate = (time: string | null) => {
  if (time) return time.substring(0, 10) + " at " + time.substring(11, 16);
  return "-";
};
