// api/data/speaking.js — Server-side speaking topics
const speakingTopics = [
  {"en":"My Daily Routine","ar":"روتيني اليومي","prompt":"Describe your typical day from morning to night. What time do you wake up? What activities fill your day? What is the most important part of your routine?"},
  {"en":"My Family","ar":"عائلتي","prompt":"Talk about your family. How many members are there? What do they do? How do you spend time together? What do you appreciate most about your family?"},
  {"en":"My Hobbies","ar":"هواياتي","prompt":"What are your hobbies or interests? How did you start them? How much time do you spend on them each week? Why are they important to you?"},
  {"en":"My Hometown","ar":"مدينتي","prompt":"Describe the city or town where you grew up or live now. What makes it special? What are the best and worst things about living there?"},
  {"en":"Favourite Food","ar":"طعامي المفضل","prompt":"Talk about your favourite food. What is it? How is it made? When do you usually eat it? Is it healthy? Why do you love it?"},
  {"en":"Travel and Holidays","ar":"السفر والعطلات","prompt":"Talk about a trip or holiday you enjoyed. Where did you go? What did you see and do? What made it memorable? Would you go back?"},
  {"en":"Technology in Daily Life","ar":"التكنولوجيا في حياتنا","prompt":"How does technology affect your daily life? What devices do you use most? Do you think technology has made life better or more complicated?"},
  {"en":"Work and Career","ar":"العمل والمهنة","prompt":"Talk about your job or the career you want. What do you do every day at work? What do you enjoy most? What challenges do you face?"},
  {"en":"Health and Exercise","ar":"الصحة والرياضة","prompt":"How do you stay healthy? Do you exercise regularly? What do you do to take care of your body and mind? Is a healthy lifestyle easy or difficult?"},
  {"en":"Education and Learning","ar":"التعليم والتعلم","prompt":"Tell me about your education. What did you study? What was your favourite subject and why? What is the most important thing education taught you?"},
  {"en":"Friendship","ar":"الصداقة","prompt":"What does friendship mean to you? What makes a good friend? Tell me about your best friend and why they are important to you."},
  {"en":"Movies and Entertainment","ar":"الأفلام والترفيه","prompt":"What kind of movies or TV shows do you enjoy? Tell me about one you have watched recently. Why did you like or dislike it?"},
  {"en":"Sport and Physical Activity","ar":"الرياضة","prompt":"Do you play any sport or exercise regularly? What sport do you enjoy most and why? Do you think sport is important? Explain your answer."},
  {"en":"The Environment","ar":"البيئة","prompt":"What environmental problems concern you most? What do you personally do to help protect the environment? What more could people do?"},
  {"en":"Shopping Habits","ar":"عادات التسوق","prompt":"How often do you go shopping? Do you prefer online or in-store shopping? What do you usually buy? Are you a careful spender or do you spend a lot?"},
  {"en":"Social Media","ar":"وسائل التواصل الاجتماعي","prompt":"Which social media platforms do you use? How does social media affect your life and relationships? Do you think it has more advantages or disadvantages?"},
  {"en":"Books and Reading","ar":"الكتب والقراءة","prompt":"Do you enjoy reading? What types of books or articles do you prefer? Tell me about a book that had an impact on you and why."},
  {"en":"Cooking and Food","ar":"الطبخ","prompt":"Do you enjoy cooking? What dishes can you make? Do you cook at home often or prefer eating out? Why is home cooking important to you?"},
  {"en":"Transport and Getting Around","ar":"المواصلات","prompt":"How do you get around your city every day? Do you prefer public transport, driving, or walking? What are the advantages and disadvantages of each?"},
  {"en":"Learning English","ar":"تعلم الإنجليزية","prompt":"Why are you learning English? How long have you been studying it? What is the hardest part? What methods help you learn best?"},
  {"en":"Childhood Memories","ar":"ذكريات الطفولة","prompt":"Tell me about a happy memory from your childhood. Where were you? What happened? Why do you still remember it? How did it shape who you are today?"},
  {"en":"Future Plans","ar":"خططي للمستقبل","prompt":"What are your plans for the next five years? What do you hope to achieve professionally and personally? What steps are you taking to reach your goals?"},
  {"en":"Pets and Animals","ar":"الحيوانات الأليفة","prompt":"Do you have or have you ever had a pet? What is your favourite animal and why? Do you think keeping pets is a good idea?"},
  {"en":"Money and Saving","ar":"المال والادخار","prompt":"How do you manage your money? Is it easy or difficult to save? What do you spend most of your money on? Do you think financial planning is important?"},
  {"en":"Weather and Seasons","ar":"الطقس والفصول","prompt":"What is the weather like where you live? Which season do you prefer and why? How does the weather affect your mood and daily activities?"},
  {"en":"Music","ar":"الموسيقى","prompt":"What type of music do you enjoy most? Do you play any musical instruments? How does music affect your mood? Can you live without music?"},
  {"en":"Weekend Activities","ar":"أنشطة عطلة نهاية الأسبوع","prompt":"How do you usually spend your weekends? Do you prefer relaxing at home or going out? What is your ideal weekend? Why?"},
  {"en":"Home and Living","ar":"المنزل والمعيشة","prompt":"Describe your home. What do you like about where you live? What would your ideal home look like? Is location or size more important to you?"},
  {"en":"Celebrations and Traditions","ar":"الاحتفالات والتقاليد","prompt":"What celebrations or traditions are important in your family or culture? How do you usually celebrate? What makes these occasions special?"},
  {"en":"Work-Life Balance","ar":"التوازن بين العمل والحياة","prompt":"How do you balance work or study with your personal life? Is it difficult to switch off? What helps you relax and recharge after a busy day?"}
]


export default speakingTopics
