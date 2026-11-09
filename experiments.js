import {activities} from "./activities.js";
import {chapters} from "./content.js";
import {drawMolecule, models} from "./molecule-models.js";
import {$,escapeHTML as h,languageButton,tr} from "./shared.js";
const ions = {
  Na:["#f6ba09","সোনালি হলুদ","Golden yellow"],
  Ca:["#c4442d","ইটের মতো লাল","Brick red"],
  Ba:["#74b538","কাঁচা আপেলের মতো সবুজ","Apple green"]
};
let ion = "Na";
let mode = "3d";
let chlorideStep = 0;
let bromineAdded = false;
let limewaterStep = 0;
let drag;
let showPairs = false;
let spinFrame;
let spinTime;
const canvas = $("molecule");
const compound = $("compound");
const yaw = $("yaw");
const pitch = $("pitch");
const zoom = $("model-zoom");
const pairsButton = $("model-pairs");
const spinButton = $("model-spin");
const wrapAngle = angle => (angle + 540) % 360 - 180;

compound.replaceChildren(...models.map((model, i) => new Option(model.formula, i)));
compound.value = String(models.findIndex(model => model.formula === "H₂O"));

const chlorideResults = [
  ["বর্ণহীন নমুনা। প্রথমে পাতলা নাইট্রিক অ্যাসিড যোগ করো।", "The sample is clear. Start with dilute nitric acid.", ""],
  ["দ্রবণ অম্লীয় হলো। এখন সিলভার নাইট্রেট যোগ করো।", "The sample is now acidic. Add silver nitrate next.", ""],
  ["সাদা AgCl অধঃক্ষেপ তৈরি হয়েছে।", "A white AgCl precipitate forms.", "Ag⁺(aq) + Cl⁻(aq) → AgCl(s)"],
  ["অধঃক্ষেপ দ্রবীভূত হয়েছে। বর্ণহীন ডাইঅ্যামিন সিলভার(I) কমপ্লেক্স তৈরি হয়।", "The precipitate dissolves and forms a colourless diamminesilver(I) complex.", "AgCl(s) + 2NH₃(aq) ⇌ [Ag(NH₃)₂]⁺(aq) + Cl⁻(aq)"],
];

const limewaterResults = [
  ["চুনের পানি স্বচ্ছ। এতে দ্রবীভূত Ca(OH)₂ আছে।", "Limewater is clear. It contains dissolved Ca(OH)₂.", ""],
  ["সাদা CaCO₃ অধঃক্ষেপ তৈরি হওয়ায় চুনের পানি দুধের মতো ঘোলা হয়েছে।", "White CaCO₃ precipitate makes the limewater look milky.", "Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)"],
  ["অতিরিক্ত CO₂ দিলে দ্রবণীয় ক্যালসিয়াম হাইড্রোজেন কার্বনেট তৈরি হয়। পানি আবার স্বচ্ছ দেখায়।", "Excess CO₂ forms soluble calcium hydrogencarbonate. The solution clears again.", "CaCO₃(s) + CO₂(g) + H₂O(l) → Ca(HCO₃)₂(aq)"],
];

function renderLimewater() {
  const [bn, en, equation] = limewaterResults[limewaterStep];
  $("limewater-result").textContent = tr(bn, en);
  $("limewater-equation").textContent = equation;
  $("limewater-equation").hidden = !equation;
  $("limewater-liquid").setAttribute("fill", limewaterStep === 1 ? "#fffef5" : "#b4def0");
  $("limewater-bubbles").setAttribute("visibility", limewaterStep ? "visible" : "hidden");
  document.querySelectorAll("[data-limewater]").forEach(button => {
    const step = Number(button.dataset.limewater);
    button.disabled = step ? step !== limewaterStep + 1 : limewaterStep === 0;
  });
}

function renderReactionTests() {
  const [bn, en, equation] = chlorideResults[chlorideStep];
  $("chloride-result").textContent = tr(bn, en);
  $("chloride-equation").textContent = equation;
  $("chloride-equation").hidden = !equation;
  $("chloride-liquid").dataset.state = chlorideStep === 2 ? "precipitate" : "clear";
  document.querySelectorAll("[data-chloride]").forEach(button => {
    const step = Number(button.dataset.chloride);
    button.disabled = step ? step !== chlorideStep + 1 : chlorideStep === 0;
  });

  $("ethane-liquid").dataset.state = bromineAdded ? "bromine" : "clear";
  $("add-bromine").disabled = bromineAdded;
  $("reset-bromine").disabled = !bromineAdded;
  $("bromine-result").textContent = bromineAdded
    ? tr("ইথিনে ব্রোমিন পানির কমলা-বাদামি রং মিলিয়ে যায়। ইথেনে স্বাভাবিক পরীক্ষার শর্তে রং থাকে।",
         "Ethene decolourises the orange-brown bromine water. Ethane retains the colour under the test conditions.")
    : tr("ব্রোমিন পানি যোগ করে দুই নলের রং তুলনা করো।", "Add bromine water to compare the two tubes.");
}

function drawCurrentModel() {
  const model = models[Number(compound.value)];
  drawMolecule(canvas, model, {
    yaw: mode === "2d" ? 20 : Number(yaw.value),
    pitch: mode === "2d" ? 20 : Number(pitch.value),
    zoom: Number(zoom.value) / 100,
    mode,
    showPairs: mode !== "fill" && showPairs && Boolean(model.lonePairs?.length),
  });
}

function setSpin(active) {
  if (spinFrame !== undefined) cancelAnimationFrame(spinFrame);
  spinFrame = active ? requestAnimationFrame(spin) : undefined;
  spinTime = undefined;
  spinButton.setAttribute("aria-pressed", String(active));
}

function spin(time) {
  if (spinTime !== undefined) {
    yaw.value = wrapAngle(Number(yaw.value) + Math.min(time - spinTime, 50) * .045);
    drawCurrentModel();
  }
  spinTime = time;
  spinFrame = requestAnimationFrame(spin);
}

function renderModel() {
  const model = models[Number(compound.value)];
  const flat = mode === "2d";
  const pairCount = model.lonePairs?.length || 0;
  const pairsAvailable = mode !== "fill" && pairCount > 0;
  const pairsVisible = pairsAvailable && showPairs;
  const shape = tr(...model.shape);
  $("model-shape").textContent = shape;
  $("model-angle").textContent = model.angle;
  $("model-vsepr").textContent = model.vsepr;
  canvas.dataset.mode = mode;
  canvas.setAttribute("aria-label", model.formula + " · " + shape + " · " + model.angle);
  $("rotation").hidden = flat;
  pairsButton.disabled = !pairsAvailable;
  pairsButton.setAttribute("aria-pressed", String(pairsVisible));
  spinButton.disabled = flat;
  spinButton.setAttribute("aria-pressed", String(spinFrame !== undefined));
  $("model-zoom-value").textContent = zoom.value + "%";
  const note = $("model-view-note");
  note.hidden = mode !== "fill" && !pairsVisible;
  note.textContent = mode === "fill"
    ? tr("গোলকগুলো পরমাণুর আপেক্ষিক আকার বোঝায়। মাপগুলো ধারণাভিত্তিক।", "The spheres show relative atomic sizes on an illustrative scale.")
    : tr("বেগুনি চিহ্নে কেন্দ্রীয় পরমাণুর নিঃসঙ্গ জোড়: ", "Purple markers show central-atom lone pairs: ") + pairCount;
  document.querySelectorAll("[data-model]").forEach(button => button.setAttribute("aria-pressed", button.dataset.model === mode));
  drawCurrentModel();
}

function renderFlame() {
  const [colour, bn, en] = ions[ion];
  $("flame-shape").setAttribute("fill", colour);
  $("colour").textContent = ion + " · " + tr(bn, en);
  document.querySelectorAll("[data-ion]").forEach(button => button.setAttribute("aria-pressed", button.dataset.ion === ion));
}

document.querySelectorAll("[data-ion]").forEach(button => button.onclick = () => {
  ion = button.dataset.ion;
  renderFlame();
});
document.querySelectorAll("[data-chloride]").forEach(button => button.onclick = () => {
  chlorideStep = Number(button.dataset.chloride);
  renderReactionTests();
});
$("add-bromine").onclick = () => { bromineAdded = true; renderReactionTests(); };
$("reset-bromine").onclick = () => { bromineAdded = false; renderReactionTests(); };
document.querySelectorAll("[data-limewater]").forEach(button => button.onclick = () => {
  limewaterStep = Number(button.dataset.limewater);
  renderLimewater();
});
document.querySelectorAll("[data-model]").forEach(button => button.onclick = () => {
  mode = button.dataset.model;
  if (mode === "2d") setSpin(false);
  renderModel();
});
compound.onchange = renderModel;
zoom.oninput = renderModel;
pairsButton.onclick = () => {
  showPairs = !showPairs;
  renderModel();
};
spinButton.onclick = () => setSpin(spinFrame === undefined);
$("model-reset").onclick = () => {
  setSpin(false);
  yaw.value = yaw.defaultValue;
  pitch.value = pitch.defaultValue;
  zoom.value = zoom.defaultValue;
  renderModel();
};
yaw.oninput = pitch.oninput = () => {
  setSpin(false);
  drawCurrentModel();
};
canvas.onpointerdown = event => {
  if (mode === "2d" || !event.isPrimary || event.button !== 0) return;
  setSpin(false);
  canvas.setPointerCapture(event.pointerId);
  drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
};
canvas.onpointermove = event => {
  if (drag?.id !== event.pointerId) return;
  yaw.value = wrapAngle(Number(yaw.value) + (event.clientX - drag.x) * 1.25);
  pitch.value = wrapAngle(Number(pitch.value) + (event.clientY - drag.y) * 1.25);
  drag.x = event.clientX;
  drag.y = event.clientY;
  drawCurrentModel();
};
canvas.onlostpointercapture = () => { drag = undefined; };

const chapterDemos = {
  "1-1": [
    ["lab-safety.html", "ল্যাব নিরাপত্তা · ভার্চুয়াল অনুশীলন", "Lab safety · virtual practice"],
    ["lab-balances.html", "রাসায়নিক ও ডিজিটাল নিক্তি", "Chemical and digital balances"],
    ["lab-balances.html#solutions", "দ্রবণ তৈরি ও ঘনমাত্রা", "Solution preparation and molarity"],
    ["lab-guide.html", "ল্যাব নিরাপত্তা ও যন্ত্রপাতি গাইড", "Lab safety and equipment guide"],
  ],
  "1-2": [["#flame", "শিখা পরীক্ষা", "Flame test"], ["#chloride", "ক্লোরাইড শনাক্তকরণ", "Chloride test"]],
  "1-3": [["#water", "3D অণুর মডেল", "3D molecular models"], ["lab.html#periodic", "পর্যায় সারণি", "Periodic table"]],
  "2-1": [["#limewater", "চুনের পানিতে CO₂ শনাক্তকরণ", "Detect CO₂ with limewater"]],
  "2-2": [["#bromine", "ব্রোমিন পানির পরীক্ষা", "Bromine water test"], ["#water", "জৈব অণুর আকৃতি", "Organic molecular shapes"]],
  "2-3": [["lab.html#titration", "অ্যাসিড–ক্ষার টাইট্রেশন", "Acid–base titration"]],
  "2-4": [["lab.html#electrolysis", "তড়িৎ বিশ্লেষণের মডেল", "Electrolysis model"]],
};

function renderChapterIndex() {
  $("chapter-index").innerHTML = ["1", "2"].map(paper => {
    const title = paper === "1" ? tr("প্রথম পত্র", "Paper 1") : tr("দ্বিতীয় পত্র", "Paper 2");
    const items = chapters.filter(([id]) => id.startsWith(paper + "-")).map(([id, bn, en]) => {
      const links = [...(chapterDemos[id] || [])];
      if (activities.some(activity => activity.chapter === id)) links.push(["#activity-" + id, "ধারণা অনুশীলন", "Concept practice"]);
      return '<li><strong>' + h(tr(bn, en)) + '</strong><br>' + links
        .map(([url, label, labelEn]) => '<a href="' + h(url) + '">' + h(tr(label, labelEn)) + '</a>').join("") + '</li>';
    });
    return '<section class="chapter-paper"><h3>' + h(title) + '</h3><ul>' + items.join("") + '</ul></section>';
  }).join("");
}
function renderActivities() {
  $("activities").innerHTML=activities.map(activity=>'<section class="sc-card" id="activity-'+activity.chapter+'"><h2>'+h(tr(activity.name,activity.nameEn))+'</h2><p>'+h(tr(activity.title,activity.titleEn))+'</p><div class="sc-actions">'+tr(activity.options,activity.optionsEn).map((option,i)=>'<button data-option="'+i+'">'+h(option)+'</button>').join("")+'</div><p role="status"></p></section>').join("");
  for(const activity of activities) {
    const section=$("activity-"+activity.chapter);
    section.querySelectorAll("button").forEach(button=>button.onclick=()=>{
      const correct=Number(button.dataset.option)===activity.answer;
      section.querySelector('[role="status"]').textContent=(correct?tr("সঠিক। ","Correct. "):tr("আবার ভেবে দেখো। ","Try again. "))+tr(activity.explanation,activity.explanationEn);
    });
  }
}
languageButton(() => {
  renderChapterIndex();
  renderFlame();
  renderReactionTests();
  renderLimewater();
  renderModel();
  renderActivities();
});
if(location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
