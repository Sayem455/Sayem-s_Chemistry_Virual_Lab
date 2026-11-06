import {activities} from "./activities.js";
import {$,escapeHTML as h,languageButton,tr} from "./shared.js";
const ions = {
  Na:["#f6ba09","সোনালি হলুদ","Golden yellow"],
  Ca:["#c4442d","ইটের মতো লাল","Brick red"],
  Ba:["#74b538","কাঁচা আপেলের মতো সবুজ","Apple green"]
};
let ion = "Na";
let mode = "3d";
const canvas=$("molecule");
const ctx=canvas.getContext("2d");
function render() {
  const [colour,bn,en]=ions[ion];
  $("flame-shape").setAttribute("fill",colour);
  $("colour").textContent=ion+" · "+tr(bn,en);
  document.querySelectorAll("[data-ion]").forEach(btn=>btn.setAttribute("aria-pressed",btn.dataset.ion===ion));
  document.querySelectorAll("[data-model]").forEach(btn=>btn.setAttribute("aria-pressed",btn.dataset.model===mode));
  $("rotation").hidden=mode==="2d";
  const yaw=mode==="3d"?Number($("yaw").value)*Math.PI/180:0;
  const pitch=mode==="3d"?Number($("pitch").value)*Math.PI/180:0;
  function project(x,y,label) {
    const z=-x*Math.sin(yaw);
    const depth=y*Math.sin(pitch)+z*Math.cos(pitch);
    const scale=330/(330-depth);
    return {x:195+x*Math.cos(yaw)*scale,y:103+(y*Math.cos(pitch)-z*Math.sin(pitch))*scale,depth,label,r:(label==="O"?29:19)*scale};
  }
  const angle=52.25*Math.PI/180;
  const oxygen=project(0,0,"O");
  const hydrogens=[-1,1].map(side=>project(side*93*Math.sin(angle),93*Math.cos(angle),"H"));
  ctx.clearRect(0,0,390,260);
  for(const hydrogen of hydrogens) {
    ctx.beginPath(); ctx.moveTo(oxygen.x,oxygen.y); ctx.lineTo(hydrogen.x,hydrogen.y);
    ctx.strokeStyle="#53647d";ctx.lineWidth=mode==="3d"?11:4;ctx.stroke();
  }
  for(const atom of [oxygen,...hydrogens].sort((a,b)=>a.depth-b.depth)) {
    const gradient=ctx.createRadialGradient(atom.x-atom.r/3,atom.y-atom.r/3,2,atom.x,atom.y,atom.r);
    const base=atom.label==="O"?"#be263f":"#2961b2";
    gradient.addColorStop(0,atom.label==="O"?"#ff9eac":"#9cc8ff");
    gradient.addColorStop(1,base);
    ctx.fillStyle=mode==="3d"?gradient:base;
    ctx.beginPath();ctx.arc(atom.x,atom.y,atom.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="white";ctx.font="bold 17px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(atom.label,atom.x,atom.y);
  }
}
document.querySelectorAll("[data-ion]").forEach(btn=>btn.onclick=()=>{ion=btn.dataset.ion;render();});
document.querySelectorAll("[data-model]").forEach(btn=>btn.onclick=()=>{mode=btn.dataset.model;render();});
for(const axis of ["yaw","pitch"]) $(axis).oninput=render;
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
languageButton(()=>{ render(); renderActivities(); });
if(location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
