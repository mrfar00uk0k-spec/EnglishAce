import json

# ── GRAMMAR (50 questions) ───────────────────────────────────────────────────
grammar = [
  {"id":1, "question":"She _____ to the gym every morning before work.", "options":{"a":"go","b":"goes","c":"going","d":"gone"}, "answer":"b", "explanation":"Third-person singular present simple requires 's'."},
  {"id":2, "question":"By the time we arrived, the film _____ already started.", "options":{"a":"has","b":"have","c":"had","d":"was"}, "answer":"c", "explanation":"Past perfect for an action completed before another past action."},
  {"id":3, "question":"I haven't seen him _____ last Monday.", "options":{"a":"for","b":"since","c":"ago","d":"from"}, "answer":"b", "explanation":"'Since' is used with a specific point in time with present perfect."},
  {"id":4, "question":"Neither the manager nor the employees _____ aware of the change.", "options":{"a":"was","b":"were","c":"is","d":"has been"}, "answer":"b", "explanation":"With 'neither…nor', the verb agrees with the closer subject."},
  {"id":5, "question":"If I _____ you, I would apologise immediately.", "options":{"a":"am","b":"was","c":"were","d":"be"}, "answer":"c", "explanation":"Second conditional uses 'were' for all subjects."},
  {"id":6, "question":"The report needs _____ before the deadline.", "options":{"a":"to submit","b":"submitting","c":"to be submitted","d":"submit"}, "answer":"c", "explanation":"'Needs to be submitted' is the correct passive infinitive."},
  {"id":7, "question":"He suggested _____ the meeting until next week.", "options":{"a":"to postpone","b":"postponing","c":"postpone","d":"postponed"}, "answer":"b", "explanation":"'Suggest' is followed by a gerund."},
  {"id":8, "question":"This is the building _____ they filmed the movie.", "options":{"a":"which","b":"who","c":"where","d":"whose"}, "answer":"c", "explanation":"'Where' is used for places in relative clauses."},
  {"id":9, "question":"She asked me _____ I had finished the project yet.", "options":{"a":"if","b":"that","c":"what","d":"which"}, "answer":"a", "explanation":"Indirect yes/no questions use 'if' or 'whether'."},
  {"id":10,"question":"You _____ bring an umbrella — it is going to rain heavily.", "options":{"a":"should","b":"must","c":"might","d":"ought"}, "answer":"a", "explanation":"'Should' gives advice."},
  {"id":11,"question":"The children _____ playing in the garden when it started to rain.", "options":{"a":"were","b":"are","c":"was","d":"had"}, "answer":"a", "explanation":"Past continuous describes an action in progress at a past time."},
  {"id":12,"question":"_____ of the two candidates was considered suitable for the job.", "options":{"a":"Neither","b":"None","c":"Both","d":"Either"}, "answer":"a", "explanation":"'Neither' is used for exactly two things in a negative sense."},
  {"id":13,"question":"The package _____ to the wrong address yesterday.", "options":{"a":"delivered","b":"was delivered","c":"has delivered","d":"delivers"}, "answer":"b", "explanation":"Passive voice: was + past participle."},
  {"id":14,"question":"He has been working here _____ five years.", "options":{"a":"since","b":"for","c":"ago","d":"during"}, "answer":"b", "explanation":"'For' is used with a duration of time."},
  {"id":15,"question":"I wish I _____ harder when I was at school.", "options":{"a":"studied","b":"had studied","c":"study","d":"have studied"}, "answer":"b", "explanation":"'Wish + past perfect' expresses regret about the past."},
  {"id":16,"question":"I _____ her three times before she finally answered.", "options":{"a":"called","b":"have called","c":"had called","d":"was calling"}, "answer":"c", "explanation":"Past perfect shows the action was completed before another past event."},
  {"id":17,"question":"If she _____ the instructions, the machine wouldn't have broken.", "options":{"a":"followed","b":"would follow","c":"had followed","d":"follows"}, "answer":"c", "explanation":"Third conditional uses 'had + past participle' in the if-clause."},
  {"id":18,"question":"He said that he _____ the report the following day.", "options":{"a":"will submit","b":"would submit","c":"submits","d":"submitted"}, "answer":"b", "explanation":"Reported speech shifts future 'will' to 'would'."},
  {"id":19,"question":"The conference takes place _____ the 15th of March.", "options":{"a":"in","b":"at","c":"on","d":"by"}, "answer":"c", "explanation":"'On' is used with specific dates."},
  {"id":20,"question":"She plays _____ piano beautifully.", "options":{"a":"a","b":"an","c":"the","d":"no article"}, "answer":"c", "explanation":"'The' is used before musical instruments."},
  {"id":21,"question":"This project is _____ complex than the previous one.", "options":{"a":"more","b":"most","c":"very","d":"too"}, "answer":"a", "explanation":"'More' is used to form the comparative of multi-syllable adjectives."},
  {"id":22,"question":"She is _____ student in the entire programme.", "options":{"a":"a brightest","b":"the most bright","c":"the brightest","d":"most brightest"}, "answer":"c", "explanation":"Superlative of one-syllable adjectives: the + adjective + -est."},
  {"id":23,"question":"The deadline _____ be extended under any circumstances.", "options":{"a":"cannot","b":"could not","c":"will not","d":"should not"}, "answer":"a", "explanation":"'Cannot' expresses impossibility or prohibition."},
  {"id":24,"question":"She _____ up the proposal and presented it to the board.", "options":{"a":"drew","b":"made","c":"did","d":"came"}, "answer":"a", "explanation":"'Draw up' means to prepare a formal document or plan."},
  {"id":25,"question":"The project failed _____ poor planning.", "options":{"a":"due to","b":"although","c":"even though","d":"despite"}, "answer":"a", "explanation":"'Due to' introduces a noun phrase showing cause."},
  {"id":26,"question":"By next June, they _____ on this project for two years.", "options":{"a":"will work","b":"will have worked","c":"would work","d":"are working"}, "answer":"b", "explanation":"Future perfect for an action completed by a specific future time."},
  {"id":27,"question":"If he _____ harder in school, he might have a better job now.", "options":{"a":"works","b":"had worked","c":"would work","d":"worked"}, "answer":"b", "explanation":"Mixed conditional: past condition affecting present result."},
  {"id":28,"question":"There is _____ information available on this topic.", "options":{"a":"few","b":"a few","c":"little","d":"a little"}, "answer":"c", "explanation":"'Little' (without 'a') means almost none, used with uncountable nouns."},
  {"id":29,"question":"You have met her before, _____ you?", "options":{"a":"haven't","b":"didn't","c":"don't","d":"had"}, "answer":"a", "explanation":"Question tags use the auxiliary from the main clause in opposite polarity."},
  {"id":30,"question":"_____ was the new product that everyone wanted to try it.", "options":{"a":"So innovative","b":"It was so innovative","c":"Such innovative it","d":"How innovative"}, "answer":"b", "explanation":"Cleft sentence: 'It was so + adjective + that...'"},
  {"id":31,"question":"Never _____ such an impressive performance.", "options":{"a":"I have seen","b":"have I seen","c":"I saw","d":"saw I"}, "answer":"b", "explanation":"Inversion is required after negative adverbs like 'never' at the start of a clause."},
  {"id":32,"question":"The presentation was _____ impressive that the investors immediately agreed.", "options":{"a":"so","b":"such","c":"very","d":"too"}, "answer":"a", "explanation":"'So + adjective + that' shows result or degree."},
  {"id":33,"question":"The manager explained _____ the new system would work.", "options":{"a":"what","b":"that","c":"how","d":"which"}, "answer":"c", "explanation":"'How' introduces a noun clause describing the manner of something."},
  {"id":34,"question":"_____ she arrived at the office, she checked her emails.", "options":{"a":"While","b":"By the time","c":"As soon as","d":"Until"}, "answer":"c", "explanation":"'As soon as' introduces an adverbial clause of time meaning immediately when."},
  {"id":35,"question":"She managed _____ the problem before the client noticed.", "options":{"a":"solving","b":"to solve","c":"solve","d":"solved"}, "answer":"b", "explanation":"'Manage' is followed by 'to + infinitive'."},
  {"id":36,"question":"They _____ in this apartment since January.", "options":{"a":"are living","b":"live","c":"have been living","d":"lived"}, "answer":"c", "explanation":"Present perfect continuous for an ongoing action that started in the past."},
  {"id":37,"question":"He _____ on the report for three hours when the power went out.", "options":{"a":"worked","b":"has worked","c":"had been working","d":"was working"}, "answer":"c", "explanation":"Past perfect continuous for an action in progress before another past event."},
  {"id":38,"question":"She _____ her car repaired at the local garage.", "options":{"a":"did","b":"made","c":"had","d":"got"}, "answer":"c", "explanation":"Causative 'have': subject + have + object + past participle."},
  {"id":39,"question":"The committee _____ unable to reach a decision.", "options":{"a":"were","b":"are","c":"was","d":"have been"}, "answer":"c", "explanation":"In American English, collective nouns take a singular verb."},
  {"id":40,"question":"She is very interested _____ pursuing a career in finance.", "options":{"a":"to","b":"in","c":"for","d":"at"}, "answer":"b", "explanation":"'Interested in' is followed by a gerund."},
  {"id":41,"question":"He passed the exam; _____, he still did not get the promotion.", "options":{"a":"therefore","b":"however","c":"consequently","d":"moreover"}, "answer":"b", "explanation":"'However' shows contrast between two statements."},
  {"id":42,"question":"This time next week, I _____ on a beach in Spain.", "options":{"a":"will sit","b":"will be sitting","c":"sit","d":"would sit"}, "answer":"b", "explanation":"Future continuous describes an action in progress at a specific future time."},
  {"id":43,"question":"It _____ that the new policy will be announced next week.", "options":{"a":"expects","b":"is expected","c":"expected","d":"has expected"}, "answer":"b", "explanation":"Passive reporting verb: 'It is expected that...'"},
  {"id":44,"question":"She blamed _____ for the mistake.", "options":{"a":"her","b":"herself","c":"she","d":"hers"}, "answer":"b", "explanation":"Reflexive pronoun 'herself' is used when the subject and object refer to the same person."},
  {"id":45,"question":"It was a _____ meeting that lasted all morning.", "options":{"a":"four-hours","b":"four hour","c":"four-hour","d":"four hours"}, "answer":"c", "explanation":"Compound adjectives used before a noun are hyphenated."},
  {"id":46,"question":"_____ honesty is the best policy is widely accepted.", "options":{"a":"A","b":"An","c":"The","d":"no article"}, "answer":"d", "explanation":"No article is used before abstract nouns used in a general sense."},
  {"id":47,"question":"The more she practised, _____ she became.", "options":{"a":"the more confident","b":"more confident","c":"the most confident","d":"most confident"}, "answer":"a", "explanation":"Double comparatives follow the pattern 'the more... the more...'"},
  {"id":48,"question":"The CEO presented the strategy, reviewed the budget, and _____ the team.", "options":{"a":"motivating","b":"to motivate","c":"motivated","d":"had motivated"}, "answer":"c", "explanation":"Parallel structure requires the same grammatical form in a series."},
  {"id":49,"question":"She is very proud _____ her achievements.", "options":{"a":"of","b":"for","c":"about","d":"at"}, "answer":"a", "explanation":"'Proud of' is the correct preposition collocation."},
  {"id":50,"question":"The board insisted that every employee _____ the new policy.", "options":{"a":"follows","b":"follow","c":"followed","d":"has followed"}, "answer":"b", "explanation":"The subjunctive mood requires the base form after 'insist that'."},
]

# ── VOCABULARY (50 questions) ────────────────────────────────────────────────
vocab = [
  {"id":1, "question":"The doctor told him to _____ sugar and fatty foods to stay healthy.", "options":{"a":"avoid","b":"accept","c":"attend","d":"admit"}, "answer":"a", "explanation":"'Avoid' means to stay away from something."},
  {"id":2, "question":"Her presentation was so _____ that everyone fell asleep.", "options":{"a":"fascinating","b":"boring","c":"exciting","d":"brilliant"}, "answer":"b", "explanation":"'Boring' means uninteresting or dull."},
  {"id":3, "question":"The company decided to _____ its staff by hiring 50 new employees.", "options":{"a":"reduce","b":"expand","c":"dismiss","d":"replace"}, "answer":"b", "explanation":"'Expand' means to increase in size or number."},
  {"id":4, "question":"Please _____ the form carefully before you sign it.", "options":{"a":"ignore","b":"destroy","c":"read","d":"forget"}, "answer":"c", "explanation":"'Read' is correct in the context of reviewing a form."},
  {"id":5, "question":"He was very _____ about his plans — he did not tell anyone.", "options":{"a":"secretive","b":"generous","c":"talkative","d":"honest"}, "answer":"a", "explanation":"'Secretive' means keeping things private."},
  {"id":6, "question":"The new policy had a major _____ on the company profits.", "options":{"a":"reason","b":"impact","c":"journey","d":"method"}, "answer":"b", "explanation":"'Impact' means effect or influence."},
  {"id":7, "question":"She _____ the offer because the salary was too low.", "options":{"a":"accepted","b":"welcomed","c":"rejected","d":"celebrated"}, "answer":"c", "explanation":"'Rejected' means refused or turned down."},
  {"id":8, "question":"The word 'exhausted' is closest in meaning to:", "options":{"a":"energetic","b":"bored","c":"very tired","d":"angry"}, "answer":"c", "explanation":"'Exhausted' means extremely tired."},
  {"id":9, "question":"To 'negotiate' means to:", "options":{"a":"argue loudly","b":"discuss to reach an agreement","c":"refuse to talk","d":"demand something"}, "answer":"b", "explanation":"'Negotiate' means to discuss in order to reach an agreement."},
  {"id":10,"question":"The opposite of 'temporary' is:", "options":{"a":"short","b":"brief","c":"permanent","d":"fast"}, "answer":"c", "explanation":"'Permanent' means lasting forever."},
  {"id":11,"question":"Choose the correct word: He was _____ to learn that he had passed the exam.", "options":{"a":"delighted","b":"frightened","c":"confused","d":"disappointed"}, "answer":"a", "explanation":"'Delighted' means very pleased or happy."},
  {"id":12,"question":"A 'colleague' is someone who:", "options":{"a":"lives next to you","b":"works with you","c":"studies with you","d":"competes against you"}, "answer":"b", "explanation":"'Colleague' refers to a fellow worker."},
  {"id":13,"question":"The word 'brief' is closest in meaning to:", "options":{"a":"long","b":"important","c":"short","d":"unclear"}, "answer":"c", "explanation":"'Brief' means lasting a short time."},
  {"id":14,"question":"To 'achieve' a goal means to:", "options":{"a":"forget it","b":"change it","c":"succeed in reaching it","d":"give it up"}, "answer":"c", "explanation":"'Achieve' means to successfully reach a goal."},
  {"id":15,"question":"Choose the best word: She gave a very _____ speech that moved the audience to tears.", "options":{"a":"confusing","b":"emotional","c":"technical","d":"quiet"}, "answer":"b", "explanation":"'Emotional' fits a speech that moved people."},
  {"id":16,"question":"The word 'transparent' most closely means:", "options":{"a":"hidden","b":"open and honest","c":"expensive","d":"complicated"}, "answer":"b", "explanation":"'Transparent' means open, honest, and not secretive."},
  {"id":17,"question":"Which sentence uses 'make up' correctly?", "options":{"a":"I need to make up for being late","b":"She makes up to the store","c":"He made up early this morning","d":"They made up the bus"}, "answer":"a", "explanation":"'Make up for' means to compensate for something."},
  {"id":18,"question":"The antonym of 'generous' is:", "options":{"a":"kind","b":"wealthy","c":"mean","d":"cheerful"}, "answer":"c", "explanation":"'Mean' or 'stingy' is the opposite of 'generous'."},
  {"id":19,"question":"Choose the correct collocation: She _____ a decision after much thought.", "options":{"a":"did","b":"made","c":"took","d":"had"}, "answer":"b", "explanation":"'Make a decision' is the standard collocation."},
  {"id":20,"question":"The word 'meticulous' means:", "options":{"a":"careless","b":"fast","c":"very careful and precise","d":"creative"}, "answer":"c", "explanation":"'Meticulous' means showing great attention to detail."},
  {"id":21,"question":"Which word best completes the sentence: The manager gave a _____ explanation of the new process.", "options":{"a":"blurry","b":"comprehensive","c":"narrow","d":"hollow"}, "answer":"b", "explanation":"'Comprehensive' means complete and covering all aspects."},
  {"id":22,"question":"To 'allocate' resources means to:", "options":{"a":"waste them","b":"hide them","c":"assign them for a specific purpose","d":"reduce them"}, "answer":"c", "explanation":"'Allocate' means to distribute or assign resources."},
  {"id":23,"question":"Which word is a synonym for 'substantial'?", "options":{"a":"tiny","b":"significant","c":"doubtful","d":"rapid"}, "answer":"b", "explanation":"'Substantial' means large in size, value, or importance."},
  {"id":24,"question":"The phrasal verb 'carry out' means to:", "options":{"a":"refuse a task","b":"perform or complete a task","c":"delay something","d":"cancel a plan"}, "answer":"b", "explanation":"'Carry out' means to complete or perform an action."},
  {"id":25,"question":"Which word correctly fills the blank: He was _____ by the complexity of the problem.", "options":{"a":"delighted","b":"overwhelmed","c":"bored","d":"organised"}, "answer":"b", "explanation":"'Overwhelmed' means feeling unable to cope with something."},
  {"id":26,"question":"The word 'concise' means:", "options":{"a":"long and detailed","b":"unclear","c":"brief and to the point","d":"formal"}, "answer":"c", "explanation":"'Concise' means expressing ideas clearly in few words."},
  {"id":27,"question":"Choose the correct collocation: The team _____ a thorough investigation.", "options":{"a":"made","b":"did","c":"conducted","d":"had"}, "answer":"c", "explanation":"'Conduct an investigation' is the standard collocation."},
  {"id":28,"question":"What does 'proficient' mean?", "options":{"a":"very skilled at something","b":"not interested","c":"poorly trained","d":"newly hired"}, "answer":"a", "explanation":"'Proficient' means highly skilled or competent."},
  {"id":29,"question":"The opposite of 'lenient' is:", "options":{"a":"gentle","b":"kind","c":"strict","d":"flexible"}, "answer":"c", "explanation":"'Strict' is the opposite of 'lenient'."},
  {"id":30,"question":"Which word best replaces 'said' in a formal report: The director _____ that sales had increased.", "options":{"a":"told","b":"stated","c":"whispered","d":"chatted"}, "answer":"b", "explanation":"'Stated' is the most formal and appropriate verb in a report."},
  {"id":31,"question":"The word 'ambiguous' means:", "options":{"a":"very clear","b":"open to more than one interpretation","c":"completely wrong","d":"highly specific"}, "answer":"b", "explanation":"'Ambiguous' means unclear or open to multiple interpretations."},
  {"id":32,"question":"Which phrasal verb means to 'investigate or look for information'?", "options":{"a":"look up","b":"look down","c":"look out","d":"look away"}, "answer":"a", "explanation":"'Look up' means to search for information."},
  {"id":33,"question":"The word 'incentive' is closest in meaning to:", "options":{"a":"penalty","b":"obstacle","c":"motivation or reward","d":"instruction"}, "answer":"c", "explanation":"An 'incentive' is something that motivates action."},
  {"id":34,"question":"Which word correctly completes: The new law will _____ companies to report their emissions.", "options":{"a":"allow","b":"prevent","c":"require","d":"suggest"}, "answer":"c", "explanation":"'Require' means to make something obligatory."},
  {"id":35,"question":"The antonym of 'accelerate' is:", "options":{"a":"speed up","b":"decelerate","c":"maintain","d":"increase"}, "answer":"b", "explanation":"'Decelerate' means to slow down."},
  {"id":36,"question":"'To take something for granted' means to:", "options":{"a":"appreciate it fully","b":"study it carefully","c":"not appreciate its value","d":"give it away"}, "answer":"c", "explanation":"'Take for granted' means to not appreciate something properly."},
  {"id":37,"question":"Which word best describes someone who is always on time?", "options":{"a":"negligent","b":"punctual","c":"absent","d":"delayed"}, "answer":"b", "explanation":"'Punctual' means arriving exactly on time."},
  {"id":38,"question":"Choose the correct usage: The contract was _____ after both parties signed.", "options":{"a":"terminated","b":"finalised","c":"ignored","d":"postponed"}, "answer":"b", "explanation":"'Finalised' means completed or made official."},
  {"id":39,"question":"The word 'diverse' is closest in meaning to:", "options":{"a":"identical","b":"limited","c":"varied","d":"boring"}, "answer":"c", "explanation":"'Diverse' means showing a great deal of variety."},
  {"id":40,"question":"Which sentence uses 'run out of' correctly?", "options":{"a":"We ran out of milk so I bought some more","b":"She ran out of the car yesterday","c":"He ran out of his job","d":"They ran out to a meeting"}, "answer":"a", "explanation":"'Run out of' means to have no more of something."},
  {"id":41,"question":"The word 'scrutinise' means to:", "options":{"a":"ignore carefully","b":"examine closely","c":"approve quickly","d":"copy exactly"}, "answer":"b", "explanation":"'Scrutinise' means to examine or inspect very closely."},
  {"id":42,"question":"Which word means 'to officially end a law or agreement'?", "options":{"a":"establish","b":"introduce","c":"abolish","d":"maintain"}, "answer":"c", "explanation":"'Abolish' means to formally put an end to something."},
  {"id":43,"question":"The correct collocation is: She has a strong _____ for detail.", "options":{"a":"eye","b":"ear","c":"sense","d":"hand"}, "answer":"a", "explanation":"'An eye for detail' means the ability to notice small details."},
  {"id":44,"question":"What does the idiom 'hit the nail on the head' mean?", "options":{"a":"to cause an accident","b":"to say something exactly right","c":"to work very hard","d":"to miss an opportunity"}, "answer":"b", "explanation":"'Hit the nail on the head' means to say or do something exactly correct."},
  {"id":45,"question":"The word 'feasible' means:", "options":{"a":"impossible","b":"expensive","c":"possible and practical","d":"complicated"}, "answer":"c", "explanation":"'Feasible' means capable of being done or likely to succeed."},
  {"id":46,"question":"Which word correctly completes: The new CEO aims to _____ a culture of innovation.", "options":{"a":"destroy","b":"foster","c":"reduce","d":"ignore"}, "answer":"b", "explanation":"'Foster' means to encourage the development of something."},
  {"id":47,"question":"The antonym of 'diminish' is:", "options":{"a":"reduce","b":"shrink","c":"increase","d":"simplify"}, "answer":"c", "explanation":"'Increase' is the opposite of 'diminish' which means to make smaller."},
  {"id":48,"question":"'To be on the fence' about something means:", "options":{"a":"to be very sure","b":"to feel unsafe","c":"to be undecided","d":"to strongly disagree"}, "answer":"c", "explanation":"'On the fence' means undecided or neutral about something."},
  {"id":49,"question":"Which sentence uses 'infer' correctly?", "options":{"a":"She inferred that she was upset from her silence","b":"He inferred the instructions to his team","c":"They inferred the meeting for tomorrow","d":"I inferred her name from the list"}, "answer":"a", "explanation":"'Infer' means to conclude from evidence, not from being told directly."},
  {"id":50,"question":"The word 'unprecedented' means:", "options":{"a":"very common","b":"expected","c":"never having happened before","d":"well-documented"}, "answer":"c", "explanation":"'Unprecedented' means never done or known before."},
]

# ── LISTENING (50 items) ─────────────────────────────────────────────────────
listening = [
  {"sentence":"I will call you later.", "difficulty":"easy"},
  {"sentence":"The meeting starts at nine.", "difficulty":"easy"},
  {"sentence":"She works in customer service.", "difficulty":"easy"},
  {"sentence":"Can you repeat that please?", "difficulty":"easy"},
  {"sentence":"I forgot my password yesterday.", "difficulty":"easy"},
  {"sentence":"The customer sounds upset.", "difficulty":"medium"},
  {"sentence":"Please send me the email.", "difficulty":"easy"},
  {"sentence":"Our office closes at five.", "difficulty":"easy"},
  {"sentence":"Thank you for your patience.", "difficulty":"easy"},
  {"sentence":"I need to speak with your manager.", "difficulty":"medium"},
  {"sentence":"Your order will arrive in three days.", "difficulty":"medium"},
  {"sentence":"We apologize for any inconvenience.", "difficulty":"medium"},
  {"sentence":"Please hold while I check your account.", "difficulty":"medium"},
  {"sentence":"I have been working here for two years.", "difficulty":"medium"},
  {"sentence":"The system is currently being updated.", "difficulty":"medium"},
  {"sentence":"Good morning, how may I assist you today?", "difficulty":"easy"},
  {"sentence":"Please provide your account number.", "difficulty":"easy"},
  {"sentence":"Your request has been successfully processed.", "difficulty":"medium"},
  {"sentence":"I understand your concern and I will help you.", "difficulty":"medium"},
  {"sentence":"Could you please hold for just a moment?", "difficulty":"easy"},
  {"sentence":"I am transferring your call to the relevant department.", "difficulty":"medium"},
  {"sentence":"The package was delivered to the wrong address.", "difficulty":"medium"},
  {"sentence":"We have updated our privacy policy recently.", "difficulty":"medium"},
  {"sentence":"Your subscription will renew automatically next month.", "difficulty":"medium"},
  {"sentence":"The technical team is currently looking into the issue.", "difficulty":"hard"},
  {"sentence":"I would like to escalate this matter to my supervisor.", "difficulty":"hard"},
  {"sentence":"Could you confirm the email address associated with your account?", "difficulty":"medium"},
  {"sentence":"We are unable to process refunds after thirty days of purchase.", "difficulty":"hard"},
  {"sentence":"Your feedback is very important to us and helps us improve.", "difficulty":"medium"},
  {"sentence":"I appreciate your patience while we resolve this issue.", "difficulty":"medium"},
  {"sentence":"The promotion is valid until the end of this calendar month.", "difficulty":"hard"},
  {"sentence":"Please be aware that this call may be recorded for training purposes.", "difficulty":"hard"},
  {"sentence":"We will send you a confirmation email within twenty-four hours.", "difficulty":"hard"},
  {"sentence":"I have raised a ticket and our team will contact you shortly.", "difficulty":"hard"},
  {"sentence":"The warranty on this product covers manufacturing defects only.", "difficulty":"hard"},
  {"sentence":"You can track your order using the reference number provided.", "difficulty":"medium"},
  {"sentence":"Our customer support team is available around the clock.", "difficulty":"medium"},
  {"sentence":"I am afraid that option is not available in your current plan.", "difficulty":"hard"},
  {"sentence":"We have processed your cancellation request as of today.", "difficulty":"hard"},
  {"sentence":"Please allow three to five business days for the refund to appear.", "difficulty":"hard"},
  {"sentence":"He turned off the lights before leaving.", "difficulty":"easy"},
  {"sentence":"She is the most experienced person on our team.", "difficulty":"medium"},
  {"sentence":"We need to reschedule the appointment.", "difficulty":"easy"},
  {"sentence":"The company launched a new product last quarter.", "difficulty":"medium"},
  {"sentence":"Employees are required to complete the annual training.", "difficulty":"hard"},
  {"sentence":"The deadline for applications is the end of next week.", "difficulty":"medium"},
  {"sentence":"Could you clarify what you mean by that?", "difficulty":"easy"},
  {"sentence":"Our records show that your payment is overdue.", "difficulty":"hard"},
  {"sentence":"I will make sure this issue is resolved by end of business today.", "difficulty":"hard"},
  {"sentence":"The manager reviewed the proposal and approved it with minor changes.", "difficulty":"hard"},
]

# ── READING (50 passages) ─────────────────────────────────────────────────────
reading = [
  # ID 1-3 already exist, start from 4
  {
    "id":4,"title":"Time Management at Work","category":"Work",
    "text":"Good time management is essential for success in any job. Workers who manage their time well are able to complete more tasks, meet deadlines, and feel less stressed. One effective method is to create a to-do list at the start of each day. Writing down your tasks helps you remember them and allows you to prioritize the most important ones. Another useful technique is to avoid distractions such as social media and unnecessary meetings. When you focus on one task at a time, you work more efficiently and make fewer mistakes. Managers often value employees who can organize their time without being told what to do.",
    "questions":[
      {"q":"What is one benefit of good time management?","options":["Meeting more people","Completing more tasks","Working more hours","Earning more money"],"answer":1},
      {"q":"What does a to-do list help workers do?","options":["Make phone calls","Prioritize important tasks","Avoid their manager","Work from home"],"answer":1},
      {"q":"What should workers avoid to manage time better?","options":["Email","Distractions like social media","Coffee breaks","Team meetings"],"answer":1},
      {"q":"What do managers value in employees?","options":["Those who work long hours","Those who ask for help always","Those who organize time independently","Those who never take breaks"],"answer":2},
    ]
  },
  {
    "id":5,"title":"Body Language in the Workplace","category":"Communication",
    "text":"Body language is a form of non-verbal communication that plays an important role in professional settings. The way you sit, stand, and make eye contact can influence how others perceive you. For example, sitting up straight signals confidence and professionalism, while crossed arms may appear defensive or closed off. Eye contact shows that you are engaged and interested in the conversation. A firm handshake creates a positive first impression during interviews or business meetings. Studies suggest that body language accounts for a large percentage of how we communicate, sometimes more than our actual words.",
    "questions":[
      {"q":"What does sitting up straight signal?","options":["Boredom","Confidence and professionalism","Nervousness","Agreement"],"answer":1},
      {"q":"What can crossed arms appear to communicate?","options":["Confidence","Interest","Defensiveness","Agreement"],"answer":2},
      {"q":"What does eye contact show?","options":["Aggression","Boredom","That you are engaged","That you are tired"],"answer":2},
      {"q":"According to the passage, what creates a positive first impression?","options":["Smiling widely","A firm handshake","Sitting quietly","Speaking loudly"],"answer":1},
    ]
  },
  {
    "id":6,"title":"Remote Work Challenges","category":"Work",
    "text":"Working from home has become increasingly common in recent years. While it offers many benefits such as flexibility and no commute, it also presents unique challenges. Many remote workers struggle with maintaining a clear boundary between their professional and personal lives. Without the physical separation of an office, it can be difficult to switch off from work at the end of the day. Isolation is another concern, as remote employees may feel disconnected from their colleagues and company culture. Effective communication tools and regular virtual meetings can help address these issues, but they require discipline and effort from both managers and employees.",
    "questions":[
      {"q":"What is one benefit of working from home?","options":["More meetings","No commute","Better salary","Larger desk"],"answer":1},
      {"q":"What challenge do many remote workers face?","options":["Too many office parties","Maintaining work-life boundaries","Lack of technology","Long commutes"],"answer":1},
      {"q":"Why might remote employees feel isolated?","options":["They work too many hours","They earn less money","They feel disconnected from colleagues","They have no internet"],"answer":2},
      {"q":"What can help address remote work challenges?","options":["Longer working hours","Regular virtual meetings","Working in silence","Reducing breaks"],"answer":1},
    ]
  },
  {
    "id":7,"title":"The Growth of E-Learning","category":"Education",
    "text":"E-learning has transformed the way people access education around the world. Online platforms allow learners of all ages to study new subjects, earn qualifications, and develop professional skills from the comfort of their homes. Unlike traditional classroom learning, e-learning offers flexibility in terms of when and where students study. This makes it particularly valuable for working adults who cannot attend regular classes. However, e-learning also has drawbacks. Students may lack motivation without the structure of a classroom environment, and technical issues can disrupt the learning experience. Despite these challenges, the e-learning industry continues to grow rapidly.",
    "questions":[
      {"q":"What has e-learning transformed?","options":["Transportation","The way people access education","Healthcare","Banking"],"answer":1},
      {"q":"Why is e-learning valuable for working adults?","options":["It is free","It offers flexible study times","It is faster than school","It provides physical books"],"answer":1},
      {"q":"What is one drawback of e-learning mentioned?","options":["Too many teachers","Lack of motivation without classroom structure","Too expensive","Too many assignments"],"answer":1},
      {"q":"Which word in the passage means 'increasing quickly'?","options":["valuable","drawbacks","flexible","rapidly"],"answer":3},
    ]
  },
  {
    "id":8,"title":"The Importance of Sleep","category":"Health",
    "text":"Sleep is one of the most important factors for good health, yet many people do not get enough of it. Adults need between seven and nine hours of sleep per night to function properly. During sleep, the body repairs itself, the brain processes information, and the immune system strengthens. People who regularly get insufficient sleep are more likely to experience health problems such as obesity, heart disease, and depression. Poor sleep also affects concentration, decision-making, and emotional stability during the day. Experts recommend maintaining a consistent sleep schedule, avoiding screens before bed, and creating a calm sleep environment.",
    "questions":[
      {"q":"How many hours of sleep do adults typically need?","options":["Five to six hours","Seven to nine hours","Ten to twelve hours","Four to five hours"],"answer":1},
      {"q":"What does the body do during sleep?","options":["Exercise and grow","Repair itself and process information","Produce more energy","Increase blood pressure"],"answer":1},
      {"q":"What problem can result from insufficient sleep?","options":["Better concentration","Weight loss","Depression and heart disease","Stronger immune system"],"answer":2},
      {"q":"What do experts recommend before bed?","options":["Exercising intensely","Watching television","Avoiding screens","Eating a large meal"],"answer":2},
    ]
  },
  {
    "id":9,"title":"Recycling and the Environment","category":"Environment",
    "text":"Recycling is the process of converting waste materials into new products. It helps reduce the amount of rubbish sent to landfills and conserves natural resources such as timber, water, and minerals. Recycling also saves energy because it requires less energy to produce a product from recycled materials than from raw materials. For example, recycling aluminium uses ninety-five percent less energy than producing it from scratch. Despite these clear benefits, recycling rates in many countries remain low due to a lack of public awareness and inadequate recycling facilities. Governments and communities need to invest in education and infrastructure to encourage more sustainable behaviour.",
    "questions":[
      {"q":"What does recycling convert waste into?","options":["Landfills","New products","Raw materials","Energy"],"answer":1},
      {"q":"Why does recycling save energy?","options":["Because factories work less","Because raw materials are not needed","Because recycled products require less energy to make","Because waste is burned"],"answer":2},
      {"q":"How much less energy does recycling aluminium use?","options":["Fifty percent less","Seventy percent less","Ninety-five percent less","Twenty percent less"],"answer":2},
      {"q":"What is one reason recycling rates remain low?","options":["Too many factories","Lack of public awareness","Too much recycled material","High costs of products"],"answer":1},
    ]
  },
  {
    "id":10,"title":"Customer Loyalty Programmes","category":"Business",
    "text":"Customer loyalty programmes are marketing strategies designed to encourage repeat business by rewarding customers for their purchases. Points-based systems, discount cards, and exclusive membership benefits are common examples. These programmes benefit both businesses and consumers. Companies gain a stable customer base, higher revenue, and valuable data about buying habits. Customers, in turn, enjoy discounts, free products, and personalised offers. Research shows that retaining an existing customer is significantly cheaper than acquiring a new one, which is why loyalty programmes are a priority for many retailers and service providers. However, the success of such programmes depends on whether the rewards genuinely reflect customer needs.",
    "questions":[
      {"q":"What is the main purpose of customer loyalty programmes?","options":["To attract new customers only","To encourage repeat business","To increase product prices","To reduce company costs"],"answer":1},
      {"q":"What do companies gain from loyalty programmes?","options":["Fewer staff","Valuable customer data and higher revenue","Lower operating costs","Government support"],"answer":1},
      {"q":"According to research, what is cheaper than finding new customers?","options":["Marketing campaigns","Retaining existing customers","Building new stores","Training new staff"],"answer":1},
      {"q":"What determines the success of a loyalty programme?","options":["Its advertising budget","Whether rewards reflect customer needs","The size of the company","The number of products offered"],"answer":3},
    ]
  },
  {
    "id":11,"title":"Urban Green Spaces","category":"Environment",
    "text":"Urban green spaces such as parks, gardens, and tree-lined streets provide significant benefits to city residents. They offer places for physical activity, relaxation, and social interaction, contributing to both physical and mental well-being. Research has consistently shown that access to green spaces reduces stress, lowers blood pressure, and improves mood. Beyond individual health benefits, green spaces play a crucial role in managing urban heat islands, improving air quality, and supporting biodiversity. However, as cities expand, green spaces are often sacrificed to make way for new housing and commercial developments. Urban planners and policymakers must balance growth with the need to preserve and create accessible green environments for all residents.",
    "questions":[
      {"q":"What do urban green spaces contribute to?","options":["Industrial growth","Physical and mental well-being","Higher property values","Increased traffic"],"answer":1},
      {"q":"What effect do green spaces have on health, according to research?","options":["They increase stress","They reduce stress and lower blood pressure","They cause illness","They make people more sedentary"],"answer":1},
      {"q":"What environmental role do green spaces play in cities?","options":["They increase pollution","They manage urban heat islands and improve air quality","They reduce property values","They replace public transport"],"answer":1},
      {"q":"What challenge do cities face regarding green spaces?","options":["Too many parks","Lack of funding for sports","Green spaces being lost to development","Too many trees blocking roads"],"answer":2},
    ]
  },
  {
    "id":12,"title":"The Psychology of Motivation","category":"Psychology",
    "text":"Motivation is the driving force behind human behaviour. Psychologists distinguish between two main types: intrinsic motivation, which comes from internal satisfaction such as enjoyment or personal growth, and extrinsic motivation, which is driven by external rewards like money, praise, or grades. Research suggests that intrinsic motivation tends to produce more sustained effort and creativity than extrinsic motivation. When people are externally rewarded for activities they already enjoy, this can actually undermine their natural interest — a phenomenon known as the overjustification effect. Understanding these dynamics is particularly important in education and the workplace, where motivating individuals effectively can significantly improve performance and satisfaction.",
    "questions":[
      {"q":"What is intrinsic motivation driven by?","options":["Money and rewards","Internal satisfaction and personal growth","Fear of consequences","Social pressure"],"answer":1},
      {"q":"Which type of motivation tends to produce more creativity?","options":{"a":"extrinsic motivation","b":"both equally","c":"neither type","d":"intrinsic motivation"}.values() if False else ["Extrinsic motivation","Both equally","Neither type","Intrinsic motivation"],"answer":3},
      {"q":"What is the overjustification effect?","options":["Being very enthusiastic","External rewards undermining natural interest","Feeling motivated by praise","Working harder for no reason"],"answer":1},
      {"q":"Where is understanding motivation particularly important, according to the text?","options":["In sports and entertainment","In education and the workplace","In government and politics","In personal relationships only"],"answer":1},
    ]
  },
  {
    "id":13,"title":"The Digital Divide","category":"Technology",
    "text":"The digital divide refers to the gap between individuals, communities, and countries that have access to modern information and communication technology and those that do not. This divide is shaped by factors including income, education, geography, and age. In developing countries, limited internet infrastructure and high device costs prevent many people from accessing the digital economy, online education, and government services. Even within wealthy nations, elderly populations and low-income communities often face barriers to digital participation. The consequences are significant: those without digital access are increasingly excluded from economic opportunities, civic participation, and social connection. Bridging this divide requires coordinated investment in infrastructure, digital literacy programmes, and affordable technology.",
    "questions":[
      {"q":"What does the digital divide refer to?","options":["A gap in coding skills","The difference between rich and poor countries","The gap in access to modern technology","The cost of internet services"],"answer":2},
      {"q":"What factors shape the digital divide?","options":["Language and culture only","Income, education, geography, and age","Weather and climate","Political systems"],"answer":1},
      {"q":"What consequence does lack of digital access create?","options":["Better community bonds","Exclusion from economic and civic opportunities","Higher levels of education","More face-to-face interaction"],"answer":1},
      {"q":"What does the passage suggest is needed to bridge the digital divide?","options":["More social media platforms","Investment in infrastructure and digital literacy","Reducing internet costs for businesses only","Creating more tech companies"],"answer":1},
    ]
  },
  {
    "id":14,"title":"Fast Fashion and Its Impact","category":"Environment",
    "text":"Fast fashion refers to the rapid production of high volumes of clothing at low prices, designed to reflect the latest trends. While it has made fashion more accessible, the industry has significant environmental and social consequences. The fashion industry is one of the world's largest polluters, consuming vast amounts of water and releasing toxic chemicals into waterways. Synthetic fabrics shed microplastics into the ocean with every wash. Socially, garment workers in developing countries often work in unsafe conditions for very low wages. Growing consumer awareness has led to the rise of sustainable fashion movements that advocate for ethical production, second-hand clothing, and buying less but better quality.",
    "questions":[
      {"q":"What characterises fast fashion?","options":["Slow and careful production","High prices and limited runs","Rapid production at low prices","Handmade and sustainable clothing"],"answer":2},
      {"q":"What environmental problem do synthetic fabrics cause?","options":["Air pollution","Microplastic pollution in oceans","Soil erosion","Forest destruction"],"answer":1},
      {"q":"What social issue does the fast fashion industry face?","options":["Too many workers","Poor working conditions and low wages","Too high production costs","Lack of customer demand"],"answer":1},
      {"q":"What does the sustainable fashion movement advocate?","options":["Buying the latest trends","Wearing only designer clothes","Ethical production and buying less, better quality","Opening more factories"],"answer":3},
    ]
  },
  {
    "id":15,"title":"Emotional Intelligence at Work","category":"Psychology",
    "text":"Emotional intelligence, often abbreviated as EQ, refers to the ability to recognise, understand, manage, and effectively use one's own emotions and the emotions of others. Psychologist Daniel Goleman popularised the concept in the 1990s, arguing that EQ may be more important than IQ for professional success. In the workplace, high emotional intelligence enables individuals to navigate complex interpersonal relationships, resolve conflicts constructively, and lead teams with empathy. Studies have linked high EQ to better leadership performance, stronger teamwork, and lower staff turnover. Unlike IQ, which remains relatively stable throughout life, emotional intelligence can be developed through self-reflection, feedback, and deliberate practice.",
    "questions":[
      {"q":"What does EQ stand for in this context?","options":["Educational Quotient","Emotional Quality","Emotional Intelligence","Effective Questioning"],"answer":2},
      {"q":"What did Daniel Goleman argue about EQ?","options":["It is less important than IQ","It may be more important than IQ for professional success","It cannot be measured","It only matters in creative fields"],"answer":1},
      {"q":"What have studies linked high EQ to?","options":["Higher salaries","Better leadership and lower staff turnover","More technical skills","Faster career promotions"],"answer":1},
      {"q":"How is EQ different from IQ according to the passage?","options":["EQ measures academic ability","EQ cannot be changed","EQ can be developed through practice","IQ is more important in leadership"],"answer":2},
    ]
  },
  {
    "id":16,"title":"Coffee Break","category":"Daily Life",
    "text":"Many people drink coffee in the morning. Coffee contains caffeine, which helps people feel more awake. Some people prefer tea instead. Both drinks are popular around the world.",
    "questions":[
      {"q":"Why do people drink coffee in the morning?","options":["To sleep better","To feel more awake","To save money","To stay warm"],"answer":1},
      {"q":"What does coffee contain?","options":["Sugar","Milk","Caffeine","Vitamins"],"answer":2},
      {"q":"What do some people prefer instead of coffee?","options":["Juice","Water","Tea","Soda"],"answer":2},
      {"q":"What does the passage say about tea?","options":["It is not popular","It contains caffeine","It is also popular worldwide","It is only drunk in the morning"],"answer":2},
    ]
  },
  {
    "id":17,"title":"Going to the Market","category":"Daily Life",
    "text":"Ahmed goes to the market every Saturday. He buys fruit, vegetables, and bread. The market is near his house. He likes to talk to the sellers. The food at the market is fresh and cheap.",
    "questions":[
      {"q":"When does Ahmed go to the market?","options":["Every Sunday","Every Friday","Every Saturday","Every day"],"answer":2},
      {"q":"What does Ahmed buy at the market?","options":["Clothes and shoes","Fruit, vegetables, and bread","Books and pens","Meat and fish only"],"answer":1},
      {"q":"Where is the market?","options":["Far from his house","Near his house","In another city","Next to his workplace"],"answer":1},
      {"q":"What is the food at the market like?","options":["Expensive and old","Fresh and cheap","Frozen and packaged","Cooked and ready"],"answer":0},
    ]
  },
  {
    "id":18,"title":"A New Job","category":"Work",
    "text":"Sara started a new job last week. She works at a bank. Her manager is very helpful. Sara arrives at work at eight o'clock every morning. She finishes at four o'clock in the afternoon. She is happy with her new job.",
    "questions":[
      {"q":"Where does Sara work?","options":["A hospital","A school","A bank","A shop"],"answer":2},
      {"q":"What time does Sara arrive at work?","options":["Seven o'clock","Eight o'clock","Nine o'clock","Ten o'clock"],"answer":1},
      {"q":"How does Sara feel about her new job?","options":["Unhappy","Worried","Bored","Happy"],"answer":3},
      {"q":"How does her manager treat her?","options":["He is strict","He is unhelpful","He is helpful","He ignores her"],"answer":2},
    ]
  },
  {
    "id":19,"title":"Learning to Cook","category":"Daily Life",
    "text":"Cooking is a useful skill for everyone. When you cook at home, you can save money and eat healthier food. Many people watch cooking videos online to learn new recipes. Some people take cooking classes. It is never too late to start cooking.",
    "questions":[
      {"q":"What can cooking at home help you do?","options":["Spend more money","Meet new people","Save money and eat healthier","Cook faster than in a restaurant"],"answer":2},
      {"q":"How do many people learn new recipes?","options":["By reading cookbooks only","By watching online cooking videos","By eating at restaurants","By asking their neighbours"],"answer":1},
      {"q":"What does the passage say about starting to cook?","options":["It is only for young people","You need a lot of money to start","It is never too late to begin","You must take classes first"],"answer":2},
      {"q":"Where can people go to learn cooking more formally?","options":{"a":"Online only","b":"Cooking classes","c":"Restaurants","d":"Libraries"}.values() if False else ["Online only","Cooking classes","Restaurants","Libraries"],"answer":1},
    ]
  },
  {
    "id":20,"title":"My Neighbourhood","category":"Daily Life",
    "text":"I live in a quiet neighbourhood. There is a park near my home where children play after school. There is also a small supermarket and a pharmacy. My neighbours are friendly. I feel safe and comfortable where I live.",
    "questions":[
      {"q":"How does the writer describe their neighbourhood?","options":["Noisy and busy","Quiet","Near the city centre","Far from shops"],"answer":1},
      {"q":"What do children do in the park?","options":["Study","Play after school","Work","Sleep"],"answer":1},
      {"q":"What is near the writer's home?","options":["A hospital and a school","A park, supermarket, and pharmacy","A factory and an office","A beach and a hotel"],"answer":1},
      {"q":"How does the writer feel about their neighbourhood?","options":["Unsafe and unhappy","Bored and lonely","Safe and comfortable","Tired and stressed"],"answer":2},
    ]
  },
  {
    "id":21,"title":"The Future of Electric Cars","category":"Technology",
    "text":"Electric vehicles are becoming more common as countries try to reduce carbon emissions. Unlike petrol cars, electric vehicles produce no direct exhaust emissions, making them cleaner for the environment. However, the electricity used to charge them may still come from fossil fuel sources, which limits their environmental benefit. Battery range and charging infrastructure remain challenges, though rapid advances in battery technology are addressing these concerns. Major car manufacturers have committed to phasing out petrol and diesel models within the next two decades. Government incentives such as tax credits and subsidies are accelerating consumer adoption, although purchase prices remain higher than equivalent combustion-engine vehicles.",
    "questions":[
      {"q":"Why are electric vehicles considered cleaner?","options":["They use less fuel","They produce no direct exhaust emissions","They are lighter than petrol cars","They require less maintenance"],"answer":1},
      {"q":"What limits the environmental benefit of electric vehicles?","options":{"a":"Their high price","b":"Their charging infrastructure","c":"Electricity may come from fossil fuels","d":"Their battery size"}.values() if False else ["Their high price","Their charging infrastructure","Electricity may come from fossil fuels","Their battery size"],"answer":2},
      {"q":"What challenges do electric vehicles still face?","options":["Too many colours available","Battery range and charging infrastructure","Lack of government interest","Too many manufacturers"],"answer":1},
      {"q":"What does the passage say about electric vehicle prices?","options":["They are cheaper than petrol cars","They are the same price","They are still higher than petrol cars","They have no price difference"],"answer":2},
    ]
  },
  {
    "id":22,"title":"Globalisation and Culture","category":"Society",
    "text":"Globalisation has made the world more connected, enabling the rapid spread of ideas, products, and cultural practices across borders. While this connectivity has enriched many cultures through exposure to new music, cuisine, and art forms, it has also raised concerns about cultural homogenisation — the process by which distinct cultural identities become increasingly similar. Critics argue that dominant cultures, particularly Western ones, disproportionately influence smaller or more traditional societies, potentially eroding indigenous languages, traditions, and values. Proponents of globalisation counter that cultural exchange is inherently dynamic and that communities are capable of selectively adopting foreign influences while preserving their core identities.",
    "questions":[
      {"q":"What does cultural homogenisation mean in this context?","options":["Cultures becoming more diverse","Cultures becoming increasingly similar","Languages disappearing entirely","Music becoming more popular"],"answer":1},
      {"q":"What concern do critics raise about globalisation?","options":{"a":"That it enriches too many cultures","b":"That dominant cultures may erode smaller ones","c":"That it creates too much trade","d":"That it makes travel more expensive"}.values() if False else ["That it enriches too many cultures","That dominant cultures may erode smaller ones","That it creates too much trade","That it makes travel more expensive"],"answer":1},
      {"q":"What do proponents of globalisation argue?","options":["Cultural exchange destroys all traditional values","Communities can adopt foreign influences while keeping their identity","Globalisation should be stopped","Western culture is superior"],"answer":1},
      {"q":"What does the word 'indigenous' most likely mean in this passage?","options":["Foreign","Modern","Native or originating naturally in a place","Scientific"],"answer":2},
    ]
  },
  {
    "id":23,"title":"The Rise of Misinformation","category":"Media",
    "text":"The proliferation of social media has dramatically accelerated the spread of misinformation — false or inaccurate information shared without necessarily intending to deceive. Unlike deliberate disinformation, misinformation can spread rapidly through well-meaning individuals who share content without verifying its accuracy. The consequences range from public health crises, as seen during vaccine debates, to political instability. Algorithms designed to maximise engagement often amplify sensational or emotionally provocative content, regardless of its truthfulness. Addressing this challenge requires a multi-faceted approach including digital literacy education, platform accountability, transparent fact-checking systems, and regulatory frameworks that balance freedom of expression with the prevention of demonstrable harm.",
    "questions":[
      {"q":"How does misinformation differ from disinformation?","options":{"a":"Misinformation is always politically motivated","b":"Misinformation is spread without necessarily intending to deceive","c":"Disinformation is less harmful","d":"They are identical in meaning"}.values() if False else ["Misinformation is always political","Misinformation is spread without intent to deceive","Disinformation is less harmful","They are identical"],"answer":1},
      {"q":"What role do social media algorithms play in misinformation?","options":["They reduce misinformation effectively","They amplify sensational content regardless of truth","They verify all content automatically","They only promote educational content"],"answer":1},
      {"q":"What real-world consequence of misinformation does the passage mention?","options":["Entertainment industry losses","Public health crises related to vaccines","Economic recessions","Increased tourism"],"answer":1},
      {"q":"What approach does the passage recommend for addressing misinformation?","options":["Banning social media entirely","A single government-controlled media source","A multi-faceted approach including education and regulation","Reducing internet access globally"],"answer":2},
    ]
  },
  {
    "id":24,"title":"Workplace Wellness Programmes","category":"Work",
    "text":"Many organisations are investing in workplace wellness programmes to improve employee health and productivity. These initiatives may include subsidised gym memberships, mental health support services, flexible working arrangements, and nutritional guidance. Proponents argue that healthier employees take fewer sick days, demonstrate higher engagement, and contribute to a more positive organisational culture. However, critics caution that wellness programmes can sometimes place undue responsibility on individuals while ignoring systemic workplace stressors such as excessive workloads, poor management, and inadequate staffing. For wellness initiatives to be genuinely effective, they must be accompanied by structural changes that address the root causes of employee dissatisfaction and burnout.",
    "questions":[
      {"q":"What is one example of a workplace wellness initiative?","options":{"a":"Longer working hours","b":"Subsidised gym memberships","c":"Reduced salaries","d":"More mandatory meetings"}.values() if False else ["Longer working hours","Subsidised gym memberships","Reduced salaries","More mandatory meetings"],"answer":1},
      {"q":"What benefit do proponents associate with healthier employees?","options":["They work longer hours","They earn more money","They take fewer sick days","They manage more people"],"answer":2},
      {"q":"What criticism do some people have of wellness programmes?","options":{"a":"They are too expensive","b":"They place too much responsibility on individuals","c":"They reduce company profits","d":"They make employees too relaxed"}.values() if False else ["They are too expensive","They place responsibility on individuals while ignoring systemic issues","They reduce profits","They make employees too relaxed"],"answer":1},
      {"q":"What does the passage say is needed for wellness programmes to be truly effective?","options":["More funding","Compulsory participation","Structural changes addressing root causes","More managers"],"answer":2},
    ]
  },
  {
    "id":25,"title":"Language and Thought","category":"Linguistics",
    "text":"The relationship between language and thought has long fascinated philosophers and linguists. The Sapir-Whorf hypothesis, also known as linguistic relativity, proposes that the language one speaks influences how one perceives and thinks about the world. Strong versions of this hypothesis suggest that language determines thought entirely, while weaker versions propose that language merely influences cognitive tendencies. Research in cognitive linguistics has found some evidence that speakers of different languages perceive colour, time, and space differently. For instance, languages that use absolute spatial terms such as north and south rather than relative terms like left and right appear to influence how speakers orient themselves. However, the extent to which language shapes thought remains a subject of ongoing scholarly debate.",
    "questions":[
      {"q":"What does the Sapir-Whorf hypothesis propose?","options":{"a":"That language has no effect on thought","b":"That language influences or determines how we perceive the world","c":"That all languages think alike","d":"That grammar determines intelligence"}.values() if False else ["Language has no effect on thought","Language influences or determines how we perceive the world","All languages think alike","Grammar determines intelligence"],"answer":1},
      {"q":"What does research in cognitive linguistics suggest?","options":["All humans perceive colour identically","Speakers of different languages may perceive space and time differently","Language has no practical effects","Grammar is universal"],"answer":1},
      {"q":"What example of linguistic influence is given in the passage?","options":{"a":"Musical ability","b":"Mathematical performance","c":"Spatial orientation using absolute vs relative terms","d":"Emotional responses to colour"}.values() if False else ["Musical ability","Mathematical performance","Spatial orientation using absolute vs relative terms","Emotional responses to colour"],"answer":2},
      {"q":"What does the passage conclude about the Sapir-Whorf hypothesis?","options":["It is proven beyond doubt","It is completely false","It remains a subject of ongoing debate","It only applies to spoken languages"],"answer":2},
    ]
  },
  # Add 25 more passages covering A1-C1 range
  {
    "id":26,"title":"At the Library","category":"Daily Life",
    "text":"The library is a quiet place to read and study. You can borrow books for free. Most libraries also have computers and internet access. People of all ages come to the library.",
    "questions":[
      {"q":"What can you do at the library for free?","options":["Buy books","Borrow books","Use a printer","Take classes"],"answer":1},
      {"q":"What else do most libraries have?","options":["A gym","Computers and internet access","A swimming pool","A cafeteria"],"answer":1},
      {"q":"Who comes to the library?","options":["Only students","Only children","Only adults","People of all ages"],"answer":3},
      {"q":"How is the library described?","options":["Noisy and crowded","Expensive","Quiet","Dark and small"],"answer":2},
    ]
  },
  {
    "id":27,"title":"Travelling by Train","category":"Travel",
    "text":"Many people travel by train because it is fast and comfortable. Trains usually run on time. You can read, sleep, or look out the window during the journey. Train stations are usually in the centre of the city.",
    "questions":[
      {"q":"Why do many people travel by train?","options":{"a":"It is the cheapest option","b":"It is fast and comfortable","c":"It goes everywhere","d":"It is free"}.values() if False else ["It is cheapest","It is fast and comfortable","It goes everywhere","It is free"],"answer":1},
      {"q":"What can you do on a train?","options":["Cook food","Drive","Read, sleep, or look out the window","Work in the kitchen"],"answer":2},
      {"q":"Where are train stations usually located?","options":["Outside the city","Near airports","In the centre of the city","Near schools"],"answer":2},
      {"q":"What does the passage say about train schedules?","options":["Trains are often late","Trains usually run on time","Trains only run at night","Trains are sometimes cancelled"],"answer":1},
    ]
  },
  {
    "id":28,"title":"Exercise and Health","category":"Health",
    "text":"Regular exercise is important for good health. It helps keep the heart strong and the body fit. Doctors recommend at least thirty minutes of exercise five days a week. Walking, swimming, and cycling are good forms of exercise.",
    "questions":[
      {"q":"What does regular exercise help keep strong?","options":["Eyes","Teeth","The heart","Hair"],"answer":2},
      {"q":"How much exercise do doctors recommend?","options":["Ten minutes a day","At least thirty minutes, five days a week","One hour every day","Two hours on weekends only"],"answer":1},
      {"q":"Which is listed as a good form of exercise?","options":["Reading","Cooking","Swimming","Sleeping"],"answer":2},
      {"q":"Why is exercise important?","options":["It makes you taller","It is good for general health","It makes you smarter","It replaces sleep"],"answer":1},
    ]
  },
  {
    "id":29,"title":"The Weather Today","category":"Daily Life",
    "text":"Today the weather is cold and windy. There are dark clouds in the sky. It will probably rain this afternoon. People are wearing coats and umbrellas. Tomorrow the weather will be better.",
    "questions":[
      {"q":"How is the weather today?","options":{"a":"Hot and sunny","b":"Warm and calm","c":"Cold and windy","d":"Snowy and cold"}.values() if False else ["Hot and sunny","Warm and calm","Cold and windy","Snowy"],"answer":2},
      {"q":"When will it probably rain?","options":["This morning","This afternoon","Tonight","Tomorrow"],"answer":1},
      {"q":"What are people wearing?","options":["Shorts and t-shirts","Coats and carrying umbrellas","Hats and sunglasses","Boots and scarves only"],"answer":1},
      {"q":"What will the weather be like tomorrow?","options":["Worse","The same","Better","Unknown"],"answer":2},
    ]
  },
  {
    "id":30,"title":"Using Public Transport","category":"Environment",
    "text":"Using public transport such as buses and trains is better for the environment than driving a private car. It produces less pollution because many people share one vehicle. Public transport also reduces traffic in cities. It can save people money on petrol and parking.",
    "questions":[
      {"q":"Why is public transport better for the environment?","options":["It is free","It produces less pollution","It is always on time","It is more comfortable"],"answer":1},
      {"q":"How does public transport reduce pollution?","options":["By using electric engines","By going faster","By sharing one vehicle among many people","By travelling less distance"],"answer":2},
      {"q":"What other benefit does public transport offer?","options":["It reduces crime","It reduces city traffic","It improves health","It creates jobs"],"answer":1},
      {"q":"How can public transport save money?","options":["By providing free tickets","By reducing costs on petrol and parking","By reducing repair costs","By offering loyalty discounts"],"answer":1},
    ]
  },
  {
    "id":31,"title":"Internet Safety","category":"Technology",
    "text":"The internet is useful, but it can also be dangerous. People should be careful about sharing personal information online. Passwords should be strong and different for each website. It is important to only use trusted websites when shopping or banking. If you receive a strange email asking for your password, do not reply.",
    "questions":[
      {"q":"What should people be careful about online?","options":["Sharing photos","Sharing personal information","Using email","Playing games"],"answer":1},
      {"q":"How should passwords be?","options":{"a":"Short and easy to remember","b":"The same for all websites","c":"Strong and different for each site","d":"Only numbers"}.values() if False else ["Short and simple","Same for all sites","Strong and different for each site","Only numbers"],"answer":2},
      {"q":"What should you do with a strange email asking for your password?","options":["Reply with your password","Forward it","Delete it and do not reply","Call the sender"],"answer":2},
      {"q":"When is it important to use only trusted websites?","options":["When reading news","When watching videos","When shopping or banking","When sending emails"],"answer":2},
    ]
  },
  {
    "id":32,"title":"A Visit to the Doctor","category":"Health",
    "text":"When you feel sick, it is important to visit a doctor. The doctor will ask about your symptoms and examine you. Sometimes the doctor will give you medicine. You should follow the doctor's advice and take the medicine as directed. Rest and drink plenty of water when you are ill.",
    "questions":[
      {"q":"What will the doctor do when you visit?","options":{"a":"Give you food","b":"Ask about your symptoms and examine you","c":"Send you home immediately","d":"Call your family"}.values() if False else ["Give you food","Ask about symptoms and examine you","Send you home","Call your family"],"answer":1},
      {"q":"What should you do with medicine the doctor gives you?","options":["Take it whenever you want","Take it as directed","Give it to others","Stop when you feel better"],"answer":1},
      {"q":"What does the passage recommend when you are ill?","options":{"a":"Exercise hard","b":"Eat a lot","c":"Rest and drink plenty of water","d":"Go to work"}.values() if False else ["Exercise","Eat a lot","Rest and drink water","Go to work"],"answer":2},
      {"q":"Why should you visit a doctor when sick?","options":["To get medicine for free","To get professional advice and treatment","To avoid work","To get a sick note"],"answer":1},
    ]
  },
  {
    "id":33,"title":"Volunteering in the Community","category":"Society",
    "text":"Volunteering means giving your time and skills to help others without getting paid. Many people volunteer at hospitals, schools, and food banks. Volunteering can help you gain experience, meet new people, and feel a sense of purpose. Communities become stronger when people help each other.",
    "questions":[
      {"q":"What does volunteering mean?","options":["Working for a high salary","Helping others without payment","Studying a new skill","Managing a business"],"answer":1},
      {"q":"Where do many people volunteer?","options":["Hotels and restaurants","Hospitals, schools, and food banks","Airports and train stations","Gyms and sports clubs"],"answer":1},
      {"q":"What can volunteering help you gain?","options":{"a":"A high salary","b":"Experience and a sense of purpose","c":"A university degree","d":"A driving licence"}.values() if False else ["A high salary","Experience and purpose","A university degree","A driving licence"],"answer":1},
      {"q":"What happens to communities when people help each other?","options":["They become more competitive","They become weaker","They become stronger","Nothing changes"],"answer":2},
    ]
  },
  {
    "id":34,"title":"The Benefits of Music Education","category":"Education",
    "text":"Studying music has been shown to have many benefits beyond learning to play an instrument. Children who receive music education often develop stronger memory, better concentration, and improved mathematical ability. Playing in a group teaches cooperation and listening skills. Music can also help manage emotions and reduce stress. Despite these benefits, music programmes in schools are often among the first to be cut when budgets are reduced, which many educators consider a short-sighted decision.",
    "questions":[
      {"q":"What skills do children develop through music education?","options":{"a":"Only musical talent","b":"Memory, concentration, and mathematical ability","c":"Language skills only","d":"Physical fitness"}.values() if False else ["Only musical talent","Memory, concentration, maths","Language only","Physical fitness"],"answer":1},
      {"q":"What does playing music in a group teach?","options":["Competition","Cooperation and listening skills","How to perform alone","How to read music only"],"answer":1},
      {"q":"How can music affect emotions?","options":{"a":"It always causes excitement","b":"It has no effect","c":"It can help manage emotions and reduce stress","d":"It makes people more anxious"}.values() if False else ["Causes excitement","No effect","Helps manage emotions and reduce stress","Causes anxiety"],"answer":2},
      {"q":"What often happens to music programmes when school budgets are cut?","options":["They receive more funding","They expand","They are among the first to be cut","They move online"],"answer":2},
    ]
  },
  {
    "id":35,"title":"Artificial Intelligence in Healthcare","category":"Technology",
    "text":"Artificial intelligence is increasingly being used in healthcare to improve diagnosis, treatment planning, and patient outcomes. Machine learning algorithms can analyse vast quantities of medical imaging data to detect conditions such as cancer at earlier stages than human radiologists alone. AI-driven tools also assist in drug discovery, helping researchers identify promising compounds more rapidly. However, the integration of AI in healthcare raises important questions about data privacy, algorithmic bias, and the appropriate boundaries of machine decision-making in matters of life and death. Most experts agree that AI should augment rather than replace human clinical judgement, and that robust regulatory frameworks are essential to ensure safe and equitable deployment.",
    "questions":[
      {"q":"How does AI assist with cancer detection?","options":{"a":"By performing surgery","b":"By analysing medical imaging to detect cancer earlier","c":"By prescribing medication","d":"By interviewing patients"}.values() if False else ["By performing surgery","By analysing imaging to detect cancer earlier","By prescribing medication","By interviewing patients"],"answer":1},
      {"q":"What is one concern about AI in healthcare?","options":["It is too slow","Algorithmic bias and data privacy","It is too expensive for hospitals","It cannot read images"],"answer":1},
      {"q":"What role do most experts believe AI should play in healthcare?","options":["Replace doctors entirely","Make all clinical decisions","Augment rather than replace human judgement","Be used only for administrative tasks"],"answer":2},
      {"q":"What does the passage say is essential for safe AI deployment?","options":{"a":"Unlimited funding","b":"Removing all regulations","c":"Robust regulatory frameworks","d":"Replacing all human doctors"}.values() if False else ["Unlimited funding","Removing regulations","Robust regulatory frameworks","Replacing all doctors"],"answer":2},
    ]
  },
  {
    "id":36,"title":"A Busy Morning","category":"Daily Life",
    "text":"Tom wakes up at seven. He takes a shower and gets dressed. Then he eats breakfast with his family. He leaves home at eight and takes the bus to work. He arrives at the office at half past eight.",
    "questions":[
      {"q":"What time does Tom wake up?","options":["Six o'clock","Seven o'clock","Eight o'clock","Nine o'clock"],"answer":1},
      {"q":"What does Tom do after getting dressed?","options":["Goes to work","Takes the bus","Eats breakfast with his family","Reads the newspaper"],"answer":2},
      {"q":"How does Tom travel to work?","options":["He drives a car","He walks","He takes the bus","He rides a bicycle"],"answer":2},
      {"q":"What time does Tom arrive at the office?","options":["Eight o'clock","Half past eight","Nine o'clock","Quarter to nine"],"answer":1},
    ]
  },
  {
    "id":37,"title":"Animals in Danger","category":"Environment",
    "text":"Many animals around the world are in danger of becoming extinct. This happens because people destroy their natural habitats to build farms and cities. Pollution also harms animals and their environments. Some organisations work to protect endangered animals. Without action, many species will disappear forever.",
    "questions":[
      {"q":"Why are many animals in danger?","options":{"a":"They are poorly adapted","b":"People destroy their natural habitats","c":"They do not reproduce enough","d":"The climate is too cold"}.values() if False else ["They are poorly adapted","People destroy their habitats","They cannot reproduce","Climate is too cold"],"answer":1},
      {"q":"What else harms animals besides habitat destruction?","options":["Food shortages","Pollution","Tourism","Noise"],"answer":1},
      {"q":"What do some organisations do for endangered animals?","options":["Study them only","Sell them","Work to protect them","Move them to other countries"],"answer":2},
      {"q":"What will happen if no action is taken?","options":{"a":"Animals will adapt","b":"Animals will move","c":"Many species will disappear forever","d":"Habitats will recover"}.values() if False else ["Animals will adapt","Animals will move","Many species disappear forever","Habitats recover"],"answer":2},
    ]
  },
  {
    "id":38,"title":"Studying Abroad","category":"Education",
    "text":"More and more students choose to study in another country. Living abroad helps students improve their language skills and experience a new culture. It can also improve career opportunities. However, it can be expensive and lonely at first. Many students say that studying abroad changed their lives in a positive way.",
    "questions":[
      {"q":"What skills can improve when living abroad?","options":["Cooking skills","Language skills","Sports skills","Art skills"],"answer":1},
      {"q":"What career benefit does studying abroad offer?","options":{"a":"Guaranteed job offers","b":"Free accommodation","c":"Improved career opportunities","d":"Higher starting salary"}.values() if False else ["Guaranteed jobs","Free accommodation","Better career opportunities","Higher salary"],"answer":2},
      {"q":"What challenge can studying abroad bring?","options":["Meeting too many people","Learning too quickly","Being expensive and lonely at first","Having too much free time"],"answer":2},
      {"q":"What do many students say about studying abroad?","options":["It was a waste of time","It changed their lives positively","It was too easy","It was not worth the cost"],"answer":1},
    ]
  },
  {
    "id":39,"title":"A Healthy Workplace","category":"Work",
    "text":"A healthy workplace is important for both employees and employers. When workers feel safe and respected, they are more productive and motivated. Good managers listen to their teams and solve problems fairly. Comfortable working conditions, such as proper lighting and ergonomic furniture, reduce tiredness and injury. Regular breaks and clear communication also help maintain a positive work environment.",
    "questions":[
      {"q":"What happens when workers feel safe and respected?","options":{"a":"They work fewer hours","b":"They earn more money","c":"They become more productive and motivated","d":"They ask for promotions"}.values() if False else ["Work fewer hours","Earn more","More productive and motivated","Ask for promotions"],"answer":2},
      {"q":"What do good managers do?","options":["They ignore problems","They listen to teams and solve problems fairly","They reduce salaries","They work the longest hours"],"answer":1},
      {"q":"What does ergonomic furniture help reduce?","options":["Costs","Tiredness and injury","Meetings","Absences from work only"],"answer":1},
      {"q":"What helps maintain a positive work environment?","options":{"a":"Long working hours","b":"Regular breaks and clear communication","c":"Strict dress codes","d":"Reducing staff numbers"}.values() if False else ["Long hours","Regular breaks and communication","Strict dress codes","Reducing staff"],"answer":1},
    ]
  },
  {
    "id":40,"title":"The History of the Internet","category":"Technology",
    "text":"The internet began as a military project in the United States in the 1960s. Scientists needed a communication network that could survive a nuclear attack. By the 1980s, universities and research centres were using it to share information. The World Wide Web was invented in 1989 by Tim Berners-Lee, making the internet accessible to the general public. Today, over five billion people use the internet for communication, education, commerce, and entertainment.",
    "questions":[
      {"q":"When did the internet begin?","options":["The 1950s","The 1960s","The 1970s","The 1980s"],"answer":1},
      {"q":"Why was the original internet network created?","options":{"a":"For entertainment","b":"For online shopping","c":"To survive a nuclear attack","d":"For business communication"}.values() if False else ["Entertainment","Online shopping","To survive a nuclear attack","Business"],"answer":2},
      {"q":"Who invented the World Wide Web?","options":["Bill Gates","Steve Jobs","Tim Berners-Lee","Elon Musk"],"answer":2},
      {"q":"How many people use the internet today according to the passage?","options":["One billion","Three billion","Over five billion","Ten billion"],"answer":2},
    ]
  },
  {
    "id":41,"title":"Work Ethic and Success","category":"Work",
    "text":"Many successful people say that hard work is the key to achieving their goals. A strong work ethic means arriving on time, meeting deadlines, and giving your best effort. People with a good work ethic are often reliable, honest, and willing to take on responsibility. Employers value these qualities because they lead to better results for the company. However, working hard must be balanced with rest to avoid burnout and maintain long-term productivity.",
    "questions":[
      {"q":"What does a strong work ethic include?","options":{"a":"Arriving late","b":"Avoiding responsibility","c":"Arriving on time and meeting deadlines","d":"Working without breaks"}.values() if False else ["Arriving late","Avoiding responsibility","Arriving on time and meeting deadlines","Working without breaks"],"answer":2},
      {"q":"Why do employers value a good work ethic?","options":["It reduces salaries","It leads to better results","It reduces the need for training","It makes employees famous"],"answer":1},
      {"q":"What must hard work be balanced with?","options":["More hard work","Socialising","Rest","Travel"],"answer":2},
      {"q":"Why is rest important for hard workers?","options":{"a":"It increases salary","b":"It helps avoid burnout","c":"It impresses managers","d":"It reduces working hours"}.values() if False else ["Increases salary","Helps avoid burnout","Impresses managers","Reduces hours"],"answer":1},
    ]
  },
  {
    "id":42,"title":"The Impact of Automation","category":"Technology",
    "text":"Automation refers to the use of machines and software to perform tasks that were previously done by humans. While automation increases efficiency and reduces costs for businesses, it also displaces workers from repetitive jobs in manufacturing, data entry, and customer service. Economists debate whether new technology ultimately creates more jobs than it destroys. Historical evidence from the Industrial Revolution suggests that technology eventually generates new employment opportunities, though the transition can be disruptive for workers without the skills required by the new economy. Governments and businesses are increasingly investing in reskilling and upskilling programmes to help workers adapt to an automated future.",
    "questions":[
      {"q":"What does automation refer to?","options":{"a":"Manual labour","b":"Machines performing previously human tasks","c":"Training new employees","d":"Outsourcing jobs abroad"}.values() if False else ["Manual labour","Machines performing human tasks","Training employees","Outsourcing abroad"],"answer":1},
      {"q":"Which type of jobs are most displaced by automation?","options":["Creative and artistic jobs","Leadership and management roles","Repetitive jobs in manufacturing and data entry","Scientific research positions"],"answer":2},
      {"q":"What does historical evidence from the Industrial Revolution suggest?","options":{"a":"Technology always reduces total employment","b":"Technology creates no new jobs","c":"Technology eventually generates new employment opportunities","d":"Workers never adapt to change"}.values() if False else ["Reduces employment","Creates no jobs","Eventually generates new opportunities","Workers never adapt"],"answer":2},
      {"q":"How are governments and businesses responding to automation?","options":["By banning automation","By reducing wages","By investing in reskilling programmes","By increasing manual labour"],"answer":2},
    ]
  },
  {
    "id":43,"title":"The Role of Arts in Society","category":"Society",
    "text":"Art, in its many forms, plays a vital role in human culture and society. Literature, music, visual art, and performance provide ways for people to express complex emotions and ideas, to question assumptions, and to understand experiences beyond their own. Societies that support the arts tend to foster greater creativity, critical thinking, and cultural identity. However, arts funding is often among the first to be reduced during economic downturns, reflecting a view that the arts are a luxury rather than a necessity. Advocates argue that investing in cultural institutions yields significant long-term economic and social returns, including tourism, community cohesion, and mental health benefits.",
    "questions":[
      {"q":"What do the arts provide ways for people to do?","options":{"a":"Earn more money","b":"Express emotions and understand others' experiences","c":"Learn technical skills","d":"Avoid social responsibility"}.values() if False else ["Earn money","Express emotions and understand others","Learn technical skills","Avoid responsibility"],"answer":1},
      {"q":"What tends to happen in societies that support the arts?","options":["Economic growth only","Greater creativity and cultural identity","More political problems","Less education"],"answer":1},
      {"q":"When is arts funding often reduced?","options":["During periods of economic growth","When there are too many artists","During economic downturns","When new governments are elected"],"answer":2},
      {"q":"What economic benefit do arts advocates point to?","options":{"a":"Reduced taxes","b":"Lower crime rates","c":"Tourism and community cohesion","d":"Faster industrial growth"}.values() if False else ["Reduced taxes","Lower crime","Tourism and community cohesion","Faster industry"],"answer":2},
    ]
  },
  {
    "id":44,"title":"Climate Migration","category":"Society",
    "text":"Climate change is increasingly driving human migration as rising sea levels, prolonged droughts, and extreme weather events make certain regions uninhabitable or economically unsustainable. The World Bank estimates that by 2050, climate change could force over 200 million people to move within their own countries. Unlike refugees fleeing conflict, climate migrants often lack formal legal recognition and protection under international law, creating a significant governance gap. The phenomenon disproportionately affects low-income nations that have contributed least to greenhouse gas emissions, raising acute questions of climate justice. Addressing climate migration requires both mitigation strategies to reduce emissions and adaptation measures to help vulnerable communities build resilience.",
    "questions":[
      {"q":"What is driving climate migration?","options":{"a":"Political instability","b":"Economic inequality","c":"Rising sea levels, droughts, and extreme weather","d":"Cultural differences"}.values() if False else ["Political instability","Economic inequality","Rising seas, droughts, extreme weather","Cultural differences"],"answer":2},
      {"q":"What legal challenge do climate migrants face?","options":["Too many documents","They lack formal legal recognition and protection","Too many countries to choose from","They are not allowed to work"],"answer":1},
      {"q":"Which countries are most affected by climate migration?","options":["Wealthy industrialised nations","Low-income nations that contributed least to emissions","Nations with the most technology","Countries near the North Pole"],"answer":1},
      {"q":"What does addressing climate migration require?","options":{"a":"Building more walls","b":"Both mitigation and adaptation strategies","c":"Reducing international aid","d":"Restricting all movement"}.values() if False else ["Building walls","Both mitigation and adaptation","Reducing aid","Restricting movement"],"answer":1},
    ]
  },
  {
    "id":45,"title":"The Science of Habits","category":"Psychology",
    "text":"Habits are automatic behaviours triggered by specific cues in our environment. According to habit researcher Charles Duhigg, every habit follows a neurological loop consisting of a cue, a routine, and a reward. The cue triggers the brain to enter automatic mode; the routine is the behaviour itself; and the reward reinforces the pattern. Understanding this loop is key to both forming new habits and breaking unwanted ones. Research shows that it takes on average 66 days — not the commonly cited 21 — to form a stable new habit, though this varies widely depending on the complexity of the behaviour and individual differences. Keystone habits, such as regular exercise, tend to trigger positive change across multiple areas of life.",
    "questions":[
      {"q":"What triggers a habit according to the passage?","options":{"a":"A reward","b":"A conscious decision","c":"A cue in the environment","d":"A routine"}.values() if False else ["A reward","A conscious decision","A cue in the environment","A routine"],"answer":2},
      {"q":"What are the three parts of the habit loop?","options":["Plan, action, reflection","Cue, routine, reward","Trigger, response, memory","Goal, effort, result"],"answer":1},
      {"q":"How long does research show it takes to form a stable habit?","options":{"a":"21 days","b":"30 days","c":"66 days on average","d":"100 days"}.values() if False else ["21 days","30 days","66 days on average","100 days"],"answer":2},
      {"q":"What are 'keystone habits'?","options":["Very difficult habits","Habits that trigger positive change in multiple areas of life","Habits formed in childhood","Habits related to keystone species"],"answer":1},
    ]
  },
  {
    "id":46,"title":"My Pet","category":"Daily Life",
    "text":"I have a dog named Max. He is brown and white. Max is very friendly and loves to play. I take him for a walk every morning. He eats special dog food twice a day. Max is my best friend.",
    "questions":[
      {"q":"What is the dog's name?","options":["Bruno","Charlie","Max","Rex"],"answer":2},
      {"q":"When does the writer take Max for a walk?","options":["Every evening","Every morning","At lunchtime","On weekends only"],"answer":1},
      {"q":"How often does Max eat?","options":["Once a day","Three times a day","Twice a day","Only at night"],"answer":2},
      {"q":"How does the writer describe Max?","options":["Shy and quiet","Friendly and loves to play","Aggressive and loud","Old and tired"],"answer":1},
    ]
  },
  {
    "id":47,"title":"A Visit to the Museum","category":"Culture",
    "text":"Last Sunday, our school class visited the national museum. We saw old paintings, ancient tools, and historical maps. Our guide explained the history of each item. I found the ancient maps most interesting. It was a great way to learn about history.",
    "questions":[
      {"q":"When did the class visit the museum?","options":["Saturday","Last Sunday","Monday","Friday"],"answer":1},
      {"q":"What did they see at the museum?","options":["Science experiments","Old paintings, tools, and maps","Modern art","Sports trophies"],"answer":1},
      {"q":"What did the guide do?","options":["Sold tickets","Explained the history of each item","Took photographs","Gave out food"],"answer":1},
      {"q":"What did the writer find most interesting?","options":{"a":"The paintings","b":"The tools","c":"The ancient maps","d":"The sculptures"}.values() if False else ["Paintings","Tools","Ancient maps","Sculptures"],"answer":2},
    ]
  },
  {
    "id":48,"title":"Saving Water","category":"Environment",
    "text":"Water is a precious resource that we must not waste. Simple actions can save a lot of water. Turn off the tap while brushing your teeth. Fix leaking pipes quickly. Take shorter showers instead of baths. Use a bucket when washing your car instead of a hose.",
    "questions":[
      {"q":"What should you do while brushing your teeth?","options":["Use more water","Turn off the tap","Use hot water","Drink water"],"answer":1},
      {"q":"What should you do with leaking pipes?","options":["Ignore them","Fix them quickly","Cover them","Report them to the council"],"answer":1},
      {"q":"What is recommended instead of baths?","options":{"a":"Swimming","b":"Shorter showers","c":"Less washing","d":"Cold water only"}.values() if False else ["Swimming","Shorter showers","Less washing","Cold water"],"answer":1},
      {"q":"What should you use when washing a car?","options":["A hose","Any method","A bucket","A sponge only"],"answer":2},
    ]
  },
  {
    "id":49,"title":"Job Interview Tips","category":"Work",
    "text":"A job interview is an important opportunity to show a company why you are the right person for the role. You should research the company before the interview. Dress professionally and arrive on time. During the interview, listen carefully and answer questions clearly. Show enthusiasm and confidence. After the interview, send a thank-you email to the interviewer.",
    "questions":[
      {"q":"What should you do before an interview?","options":{"a":"Buy new clothes","b":"Research the company","c":"Call the manager","d":"Prepare a long list of demands"}.values() if False else ["Buy clothes","Research the company","Call manager","Prepare demands"],"answer":1},
      {"q":"How should you dress for an interview?","options":["Casually","Professionally","In sports clothes","It does not matter"],"answer":1},
      {"q":"What should you do after the interview?","options":["Wait by the phone","Send a thank-you email","Call the company daily","Post about it on social media"],"answer":1},
      {"q":"What qualities should you show during the interview?","options":["Shyness and silence","Enthusiasm and confidence","Nervousness and hesitation","Speed and impatience"],"answer":1},
    ]
  },
  {
    "id":50,"title":"Critical Thinking in the Modern World","category":"Education",
    "text":"Critical thinking — the ability to analyse information objectively and make reasoned judgements — has become an essential skill in the twenty-first century. In an environment saturated with information, much of it unreliable or deliberately misleading, the capacity to evaluate sources, identify logical fallacies, and distinguish evidence from opinion is more important than ever. Educational theorists argue that traditional schooling, with its emphasis on memorisation and standardised testing, does not adequately cultivate critical thinking. Problem-based learning, Socratic dialogue, and collaborative inquiry are among the pedagogical approaches advocated as superior alternatives. Employers consistently rank critical thinking among the most desirable graduate attributes, reflecting its centrality to effective decision-making, innovation, and adaptability in rapidly changing professional environments.",
    "questions":[
      {"q":"What is critical thinking described as in the passage?","options":{"a":"Memorising large amounts of information","b":"Analysing information objectively and making reasoned judgements","c":"Following instructions carefully","d":"Reading widely across subjects"}.values() if False else ["Memorising information","Analysing information objectively and making reasoned judgements","Following instructions","Reading widely"],"answer":1},
      {"q":"What capacity does the passage say is most important in today's information environment?","options":["Speed of reading","Evaluating sources and distinguishing evidence from opinion","Writing quickly","Speaking multiple languages"],"answer":1},
      {"q":"What criticism does the passage make of traditional schooling?","options":{"a":"It is too expensive","b":"It focuses too much on sport","c":"It does not adequately cultivate critical thinking","d":"It produces too many graduates"}.values() if False else ["Too expensive","Too much sport","Does not cultivate critical thinking","Too many graduates"],"answer":2},
      {"q":"Why do employers value critical thinking?","options":{"a":"It makes employees work faster","b":"It reduces training costs","c":"It is central to decision-making, innovation, and adaptability","d":"It ensures obedience"}.values() if False else ["Work faster","Reduce costs","Central to decisions, innovation, adaptability","Ensure obedience"],"answer":2},
    ]
  },
]

print(f"Grammar: {len(grammar)}, Vocab: {len(vocab)}, Listening: {len(listening)}, Reading: {len(reading)}")
