export const getDate = (time: number) => {
  const date = new Date(time);
  return (
    date.toISOString().substring(0, 10) +
    " at " +
    date.toISOString().substring(11, 16)
  );
};
