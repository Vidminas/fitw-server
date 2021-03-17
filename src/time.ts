let TODAY: Date;

{
  // enclose in a block so that the reference to dateRightNow
  // can be deleted after setting TODAY
  const dateRightNow = new Date();
  TODAY = new Date(
    dateRightNow.getFullYear(),
    dateRightNow.getMonth(),
    dateRightNow.getDate()
  );
}

export const getToday = () => TODAY;
export const makeItTomorrow = () => TODAY.setDate(TODAY.getDate() + 1);
export const makeItYesterday = () => TODAY.setDate(TODAY.getDate() - 1);

export const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const isDayBefore = (currentDate: Date, dateToCheck: Date) => {
  const tempDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 1
  );
  return isSameDay(tempDate, dateToCheck);
};
