// Nepali date conversion function
export const convertToNepaliDate = (englishDate: Date): string => {
  const nepaliMonths = [
    'बैशाख', 'जेष्ठ', 'आषाढ़', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मार्ग', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  
  const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
  ];
  
  const englishYear = englishDate.getFullYear();
  const nepaliYear = englishYear + 57;
  
  const month = englishDate.getMonth();
  const day = englishDate.getDate();
  const dayOfWeek = englishDate.getDay();
  
  return `${nepaliYear} ${nepaliMonths[month]} ${day}, ${nepaliDays[dayOfWeek]}`;
};

export const getTodayNepaliDate = (): string => {
  return convertToNepaliDate(new Date());
};