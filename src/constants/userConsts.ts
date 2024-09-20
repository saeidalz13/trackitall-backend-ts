
export const generateDefaultInterviewQuestions = (
  userId: string
): Array<Object> => {
  return [
    { question: "Tell me about yourself", userUlid: userId },
    { question: "What does your ideal job look like?", userUlid: userId },
    { question: "What is your proudest project?", userUlid: userId },
    { question: "What do you know about us?", userUlid: userId },
    { question: "Why do wanna leave your current job?", userUlid: userId },
    {
      question: "Tell me about a time you had to persuade someone",
      userUlid: userId,
    },
    {
      question:
        "Tell me about a time that you failed and what did you learn from it?",
      userUlid: userId,
    },
    {
      question:
        "Have you ever had disagreement, conflicts, issues with your coworkers?",
      userUlid: userId,
    },
    { question: "How would your colleagues describe you?", userUlid: userId },
    { question: "What frustrates you the most?", userUlid: userId },
    {
      question:
        "What was the most difficult bug you fixed in the past 6 months?",
      userUlid: userId,
    },
    {
      question:
        "Have you ever missed a deadline? If so, how did you handle it?",
      userUlid: userId,
    },
    {
      question: "Describe a time when you had to meet a tight deadline",
      userUlid: userId,
    },
  ];
};
