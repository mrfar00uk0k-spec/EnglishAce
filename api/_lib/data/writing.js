// api/data/writing.js — Server-side writing prompts
const writingPrompts = {
  easy: [
    {"title": "My Morning Routine", "en": "Write about what you do every morning from when you wake up until you leave the house. Include details like breakfast, getting dressed, and how you travel.", "ar": ""},
    {"title": "My Family", "en": "Write about your family. How many people are in your family? What do they do? How do you spend time together?", "ar": ""},
    {"title": "My Favorite Food", "en": "Write about a food or meal you love to eat. What is it? How is it made? When do you usually eat it?", "ar": ""},
    {"title": "My Hometown", "en": "Write about the place where you live or grew up. What is it like? What do you like about it?", "ar": ""},
    {"title": "My Free Time", "en": "Write about what you do in your free time. What activities do you enjoy? How often do you do them?", "ar": ""},
    {"title": "My Best Friend", "en": "Write about your best friend. What do they look like? What is their personality? What do you do together?", "ar": ""},
    {"title": "My Favorite Season", "en": "Write about your favorite time of year. What is the weather like? What activities do you enjoy during this season?", "ar": ""},
    {"title": "A Place I Like to Visit", "en": "Write about a place you enjoy visiting, like a park, café, beach, or mall. Why do you like going there?", "ar": ""},
    {"title": "My Weekend", "en": "Write about what you usually do on the weekend. Where do you go? Who do you spend time with?", "ar": ""},
    {"title": "My Job", "en": "Write about your job or the job you want to have. What do you do every day? What do you like about it?", "ar": ""},
    {"title": "My Home", "en": "Write about where you live. How many rooms does your home have? What is your favorite room and why?", "ar": ""},
    {"title": "A Hobby I Enjoy", "en": "Write about a hobby or activity you enjoy. When did you start? How often do you do it? Why do you enjoy it?", "ar": ""},
    {"title": "My Favorite Movie or TV Show", "en": "Write about a movie or TV show you enjoy. What is it about? Why do you like it? Who do you watch it with?", "ar": ""},
    {"title": "Shopping", "en": "Write about how and where you usually shop. Do you prefer shopping online or in stores? What do you like to buy?", "ar": ""},
    {"title": "My Daily Routine", "en": "Write about a typical day in your life from morning to night. What do you do at work or school? What do you do in the evening?", "ar": ""},
  ],
  medium: [
    {"title": "A Trip I Remember", "en": "Write about a trip or holiday you have taken. Where did you go? Who did you go with? What did you see and do? Why do you remember it?", "ar": ""},
    {"title": "Using Technology", "en": "Write about how you use technology in your daily life. What devices do you use? How do they help you at work or at home?", "ar": ""},
    {"title": "A Person I Admire", "en": "Write about a person you admire, such as a family member, teacher, or famous person. What have they done? Why do they inspire you?", "ar": ""},
    {"title": "Healthy Living", "en": "Write about what you do to stay healthy. Do you exercise? What do you eat? How important is health to you?", "ar": ""},
    {"title": "My Favorite Way to Relax", "en": "Write about how you relax after a busy or stressful day. What do you do? How does it help you feel better?", "ar": ""},
    {"title": "Social Media", "en": "Write about how you use social media. Which platforms do you use? How much time do you spend on them? Are they helpful or not?", "ar": ""},
    {"title": "A Skill I Have", "en": "Write about something you are good at. How did you learn it? How do you use it in your life or at work?", "ar": ""},
    {"title": "City Life or Country Life", "en": "Write about whether you prefer living in a city or in the countryside. What are the good and bad sides of each? Which do you prefer and why?", "ar": ""},
    {"title": "Learning English", "en": "Write about why you are learning English. How do you study? What is easy and what is difficult? How will English help you in the future?", "ar": ""},
    {"title": "A Challenge I Faced", "en": "Write about a difficult situation you experienced. What happened? How did you feel? What did you do to solve the problem?", "ar": ""},
    {"title": "My Dream Holiday", "en": "Write about a holiday you would love to take. Where would you go? What would you do there? Who would you travel with?", "ar": ""},
    {"title": "Working with Others", "en": "Write about your experience working or studying with other people. Do you prefer working in a team or alone? Give reasons and examples.", "ar": ""},
    {"title": "A Good Friend", "en": "Write about what makes a good friend. What qualities should a good friend have? Describe a time when a friend helped you.", "ar": ""},
    {"title": "Online Shopping", "en": "Write about your experience with online shopping. What do you buy online? What are the advantages and disadvantages compared to shopping in stores?", "ar": ""},
    {"title": "My Goals", "en": "Write about one or two goals you have for the next year. What do you want to achieve? What steps are you taking to reach these goals?", "ar": ""},
  ],
  hard: [
    {"title": "A Difficult Decision", "en": "Write about a time when you had to make a difficult decision. What were your choices? What did you decide? What happened after?", "ar": ""},
    {"title": "My Dream Job", "en": "Write about the job you would most like to have. What does this job involve? Why does it suit you? What do you need to do to get this job?", "ar": ""},
    {"title": "A Mistake I Made", "en": "Write about a mistake you made at work, school, or in your personal life. What happened? How did you feel? What did you learn from it?", "ar": ""},
    {"title": "Helping Someone", "en": "Write about a time when you helped someone who needed support. What was the situation? What did you do? How did it make you feel?", "ar": ""},
    {"title": "A Change in My Life", "en": "Write about an important change that happened in your life. What changed? How did it affect you? How did you adapt to the new situation?", "ar": ""},
    {"title": "What Makes a Good Employee", "en": "Write about the qualities that make someone a good employee. Think about reliability, communication, attitude, and work ethic. Use examples if you can.", "ar": ""},
    {"title": "Work and Free Time", "en": "Write about how you balance your work or studies with your personal life. How do you make time for things you enjoy? Is this balance difficult to maintain?", "ar": ""},
    {"title": "A Memorable Experience", "en": "Write about an experience that you will never forget. Where were you? What happened? Why was it so important or meaningful to you?", "ar": ""},
    {"title": "Advice for a Job Interview", "en": "Write about the advice you would give to a friend who is going to their first job interview. What should they do before and during the interview?", "ar": ""},
    {"title": "Why Communication Matters", "en": "Write about why good communication is important in everyday life and at work. Give examples of what can go wrong when people do not communicate clearly.", "ar": ""},
    {"title": "Moving to a New Place", "en": "Write about what it would be like to move to a new city or country. What challenges would you face? What would be exciting about starting over?", "ar": ""},
    {"title": "First Day at a New Job", "en": "Write about your first day at a new job or course. How did you feel? What did you do? What did you learn from the experience?", "ar": ""},
    {"title": "A Time I Was Nervous", "en": "Write about a time when you felt very nervous about something. What was the situation? How did you manage your feelings? What happened in the end?", "ar": ""},
    {"title": "A Conversation I Remember", "en": "Write about a conversation that had an impact on you. Who were you talking to? What was it about? How did it change the way you thought or felt?", "ar": ""},
    {"title": "What I Would Change", "en": "Write about one thing you would change about your daily life if you could. What would you change? How would your life be different? Why is this important to you?", "ar": ""},
    {"title": "Customer Service", "en": "Write about a time you experienced good or bad customer service. What happened? How were you treated? What should the person or company have done differently?", "ar": ""},
    {"title": "Making New Friends", "en": "Write about how you make new friends. Is it easy or difficult for you? What do you look for in a friend? Describe a time you made a new friend.", "ar": ""},
    {"title": "A Problem I Solved", "en": "Write about a problem you had to solve at work, school, or at home. What was the problem? What steps did you take? What was the result?", "ar": ""},
    {"title": "Something I Am Proud Of", "en": "Write about something you have done that you are proud of. What did you do? Why did you decide to do it? How did it make you feel when you succeeded?", "ar": ""},
    {"title": "My Career Plans", "en": "Write about your plans for your career in the future. What do you want to do? What skills do you need to develop? What steps are you already taking?", "ar": ""},
  ],
}

export function getNextWritingPrompt(attemptCount = 0, recentKeys = []) {
  const tier = attemptCount < 2 ? 'easy' : attemptCount < 5 ? 'medium' : 'hard';
  const pool = writingPrompts[tier] || writingPrompts.easy;
  const fresh = pool.filter((_, i) => !recentKeys.includes(`${tier}:${i}`));
  const choices = fresh.length > 0 ? fresh : pool;
  const idx = Math.floor(Math.random() * choices.length);
  const chosen = choices[idx];
  const originalIndex = pool.indexOf(chosen);
  return { ...chosen, tier, key: `${tier}:${originalIndex}` };
}


export const writingPromptsBank = writingPrompts
