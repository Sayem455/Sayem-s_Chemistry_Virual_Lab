import {activities} from "./activities.js";
export const chapters = [
  ["1-1","ল্যাবরেটরির নিরাপদ ব্যবহার","Safe use of the laboratory"],
  ["1-2","গুণগত রসায়ন","Qualitative chemistry"],
  ["1-3","মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন","Periodic properties and chemical bonding"],
  ["1-4","রাসায়নিক পরিবর্তন","Chemical changes"],
  ["1-5","কর্মমুখী রসায়ন","Applied chemistry"],
  ["2-1","পরিবেশ রসায়ন","Environmental chemistry"],
  ["2-2","জৈব রসায়ন","Organic chemistry"],
  ["2-3","পরিমাণগত রসায়ন","Quantitative chemistry"],
  ["2-4","তড়িৎ রসায়ন","Electrochemistry"],
  ["2-5","অর্থনৈতিক রসায়ন","Economic chemistry"]
];
export const types = {
  experiment:["এক্সপেরিমেন্ট","Experiments"],
  pdf:["অধ্যায়ের PDF","Chapter PDFs"],
  book:["দাগানো বই","Annotated reading"],
  slides:["ক্লাসের স্লাইড","Class slides"],
  bank:["প্রশ্নব্যাংক","Question bank"],
  video:["ভিডিও","Videos"],
  model:["মডেল","Models"]
};
export const starter = [
  ...activities.map(a=>[a.chapter,"experiment",a.name,a.nameEn,"experiments.html#activity-"+a.chapter]),
  ["1-2","video","শিখার বর্ণ · ভিডিও","Flame colours · video","materials/Sayems_Chemistry_Flame_Colours.mp4"],
  ["1-2","slides","গুণগত রসায়ন · ক্লাস স্লাইড টেমপ্লেট","Qualitative chemistry · class slide template","materials/Sayems_Chemistry_Qualitative_Chemistry_Template.pptx"],
  ["1-2","experiment","শিখা পরীক্ষা","Flame test","experiments.html#flame"],
  ["1-2","experiment","ক্লোরাইড আয়ন শনাক্তকরণ","Chloride ion test","experiments.html#chloride"],
  ["1-2","pdf","শিখা পরীক্ষার নোট","Flame test notes","materials/flame-test-notes.pdf"],
  ["1-2","bank","গুণগত রসায়ন · অনুশীলন প্রশ্ন","Qualitative chemistry · practice questions","materials/qualitative-practice.pdf"],
  ["1-3","model","পর্যায় সারণি","Periodic table","lab.html#periodic"],
  ["1-3","model","অণুর আকৃতি · 2D ও 3D","Molecular shapes · 2D and 3D","experiments.html#water"],
  ["2-1","experiment","চুনের পানিতে CO₂ শনাক্তকরণ","Detect CO₂ with limewater","experiments.html#limewater"],
  ["2-2","experiment","ব্রোমিন পানির পরীক্ষা","Bromine water test","experiments.html#bromine"],
  ["2-3","experiment","এসিড–ক্ষার টাইট্রেশন","Acid–base titration","lab.html#titration"],
  ["2-4","experiment","তড়িৎ বিশ্লেষণ","Electrolysis","lab.html#electrolysis"]
].map(([chapter,type,title,titleEn,url])=>({chapter,type,title,titleEn,url,public:true}));
export const starterQuiz = [
  ["সোডিয়াম আয়নের শিখার বর্ণ কোনটি?","Which flame colour identifies sodium?",
    ["সোনালি হলুদ","ইটের মতো লাল","আপেল-সবুজ"],["Golden yellow","Brick red","Apple green"],0,
    "উত্তেজিত সোডিয়াম পরমাণু হলুদ আলো নির্গত করে।","Excited sodium atoms emit yellow light."],
  ["ইটের মতো লাল শিখা কোন আয়নের?","Which ion gives a brick-red flame?",
    ["Ba²⁺","Ca²⁺","Na⁺"],["Ba²⁺","Ca²⁺","Na⁺"],1,
    "ক্যালসিয়াম যৌগ শিখায় ইটের মতো লাল বর্ণ দেয়।","Calcium compounds give a brick-red flame."],
  ["বারিয়ামের শিখার বর্ণ কোনটি?","What flame colour is associated with barium?",
    ["সোনালি হলুদ","ইটের মতো লাল","আপেল-সবুজ"],["Golden yellow","Brick red","Apple green"],2,
    "বারিয়াম যৌগ শিখায় আপেল-সবুজ বর্ণ দেয়।","Barium compounds give an apple-green flame."],
  ["একটি p উপস্তরে কয়টি অরবিটাল থাকে?","How many orbitals are in a p subshell?",
    ["১","৩","৫"],["1","3","5"],1,"pₓ, pᵧ ও p_z মিলে তিনটি।","There are three: pₓ, pᵧ and p_z."],
  ["Ksp-এর রাশিতে কোনটি থাকে?","What appears in a Ksp expression?",
    ["দ্রবীভূত আয়নের সক্রিয়তা","বিশুদ্ধ কঠিন লবণের ঘনমাত্রা","পাত্রের আয়তন"],["Activities of dissolved ions","Concentration of the pure solid salt","Vessel volume"],0,
    "বিশুদ্ধ কঠিন পদার্থের সক্রিয়তা ১ ধরা হয়।","The activity of the pure solid is taken as 1."]
].map(([title,titleEn,options,optionsEn,answer,explanation,explanationEn])=>({chapter:"1-2",title,titleEn,options,optionsEn,answer,explanation,explanationEn,public:true}));

starterQuiz.push(...activities);
