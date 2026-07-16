// api/data/vocabulary.js — Server-side vocabulary bank
const vocabularyQuestions = [
  { id:1, question:"What does the word 'big' mean?", options:{ a:"small", b:"large", c:"fast", d:"cold" }, answer:"b", explanation:"'Big' means large in size. It is the opposite of 'small'." },
  { id:2, question:"Which word describes how you feel when something good happens?", options:{ a:"tired", b:"angry", c:"happy", d:"hungry" }, answer:"c", explanation:"'Happy' means feeling pleasure or joy when something good happens." },
  { id:3, question:"A 'shop' is a place where you _____ things.", options:{ a:"sleep", b:"cook", c:"buy", d:"study" }, answer:"c", explanation:"A shop is a place where you go to buy goods or products." },
  { id:4, question:"If you 'arrive' somewhere, you _____.", options:{ a:"leave it", b:"reach it", c:"look for it", d:"pass by it" }, answer:"b", explanation:"'Arrive' means to reach a destination or place you were travelling to." },
  { id:5, question:"Which word means the opposite of 'expensive'?", options:{ a:"cheap", b:"new", c:"broken", d:"heavy" }, answer:"a", explanation:"'Cheap' means not costing much money — the opposite of 'expensive'." },
  { id:6, question:"If something is 'available', it means it is _____.", options:{ a:"very old", b:"ready to use or get", c:"broken", d:"far away" }, answer:"b", explanation:"'Available' means ready to be used, bought, or accessed." },
  { id:7, question:"A 'customer' is someone who _____ a product or service.", options:{ a:"makes", b:"designs", c:"buys or uses", d:"repairs" }, answer:"c", explanation:"A customer is a person who purchases or uses a company's goods or services." },
  { id:8, question:"To 'confirm' a booking means to _____.", options:{ a:"cancel it", b:"change the date", c:"make it official", d:"look for it" }, answer:"c", explanation:"To confirm means to make something certain or definite, often by saying yes or sending a message." },
  { id:9, question:"A 'deadline' is _____.", options:{ a:"a slow connection", b:"a type of contract", c:"the latest time to finish something", d:"a business meeting" }, answer:"c", explanation:"A deadline is the latest time or date by which something must be completed." },
  { id:10, question:"If you 'improve', you _____.", options:{ a:"stay the same", b:"get worse", c:"get better", d:"stop trying" }, answer:"c", explanation:"'Improve' means to become better or to make something better." },
  { id:11, question:"A 'colleague' is _____.", options:{ a:"a type of university", b:"someone you work with", c:"a customer", d:"a business rule" }, answer:"b", explanation:"A colleague is a person you work with, especially in a professional setting." },
  { id:12, question:"To 'negotiate' means to _____.", options:{ a:"refuse to speak", b:"discuss something to reach an agreement", c:"sign a contract", d:"pay immediately" }, answer:"b", explanation:"To negotiate means to talk with others to reach a mutually acceptable agreement." },
  { id:13, question:"If someone is 'fluent' in a language, they _____.", options:{ a:"are just starting to learn it", b:"speak it slowly", c:"speak it naturally and easily", d:"understand only basic words" }, answer:"c", explanation:"Being fluent means speaking a language naturally, smoothly, and without difficulty." },
  { id:14, question:"'Efficient' work means it is done _____.", options:{ a:"slowly and carefully", b:"quickly with minimum waste of time or effort", c:"without any plan", d:"by a large team" }, answer:"b", explanation:"Efficient means achieving maximum results with minimum wasted time or effort." },
  { id:15, question:"To 'postpone' a meeting means to _____.", options:{ a:"attend it early", b:"cancel it permanently", c:"move it to a later time", d:"make it shorter" }, answer:"c", explanation:"To postpone means to delay an event and move it to a later time." },
  { id:16, question:"To 'collaborate' means to _____.", options:{ a:"compete against others", b:"work together with others on a task", c:"review someone's work", d:"present a report" }, answer:"b", explanation:"To collaborate means to work jointly with others, especially in an intellectual or creative effort." },
  { id:17, question:"To 'implement' a plan means to _____.", options:{ a:"reject it", b:"discuss it further", c:"put it into action", d:"write it down" }, answer:"c", explanation:"To implement means to put a plan, decision, or agreement into effect." },
  { id:18, question:"'Consequently' is used to introduce _____.", options:{ a:"a reason", b:"a result or effect", c:"a new topic", d:"an example" }, answer:"b", explanation:"'Consequently' means as a result, used to introduce the outcome of a previous action or situation." },
  { id:19, question:"A 'proficient' worker is someone who is _____.", options:{ a:"new and inexperienced", b:"skilled and competent at their job", c:"slow but careful", d:"working part time" }, answer:"b", explanation:"Proficient means having a high level of competence or skill in a particular area." },
  { id:20, question:"An 'incentive' is something that _____.", options:{ a:"discourages people from acting", b:"motivates or encourages people to do something", c:"explains a company policy", d:"records an employee's performance" }, answer:"b", explanation:"An incentive is something that motivates or encourages a person to take a specific action or work harder." }
]


export function getTestQuestions(pool, count = 5) {
  const total = pool.length;
  if (total <= count) return [...pool];
  // Divide pool into tiers by position (IDs 1-20 easy, 21-35 medium, 36-50 hard)
  const easyEnd  = Math.floor(total * 0.40);   // first 40% = easy
  const medEnd   = Math.floor(total * 0.70);   // next  30% = medium
  const easy     = pool.slice(0, easyEnd);
  const medium   = pool.slice(easyEnd, medEnd);
  const hard     = pool.slice(medEnd);
  const shuffle  = arr => [...arr].sort(() => Math.random() - 0.5);
  // Fixed pattern: Q1=Easy, Q2=Easy, Q3=Medium, Q4=Medium, Q5=Hard
  const easyPick   = Math.min(2, easy.length);
  const medPick    = Math.min(2, medium.length);
  const hardPick   = Math.min(count - easyPick - medPick, hard.length);
  return [
    ...shuffle(easy).slice(0, easyPick),
    ...shuffle(medium).slice(0, medPick),
    ...shuffle(hard).slice(0, Math.max(0, hardPick)),
  ];
}


export default vocabularyQuestions
