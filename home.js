import {$, connect, escapeHTML as h, rows, safeURL, setupMessage, tr} from "./shared.js";
const form = $("admission-form");
let notices = [];
let teacher = {};
const defaultDegree = $("teacher-degree").textContent;
function render() {
  $("public-notices").innerHTML = notices.length ? notices.map(item => '<p><strong>'+h(tr(item.title, item.titleEn || item.title))+'</strong> · '+h(item.date)+'<br>'+h(tr(item.body, item.bodyEn || item.body))+'</p>').join("") : '<p>'+tr("এখনো কোনো নোটিশ প্রকাশিত হয়নি।","No notices have been published.")+'</p>';
  $("teacher-bio").textContent = tr(teacher.bio || "HSC রসায়ন শিক্ষক · Sayem’s Chemistry",teacher.bioEn || "HSC Chemistry teacher · Sayem’s Chemistry");
  $("teacher-degree").textContent = tr(teacher.degree,teacher.degreeEn || teacher.degree) || defaultDegree;
  const photo = safeURL(teacher.photo);
  if (photo) { $("teacher-photo").src = photo; $("teacher-photo").alt = "S.M. Sayem Mahmud"; }
}
render();
window.addEventListener("sc-language", render);
try {
  const connection = await connect();
  if (connection) {
    const {db} = connection;
    form.querySelector("button").disabled = false;
    form.onsubmit = async event => {
      event.preventDefault();
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        const data = Object.fromEntries(new FormData(form));
        await db.collection("applications").add({...data, createdAt:new Date().toISOString()});
        form.reset();
        $("admission-status").textContent = tr("আবেদন জমা হয়েছে।","Application submitted.");
      } catch { $("admission-status").textContent = tr("আবেদন জমা হয়নি। আবার চেষ্টা করো।","Could not submit. Try again."); }
      finally { button.disabled = false; }
    };
    const [noticeResult, teacherResult] = await Promise.all([
      db.collection("notices").where("public", "==", true).get(), db.doc("settings/teacher").get()
    ]);
    notices = rows(noticeResult).sort((a,b) => (b.date || "").localeCompare(a.date || ""));
    teacher = teacherResult.data() || {};
    render();
  } else {
    const status = $("admission-status");
    const update = () => { status.textContent = setupMessage(); };
    update();
    window.addEventListener("sc-language", update);
  }
} catch { $("admission-status").textContent = tr("অনলাইন সেবা সংযুক্ত হয়নি।","The online service could not connect."); }
