import {$, lang, languageButton, tr} from "./shared.js";

const requiredGear = ["goggles", "coat", "gloves", "shoes"];
const hazards = [
  {
    sign: "flame",
    description: ["লাল ডায়মন্ডে কালো শিখা", "A black flame in a red diamond"],
    feedback: ["শিখা চিহ্ন দাহ্য পদার্থের মতো আগুনের ঝুঁকি বোঝাতে পারে।", "The flame pictogram can indicate a fire hazard such as a flammable material."],
  },
  {
    sign: "corrosion",
    description: ["লাল ডায়মন্ডে দুটি নল থেকে হাত ও ধাতুর ওপর ফোঁটা পড়ছে", "Two test tubes dripping onto a hand and a metal surface inside a red diamond"],
    feedback: ["এই চিহ্ন ত্বক পুড়ে যাওয়া, চোখের গুরুতর ক্ষতি বা ধাতুর ক্ষয়ের ঝুঁকি বোঝাতে পারে।", "This pictogram can indicate skin burns, serious eye damage or corrosion of metals."],
  },
  {
    sign: "skull",
    description: ["লাল ডায়মন্ডে মাথার খুলি ও আড়াআড়ি দুটি হাড়", "A skull and crossed bones inside a red diamond"],
    feedback: ["খুলি ও হাড়ের চিহ্ন তীব্র বিষাক্ততার ঝুঁকি বোঝায়। রাসায়নিকটি অল্প সময়ের সংস্পর্শেও গুরুতর ক্ষতি করতে পারে।", "The skull and crossbones indicates acute toxicity. Short-term exposure can be dangerous."],
  },
];

const ppeForm = $("ppe-form");
const signImage = $("hazard-sign");
const hazardNext = $("hazard-next");
const hazardButtons = document.querySelectorAll("[data-hazard]");
const dilutionButtons = document.querySelectorAll("[data-dilution]");
let ppeResult;
let hazardIndex = 0;
let hazardAnswer;
let dilutionAnswer;

function feedback(id, correct, message) {
  const element = $(id);
  element.hidden = correct === undefined;
  element.dataset.result = correct ? "correct" : "retry";
  element.textContent = correct === undefined ? "" : tr(...message);
}

function render() {
  const hazard = hazards[hazardIndex];
  const hazardCorrect = hazardAnswer === hazard.sign;
  const dilutionCorrect = dilutionAnswer === "acid";
  const lastHazard = hazardIndex === hazards.length - 1;
  const completed = Number(ppeResult === true) + Number(hazardCorrect && lastHazard) + Number(dilutionCorrect);
  const numbers = new Intl.NumberFormat(lang() === "bn" ? "bn-BD" : "en");
  $("safety-progress").value = completed;
  $("safety-progress-text").textContent = completed === 3
    ? tr("৩টি অনুশীলনই সম্পন্ন হয়েছে।", "All three activities are complete.")
    : tr(`৩টির মধ্যে ${numbers.format(completed)}টি অনুশীলন সম্পন্ন।`, `${completed} of 3 activities complete.`);

  feedback("ppe-result", ppeResult, ppeResult
    ? ["সঠিক। গগলস, ল্যাব কোট, উপযোগী গ্লাভস ও পা ঢাকা জুতা বেছে নিয়েছ।", "Correct. You selected splash goggles, a lab coat, suitable gloves and closed shoes."]
    : ["বাছাইটি আবার দেখো। সাধারণ চশমা ও খোলা স্যান্ডেল যথেষ্ট সুরক্ষা দেয় না।", "Check your selection. Ordinary glasses and open sandals do not provide adequate protection."]);

  signImage.dataset.sign = hazard.sign;
  signImage.setAttribute("aria-label", tr(...hazard.description));
  $("hazard-position").textContent = tr(
    `চিহ্ন ${numbers.format(hazardIndex + 1)} / ${numbers.format(hazards.length)}`,
    `Pictogram ${hazardIndex + 1} of ${hazards.length}`,
  );
  hazardNext.hidden = !hazardCorrect || lastHazard;
  hazardButtons.forEach(button => { button.disabled = hazardCorrect; });
  feedback("hazard-result", hazardAnswer === undefined ? undefined : hazardCorrect, hazardCorrect
    ? hazard.feedback
    : ["চিহ্নের ছবিটি আবার দেখো এবং আরেকটি উত্তর বেছে নাও।", "Look at the symbol again and choose another answer."]);

  $("dilution-scene").dataset.state = dilutionCorrect ? "ready" : "waiting";
  dilutionButtons.forEach(button => { button.disabled = dilutionCorrect; });
  feedback("dilution-result", dilutionAnswer === undefined ? undefined : dilutionCorrect, dilutionCorrect
    ? ["সঠিক। পানিতে ধীরে অ্যাসিড যোগ করো। পাতলাকরণে তাপ বের হয়।", "Correct. Add the acid slowly to water. Dilution releases heat."]
    : ["এই ক্রমে মিশ্রণ খুব দ্রুত গরম হয়ে অ্যাসিড ছিটকে পড়তে পারে। ক্রমটি বদলে আবার চেষ্টা করো।", "This order can heat the mixture rapidly and cause acid to splash. Try the reverse order."]);
}

ppeForm.onsubmit = event => {
  event.preventDefault();
  const selected = new FormData(ppeForm).getAll("gear");
  ppeResult = selected.length === requiredGear.length && requiredGear.every(item => selected.includes(item));
  render();
};
ppeForm.onchange = () => {
  ppeResult = undefined;
  render();
};
hazardButtons.forEach(button => button.onclick = () => {
  hazardAnswer = button.dataset.hazard;
  render();
});
hazardNext.onclick = () => {
  hazardIndex++;
  hazardAnswer = undefined;
  render();
  hazardButtons[0].focus();
};
dilutionButtons.forEach(button => button.onclick = () => {
  dilutionAnswer = button.dataset.dilution;
  render();
});
$("safety-reset").onclick = () => {
  ppeForm.reset();
  ppeResult = hazardAnswer = dilutionAnswer = undefined;
  hazardIndex = 0;
  render();
};

languageButton(render);
