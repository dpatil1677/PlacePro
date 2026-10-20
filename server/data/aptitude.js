// Mock aptitude data — replace with PostgreSQL queries later

export const tests = [
  {
    id: 'apt1',
    title: 'Quantitative Aptitude Basics',
    category: 'Quantitative',
    difficulty: 'Easy',
    questions: 10,
    duration: 30,
    questions_data: [
      { id: 1, q: 'What is 15% of 240?', options: ['36', '30', '32', '38'], answer: 0 },
      { id: 2, q: 'A train travels 360 km in 4 hours. Find its speed in km/hr.', options: ['80', '90', '75', '100'], answer: 1 },
      { id: 3, q: 'If 3x + 7 = 22, what is x?', options: ['4', '5', '6', '3'], answer: 1 },
      { id: 4, q: 'Find the LCM of 12 and 18.', options: ['24', '36', '48', '72'], answer: 1 },
      { id: 5, q: 'A shopkeeper sells an item at ₹560 at 40% profit. Find cost price.', options: ['₹300', '₹400', '₹350', '₹380'], answer: 1 },
      { id: 6, q: 'Simple interest on ₹2000 at 5% per annum for 3 years is?', options: ['₹300', '₹350', '₹200', '₹400'], answer: 0 },
      { id: 7, q: 'What is the square root of 196?', options: ['12', '14', '13', '15'], answer: 1 },
      { id: 8, q: 'If A:B = 2:3 and B:C = 4:5, find A:C.', options: ['8:15', '2:5', '4:9', '6:10'], answer: 0 },
      { id: 9, q: 'A pipe fills a tank in 6 hours. How much of the tank is filled in 2 hours?', options: ['1/3', '1/4', '1/2', '2/3'], answer: 0 },
      { id: 10, q: 'The average of 5 numbers is 20. If one number is removed, average becomes 18. The removed number is?', options: ['28', '26', '30', '24'], answer: 0 },
    ],
  },
  {
    id: 'apt2',
    title: 'Advanced Quant Reasoning',
    category: 'Quantitative',
    difficulty: 'Hard',
    questions: 10,
    duration: 45,
    questions_data: [
      { id: 1, q: 'Two pipes A and B can fill a cistern in 12 and 15 minutes respectively. Both are opened together, but after 3 minutes, A is closed. How long will B take to fill the cistern?', options: ['8.25 min', '7.5 min', '8.75 min', '9 min'], answer: 0 },
      { id: 2, q: 'A boat goes 30 km upstream and 44 km downstream in 10 hours. In 13 hours, it can go 40 km upstream and 55 km downstream. Find the speed of the stream.', options: ['3 km/hr', '4 km/hr', '2.5 km/hr', '5 km/hr'], answer: 0 },
      { id: 3, q: 'The compound interest on ₹30,000 at 7% per annum for 2 years is?', options: ['₹4,347', '₹4,200', '₹4,500', '₹4,410'], answer: 0 },
      { id: 4, q: 'If 10% of x = 20% of y, then x:y = ?', options: ['1:2', '2:1', '3:2', '1:3'], answer: 1 },
      { id: 5, q: 'A man can row 18 km/hr in still water. If it takes 3.5 hours to row 28 km upstream and back, find the speed of the stream.', options: ['2 km/hr', '3 km/hr', '4 km/hr', '5 km/hr'], answer: 0 },
      { id: 6, q: 'Find the number of ways to arrange the letters of the word "MATHEMATICS".', options: ['4989600', '4939200', '4832100', '4989200'], answer: 0 },
      { id: 7, q: 'In how many ways can a committee of 5 be formed from 8 men and 5 women such that it includes at least 1 woman?', options: ['1287', '1260', '1246', '1300'], answer: 0 },
      { id: 8, q: 'A man sold two watches at ₹990 each. On one he gained 10% and on the other he lost 10%. His net gain/loss is?', options: ['1% loss', '1% gain', 'No loss, no gain', '2% loss'], answer: 0 },
      { id: 9, q: 'The sum of three numbers in G.P. is 39 and their product is 729. Find the numbers.', options: ['3,9,27', '1,3,9', '9,27,81', '6,9,12'], answer: 0 },
      { id: 10, q: 'A train 270 m long is running at 45 km/hr. In how many seconds does it pass a platform 180 m long?', options: ['36', '35', '40', '32'], answer: 0 },
    ],
  },
  {
    id: 'apt3',
    title: 'Verbal Ability & RC',
    category: 'Verbal',
    difficulty: 'Medium',
    questions: 10,
    duration: 30,
    questions_data: [
      { id: 1, q: 'Choose the correct synonym for "Ephemeral":', options: ['Permanent', 'Transitory', 'Eternal', 'Stable'], answer: 1 },
      { id: 2, q: 'Choose the correct antonym for "Benevolent":', options: ['Kind', 'Malevolent', 'Generous', 'Compassionate'], answer: 1 },
      { id: 3, q: 'Fill in: He _____ to the market every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
      { id: 4, q: 'Identify the error: "He is one of the most honest man I have ever met."', options: ['one', 'most honest', 'man', 'ever met'], answer: 2 },
      { id: 5, q: 'Choose the word that best completes: The _____ of the argument was lost on the audience.', options: ['strength', 'subtlety', 'length', 'volume'], answer: 1 },
      { id: 6, q: 'Which sentence is grammatically correct?', options: ['She don\'t know the answer.', 'She doesn\'t knows the answer.', 'She doesn\'t know the answer.', 'She not know the answer.'], answer: 2 },
      { id: 7, q: 'Choose the correctly spelled word:', options: ['Accommodation', 'Accomodation', 'Acommodation', 'Accommodaton'], answer: 0 },
      { id: 8, q: 'Identify the part of speech of the underlined word: "He runs quickly."', options: ['Adjective', 'Adverb', 'Noun', 'Verb'], answer: 1 },
      { id: 9, q: 'Choose the correct meaning of the idiom "To beat around the bush":', options: ['To be direct', 'To avoid the main topic', 'To be aggressive', 'To work hard'], answer: 1 },
      { id: 10, q: 'Which of the following is a compound sentence?', options: ['She sings beautifully.', 'She sings and he plays.', 'She sings because she loves music.', 'Although she sings, he does not.'], answer: 1 },
    ],
  },
  {
    id: 'apt4',
    title: 'Logical Reasoning Fundamentals',
    category: 'Logical',
    difficulty: 'Easy',
    questions: 10,
    duration: 25,
    questions_data: [
      { id: 1, q: 'All dogs are animals. All animals are mammals. Therefore:', options: ['All mammals are dogs', 'All dogs are mammals', 'No dogs are mammals', 'Some dogs are not mammals'], answer: 1 },
      { id: 2, q: 'If A > B, B > C, and C > D, which is the smallest?', options: ['A', 'B', 'C', 'D'], answer: 3 },
      { id: 3, q: 'Complete the sequence: 2, 4, 8, 16, ___', options: ['18', '24', '32', '28'], answer: 2 },
      { id: 4, q: 'If FIRE is coded as 6935, how is RICE coded?', options: ['9536', '9563', '9356', '9365'], answer: 0 },
      { id: 5, q: 'A clock shows 3:15. What angle does the minute hand make with the hour hand?', options: ['7.5°', '0°', '22.5°', '45°'], answer: 0 },
      { id: 6, q: 'Which number is odd one out: 121, 169, 196, 225', options: ['121', '169', '196', '225'], answer: 2 },
      { id: 7, q: 'Complete the series: J, F, M, A, M, J, ___', options: ['A', 'J', 'S', 'O'], answer: 1 },
      { id: 8, q: 'If Monday is 2 days after Saturday, what day is 3 days before Thursday?', options: ['Tuesday', 'Monday', 'Sunday', 'Wednesday'], answer: 1 },
      { id: 9, q: 'Mirror image: If INDIA is written as AYDNI, CHINA is written as?', options: ['ANIHC', 'ANHIC', 'AINHC', 'ANICH'], answer: 0 },
      { id: 10, q: 'In a certain code language, "go to school" is coded as "23 45 67". What is the code for "to"?', options: ['23', '45', '67', 'Cannot determine'], answer: 3 },
    ],
  },
  {
    id: 'apt5',
    title: 'Data Interpretation',
    category: 'Quantitative',
    difficulty: 'Medium',
    questions: 10,
    duration: 35,
    questions_data: [
      { id: 1, q: 'A pie chart shows: Food 40%, Rent 25%, Transport 15%, Others 20%. If total is ₹10,000, how much is spent on Food?', options: ['₹4,000', '₹3,000', '₹5,000', '₹2,500'], answer: 0 },
      { id: 2, q: 'From a bar graph: Sales in Q1=200, Q2=250, Q3=300, Q4=150. What is the average quarterly sales?', options: ['225', '200', '250', '300'], answer: 0 },
      { id: 3, q: 'A table shows: Year 2019 production=500, Year 2020=600, Year 2021=750. Percentage increase from 2019 to 2021?', options: ['40%', '50%', '45%', '55%'], answer: 1 },
      { id: 4, q: 'In a class of 60 students, 40% play cricket. How many students do not play cricket?', options: ['36', '24', '40', '30'], answer: 0 },
      { id: 5, q: 'A line graph shows population growth: 2000=10000, 2010=15000, 2020=22500. What is the growth rate per decade?', options: ['40%', '50%', '45%', '35%'], answer: 1 },
      { id: 6, q: 'From the data: A=120, B=80, C=100. What percentage is B of total?', options: ['27%', '26.7%', '25%', '28%'], answer: 1 },
      { id: 7, q: 'If a company\'s revenue was ₹50 lakh in 2020 and grew by 20% in 2021, what is the revenue in 2021?', options: ['₹60 lakh', '₹55 lakh', '₹65 lakh', '₹70 lakh'], answer: 0 },
      { id: 8, q: 'In a survey of 200 people, 120 prefer tea. What is the ratio of tea to coffee drinkers?', options: ['3:2', '2:3', '3:5', '5:3'], answer: 0 },
      { id: 9, q: 'A store sold 500 items in January, 600 in February, 450 in March. What is the average monthly sales?', options: ['516.67', '520', '500', '530'], answer: 0 },
      { id: 10, q: 'If investment grows from ₹10,000 to ₹14,400 in 2 years with compound interest, what is the annual rate?', options: ['20%', '25%', '15%', '18%'], answer: 0 },
    ],
  },
  {
    id: 'apt6',
    title: 'Critical Thinking',
    category: 'Logical',
    difficulty: 'Hard',
    questions: 10,
    duration: 40,
    questions_data: [
      { id: 1, q: 'If all birds can fly, and penguins are birds, then penguins can fly. This argument is:', options: ['Valid but unsound', 'Invalid and unsound', 'Valid and sound', 'Invalid but sound'], answer: 0 },
      { id: 2, q: 'What assumption is needed: "Tom studied hard, so he will pass the exam"?', options: ['Tom is smart', 'Hard study leads to passing', 'The exam is easy', 'Tom has good memory'], answer: 1 },
      { id: 3, q: 'Which weakens the argument "Eating vegetables daily improves health": Studies show that eating vegetables rarely improves health among those who:', options: ['Exercise regularly', 'Eat junk food alongside', 'Don\'t drink enough water', 'Sleep less than 6 hours'], answer: 1 },
      { id: 4, q: 'Identify the logical fallacy: "You should not criticize my arguments because you\'re not a philosopher."', options: ['Ad hominem', 'Straw man', 'Appeal to authority', 'False dichotomy'], answer: 0 },
      { id: 5, q: 'Complete the analogy: Book is to Library as Painting is to:', options: ['Artist', 'Museum', 'Canvas', 'Gallery'], answer: 3 },
      { id: 6, q: 'If "No managers are cowards" and "Some employees are cowards", then:', options: ['Some employees are managers', 'No employees are managers', 'Some employees are not managers', 'All managers are employees'], answer: 2 },
      { id: 7, q: 'The statement "If it rains, then the ground is wet" can be logically reversed as:', options: ['If the ground is wet, it rained', 'If the ground is not wet, it did not rain', 'If it did not rain, the ground is not wet', 'None'], answer: 1 },
      { id: 8, q: 'Which conclusion CANNOT be drawn: All A are B. Some B are C.', options: ['Some A may be C', 'Some B are A', 'No A is C', 'All A are B'], answer: 2 },
      { id: 9, q: 'A deductive argument that guarantees the truth of its conclusion, given true premises, is called:', options: ['Sound', 'Valid', 'Cogent', 'Strong'], answer: 1 },
      { id: 10, q: 'Spot the fallacy: "Everyone I know prefers Android, so most people prefer Android."', options: ['Hasty generalization', 'Ad hominem', 'Straw man', 'False dichotomy'], answer: 0 },
    ],
  },
  {
    id: 'apt7',
    title: 'Technical Aptitude - CS',
    category: 'Technical',
    difficulty: 'Medium',
    questions: 10,
    duration: 30,
    questions_data: [
      { id: 1, q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1 },
      { id: 2, q: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Tree', 'Graph'], answer: 1 },
      { id: 3, q: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'HighText Transfer Protocol', 'HyperText Transport Protocol', 'HyperType Transfer Protocol'], answer: 0 },
      { id: 4, q: 'In a database, which key uniquely identifies a record?', options: ['Foreign Key', 'Primary Key', 'Candidate Key', 'Composite Key'], answer: 1 },
      { id: 5, q: 'Which sorting algorithm has the best average-case complexity?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], answer: 2 },
      { id: 6, q: 'What is the output of: print(2**3) in Python?', options: ['6', '8', '9', '5'], answer: 1 },
      { id: 7, q: 'Which OSI layer handles routing?', options: ['Data Link', 'Transport', 'Network', 'Session'], answer: 2 },
      { id: 8, q: 'What does OOP stand for?', options: ['Object-Oriented Programming', 'Object-Only Protocol', 'Ordered Object Processing', 'Open Oriented Programming'], answer: 0 },
      { id: 9, q: 'The process of converting source code to machine code is called:', options: ['Interpretation', 'Compilation', 'Execution', 'Debugging'], answer: 1 },
      { id: 10, q: 'Which of the following is NOT a programming paradigm?', options: ['Functional', 'Declarative', 'Operational', 'Object-Oriented'], answer: 2 },
    ],
  },
  {
    id: 'apt8',
    title: 'Speed Math Mastery',
    category: 'Quantitative',
    difficulty: 'Easy',
    questions: 10,
    duration: 20,
    questions_data: [
      { id: 1, q: '27 × 13 = ?', options: ['351', '361', '341', '331'], answer: 0 },
      { id: 2, q: '144 ÷ 12 = ?', options: ['10', '11', '12', '13'], answer: 2 },
      { id: 3, q: '19 × 19 = ?', options: ['351', '361', '371', '381'], answer: 1 },
      { id: 4, q: '1250 × 8 = ?', options: ['9000', '10000', '9500', '8500'], answer: 1 },
      { id: 5, q: '√625 = ?', options: ['23', '25', '27', '21'], answer: 1 },
      { id: 6, q: '35% of 280 = ?', options: ['98', '96', '100', '94'], answer: 0 },
      { id: 7, q: '2/5 of 350 = ?', options: ['130', '140', '120', '150'], answer: 1 },
      { id: 8, q: '568 + 432 = ?', options: ['990', '1000', '1010', '980'], answer: 1 },
      { id: 9, q: '72 × 25 = ?', options: ['1800', '1900', '1700', '2000'], answer: 0 },
      { id: 10, q: '15³ = ?', options: ['3375', '3125', '3025', '3225'], answer: 0 },
    ],
  },
];

// In-memory results store — keyed by userId
const results = {};

export function getAllTests() {
  return tests.map(({ questions_data, ...t }) => t);
}

export function getTestById(id) {
  return tests.find((t) => t.id === id) || null;
}

export function getResultsForUser(userId) {
  return results[userId] || [];
}

export function saveResult(userId, result) {
  if (!results[userId]) results[userId] = [];
  results[userId].unshift(result);
  return result;
}
