import {$, languageButton, tr} from "./shared.js";
import {renderSolution} from "./lab-solutions.js";

const samples = {
  metal: {name: ["পিতলের টুকরা", "Brass piece"], icon: "sample-metal-slug", units: 123432},
  glass: {name: ["কাচের গুটি", "Glass beads"], icon: "sample-glass-beads", units: 47864},
  ceramic: {name: ["সিরামিকের টুকরা", "Ceramic piece"], icon: "sample-ceramic", units: 21576},
};

// All masses use integer units of 0.0001 g.
const riderDivisions = 50;
const boatUnits = 12754;
const denominations = [
  ["20 g", 200000, 1], ["10 g", 100000, 1], ["5 g", 50000, 1],
  ["2 g", 20000, 2], ["1 g", 10000, 1], ["500 mg", 5000, 1],
  ["200 mg", 2000, 2], ["100 mg", 1000, 1], ["50 mg", 500, 1],
  ["20 mg", 200, 2], ["10 mg", 100, 2],
];
const svgNamespace = "http://www.w3.org/2000/svg";
const sampleSelect = $("balance-sample");
const riderMass = $("balance-rider-mass");
const riderPosition = $("balance-rider-position");
const riderDown = $("balance-rider-down");
const riderUp = $("balance-rider-up");
const beamToggle = $("balance-beam-toggle");
const placeSample = $("balance-place-sample");
const placeBoat = $("balance-place-boat");
const tareButton = $("balance-tare");
const sampleIcons = document.querySelectorAll("[data-balance-sample]");
const digitalSampleIcons = document.querySelectorAll(".balance-digital-sample");
const boatIcons = document.querySelectorAll(".balance-digital-boat");
let beamReleased = false;
let sampleOnDigital = false;
let boatOnDigital = false;
let tared = false;

function fixedMass(units, places = 4) {
  return places === 2 ? (Math.round(units / 100) / 100).toFixed(2) : (units / 10000).toFixed(4);
}

function signed(value, text = String(Math.abs(value))) {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return sign + text;
}

function svgElement(tag, attributes) {
  const node = document.createElementNS(svgNamespace, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

const beamCenter = {x: 320, y: 113};
const halfBeam = 215;
function beamMarkX(mark) {
  return beamCenter.x + mark * halfBeam / riderDivisions;
}

const ticks = $("balance-ticks");
for (let mark = -riderDivisions; mark <= riderDivisions; mark++) {
  const x = beamMarkX(mark);
  const major = mark % 10 === 0;
  ticks.append(svgElement("path", {
    d: `M${x} 106v${major ? 8 : 4}`, stroke: "#6b5534", "stroke-width": major ? 1.4 : .75,
  }));
  if (mark % 25 === 0) {
    const label = svgElement("text", {x, y: 77});
    label.textContent = signed(mark);
    ticks.append(label);
  }
}

const weights = denominations.map(([label, units, available]) => {
  const tile = document.createElement("div");
  tile.className = "balance-weight";
  tile.innerHTML = `<strong>${label}</strong><div><button type="button" class="balance-secondary">−</button><output>0</output><button type="button" class="balance-secondary">+</button></div>`;
  const [remove, add] = tile.querySelectorAll("button");
  const countLabel = tile.querySelector("output");
  const weight = {label, units, available, count: 0, remove, add, countLabel};
  remove.onclick = () => { weight.count--; renderMechanical(); };
  add.onclick = () => { weight.count++; renderMechanical(); };
  $("balance-weight-box").append(tile);
  return weight;
});

function renderPanWeights() {
  const pieces = weights.flatMap(weight => Array.from({length: weight.count}, () => weight.units));
  const piecesPerRow = 5;
  const icons = pieces.map((units, index) => {
    const row = Math.floor(index / piecesPerRow);
    const rowSize = Math.min(pieces.length - row * piecesPerRow, piecesPerRow);
    const x = 535 + (index % piecesPerRow - (rowSize - 1) / 2) * 16;
    const y = 208 - row * 11;
    return svgElement("use", {
      href: "#balance-weight", transform: `translate(${x} ${y}) scale(${units >= 10000 ? .95 : .66})`,
    });
  });
  $("balance-pan-weights").replaceChildren(...icons.reverse());
}

function renderBeam(angle) {
  $("balance-beam").setAttribute("transform", `rotate(${angle} ${beamCenter.x} ${beamCenter.y})`);
  const radians = angle * Math.PI / 180;
  for (const [side, distance] of [["left", -halfBeam], ["right", halfBeam]]) {
    const x = distance * (Math.cos(radians) - 1);
    const y = distance * Math.sin(radians);
    $(`balance-${side}-pan`).setAttribute("transform", `translate(${x} ${y})`);
  }
}

function renderMechanical() {
  const sample = samples[sampleSelect.value];
  const mark = Number(riderPosition.value);
  const riderMg = Number(riderMass.value);
  const riderStep = riderMg * 10 / riderDivisions;
  const riderUnits = mark * riderStep;
  const weightUnits = weights.reduce((total, weight) => total + weight.count * weight.units, 0);
  const estimate = weightUnits + riderUnits;
  const error = estimate - sample.units;
  const angle = beamReleased ? Math.sign(error) * Math.min(9, 2 * Math.log10(1 + Math.abs(error))) : 0;
  const balanced = beamReleased && error === 0;
  renderBeam(angle);
  renderPanWeights();
  $("balance-rider").setAttribute("transform", `translate(${beamMarkX(mark)} 0)`);
  $("balance-left-label").textContent = tr(...sample.name);
  $("balance-rider-mark").textContent = signed(mark);
  $("balance-rider-constant").textContent = `${riderMg} mg ÷ ${riderDivisions} = ${fixedMass(riderStep)} g`
    + tr(" প্রতি দাগে", " per division");
  $("balance-weights-total").textContent = fixedMass(weightUnits) + " g";
  $("balance-rider-total").textContent = signed(riderUnits, fixedMass(Math.abs(riderUnits))) + " g";
  $("balance-measured").textContent = balanced ? fixedMass(estimate) + " g" : "—";
  beamToggle.textContent = beamReleased ? tr("বিম আটকাও", "Arrest beam") : tr("বিম ছাড়ো", "Release beam");
  beamToggle.setAttribute("aria-pressed", String(beamReleased));
  $("balance-adjustments").disabled = beamReleased;
  riderDown.disabled = mark === -riderDivisions;
  riderUp.disabled = mark === riderDivisions;
  riderDown.setAttribute("aria-label", tr("এক দাগ বামে", "One division left"));
  riderUp.setAttribute("aria-label", tr("এক দাগ ডানে", "One division right"));

  for (const weight of weights) {
    weight.remove.disabled = weight.count === 0;
    weight.add.disabled = weight.count === weight.available;
    weight.countLabel.textContent = weight.count + " / " + weight.available;
    weight.remove.setAttribute("aria-label", tr(`${weight.label} সরাও`, `Remove ${weight.label}`));
    weight.add.setAttribute("aria-label", tr(`${weight.label} যোগ করো`, `Add ${weight.label}`));
  }

  const status = $("balance-mechanical-status");
  status.dataset.state = balanced ? "balanced" : beamReleased ? "tilted" : "idle";
  if (balanced) {
    status.textContent = tr("সাম্য হয়েছে। পয়েন্টার শূন্য দাগে। বাটখারা ও রাইডারের অবদান যোগ করে বস্তুর ভর পাওয়া গেছে।",
      "Balanced. The pointer is at zero. Add the weights and the signed rider contribution to obtain the sample mass.");
  } else if (!beamReleased) {
    status.textContent = tr("বিম আটকানো। বাটখারা ও রাইডার ঠিক করে বিম ছাড়ো।", "The beam is arrested. Set the weights and rider, then release it.");
  } else {
    status.textContent = error < 0
      ? tr("বাঁ পাল্লা ভারী। বিম আটকে ডান দিকের কার্যকর ভর বাড়াও।", "The left pan is heavier. Arrest the beam and increase the effective mass on the right.")
      : tr("ডান পাল্লা ভারী। বিম আটকে ডান দিকের কার্যকর ভর কমাও।", "The right pan is heavier. Arrest the beam and decrease the effective mass on the right.");
  }
}

function renderDigital() {
  const sample = samples[sampleSelect.value];
  const load = Number(sampleOnDigital) * sample.units + Number(boatOnDigital && !tared) * boatUnits;
  $("balance-digital-2").textContent = fixedMass(load, 2);
  $("balance-digital-4").textContent = fixedMass(load);
  for (const icon of digitalSampleIcons) {
    icon.setAttribute("visibility", sampleOnDigital ? "visible" : "hidden");
    icon.setAttribute("y", boatOnDigital ? 81 : 86);
  }
  for (const icon of boatIcons) icon.setAttribute("visibility", boatOnDigital ? "visible" : "hidden");
  placeSample.textContent = sampleOnDigital ? tr("বস্তু সরাও", "Remove object") : tr("বস্তু রাখো", "Place object");
  placeBoat.textContent = boatOnDigital ? tr("ওজন-পাত্র সরাও", "Remove container") : tr("ওজন-পাত্র রাখো", "Place container");
  placeBoat.disabled = sampleOnDigital;
  tareButton.disabled = sampleOnDigital || !boatOnDigital || tared;

  const status = $("balance-digital-status");
  status.dataset.state = sampleOnDigital ? "balanced" : "idle";
  if (sampleOnDigital) {
    const sampleName = tr(...sample.name);
    const measurement = boatOnDigital && !tared
      ? tr("পাঠে বস্তু ও পাত্রের মোট ভর আছে।", "The readings include both the object and the container.")
      : tr("পাঠে শুধু বস্তুর ভর আছে।", "The readings show the object’s mass.");
    status.textContent = sampleName + " · " + measurement;
  } else if (boatOnDigital && tared) {
    status.textContent = tr("পাত্রের ভর বাদ গেছে। এখন বস্তু রাখো।", "The container mass has been tared. Place the object now.");
  } else if (boatOnDigital) {
    status.textContent = tr("খালি পাত্রের ভর দেখা যাচ্ছে। শূন্য করতে TARE চাপো।", "The displays show the empty container mass. Press TARE to zero them.");
  } else {
    status.textContent = tr("দুটি পাল্লাই খালি। একটি বস্তু বা ওজন-পাত্র রাখো।", "Both pans are empty. Place an object or a container.");
  }
}

function render() {
  for (const option of sampleSelect.options) option.textContent = tr(...samples[option.value].name);
  const icon = "#" + samples[sampleSelect.value].icon;
  for (const use of sampleIcons) use.setAttribute("href", icon);
  renderMechanical();
  renderDigital();
}

function resetMechanical() {
  beamReleased = false;
  riderMass.value = "5";
  riderPosition.value = "0";
  for (const weight of weights) weight.count = 0;
}

sampleSelect.onchange = () => {
  resetMechanical();
  sampleOnDigital = false;
  render();
};
beamToggle.onclick = () => {
  beamReleased = !beamReleased;
  renderMechanical();
};
$("balance-mechanical-reset").onclick = () => {
  resetMechanical();
  renderMechanical();
};
riderMass.onchange = riderPosition.oninput = renderMechanical;
riderDown.onclick = () => { riderPosition.value = Number(riderPosition.value) - 1; renderMechanical(); };
riderUp.onclick = () => { riderPosition.value = Number(riderPosition.value) + 1; renderMechanical(); };

placeSample.onclick = () => { sampleOnDigital = !sampleOnDigital; renderDigital(); };
placeBoat.onclick = () => {
  boatOnDigital = !boatOnDigital;
  tared = false;
  renderDigital();
};
tareButton.onclick = () => { tared = true; renderDigital(); };
$("balance-digital-reset").onclick = () => {
  sampleOnDigital = boatOnDigital = tared = false;
  renderDigital();
};

languageButton(() => {
  render();
  renderSolution();
});
