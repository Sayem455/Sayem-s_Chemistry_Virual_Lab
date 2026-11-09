import {$, bindAuth, connect, escapeHTML as h, lang, languageButton, rows, safeURL, setupMessage, tr} from "./shared.js";
import {chapters, starter, starterQuiz, types} from "./content.js";
import {qualitativeSlideGroups} from "./qualitative-slides.js";
let chapter = "1-2";
let resources = [];
let quizzes = [];
let notices = [];
let profile = null;
let studentRecords = [];
let connection;
let user = null;
let session = 0;
let protectedVersion = 0;
let unsubscribeRecords;
let access = { state: "sign-in" };
let privateResources = [];
let privateQuizzes = [];

async function studyRequest(query = "") {
  const token = await user.getIdToken();
  return fetch("/api/study-materials" + query, {
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
  });
}

async function refreshAccess() {
  if (!profile || !user) return;
  const version = ++protectedVersion;
  const previous = JSON.stringify([access, privateResources, privateQuizzes]);
  try {
    const response = await studyRequest();
    const data = await response.json();
    if (version !== protectedVersion) return;
    if (response.ok && (!Array.isArray(data.resources) || !Array.isArray(data.quizzes))) throw new Error("Invalid access response");
    access = response.ok ? { state: "open" } : { state: data.error, overdue: data.overdue };
    privateResources = response.ok ? data.resources : [];
    privateQuizzes = response.ok ? data.quizzes : [];
  } catch {
    if (version !== protectedVersion) return;
    access = { state: "unavailable" };
    privateResources = [];
    privateQuizzes = [];
  }
  if (previous !== JSON.stringify([access, privateResources, privateQuizzes])) renderChapter();
}

function accessMessage() {
  if (access.state === "open") return "";
  const dues = access.state === "overdue" && Array.isArray(access.overdue)
    ? access.overdue.map(item => h(item.month) + " · ৳" + h(item.amount)).join(", ")
    : "";
  const message = dues ? tr("বকেয়া ফি: ", "Overdue fees: ") + dues + ". " +
    tr("ফি পরিশোধের হিসাব আপডেট হলে ক্লাসের উপকরণ খুলবে।", "Class materials reopen once your payment is recorded.")
    : access.state === "sign-in" ? tr("ব্যাচের স্টাডি ম্যাটেরিয়ালস দেখতে শিক্ষার্থী হিসেবে লগইন করো।", "Sign in as a student to access batch study materials.")
    : access.state === "checking" ? tr("স্টাডি ম্যাটেরিয়ালসের অ্যাক্সেস যাচাই হচ্ছে…", "Checking study-material access…")
    : access.state === "student" ? tr("স্টাডি ম্যাটেরিয়ালসের জন্য তোমার শিক্ষার্থী প্রোফাইল যুক্ত করতে হবে।", "Link your student profile to access study materials.")
    : tr("স্টাডি ম্যাটেরিয়ালসের অ্যাক্সেস যাচাই করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করো।", "Study-material access could not be verified. Try again shortly.");
  return '<section class="sc-card" role="status"><p>' + message +
    '</p><a class="sc-button" href="#' + (dues ? 'fees' : 'dashboard') + '">' +
    (dues ? tr("ফি ও পরিশোধের নির্দেশনা", "Fees and payment instructions") : tr("আমার ড্যাশবোর্ড", "My dashboard")) + '</a></section>';
}

async function downloadStudyFile(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const generation = session;
  button.disabled = true;
  try {
    const response = await studyRequest("?" + button.dataset.studyFile);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) await refreshAccess();
      throw new Error("Download failed");
    }
    const file = await response.blob();
    if (generation !== session || access.state !== "open") return;
    const name = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") || "")?.[1];
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "study-material";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch {
    if (button.isConnected) $("study-download-status").textContent = tr("ফাইল পাওয়া যায়নি। আবার চেষ্টা করো।", "Could not get the file. Try again.");
  } finally {
    button.disabled = false;
  }
}

function resourceLink(item) {
  const title = h(tr(item.title,item.titleEn || item.title));
  const bundled = typeof item.url === "string" && item.url.startsWith("materials/");
  if (item.privateFile || bundled) {
    if (access.state !== "open") return "";
    const query = item.privateFile ? "resource=" + encodeURIComponent(item.id) : "asset=" + encodeURIComponent(item.url.slice(10));
    return '<li><button type="button" class="sc-button" data-study-file="'+h(query)+'">'+title+'</button></li>';
  }
  const url = safeURL(item.url);
  return url ? '<li><a href="'+h(url)+'">'+title+'</a></li>' : "";
}
function renderSlideGroups() {
  return qualitativeSlideGroups.map(({title, titleEn, slides}) =>
    '<details class="sc-slide-group"><summary>'+h(tr(title,titleEn))+'</summary><ul>'+
    slides.map(resourceLink).join("")+'</ul></details>'
  ).join("");
}
function render() {
  const content = $("content");
  content.innerHTML = '<div class="sc-actions sc-tabs"><a class="sc-button" href="#learn">'+tr("অধ্যায়","Chapters")+'</a><a class="sc-button" href="#practice">MCQ</a><a class="sc-button" href="#dashboard">'+tr("আমার ড্যাশবোর্ড","My dashboard")+'</a><a class="sc-button" href="lab.html">Virtual Lab ↗</a></div>'+
    '<section class="sc-card" id="learn"><h2>'+tr("অধ্যায় বেছে নাও","Choose a chapter")+'</h2><select class="sc-select" aria-label="'+tr("অধ্যায়","Chapter")+'" id="chapter">'+chapters.map(([id,bn,en])=>'<option value="'+id+'">'+id+' · '+tr(bn,en)+'</option>').join("")+'</select></section><div id="chapter-content"></div>';
  $("chapter").value = chapter;
  $("chapter").onchange = event => { chapter = event.target.value; renderChapter(); };
  renderChapter();
  renderDashboard();
}
function renderChapter() {
  const items = [...starter,...resources,...privateResources].filter(item=>item.chapter===chapter);
  const groups = Object.entries(types).map(([type,names])=>{
    const links = items.filter(item=>item.type===type).map(resourceLink).join("");
    const slideGroups = type === "slides" && chapter === "1-2" && access.state === "open" ? renderSlideGroups() : "";
    const resourceList = links ? '<ul>'+links+'</ul>' : "";
    return '<article class="sc-card"><h3>'+names[lang()==="en"?1:0]+'</h3>'+
      (resourceList+slideGroups || '<p>'+tr("উপকরণ প্রকাশের অপেক্ষায়।","Materials pending publication.")+'</p>')+'</article>';
  }).join("");
  const questions = [...starterQuiz,...quizzes,...privateQuizzes].filter(q=>q.chapter===chapter && Array.isArray(q.options));
  $("chapter-content").innerHTML = accessMessage() + '<p id="study-download-status" role="status"></p><div class="sc-grid">'+groups+'</div><section id="practice" class="sc-card sc-quiz"><h2>'+tr("MCQ প্র্যাকটিস","MCQ practice")+'</h2>'+
    (questions.length ? '<form id="quiz">'+questions.map((q,i)=>'<fieldset><legend>'+ (i+1)+'. '+h(tr(q.title,q.titleEn||q.title))+'</legend>'+
    tr(q.options,q.optionsEn?.length===q.options.length?q.optionsEn:q.options).map((option,j)=>'<label><input required type="radio" name="q'+i+'" value="'+j+'"> '+h(option)+'</label>').join("")+
    '<p id="feedback-'+i+'"></p></fieldset>').join("")+'<button>'+tr("উত্তর মিলিয়ে দেখো","Check answers")+'</button> <button type="reset" aria-pressed="false">'+tr("আবার শুরু করো","Try again")+'</button><p id="quiz-result" class="sc-result" role="status"></p></form>' : '<p>'+tr("এই অধ্যায়ের প্রশ্ন প্রকাশের অপেক্ষায়।","Questions for this chapter are pending publication.")+'</p>')+'</section>';
  $("chapter-content").querySelectorAll("[data-study-file]").forEach(button => button.onclick = downloadStudyFile);
  const quiz = $("quiz");
  if (!quiz) return;
  quiz.onsubmit = event => {
    event.preventDefault();
    const answers = new FormData(quiz);
    let score = 0;
    questions.forEach((q,i)=>{
      const correct = Number(answers.get("q"+i)) === q.answer;
      score += Number(correct);
      $("feedback-"+i).textContent = (correct ? tr("সঠিক। ","Correct. ") : tr("ভুল। সঠিক উত্তর: ","Incorrect. Correct answer: ")+tr(q.options[q.answer],q.optionsEn?.[q.answer] || q.options[q.answer])+". ")+tr(q.explanation,q.explanationEn || q.explanation);
    });
    $("quiz-result").textContent = tr("স্কোর ","Score ")+score+"/"+questions.length;
  };
  quiz.onreset = () => {
    questions.forEach((_,i)=>{ $("feedback-"+i).textContent = ""; });
    $("quiz-result").textContent = "";
  };
}
function renderDashboard() {
  const area = $("private");
  if (!profile) {
    area.replaceChildren();
    return;
  }
  const table = (records, columns) => records.length ? '<div class="sc-scroll"><table class="sc-table"><tbody>'+records.map(record=>'<tr>'+columns.map(key=>'<td>'+h(record[key])+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>' : '<p>'+tr("এখনো তথ্য যোগ হয়নি।","No records yet.")+'</p>';
  const byKind = kind => studentRecords.filter(r=>r.kind===kind).sort((a,b)=>b.date.localeCompare(a.date));
  const attendance = byKind("attendance");
  const present = attendance.filter(r=>r.state==="present").length;
  const paid = byKind("fees").filter(r=>r.state==="paid").reduce((n,r)=>n+Number(r.amount),0);
  const due = byKind("fees").filter(r=>r.state==="due").reduce((n,r)=>n+Number(r.amount),0);
  const upcoming = notices.filter(n=>!n.batch || n.batch===profile.batch).sort((a,b)=>a.date.localeCompare(b.date));
  area.innerHTML = '<section class="sc-card"><h2>'+h(profile.name)+'</h2><p>'+h(profile.batch)+' · '+h(profile.roll)+'</p><p>'+h(user.email)+'</p><p>'+tr("উপস্থিতির হার ","Attendance ")+(attendance.length ? Math.round(100*present/attendance.length)+"%" : "—")+' · '+tr("পরিশোধ ","Paid ")+'৳'+paid+' · '+tr("বকেয়া ","Due ")+'৳'+due+'</p></section>'+
    '<section class="sc-card"><h2>'+tr("রুটিন ও নোটিশ","Schedule and notices")+'</h2>'+table(upcoming.map(n=>({...n,title:tr(n.title,n.titleEn||n.title),body:tr(n.body,n.bodyEn||n.body)})),["date","title","body"])+'</section>'+
    '<section class="sc-card" id="marks"><h2>'+tr("মার্কশিট · সর্বশেষ নম্বর আগে","Marksheet · latest first")+'</h2>'+table(byKind("marks").map(r=>({...r,score:r.score+"/"+r.total})),["date","title","score"])+'</section>'+
    '<section class="sc-card"><h2>'+tr("হাজিরা","Attendance")+'</h2>'+table(attendance.map(r=>({...r,state:r.state==="present"?tr("উপস্থিত","Present"):tr("অনুপস্থিত","Absent")})),["date","state"])+'</section>'+
    '<section class="sc-card" id="fees"><h2>'+tr("বেতন","Fees")+'</h2><p>'+tr("ফি পরিশোধের জন্য কোচিং অফিসে যোগাযোগ করো।","Contact the coaching office to pay your fees.")+'</p>'+table(byKind("fees").map(r=>({...r,state:r.state==="paid"?tr("পরিশোধিত","Paid"):tr("বকেয়া","Due")})),["date","title","amount","state"])+'</section>';
}
async function load(userValue) {
  const generation = ++session;
  ++protectedVersion;
  unsubscribeRecords?.();
  user = userValue;
  profile = null;
  studentRecords = [];
  resources = [];
  quizzes = [];
  privateResources = [];
  privateQuizzes = [];
  notices = [];
  access = { state: user ? "checking" : "sign-in" };
  render();
  const {db} = connection;
  try {
    const studentDoc = user ? await db.doc("students/"+user.uid).get() : null;
    const studentProfile = studentDoc?.data();
    const publicly = name => db.collection(name).where("public","==",true).get();
    const results = await Promise.all([publicly("resources"),publicly("quizzes"),publicly("notices"),
      studentProfile ? db.collection("students/"+user.uid+"/records").get() : null,
      studentProfile ? db.collection("notices").where("batch","==",studentProfile.batch).get() : null,
      studentProfile ? db.collection("notices").where("batch","==","").get() : null]);
    if (generation !== session) return;
    [resources,quizzes] = results.slice(0,2).map(rows);
    notices = [...new Map([results[2],results[4],results[5]].filter(Boolean).flatMap(rows).map(n=>[n.id,n])).values()];
    profile = studentProfile;
    studentRecords = results[3] ? rows(results[3]) : [];
    if (user && !profile) access = { state: "student" };
    $("auth-status").textContent = user && !profile ? tr("তোমার শিক্ষার্থী প্রোফাইল এখনো যুক্ত হয়নি।","Your student profile has not been linked.") : "";
    render();
    if (location.hash === "#marks" && !profile) $("dashboard").scrollIntoView();
    else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    if (profile) {
      void refreshAccess();
      let fees = JSON.stringify(studentRecords.filter(record => record.kind === "fees"));
      unsubscribeRecords = db.collection("students/"+user.uid+"/records").onSnapshot(snapshot => {
        if (generation !== session || snapshot.metadata.fromCache) return;
        studentRecords = rows(snapshot);
        renderDashboard();
        const latest = JSON.stringify(studentRecords.filter(record => record.kind === "fees"));
        if (latest !== fees) {
          fees = latest;
          access = { state: "checking" };
          privateResources = [];
          privateQuizzes = [];
          renderChapter();
          void refreshAccess();
        }
      });
    }
  } catch {
    if (generation === session) {
      if (user) access = { state: "unavailable" };
      $("auth-status").textContent = tr("অনলাইন তথ্য লোড হয়নি।","Online data could not be loaded.");
      renderChapter();
    }
  }
}
window.addEventListener("focus", refreshAccess);
languageButton(render);
if(location.hash === "#marks") $("dashboard").scrollIntoView();
try {
  connection = await connect();
  if (connection) bindAuth(connection.auth,load);
  else $("auth-status").textContent = setupMessage();
} catch { $("auth-status").textContent = setupMessage(); }
