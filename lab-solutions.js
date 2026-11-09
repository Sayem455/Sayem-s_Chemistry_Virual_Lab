import {$, tr} from "./shared.js";

const compounds = {
  nacl: {formula: "NaCl", name: ["সোডিয়াম ক্লোরাইড", "Sodium chloride"], molarMass: 58.44},
  kcl: {formula: "KCl", name: ["পটাশিয়াম ক্লোরাইড", "Potassium chloride"], molarMass: 74.55},
  carbonate: {formula: "Na₂CO₃", name: ["পানিশূন্য সোডিয়াম কার্বনেট", "Anhydrous sodium carbonate"], molarMass: 105.99},
};
const namedConcentrations = [
  {molarity: 1, label: ["মোলার", "Molar"]},
  {molarity: .5, label: ["সেমিমোলার", "Semimolar"]},
  {molarity: .1, label: ["ডেসিমোলার", "Decimolar"]},
  {molarity: .01, label: ["সেন্টিমোলার", "Centimolar"]},
  {molarity: .001, label: ["মিলিমোলার", "Millimolar"]},
];
const other = {label: ["অন্যান্য ঘনমাত্রা", "Another concentration"]};
const massChoices = [...namedConcentrations.map(type => type.molarity), .25].sort((a, b) => a - b);
const massScale = 10000;
const compoundSelect = $("solution-compound");
const volumeSelect = $("solution-volume");
const massSelect = $("solution-mass");
const typeSelect = $("solution-type");
let step = 0;
let checked = false;

function sampleMassUnits(molarMass, millilitres, molarity) {
  const molarMassHundredths = Math.round(molarMass * 100);
  const millimolar = Math.round(molarity * 1000);
  // Multiply the scaled integers before rounding to the balance display step.
  return Math.round(molarMassHundredths * millilitres * millimolar / massScale);
}

function replaceOptions(select, blankLabel, options) {
  const value = select.value;
  select.replaceChildren(new Option(blankLabel, ""), ...options);
  if (options.some(option => option.value === value)) select.value = value;
}

function setupSolutionOptions() {
  const molarMass = compounds[compoundSelect.value].molarMass;
  const millilitres = Number(volumeSelect.value);
  for (const option of compoundSelect.options) {
    const {formula, name} = compounds[option.value];
    option.textContent = formula + " · " + tr(...name);
  }
  replaceOptions(massSelect, tr("ভর বেছে নাও", "Choose mass"), massChoices.map(molarity => {
    const units = sampleMassUnits(molarMass, millilitres, molarity);
    return new Option((units / massScale).toFixed(4) + " g", String(units));
  }));
  replaceOptions(typeSelect, tr("ধরন বেছে নাও", "Choose type"), [
    ...namedConcentrations.map(type => new Option(tr(...type.label) + ` (${type.molarity} M)`, String(type.molarity))),
    new Option(tr(...other.label), "other"),
  ]);
}

export function renderSolution() {
  setupSolutionOptions();
  const compound = compounds[compoundSelect.value];
  const millilitres = Number(volumeSelect.value);
  const litres = millilitres / 1000;
  const selectedMass = massSelect.value !== "";
  const grams = Number(massSelect.value) / massScale;
  $("solution-flask-label").textContent = millilitres + " mL";
  $("solution-scene").dataset.step = String(step);
  $("solution-molar-mass").textContent = tr("মোলার ভর ", "Molar mass ") + compound.molarMass.toFixed(2) + " g/mol";
  $("solution-dissolve").disabled = !selectedMass || step !== 0;
  $("solution-fill").disabled = step !== 1;
  $("solution-answer-controls").disabled = step !== 2;
  $("solution-reset").disabled = !selectedMass && step === 0;
  $("solution-step-status").textContent = [
    tr("নমুনার ভর বেছে বিকারের পানিতে দ্রবীভূত করো।", "Choose a sample mass and dissolve it in the beaker."),
    tr("নমুনা দ্রবীভূত হয়েছে। সম্পূর্ণ দ্রবণ ফ্লাস্কে নিয়ে চূড়ান্ত দাগ পর্যন্ত পানি যোগ করো।", "The sample has dissolved. Transfer all the solution to the flask and add water up to the mark."),
    tr("দ্রবণ প্রস্তুত। চূড়ান্ত আয়তন দিয়ে মোলার ঘনমাত্রার ধরন বেছে নাও।", "The solution is ready. Use its final volume to identify the concentration."),
  ][step];

  const result = $("solution-result");
  result.hidden = !checked;
  if (!checked) return;
  const moles = grams / compound.molarMass;
  const molarity = moles / litres;
  // Classify using the mass rounded to the 0.0001 g display step.
  const type = namedConcentrations.find(entry =>
    sampleMassUnits(compound.molarMass, millilitres, entry.molarity) === Number(massSelect.value)
  );
  const correct = typeSelect.value === (type ? String(type.molarity) : "other");
  const format = value => Number(value.toPrecision(5)).toString();
  result.dataset.state = correct ? "balanced" : "tilted";
  $("solution-verdict").textContent = correct
    ? tr("সঠিক · ", "Correct · ") + tr(...(type || other).label)
    : tr("হিসাবটি মিলিয়ে আবার ধরন বেছে নাও।", "Compare your choice with the calculation and try again.");
  const equation = `(${grams.toFixed(4)} g ÷ ${compound.molarMass.toFixed(2)} g/mol) ÷ ${litres.toFixed(3)} L ≈ ${format(molarity)} mol/L`;
  const reference = type ? tr(" · নামমাত্র ", " · nominal ") + type.molarity + " M" : "";
  $("solution-calculation").textContent = equation + reference;
}

function resetSolution(clearMass) {
  step = 0;
  checked = false;
  typeSelect.value = "";
  if (clearMass) massSelect.value = "";
  renderSolution();
}

compoundSelect.onchange = volumeSelect.onchange = () => resetSolution(true);
massSelect.onchange = () => resetSolution(false);
typeSelect.onchange = () => {
  checked = false;
  $("solution-result").hidden = true;
};
$("solution-dissolve").onclick = () => { step = 1; renderSolution(); };
$("solution-fill").onclick = () => { step = 2; renderSolution(); };
$("solution-reset").onclick = () => resetSolution(true);
$("solution-answer").onsubmit = event => {
  event.preventDefault();
  if (step !== 2 || typeSelect.value === "") return;
  checked = true;
  renderSolution();
};
