export const prepareAiInsightString = (
  jobDesc: string,
  companyName: string
): string => {
  return `${jobDesc} 
    
Based on the job description provided above, please give me information about ${companyName} company, 
their mission, and useful insight you might have to help me succeed in my interview with them. 
Also highlight both technical and soft skills necessary to succeed. KEEP YOUR ANSWER INFORMATIVE BUT LESS THAN 10000 characters please.`;
};
