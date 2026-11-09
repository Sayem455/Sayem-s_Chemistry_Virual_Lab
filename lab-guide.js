import {$, escapeHTML as h, languageButton, tr} from "./shared.js";

const personalProtection = [
  {
    id: "apron", name: ["রাসায়নিক-প্রতিরোধী এপ্রন", "Chemical-resistant apron"],
    job: ["রাসায়নিকের ছিটা থেকে শরীরের সামনের অংশ ও পোশাক রক্ষা করে।", "Protects the front of the body and clothing from splashes."],
    use: ["ক্ষয়কারী দ্রবণ ছিটকে পড়ার ঝুঁকি থাকলে ঝুঁকি মূল্যায়ন অনুযায়ী ল্যাব কোটের ওপর পরা হয়।", "Wear it over a lab coat when the assessment calls for added splash protection."],
    example: ["ঘন HCl নিয়ে প্রশিক্ষিত ব্যক্তির কাজে অ্যাসিড-প্রতিরোধী এপ্রন।", "An acid-resistant apron for authorized work with concentrated HCl."],
  },
  {
    id: "goggles", name: ["সুরক্ষা গগলস", "Splash goggles"],
    job: ["রাসায়নিকের ছিটা থেকে চোখ রক্ষা করে।", "Protect the eyes from chemical splashes."],
    use: ["ছিটকে পড়ার ঝুঁকি আছে এমন পরীক্ষায় শুরু থেকেই চোখের চারপাশ ঢেকে পরো।", "Wear splash goggles from the start of splash-risk work, fitted around the eyes."],
    example: ["NaOH দ্রবণ বা অ্যাসিড নিয়ে ছিটা লাগতে পারে এমন কাজ।", "Splash-risk work with NaOH solution or an acid."],
  },
  {
    id: "coat", name: ["ল্যাব কোট", "Lab coat"],
    job: ["শরীর ও পোশাকের ওপর সুরক্ষার স্তর তৈরি করে।", "Provide a protective layer over skin and clothing."],
    use: ["পরীক্ষার ঝুঁকি অনুযায়ী শিক্ষকের নির্ধারিত কোট বা অ্যাপ্রন পরো ও সামনের অংশ বন্ধ রাখো।", "Use the coat or apron specified by your teacher for the experiment and fasten it."],
    example: ["Na₂CO₃ বা CuSO₄·5H₂O নিয়ে অনুমোদিত ল্যাবের কাজ।", "Authorized lab work with Na₂CO₃ or CuSO₄·5H₂O."],
  },
  {
    id: "gloves", name: ["সুরক্ষা গ্লাভস", "Protective gloves"],
    job: ["হাতে রাসায়নিক লাগার ঝুঁকি কমায়।", "Reduce chemical contact with the hands."],
    use: ["রাসায়নিকের SDS ও শিক্ষকের নির্দেশনা অনুযায়ী গ্লাভস বেছে নাও। দূষিত বা ছেঁড়া গ্লাভস বদলাও।", "Choose gloves for the specific chemical using its SDS and your teacher’s instructions. Replace contaminated or torn gloves."],
    example: ["NaOH দ্রবণের জন্য গ্লাভস বাছাইয়ে ঘনমাত্রা ও সংস্পর্শের সময় বিবেচনা করো।", "For NaOH solution, consider the concentration and contact time when selecting gloves."],
  },
  {
    id: "mask", name: ["মাস্ক ও রেসপিরেটর", "Mask and respirator"],
    job: ["ছবির সাধারণ মাস্ক বড় ফোঁটা আটকাতে সাহায্য করে। অনুমোদিত কণা-ফিল্টার রেসপিরেটর নির্দিষ্ট ধুলা বা কণার জন্য ব্যবহৃত হয়।", "The ordinary mask pictured helps block large droplets. An approved particulate respirator is intended for specified dusts or particles."],
    use: ["শ্বাস-সুরক্ষা প্রয়োজন হলে দায়িত্বপ্রাপ্ত ব্যক্তি ঝুঁকি অনুযায়ী রেসপিরেটর বাছাই ও ফিট যাচাই করেন।", "When respiratory protection is needed, the responsible person selects the respirator and verifies its fit."],
    example: ["ঘন HCl-এর বাষ্পের জন্য সাধারণ মাস্ক বা N95 যথেষ্ট সুরক্ষা দেয় না। এ কাজের জন্য চালু ফিউম হুড ও অনুমোদিত পদ্ধতি দরকার।", "Ordinary masks and N95 respirators do not protect against concentrated HCl vapour. This work requires an operating fume hood and an approved procedure."],
  },
  {
    id: "shield", name: ["ফেস শিল্ড", "Face shield"],
    job: ["মুখের বড় অংশকে রাসায়নিকের ছিটা থেকে আড়াল করে।", "Shields much of the face from splashes."],
    use: ["ছিটা বেশি হওয়ার ঝুঁকিতে গগলসের সঙ্গে বাড়তি সুরক্ষা হিসেবে পরা হয়।", "Wear it with splash goggles as added protection when the splash risk is higher."],
    example: ["ঘন অ্যাসিড বা ক্ষার নিয়ে প্রশিক্ষিত ব্যক্তির ছিটা-ঝুঁকির কাজ।", "Authorized splash-risk work with concentrated acids or bases."],
  },
  {
    id: "shoes", name: ["পা ঢাকা জুতা", "Closed-toe shoes"],
    job: ["রাসায়নিকের ছিটা ও পড়ে যাওয়া কাচ থেকে পা ঢেকে রাখে।", "Cover feet against splashes and dropped glass."],
    use: ["ল্যাবে ঢোকার আগেই পায়ের আঙুল ও ওপরের অংশ ঢাকা জুতা পরো।", "Put on shoes that cover the toes and tops of the feet before entering the lab."],
    example: ["যেকোনো রাসায়নিকের ব্যবহারিক ক্লাসে, যেমন NaCl দ্রবণ তৈরির সময়ও।", "For all practical lab sessions, including preparation of a NaCl solution."],
  },
];

const safetyGear = [
  {
    id: "hood", name: ["ফিউম হুড", "Fume hood"],
    job: ["উৎপন্ন ক্ষতিকর বাষ্প বা গ্যাস কাজের জায়গা থেকে টেনে সরায়।", "Extract hazardous vapours or gases from the working area."],
    use: ["বাষ্প বা গ্যাসের ঝুঁকি আছে এমন অনুমোদিত কাজ চালু হুডে করো। স্যাশের উচ্চতা ও বায়ুপ্রবাহ শিক্ষককে দিয়ে যাচাই করাও।", "Do approved vapour- or gas-producing work in an operating hood. Have your teacher check the sash height and airflow."],
  },
  {
    id: "eyewash", name: ["আইওয়াশ স্টেশন", "Eyewash station"],
    job: ["চোখ থেকে রাসায়নিক ধুয়ে সরাতে পানি দেয়।", "Provide water to flush a chemical from the eyes."],
    use: ["চোখে ছিটা লাগলে সঙ্গে সঙ্গে আইওয়াশে চোখ ধোয়া শুরু করো ও সাহায্যের জন্য শিক্ষককে ডাকো। পরীক্ষার আগে এর অবস্থান দেখে রাখো।", "If a splash reaches the eyes, start flushing at the eyewash immediately and call the teacher for help. Locate the station before the experiment."],
  },
  {
    id: "shower", name: ["সেফটি শাওয়ার", "Safety shower"],
    job: ["শরীরের বড় অংশে পড়া রাসায়নিক দ্রুত ধুয়ে ফেলার ব্যবস্থা।", "Rapidly flush chemicals from a large area of the body."],
    use: ["শরীরে বড় ছিটা লাগলে জরুরি শাওয়ার চালু করো ও সাহায্যের জন্য ডাকো। ল্যাবের জরুরি নির্দেশনা অনুসরণ করো।", "For a large splash onto the body, activate the emergency shower and call for help. Follow the laboratory’s emergency instructions."],
  },
  {
    id: "extinguisher", name: ["অগ্নিনির্বাপক", "Fire extinguisher"],
    job: ["আগুনের ধরনের উপযোগী নির্বাপক দিয়ে প্রশিক্ষিত ব্যক্তি ছোট আগুন নিয়ন্ত্রণের চেষ্টা করতে পারেন।", "Trained personnel may use the appropriate extinguisher to tackle a small fire."],
    use: ["আগুন দেখলে শিক্ষককে সতর্ক করো এবং ল্যাবের জরুরি বের হওয়ার নির্দেশনা অনুসরণ করো।", "If you see a fire, alert the teacher and follow the laboratory’s evacuation procedure."],
  },
  {
    id: "first-aid", name: ["প্রাথমিক চিকিৎসা বাক্স", "First-aid kit"],
    job: ["প্রাথমিক চিকিৎসার সরঞ্জাম এক জায়গায় রাখে।", "Keep basic first-aid supplies together."],
    use: ["আঘাতের কথা সঙ্গে সঙ্গে শিক্ষককে জানাও। দায়িত্বপ্রাপ্ত ব্যক্তি ল্যাবের নিয়ম মেনে সাহায্য করবেন।", "Report injuries to the teacher promptly. The designated person can provide help under the lab’s procedures."],
  },
  {
    id: "spill", name: ["স্পিল কিট", "Spill kit"],
    job: ["অনুমোদিত পদ্ধতিতে ছড়িয়ে পড়া রাসায়নিক সামলানোর সরঞ্জাম রাখে।", "Hold supplies for responding to a chemical spill with an approved procedure."],
    use: ["রাসায়নিক পড়ে গেলে অন্যদের দূরে রাখো ও শিক্ষককে জানাও। প্রশিক্ষিত ব্যক্তি পদার্থের ধরন বুঝে কিট ব্যবহার করবেন।", "Keep others away from a spill and notify the teacher. A trained person chooses the response for the specific chemical."],
  },
  {
    id: "sink", name: ["ল্যাব সিঙ্ক", "Lab sink"],
    job: ["হাত ধোয়া ও অনুমোদিত কাচপাত্র পরিষ্কারের জন্য পানি দেয়।", "Provides water for handwashing and approved glassware cleaning."],
    use: ["কাজ শেষে হাত ধোও। রাসায়নিক বর্জ্যের জন্য শিক্ষকের নির্ধারিত পাত্র ব্যবহার করো।", "Wash hands after lab work. Use the designated container for chemical waste."],
  },
  {
    id: "blanket", name: ["অগ্নিনিরোধক কম্বল", "Fire blanket"],
    job: ["ল্যাবের নিয়মে অনুমোদিত হলে প্রশিক্ষিত ব্যক্তি বেঞ্চে লাগা ছোট আগুন ঢেকে নেভাতে এটি ব্যবহার করেন।", "Used by trained personnel to smother a small bench fire where laboratory procedures allow."],
    use: ["আগুন দেখলে শিক্ষককে জানাও এবং জরুরি বহির্গমন নির্দেশনা অনুসরণ করো।", "Alert the teacher to a fire and follow the evacuation procedure."],
  },
  {
    id: "alarm", name: ["অগ্নিসংকেত ও জরুরি বহির্গমন", "Fire alarm and emergency exit"],
    job: ["বিপদ সম্পর্কে সবাইকে জানায় এবং নিরাপদে বের হওয়ার পথ দেখায়।", "Alert occupants to danger and identify the evacuation route."],
    use: ["কাজের আগেই সংকেত ও বের হওয়ার পথ চিনে রাখো। সংকেত বাজলে শিক্ষকের নির্দেশে বের হও।", "Identify the alarm and exit route before work. Follow the teacher’s instructions when the alarm sounds."],
  },
  {
    id: "glass-bin", name: ["ভাঙা কাচের পাত্র", "Broken-glass bin"],
    job: ["ধারালো ভাঙা কাচ অন্য বর্জ্য থেকে আলাদা রাখে।", "Keeps sharp broken glass separate from other waste."],
    use: ["কাচ ভাঙলে শিক্ষককে জানাও। রাসায়নিক-দূষিত কাচের জন্য ল্যাবের নির্ধারিত বর্জ্যপদ্ধতি প্রযোজ্য।", "Report broken glass to the teacher. Follow the designated waste procedure for chemically contaminated glass."],
  },
  {
    id: "gas-valve", name: ["গ্যাস বন্ধ করার ভালভ", "Gas shutoff valve"],
    job: ["জরুরি অবস্থায় ল্যাবের গ্যাস সরবরাহ বন্ধ করার ব্যবস্থা।", "Allows the laboratory gas supply to be shut off in an emergency."],
    use: ["এর অবস্থান আগে চিনে রাখো। গ্যাসের গন্ধ বা লিক সন্দেহ হলে শিক্ষককে জানাও ও জরুরি নির্দেশ অনুসরণ করো।", "Locate it before work. If you suspect a leak, alert the teacher and follow the emergency instructions."],
  },
  {
    id: "phone", name: ["জরুরি ফোন", "Emergency phone"],
    job: ["ল্যাবে দুর্ঘটনার খবর দেওয়া ও জরুরি সাহায্য চাওয়ার ব্যবস্থা।", "Provides a way to report incidents and call for emergency assistance."],
    use: ["কাজের আগে ফোন ও ল্যাবের জরুরি নম্বর কোথায় আছে জেনে রাখো।", "Locate the phone and the lab’s emergency numbers before starting work."],
  },
];

const equipment = [
  {
    id: "beaker", name: ["বিকার", "Beaker"],
    job: ["দ্রবণ রাখা, মেশানো ও কঠিন পদার্থ দ্রবীভূত করার পাত্র।", "Hold and mix liquids and dissolve solids."],
    use: ["দ্রবণ তৈরির শুরুর ধাপে ব্যবহার করো। গায়ের দাগ আনুমানিক আয়তন দেখায়।", "Use it at the start of solution preparation. Its graduations indicate approximate volume."],
  },
  {
    id: "cylinder", name: ["মেজারিং সিলিন্ডার", "Graduated cylinder"],
    job: ["দাগাঙ্কিত নলে বিভিন্ন আয়তনের তরল মাপা যায়।", "Measure different liquid volumes using graduations."],
    use: ["সমতল জায়গায় দাঁড় করাও। পানির মতো স্বচ্ছ তরলের নিচের মেনিস্কাস চোখের সমতলে পড়ো।", "Set it upright on a level surface. For a clear aqueous liquid, read the bottom of the meniscus at eye level."],
  },
  {
    id: "volumetric", name: ["আয়তনিক ফ্লাস্ক", "Volumetric flask"],
    job: ["গলার একক দাগ পর্যন্ত নির্দিষ্ট আয়তনের দ্রবণ তৈরি করে।", "Prepare a fixed volume of solution at the single neck mark."],
    use: ["দ্রবীভূত নমুনা স্থানান্তর করে দাগ পর্যন্ত দ্রাবক যোগ করো। তারপর ছিপি লাগিয়ে মিশিয়ে নাও।", "Transfer the dissolved sample, add solvent to the mark, then stopper and mix."],
    link: ["lab-balances.html#solutions", "দ্রবণ তৈরির অনুশীলন", "Try preparing a solution"],
  },
  {
    id: "pipette", name: ["আয়তনিক পিপেট", "Volumetric pipette"],
    job: ["একটি নির্দিষ্ট আয়তনের তরল অন্য পাত্রে স্থানান্তর করে।", "Deliver one fixed volume of liquid into another vessel."],
    use: ["পিপেট ফিলার লাগিয়ে দাগ পর্যন্ত তরল তোলো। টাইট্রেশনের নমুনা কনিকেল ফ্লাস্কে নিতে ব্যবহার করো।", "Use a pipette filler to draw liquid to the mark. Transfer a titration sample into a conical flask."],
  },
  {
    id: "burette", name: ["বুরেট", "Burette"],
    job: ["স্টপকক দিয়ে নিয়ন্ত্রিতভাবে তরল ছাড়ে।", "Deliver controlled amounts of liquid through a stopcock."],
    use: ["স্ট্যান্ডে খাড়া করে টাইট্রেশনে ব্যবহার করো। শেষ ও শুরুর পাঠের পার্থক্য থেকে ছাড়া তরলের আয়তন পাও।", "Clamp it upright for a titration. Subtract the initial reading from the final reading for volume delivered."],
    link: ["lab.html#titration", "টাইট্রেশন ডেমো", "Open the titration demo"],
  },
  {
    id: "conical", name: ["কনিকেল ফ্লাস্ক", "Conical flask"],
    job: ["সরু গলার কারণে তরল ঘুরিয়ে মেশানো সহজ হয়।", "The narrow neck makes it easier to swirl and mix liquids."],
    use: ["টাইট্রেশনে বুরেটের নিচে রাখো। বিকারক যোগ করার সময় শিক্ষকের নির্দেশমতো দ্রবণ ঘুরিয়ে মেশাও।", "Place it below a burette in a titration and swirl as your teacher directs."],
  },
  {
    id: "tube", name: ["টেস্টটিউব", "Test tube"],
    job: ["অল্প পরিমাণে বিক্রিয়া ও রং বা অধঃক্ষেপ পর্যবেক্ষণের পাত্র।", "Run small reactions and observe colour changes or precipitates."],
    use: ["র‍্যাকে রেখে কাজ করো। শিক্ষক গরম করতে বললে হোল্ডার ব্যবহার করো এবং নলের মুখ মানুষ থেকে দূরে রাখো।", "Use a test-tube rack. If heating is authorized, use a holder and point the opening away from people."],
  },
  {
    id: "funnel", name: ["ফানেল ও ফিল্টার পেপার", "Funnel and filter paper"],
    job: ["ফানেল দিয়ে ঢালা যায়। ফিল্টার পেপার যোগ করলে অদ্রবণীয় কঠিন পদার্থ আলাদা হয়।", "A funnel guides pouring. Adding filter paper retains an insoluble solid."],
    use: ["ফিল্টার পেপার ফানেলে বসিয়ে নিচে পরিশ্রুত তরল সংগ্রহের পাত্র রাখো।", "Fit filter paper in the funnel and place a vessel below it to collect the filtrate."],
  },
  {
    id: "spatula", name: ["স্প্যাচুলা", "Spatula"],
    job: ["অল্প পরিমাণ কঠিন বিকারক স্থানান্তর করে।", "Transfer small amounts of a solid reagent."],
    use: ["শুষ্ক ও পরিষ্কার স্প্যাচুলা দিয়ে কঠিন পদার্থ ওজন-পাত্রে নাও।", "Use a clean, dry spatula to transfer a solid to a weighing container."],
  },
  {
    id: "wash-bottle", name: ["ওয়াশ বোতল", "Wash bottle"],
    job: ["চাপ দিলে সরু মুখ দিয়ে লেবেলে লেখা তরলের ধারা বের হয়।", "Squeezing delivers a directed stream of the liquid on its label."],
    use: ["পাতিত পানির বোতল দিয়ে বিকার ধুয়ে দ্রবণের অবশিষ্ট অংশ ফ্লাস্কে স্থানান্তর করা যায়।", "Use a distilled-water wash bottle to rinse remaining solution from the beaker into a flask."],
  },
  {
    id: "balance", name: ["ডিজিটাল নিক্তি", "Digital balance"],
    job: ["নমুনার ভর সংখ্যায় দেখায়।", "Display the sample’s mass numerically."],
    use: ["নমুনা রাখার আগে খালি ওজন-পাত্রের ভর TARE দিয়ে বাদ দাও।", "Tare the empty weighing container before adding the sample."],
    link: ["lab-balances.html#digital", "ডিজিটাল নিক্তিতে মাপো", "Try digital weighing"],
  },
];

const symbols = [
  {id: "flame", code: "GHS02", name: ["শিখা", "Flame"], job: ["দাহ্য বা আগুন ধরার অন্য ঝুঁকি।", "Flammability or another fire hazard."]},
  {id: "corrosion", code: "GHS05", name: ["ক্ষয়", "Corrosion"], job: ["ত্বক পোড়ানো, চোখের গুরুতর ক্ষতি বা ধাতু ক্ষয়ের ঝুঁকি।", "Skin burns, serious eye damage or corrosion of metals."]},
  {id: "skull", code: "GHS06", name: ["খুলি ও হাড়", "Skull and crossbones"], job: ["তীব্র বিষাক্ততা। সংস্পর্শে গুরুতর ক্ষতি বা মৃত্যুর ঝুঁকি।", "Acute toxicity with risk of severe harm or death after exposure."]},
  {id: "exclamation", code: "GHS07", name: ["বিস্ময়সূচক চিহ্ন", "Exclamation mark"], job: ["চোখ বা ত্বকের জ্বালা, ক্ষতিকর তীব্র বিষাক্ততা বা অন্যান্য স্বাস্থ্যঝুঁকি।", "Eye or skin irritation, harmful acute toxicity or other health hazards."]},
  {id: "environment", code: "GHS09", name: ["পরিবেশ", "Environment"], job: ["জলজ প্রাণী ও উদ্ভিদের ক্ষতির ঝুঁকি।", "Harm to aquatic life."]},
  {id: "oxidizer", code: "GHS03", name: ["বৃত্তের ওপর শিখা", "Flame over circle"], job: ["জারক পদার্থ। আগুন শুরু বা তীব্র করার ঝুঁকি।", "Oxidizers can cause or intensify a fire."]},
  {id: "explosive", code: "GHS01", name: ["বিস্ফোরণ", "Exploding bomb"], job: ["বিস্ফোরক বা নির্দিষ্ট অস্থিতিশীল পদার্থের ঝুঁকি।", "Explosive or certain unstable substances."]},
  {id: "gas", code: "GHS04", name: ["গ্যাস সিলিন্ডার", "Gas cylinder"], job: ["চাপযুক্ত গ্যাসের ঝুঁকি।", "Gases under pressure."]},
  {id: "health", code: "GHS08", name: ["গুরুতর স্বাস্থ্যঝুঁকি", "Serious health hazard"], job: ["ক্যানসার, অঙ্গের ক্ষতি বা শ্বাসতন্ত্রের সংবেদনশীলতার মতো নির্দিষ্ট গুরুতর ঝুঁকি।", "Specific serious hazards such as cancer, organ damage or respiratory sensitization."]},
];

const hazardLessons = {
  flame: {
    legacy: ["F", "F+"],
    example: ["ইথানল · দাহ্য তরল শ্রেণি ২ (H225)। ডাইইথাইল ইথার · শ্রেণি ১ (H224), অত্যন্ত দাহ্য।", "Ethanol · flammable liquid category 2 (H225). Diethyl ether · category 1 (H224), extremely flammable."],
    precaution: ["তাপ, স্ফুলিঙ্গ ও খোলা শিখা থেকে দূরে রাখো। ব্যবহার শেষে পাত্র বন্ধ রাখো।", "Keep away from heat, sparks and open flames. Close the container after use."],
    source: "https://hcis.safeworkaustralia.gov.au/HazardousChemical/Details?chemicalID=1340",
  },
  corrosion: {
    legacy: ["C"],
    example: ["কঠিন NaOH · ত্বকের ক্ষয় শ্রেণি ১এ (H314)। চোখেও গুরুতর ক্ষতি করতে পারে।", "Solid NaOH · skin corrosion category 1A (H314). It can also cause serious eye damage."],
    precaution: ["ছিটা-রোধী গগলস ও পদার্থের উপযোগী গ্লাভস বেছে নাও। ঝুঁকি অনুযায়ী এপ্রন ও ফেস শিল্ড যোগ করো।", "Use splash goggles and compatible gloves. Add an apron and face shield as called for by the risk assessment."],
    source: "https://www.carlroth.com/downloads/sdb/en/6/SDB_6771_MT_EN.pdf",
  },
  skull: {
    legacy: ["T", "T+"],
    example: ["সোডিয়াম অ্যাজাইড (NaN₃) · গিলে ফেলার তীব্র বিষাক্ততা শ্রেণি ২ (H300)। H301 মানে গিলে ফেললে বিষাক্ত, H300 মানে গিলে ফেললে প্রাণঘাতী হতে পারে।", "Sodium azide (NaN₃) · acute oral toxicity category 2 (H300). H301 indicates toxic if swallowed, while H300 indicates potentially fatal oral exposure."],
    precaution: ["সংস্পর্শ এড়াও। এ ধরনের নমুনা কেবল প্রশিক্ষিত ও অনুমোদিত কর্মীর জন্য।", "Avoid exposure. Leave these materials to trained, authorized personnel."],
    source: "https://www.carlroth.com/downloads/sdb/en/K/SDB_K305_MT_EN.pdf",
  },
  exclamation: {
    legacy: ["Xi", "Xn"],
    example: ["পানিশূন্য Na₂CO₃ · চোখে জ্বালা শ্রেণি ২ (H319)। CuSO₄·5H₂O · গিলে ফেলার তীব্র বিষাক্ততা শ্রেণি ৪ (H302), অর্থাৎ ক্ষতিকারক।", "Anhydrous Na₂CO₃ · eye irritation category 2 (H319). CuSO₄·5H₂O · acute oral toxicity category 4 (H302), harmful if swallowed."],
    precaution: ["ধুলা ও ছিটা এড়াও। বোতলের লেবেল দেখে উপযুক্ত চোখ ও হাতের সুরক্ষা ব্যবহার করো।", "Avoid dust and splashes. Check the label for suitable eye and hand protection."],
    source: "https://www.carlroth.com/downloads/sdb/en/P/SDB_P025_GB_EN.pdf",
  },
  environment: {
    legacy: ["N"],
    example: ["CuSO₄·5H₂O · দীর্ঘমেয়াদি জলজ ঝুঁকি শ্রেণি ১ (H410)।", "CuSO₄·5H₂O · chronic aquatic hazard category 1 (H410)."],
    precaution: ["সিঙ্ক বা মাটিতে ছড়ানো ঠেকাও। বর্জ্য নির্ধারিত পাত্রে রাখো।", "Prevent release into drains or soil. Collect waste in the designated container."],
    source: "https://www.carlroth.com/downloads/sdb/en/P/SDB_P025_GB_EN.pdf",
  },
  oxidizer: {
    legacy: ["O"],
    example: ["কঠিন KMnO₄ · জারক কঠিন পদার্থ শ্রেণি ২ (H272)।", "Solid KMnO₄ · oxidizing solid category 2 (H272)."],
    precaution: ["দাহ্য পদার্থ থেকে আলাদা রাখো। শিক্ষকের অনুমতি ছাড়া অন্য বিকারকের সঙ্গে মেশাবে না।", "Keep away from combustible material. Mix with other reagents only as authorized by your teacher."],
    source: "https://hcis.safeworkaustralia.gov.au/HazardousChemical/Details?chemicalID=3631",
  },
  explosive: {
    legacy: ["E"],
    example: ["TNT · বিস্ফোরক বিভাগ ১.১ (H201)। একই সঙ্গে বড় অংশ বিস্ফোরিত হওয়ার ঝুঁকি।", "TNT · explosive division 1.1 (H201), a mass explosion hazard."],
    precaution: ["সন্দেহজনক পাত্র থেকে দূরে সরে দায়িত্বপ্রাপ্ত ব্যক্তিকে জানাও।", "Move away from a suspect container and alert the responsible person."],
    source: "https://www.epa.govt.nz/database-search/approved-hazardous-substances-with-controls/view/D4BB7F23-F0C2-417A-AF16-8191575C7C39/",
  },
  gas: {
    example: ["সংকুচিত নাইট্রোজেন (N₂) · চাপযুক্ত গ্যাস (H280)। গরম হলে সিলিন্ডার ফাটতে পারে।", "Compressed nitrogen (N₂) · gas under pressure (H280). The cylinder may burst if heated."],
    precaution: ["তাপ থেকে দূরে রাখো। সিলিন্ডার স্থির করা ও ব্যবহার প্রশিক্ষিত ব্যক্তির কাজ।", "Keep cylinders away from heat. Trained personnel secure and operate them."],
    source: "https://static.prd.echannel.linde.com/wcsstore/LT_REN_Industrial_Gas_Store/pdf/SDS_LT/EN/Nitrogen-compressed_Biogon-N_1.1-ENLT_tcm619-456706.pdf",
  },
  health: {
    example: ["বেনজিন · ক্যান্সার সৃষ্টির ঝুঁকি শ্রেণি ১এ (H350)। মিথানল · একবারের সংস্পর্শে নির্দিষ্ট অঙ্গের ক্ষতি শ্রেণি ১ (H370)।", "Benzene · carcinogenicity category 1A (H350). Methanol · specific target organ toxicity after single exposure, category 1 (H370)."],
    precaution: ["কম ঝুঁকির অনুমোদিত বিকল্প বেছে নাও। সংস্পর্শ নিয়ন্ত্রণে ল্যাবের অনুমোদিত পদ্ধতি অনুসরণ করো।", "Choose an approved, lower-hazard substitute. Follow the lab’s approved exposure controls."],
    source: "https://hcis.safeworkaustralia.gov.au/HazardousChemical/Details?chemicalID=359",
  },
};

const labWarnings = [
  {
    id: "radiation", name: ["আয়নকারী বিকিরণ", "Ionizing radiation"],
    job: ["ট্রিফয়েল আয়নকারী বিকিরণের উৎস বা নিয়ন্ত্রিত এলাকা চেনায়।", "The trefoil identifies an ionizing radiation source or controlled area."],
    example: ["এক্স-রে কক্ষের প্রবেশপথ। প্রাপ্ত ডোজের ওপর ক্ষতির মাত্রা নির্ভর করে।", "Example: an X-ray room entrance. The severity of harm depends on the dose received."],
    precaution: ["প্রবেশের নির্দেশ মানো। প্রশিক্ষিত কর্মীরা সময়, দূরত্ব ও আড়াল নিয়ন্ত্রণ করেন।", "Follow access signs. Trained workers manage time, distance and shielding."],
    source: "https://www.osha.gov/ionizing-radiation/background",
  },
  {
    id: "biohazard", name: ["জৈব ঝুঁকি", "Biological hazard"],
    job: ["সংক্রমণ ঘটাতে পারে এমন নমুনা বা নিয়ন্ত্রিত এলাকার সতর্কতা।", "Warns of potentially infectious samples or controlled areas."],
    example: ["সংক্রমণ-সন্দেহযুক্ত নমুনার পাত্র। মাত্রা নমুনা, জীবাণু ও সংস্পর্শের ওপর নির্ভর করে।", "Example: a potentially infectious specimen container. Risk depends on the specimen, agent and exposure."],
    precaution: ["পাত্র খুলবে না। প্রবেশ ও নমুনা ব্যবহারে দায়িত্বপ্রাপ্ত ব্যক্তির নির্দেশ মানো।", "Leave containers closed. Follow the responsible person’s access and handling instructions."],
    source: "https://www.cdc.gov/labs/pdf/SF__19_308133-A_BMBL6_00-BOOK-WEB-final-3.pdf",
  },
  {
    id: "electricity", name: ["বৈদ্যুতিক বিপদ", "Electrical hazard"],
    job: ["বিদ্যুৎস্পৃষ্ট হওয়া বা পোড়ার ঝুঁকি জানায়।", "Warns of electric shock or burns."],
    example: ["উচ্চ ভোল্টেজের বিদ্যুৎ সরবরাহ যন্ত্র। ভোল্টেজ, কারেন্ট ও সংস্পর্শের সময়ের সঙ্গে ঝুঁকি বদলায়।", "Example: a high-voltage power supply. Risk varies with voltage, current and contact time."],
    precaution: ["হাত শুকনো রাখো। ক্ষতিগ্রস্ত তার বা যন্ত্র দেখলে স্পর্শ না করে শিক্ষককে জানাও।", "Keep hands dry. Report damaged cords or equipment to the teacher and avoid contact."],
    source: "https://www.osha.gov/electrical",
  },
];

const chemicals = [
  {
    formula: "C₂H₅OH", name: ["ইথানল", "Ethanol"],
    grade: ["অ্যাবসোলিউট ইথানল · Fisher Scientific", "Absolute ethanol · Fisher Scientific"],
    signal: "danger", signs: ["flame", "exclamation"],
    risks: [
      ["H225", "দাহ্য তরল · শ্রেণি ২ · তরল ও বাষ্প খুব সহজে জ্বলে ওঠে।", "Flammable liquid · category 2 · liquid and vapour ignite easily."],
      ["H319", "চোখে জ্বালা · শ্রেণি ২ · চোখে তীব্র জ্বালা সৃষ্টি করতে পারে।", "Eye irritation · category 2 · may seriously irritate the eyes."],
    ],
    precautions: ["তাপ, স্ফুলিঙ্গ ও খোলা শিখা থেকে দূরে রাখো। শিক্ষকের নির্দেশে চোখের সুরক্ষা ব্যবহার করো।", "Keep it away from heat, sparks and open flames. Use eye protection as instructed."],
    source: "https://assets.thermofisher.com/DirectWebViewer/private/document.aspx?prd=FSUE0665DF~~PDF~~MTR~~CLP1~~EN~~2023-10-19+20%3A52%3A40~~Ethanol++absolute~~",
  },
  {
    formula: "NaOH", name: ["সোডিয়াম হাইড্রক্সাইড", "Sodium hydroxide"],
    grade: ["কঠিন দানা ≥98% · Carl Roth 6771", "Solid pellets ≥98% · Carl Roth 6771"],
    signal: "danger", signs: ["corrosion"],
    risks: [
      ["H314", "ত্বকের ক্ষয় · শ্রেণি ১এ · ত্বকে গুরুতর দাহ ও চোখের ক্ষতি করতে পারে।", "Skin corrosion · category 1A · can cause severe skin burns and eye damage."],
      ["H290", "ধাতু ক্ষয় · শ্রেণি ১ · কিছু ধাতুকে ক্ষয় করতে পারে।", "Corrosive to metals · category 1 · may corrode metals."],
    ],
    precautions: ["শিক্ষকের তত্ত্বাবধানে উপযুক্ত গ্লাভস ও চোখের সুরক্ষা ব্যবহার করো। পাত্র বন্ধ রাখো।", "Under teacher supervision, use suitable gloves and eye protection. Keep the container closed."],
    source: "https://www.carlroth.com/downloads/sdb/en/6/SDB_6771_MT_EN.pdf",
  },
  {
    formula: "Na₂CO₃", name: ["সোডিয়াম কার্বনেট", "Sodium carbonate"],
    grade: ["পানিশূন্য, ≥99% · Carl Roth 8563", "Anhydrous, ≥99% · Carl Roth 8563"],
    signal: "warning", signs: ["exclamation"],
    risks: [
      ["H319", "চোখে জ্বালা · শ্রেণি ২ · চোখে তীব্র জ্বালা সৃষ্টি করতে পারে।", "Eye irritation · category 2 · may seriously irritate the eyes."],
    ],
    precautions: ["চোখের সুরক্ষা ব্যবহার করো। কঠিন পদার্থ স্থানান্তরে ধুলা ও ছিটা এড়াও।", "Use eye protection and avoid creating dust or splashes when transferring the solid."],
    source: "https://www.carlroth.com/medias/SDB-8563-GB-EN.pdf?context=bWFzdGVyfHNlY3VyaXR5RGF0YXNoZWV0c3wyNDgxMTl8YXBwbGljYXRpb24vcGRmfGFEQTRMMmhqTkM4NU1UYzRPVEl3T1RRek5qUTJMMU5FUWw4NE5UWXpYMGRDWDBWT0xuQmtaZ3wwNTYxN2Q4ODJmNjk3Njg0ODFmMzk5NjgxZWE3YThlZGM5ODJiZjZkODExYzM4ZTMxOWI1YjMxZjNhNWE5Zjg3",
  },
  {
    formula: "CuSO₄·5H₂O", name: ["কপার সালফেট পেন্টাহাইড্রেট", "Copper sulfate pentahydrate"],
    grade: ["কঠিন স্ফটিক ≥99% · Carl Roth P025", "Solid crystals ≥99% · Carl Roth P025"],
    signal: "danger", signs: ["corrosion", "exclamation", "environment"],
    risks: [
      ["H302", "তীব্র বিষাক্ততা · শ্রেণি ৪ · গিলে ফেললে ক্ষতিকর।", "Acute oral toxicity · category 4 · harmful if swallowed."],
      ["H318", "চোখের গুরুতর ক্ষতি · শ্রেণি ১।", "Serious eye damage · category 1."],
      ["H410", "দীর্ঘমেয়াদি জলজ ঝুঁকি · শ্রেণি ১ · জলজ জীবের দীর্ঘস্থায়ী ক্ষতি করতে পারে।", "Chronic aquatic hazard · category 1 · can cause lasting harm to aquatic life."],
    ],
    precautions: ["উপযুক্ত গ্লাভস ও চোখের সুরক্ষা ব্যবহার করো। বর্জ্য শিক্ষকের নির্দেশিত পাত্রে রাখো, সিঙ্কে ঢালো না।", "Use suitable gloves and eye protection. Put waste into the container directed by the teacher and keep it out of the sink."],
    source: "https://www.carlroth.com/downloads/sdb/en/P/SDB_P025_GB_EN.pdf",
  },
];

const habits = [
  [["ল্যাবে খাবার বা পানীয় রাখা", "Food or drink in the lab"],
   ["খাবারে রাসায়নিক লাগতে পারে। খাবার ও পানীয় বাইরে রাখো এবং কাজ শেষে সাবান-পানিতে হাত ধোও।", "Chemicals can contaminate food. Keep food and drink outside and wash your hands with soap and water after lab work."]],
  [["মুখ দিয়ে পিপেট টানা", "Mouth pipetting"],
   ["তরল মুখে চলে যেতে পারে। পিপেট ফিলার ব্যবহার করো।", "Liquid can enter the mouth. Use a pipette filler."]],
  [["রাসায়নিকের সরাসরি গন্ধ নেওয়া", "Smelling a chemical directly"],
   ["ক্ষতিকর বাষ্প শ্বাসের সঙ্গে ঢুকতে পারে। পরীক্ষার জন্য শিক্ষক যে পর্যবেক্ষণ পদ্ধতি অনুমোদন করেন, সেটি অনুসরণ করো।", "Harmful vapours can be inhaled. Follow the observation method authorized by your teacher."]],
  [["অবশিষ্ট বিকারক মূল বোতলে ফেরানো", "Returning excess reagent to its bottle"],
   ["মূল বিকারক দূষিত হতে পারে। অবশিষ্টাংশ শিক্ষক যে বর্জ্যপাত্র দেখান সেখানে দাও।", "It can contaminate the stock. Put excess reagent in the waste container specified by your teacher."]],
  [["ছিটা বা ভাঙা কাচ নিজে সরানো", "Handling a spill or broken glass yourself"],
   ["ছিটা ও ভাঙা কাচে আঘাতের ঝুঁকি থাকে। অন্যদের দূরে রেখে শিক্ষককে সঙ্গে সঙ্গে জানাও।", "Spills and broken glass can cause injury. Keep others away and tell the teacher immediately."]],
  [["অনুমতি ছাড়া বিকারক মেশানো বা গরম করা", "Mixing or heating chemicals without permission"],
   ["অপ্রত্যাশিত তাপ, বাষ্প বা ছিটা তৈরি হতে পারে। শিক্ষকের অনুমোদিত ধাপ ও পরিমাণ অনুসরণ করো।", "Unexpected heat, vapours or splashes can occur. Follow the steps and quantities approved by your teacher."]],
];

const symbolById = Object.fromEntries(symbols.map(symbol => [symbol.id, symbol]));
const icon = id => `<svg class="guide-icon" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><use href="#guide-${id}"></use></svg>`;
const sign = id => `<span class="safety-sign" data-sign="${id}" aria-hidden="true"></span>`;

function makePicker(listId, detailId, entries, buttonContent, detailContent) {
  let selected = 0;
  const buttons = entries.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-pick";
    button.setAttribute("aria-controls", detailId);
    button.onclick = () => {
      selected = index;
      updateDetail();
    };
    $(listId).append(button);
    return button;
  });

  function updateDetail() {
    buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === selected)));
    $(detailId).innerHTML = detailContent(entries[selected]);
  }

  return () => {
    buttons.forEach((button, index) => { button.innerHTML = buttonContent(entries[index]); });
    updateDetail();
  };
}

function toolButton(entry) {
  return icon(entry.id) + `<span>${h(tr(...entry.name))}</span>`;
}

function toolDetail(entry) {
  const link = entry.link
    ? `<a class="guide-reference-link" href="${h(entry.link[0])}">${h(tr(entry.link[1], entry.link[2]))}</a>`
    : "";
  return `<div class="guide-tool-body">${icon(entry.id)}
    <div><h3>${h(tr(...entry.name))}</h3>
    <p><strong>${tr("কাজ", "What it does")}</strong> · ${h(tr(...entry.job))}</p>
    <p><strong>${tr("কখন ও কীভাবে", "When and how")}</strong> · ${h(tr(...entry.use))}</p>
    ${link}</div></div>`;
}

function chemicalDetail(entry) {
  const signal = entry.signal === "danger" ? tr("Danger · বিপদ", "Danger") : tr("Warning · সতর্কতা", "Warning");
  const pictograms = entry.signs.map(id =>
    `<figure>${sign(id)}<figcaption>${h(symbolById[id].code)} · ${h(tr(...symbolById[id].name))}</figcaption></figure>`
  ).join("");
  const risks = entry.risks.map(([code, bn, en]) => `<li><strong>${h(code)}</strong> · ${h(tr(bn, en))}</li>`).join("");
  return `<h3>${h(entry.formula)} · ${h(tr(...entry.name))}</h3>
    <p>${h(tr(...entry.grade))}</p>
    <p><span class="guide-signal" data-signal="${entry.signal}">${h(signal)}</span></p>
    <div class="guide-pictograms">${pictograms}</div>
    <p><strong>${tr("ক্ষতির ধরন ও শ্রেণি", "Hazard and category")}</strong></p><ul>${risks}</ul>
    <p><strong>${tr("সতর্কতা", "Precautions")}</strong> · ${h(tr(...entry.precautions))}</p>
    <a class="guide-reference-link" href="${h(entry.source)}">${tr("এই নমুনার SDS", "Safety data sheet for this product")}</a>`;
}

function card(title, image, rows, footer = "") {
  return `<article class="guide-study-card">
    <div class="guide-card-image">${image}</div>
    <h3>${h(title)}</h3>
    <dl>${rows.map(([label, body]) => `<div><dt>${h(label)}</dt><dd>${h(body)}</dd></div>`).join("")}</dl>
    ${footer}
  </article>`;
}

function sourceLink(url) {
  return `<a class="guide-reference-link" href="${h(url)}">${tr("তথ্যসূত্র", "Reference")}</a>`;
}

function protectionCard(entry) {
  return card(tr(...entry.name), icon(entry.id), [
    [tr("কেন ব্যবহার করি", "Why it is used"), tr(...entry.job)],
    [tr("কখন ব্যবহার করি", "When it is used"), tr(...entry.use)],
    ...(entry.example ? [[tr("রাসায়নিকের উদাহরণ", "Chemical example"), tr(...entry.example)]] : []),
  ]);
}

function legacySign(id, code) {
  const image = id === "exclamation" ? '<span class="guide-legacy-cross">×</span>' : sign(id);
  return `<span class="guide-legacy-sign">${image}<span class="guide-legacy-code">${h(code)}</span></span>`;
}

const legacyNames = {
  F: ["সহজে দাহ্য", "Highly flammable"], "F+": ["অত্যন্ত দাহ্য", "Extremely flammable"],
  T: ["বিষাক্ত", "Toxic"], "T+": ["অত্যন্ত বিষাক্ত", "Very toxic"],
  Xi: ["উত্তেজক", "Irritant"], Xn: ["ক্ষতিকারক", "Harmful"],
  C: ["ক্ষয়কারী", "Corrosive"], O: ["জারক", "Oxidizing"],
  E: ["বিস্ফোরক", "Explosive"], N: ["পরিবেশের জন্য ক্ষতিকর", "Dangerous for the environment"],
};

function hazardCard(entry) {
  const lesson = hazardLessons[entry.id];
  const oldCodes = lesson.legacy || [];
  const images = sign(entry.id) + oldCodes.map(code => legacySign(entry.id, code)).join("");
  const oldLabels = oldCodes.map(code => code + " · " + tr(...legacyNames[code]));
  return card(entry.code + " · " + tr(...entry.name), images, [
    [tr("কোন ঝুঁকি", "Hazard"), tr(...entry.job)],
    ...(oldLabels.length ? [[tr("পুরোনো লেবেল", "Legacy labels"), oldLabels.join(" / ")]] : []),
    [tr("উদাহরণ ও মাত্রা", "Example and severity"), tr(...lesson.example)],
    [tr("সতর্কতা", "Precautions"), tr(...lesson.precaution)],
  ], sourceLink(lesson.source));
}

function labWarningCard(entry) {
  return card(tr(...entry.name), icon(entry.id), [
    [tr("কোন ঝুঁকি", "Hazard"), tr(...entry.job)],
    [tr("উদাহরণ ও মাত্রা", "Example and severity"), tr(...entry.example)],
    [tr("সতর্কতা", "Precautions"), tr(...entry.precaution)],
  ], sourceLink(entry.source));
}
const renderEquipment = makePicker("equipment-picks", "equipment-detail", equipment, toolButton, toolDetail);
const renderChemicals = makePicker("chemical-picks", "chemical-detail", chemicals,
  entry => `<strong>${h(entry.formula)}</strong><small>${h(tr(...entry.name))}</small>`, chemicalDetail);
languageButton(() => {
  $("ppe-cards").innerHTML = personalProtection.map(protectionCard).join("");
  $("gear-cards").innerHTML = safetyGear.map(protectionCard).join("");
  $("symbol-cards").innerHTML = symbols.map(hazardCard).join("");
  $("other-warning-cards").innerHTML = labWarnings.map(labWarningCard).join("");
  renderEquipment();
  renderChemicals();
  const expanded = [...$("habit-list").querySelectorAll("details")].map(detail => detail.open);
  $("habit-list").innerHTML = habits.map(([title, explanation], index) =>
    `<details class="guide-habit"${expanded[index] ? " open" : ""}><summary>${h(tr(...title))}</summary><p>${h(tr(...explanation))}</p></details>`
  ).join("");
});
