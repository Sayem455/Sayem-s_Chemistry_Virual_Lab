import {$, bindAuth, connect, escapeHTML as h, lang, languageButton, rows, setupMessage, tr} from "./shared.js";
import {chapters,types} from "./content.js";

let db;
let auth;
let ready = false;
let tab = "student";
let student = "";
let batch = "";
let students = [];
let entries = [];
let listed = [];
let listVersion = 0;
let authVersion = 0;
const sections = {
  student:["শিক্ষার্থী","Students"], attendance:["হাজিরা","Attendance"], marks:["নম্বর","Marks"],
  fees:["বেতন","Fees"], notices:["রুটিন ও নোটিশ","Schedule and notices"], resources:["কনটেন্ট","Resources"],
  quizzes:["MCQ","MCQs"], teacher:["শিক্ষক পরিচিতি","Teacher profile"], applications:["ভর্তির আবেদন","Applications"]
};
const date = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const field = (name,label,type="text",required=true,value="",extra="") =>
  '<label>'+label+'<input name="'+name+'" type="'+type+'" '+(required?"required ":"")+'value="'+h(value)+'" '+extra+'></label>';
const select = (name,label,options,value="") =>
  '<label>'+label+'<select name="'+name+'" required>'+options.map(([id,title])=>'<option value="'+h(id)+'" '+(id===value?"selected":"")+'>'+h(title)+'</option>').join("")+'</select></label>';
const localized = (name,bn,en) => field(name,tr(bn,en))+field(name+"En",en+" (EN)","text",false);
const publicField = () => '<label><span><input type="checkbox" name="public" style="width:auto"> '+tr("সবার জন্য প্রকাশ","Publish publicly")+'</span></label>';
const chapterField = () => select("chapter",tr("অধ্যায়","Chapter"),chapters.map(([id,bn,en])=>[id,tr(bn,en)]));
const studentField = () => select("uid",tr("শিক্ষার্থী","Student"),[["","—"],...students.filter(s=>!batch||s.batch===batch).map(s=>[s.id,s.name+" · "+s.batch+" · "+s.roll])],student);
const dayField = () => field("date",tr("তারিখ","Date"),"date",true,date());
const monthField = () => field("date",tr("মাস","Month"),"month",true,date().slice(0,7));
const stateField = () => select("state",tr("অবস্থা","Status"), tab==="fees" ?
  [["paid",tr("পরিশোধিত","Paid")],["due",tr("বকেয়া","Due")]] :
  [["present",tr("উপস্থিত","Present")],["absent",tr("অনুপস্থিত","Absent")]]);
const valueOf = (form, name) => form.elements.namedItem(name);
function table(columns, records, action) {
  if (!records.length) return '<p>'+tr("এখনো কোনো রেকর্ড নেই।","No records yet.")+'</p>';
  return '<div class="sc-scroll"><table class="sc-table"><thead><tr>'+columns.map(([,label])=>'<th>'+label+'</th>').join("")+(action?'<th></th>':'')+'</tr></thead><tbody>'+
    records.map(r=>'<tr>'+columns.map(([key])=>'<td>'+h(r[key])+'</td>').join("")+(action?'<td>'+action(r)+'</td>':'')+'</tr>').join("")+'</tbody></table></div>';
}
function fields() {
  switch (tab) {
    case "student": {
      const record = students.find(s=>s.id===student) || {};
      return field("uid","Firebase Auth UID","text",true,record.id,'pattern="[A-Za-z0-9_-]{1,128}"')+
        field("name",tr("নাম","Name"),"text",true,record.name)+field("batch",tr("ব্যাচ","Batch"),"text",true,record.batch)+field("roll",tr("রোল","Roll"),"text",true,record.roll)+
        field("guardian",tr("অভিভাবকের ফোন (+880...)","Guardian phone (+880...)"),"tel",true,record.guardian,'pattern="\\+[1-9][0-9]{9,14}"');
    }
    case "attendance": return studentField()+dayField()+stateField();
    case "marks": return studentField()+dayField()+field("title",tr("পরীক্ষা","Exam"))+
      field("score",tr("প্রাপ্ত নম্বর","Score"),"number",true,"",'min="0" step="any"')+field("total",tr("পূর্ণমান","Maximum"),"number",true,"",'min="0.01" step="any"');
    case "fees": return studentField()+monthField()+field("title",tr("বেতনের বিবরণ","Fee description"))+
      field("amount",tr("টাকা","Amount (BDT)"),"number",true,"",'min="0" step="any"')+stateField();
    case "notices": return dayField()+select("kind",tr("ধরন","Type"),[["notice",tr("নোটিশ","Notice")],["exam",tr("পরীক্ষা","Exam")],["schedule",tr("রুটিন","Schedule")]])+field("batch",tr("ব্যাচ (ঐচ্ছিক)","Batch (optional)"),"text",false)+localized("title","শিরোনাম","Title")+localized("body","বিবরণ","Details")+publicField();
    case "resources": return chapterField()+select("type",tr("উপকরণের ধরন","Material type"),Object.entries(types).map(([id,n])=>[id,n[lang()==="en"?1:0]]))+localized("title","শিরোনাম","Title")+field("url",tr("ফাইল বা পেজের লিংক","File or page URL"),"url")+publicField();
    case "quizzes": return chapterField()+localized("title","প্রশ্ন","Question")+
      field("options",tr("অপশন | দিয়ে আলাদা করো","Options separated by |"))+
      field("optionsEn","Options (EN)","text",false)+field("answer",tr("সঠিক অপশনের ক্রম (১ থেকে)","Correct option number (starts at 1)"),"number",true,1,'min="1"')+
      localized("explanation","উত্তরের ব্যাখ্যা","Explanation")+publicField();
    case "teacher": {
      const record = listed[0] || {};
      return field("photo",tr("শিক্ষকের ছবির লিংক","Teacher photo URL"),"url",false,record.photo)+
        [["degree","শিক্ষাগত যোগ্যতা","Academic qualifications"],["bio","পরিচিতি","Biography"]].map(([key,bn,en])=>field(key,tr(bn,en),"text",false,record[key])+field(key+"En",en+" (EN)","text",false,record[key+"En"])).join("");
    }
    default: return "";
  }
}
function render() {
  if (!ready) { $("private").replaceChildren(); return; }
  const batches = [...new Set(students.map(s=>s.batch))].sort();
  const shown = students.filter(s=>!batch||s.batch===batch);
  $("private").innerHTML = '<div class="sc-actions sc-tabs">'+Object.entries(sections).map(([key,n])=>'<button data-tab="'+key+'" aria-pressed="'+(tab===key)+'">'+tr(...n)+'</button>').join("")+'</div>'+
    '<article class="sc-card"><h2>'+tr(...sections[tab])+'</h2>'+
    (["student","attendance","marks","fees"].includes(tab)?'<div class="sc-form">'+select("filter",tr("ব্যাচ ফিল্টার","Batch filter"),[["",tr("সব ব্যাচ","All batches")],...batches.map(b=>[b,b])],batch)+'</div><br>':'')+
    (tab==="student"?table([["name",tr("নাম","Name")],["batch",tr("ব্যাচ","Batch")],["roll",tr("রোল","Roll")]],shown,s=>'<button data-profile="'+h(s.id)+'">'+tr("প্রোফাইল","Profile")+'</button>'):"")+
    (tab==="applications" ? "" : '<form class="sc-form" id="editor"><input type="hidden" name="editId">'+fields()+'<div class="sc-actions"><button>'+tr("সংরক্ষণ","Save")+'</button><button type="reset" aria-pressed="false">'+tr("ফরম খালি করো","Reset form")+'</button></div></form>')+
    '<p id="editor-status" role="status"></p><div id="entries"></div></article>';
  $("private").querySelectorAll("[data-tab]").forEach(button=>button.onclick=async()=>{
    tab=button.dataset.tab; listed=[]; entries=[]; render(); await refreshList();
  });
  $("private").querySelectorAll("[data-profile]").forEach(button=>button.onclick=async()=>{
    student=button.dataset.profile; render(); await refreshList();
  });
  const filter = $("private").querySelector('[name="filter"]');
  if (filter) filter.onchange=async()=>{
    batch=filter.value;
    if (!shown.some(s=>s.id===student&&(!batch||s.batch===batch))) student="";
    entries=[]; render(); await refreshList();
  };
  const editor=$("editor");
  if(editor) {
    editor.onsubmit=save;
    const chooser=valueOf(editor,"uid");
    if(chooser?.tagName==="SELECT") chooser.onchange=async()=>{
      student=chooser.value; entries=[]; await refreshList();
    };
    editor.onreset=event=>{
      event.preventDefault();
      if(tab==="student") { student=""; entries=[]; }
      render();
    };
  }
  renderEntries();
}
function renderEntries() {
  const box=$("entries");
  if (!box) return;
  if(tab==="applications") {
    box.innerHTML=table([["name","Name"],["phone","Phone"],["batch","Batch"],["createdAt","Submitted"]],listed);
  } else if (["notices","quizzes","resources"].includes(tab)) {
    box.innerHTML=table([["title",tr("শিরোনাম","Title")]],listed,r=>'<button data-edit="'+h(r.id)+'">'+tr("সম্পাদনা","Edit")+'</button>');
  } else if (["student","attendance","marks","fees"].includes(tab) && student) {
    const attendance=entries.filter(r=>r.kind==="attendance");
    const rate=attendance.length ? Math.round(100*attendance.filter(r=>r.state==="present").length/attendance.length)+"%" : "—";
    const records = tab==="student" ? entries : entries.filter(r=>r.kind===tab);
    box.innerHTML='<h3>'+tr("শিক্ষার্থীর রেকর্ড","Student records")+'</h3><p>'+tr("উপস্থিতির হার ","Attendance ")+rate+'</p>'+
      table([["date",tr("তারিখ","Date")],["kind",tr("ধরন","Type")],["title",tr("বিবরণ","Details")],["summary",tr("অবস্থা / নম্বর / টাকা","Status / marks / fees")],["sms",tr("মেসেজ","SMS")],["correction",tr("হাজিরা সংশোধন","Attendance corrections")]],
      records.map(r=>({...r,summary:r.kind==="marks"?r.score+"/"+r.total:r.kind==="fees"?"৳"+r.amount+" · "+r.state:r.state,sms:r.message ? [r.message.status,r.message.updatedAt].filter(Boolean).join(" · ") : "—",correction:(r.corrections||[]).map(change=>change.from+" → "+change.to+" · "+change.at).join(" / ")})),r=>
      (tab==="student"?"":'<button data-edit="'+h(r.id)+'">'+tr("সম্পাদনা","Edit")+'</button>')+
      (r.kind==="attendance"&&r.state==="absent"?'<button data-sms="'+h(r.id)+'">SMS</button>':''));
  } else box.replaceChildren();
  box.querySelectorAll("[data-edit]").forEach(button=>button.onclick=()=>{
    const record=[...listed,...entries].find(r=>r.id===button.dataset.edit);
    const form=$("editor");
    for(const [key,value] of Object.entries(record)) {
      const input=valueOf(form,key);
      if(!input) continue;
      if(input.type==="checkbox") input.checked=!!value;
      else input.value=Array.isArray(value)?value.join(" | "):key==="answer"?value+1:value;
    }
    valueOf(form,"editId").value=record.id;
    form.scrollIntoView({block:"center"});
  });
  box.querySelectorAll("[data-sms]").forEach(button=>button.onclick=async()=>{
    button.disabled=true;
    const record=entries.find(r=>r.id===button.dataset.sms);
    try { await sendSMS(student,record.id,!!record.message?.sid); }
    catch(error) { if ($("editor-status")) $("editor-status").textContent=error.message; }
    finally { await refreshList(); }
  });
}
async function refreshList() {
  const version=++listVersion;
  const current=tab, uid=student;
  try {
    if(current==="teacher") {
      const result=await db.doc("settings/teacher").get();
      if(version===listVersion && ready) { listed=[result.data()||{}]; render(); }
    } else if(["notices","resources","quizzes","applications"].includes(current)) {
      const result=rows(await db.collection(current).get());
      if(version===listVersion && ready) { listed=result; renderEntries(); }
    } else if(uid) {
      const result=rows(await db.collection("students/"+uid+"/records").get());
      if(version===listVersion && ready) { entries=result.sort((a,b)=>b.date.localeCompare(a.date)); renderEntries(); }
    } else if(version===listVersion && ready) { entries=[]; renderEntries(); }
  } catch { if(version===listVersion&&$("editor-status")) $("editor-status").textContent=tr("রেকর্ড লোড হয়নি।","Records could not be loaded."); }
}
async function sendSMS(uid,id,refresh=false) {
  const token=await auth.currentUser.getIdToken();
  const response=await fetch("/api/attendance-sms",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({uid,id,refresh})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(result.error || "SMS service could not be reached.");
  return result;
}
async function save(event) {
  event.preventDefault();
  const form=event.currentTarget;
  const button=form.querySelector("button");
  const status=$("editor-status");
  const mode=tab;
  const data=Object.fromEntries(new FormData(form));
  for(const key of Object.keys(data)) data[key]=data[key].trim();
  const {editId,uid}=data;
  delete data.editId; delete data.uid;
  button.disabled=true;
  let note="";
  try {
    if(mode==="student") {
      await db.doc("students/"+uid).set(data,{merge:true});
      students=rows(await db.collection("students").get());
      student=uid; render();
    } else if(mode==="teacher") {
      await db.doc("settings/teacher").set(data);
    } else if(["attendance","marks","fees"].includes(mode)) {
      data.kind=mode;
      if(mode==="marks") {
        data.score=Number(data.score); data.total=Number(data.total);
        if(data.score>data.total) throw new Error(tr("প্রাপ্ত নম্বর পূর্ণমানের বেশি হতে পারে না।","Score cannot exceed the maximum."));
      }
      if(mode==="fees") data.amount=Number(data.amount);
      if(mode==="attendance" && editId && editId!=="attendance_"+data.date) throw new Error(tr("তারিখ বদলাতে নতুন রেকর্ড দিন।","Create a new record to use a different date."));
      if(mode==="fees" && editId && editId!=="fees_"+data.date) throw new Error(tr("মাস বদলাতে নতুন রেকর্ড দিন।","Create a new record to use a different month."));
      const collection=db.collection("students/"+uid+"/records");
      const ref=mode==="marks" ? (editId?collection.doc(editId):collection.doc()) : collection.doc(mode+"_"+data.date);
      if(mode==="attendance") {
        await db.runTransaction(async transaction=>{
          const previous=(await transaction.get(ref)).data();
          if(previous && previous.state!==data.state) {
            const corrections=[...(previous.corrections||[]),{from:previous.state,to:data.state,at:new Date().toISOString()}];
            transaction.set(ref,{...data,corrections},{merge:true});
          } else transaction.set(ref,data,{merge:true});
        });
      } else await ref.set(data,{merge:true});
      if(mode==="attendance"&&data.state==="absent") {
        try { note=(await sendSMS(uid,ref.id)).status; } catch(error) { note=error.message; }
      }
    } else {
      data.public=!!data.public;
      if(mode==="notices" && data.batch && data.public) throw new Error(tr("ব্যাচের নোটিশ ব্যক্তিগত রাখুন।","Keep batch notices private."));
      if(mode==="resources" && !/^https?:\/\//i.test(data.url)) throw new Error("Use an HTTPS or HTTP link.");
      if(mode==="quizzes") {
        data.options=data.options.split("|").map(s=>s.trim()).filter(Boolean);
        data.optionsEn=data.optionsEn.split("|").map(s=>s.trim()).filter(Boolean);
        data.answer=Number(data.answer)-1;
        if(data.options.length<2||data.answer<0||data.answer>=data.options.length||!Number.isInteger(data.answer)||data.optionsEn.length&&data.optionsEn.length!==data.options.length) throw new Error(tr("অপশন ও সঠিক উত্তরের ক্রম যাচাই করুন।","Check the options and the correct option number."));
      }
      const collection=db.collection(mode);
      await (editId ? collection.doc(editId).set(data) : collection.add(data));
      if(!editId) form.reset();
    }
    await refreshList();
    if(tab===mode&&$("editor-status")) $("editor-status").textContent=tr("সংরক্ষিত।","Saved.")+(note?" SMS: "+note:"");
  } catch(error) { status.textContent=error.message; }
  finally { button.disabled=false; }
}

languageButton(render);
try {
  const connection=await connect();
  if(!connection) $("auth-status").textContent=setupMessage();
  else {
    ({db,auth}=connection);
    bindAuth(auth,async user=>{
      const version=++authVersion;
      ++listVersion;
      ready=false; students=[]; entries=[]; listed=[]; student=""; batch="";
      $("auth-status").textContent="";
      render();
      if(!user) return;
      try {
        const access=await db.doc("admins/"+user.uid).get();
        if(version!==authVersion) return;
        if(!access.exists) { $("auth-status").textContent=tr("এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।","This account has no administrator access."); return; }
        const result=rows(await db.collection("students").get());
        if(version!==authVersion) return;
        students=result; ready=true; render(); await refreshList();
      } catch { if(version===authVersion) $("auth-status").textContent=tr("অ্যাডমিন তথ্য লোড হয়নি।","Admin data could not be loaded."); }
    });
  }
} catch { $("auth-status").textContent=setupMessage(); }
