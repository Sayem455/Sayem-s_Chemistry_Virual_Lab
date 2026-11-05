const $=s=>document.querySelector(s);let language='bn';
$('#lang').addEventListener('click',()=>{language=language==='bn'?'en':'bn';document.documentElement.lang=language;document.querySelectorAll('[data-bn][data-en]').forEach(el=>{el.innerHTML=el.dataset[language]});$('#lang').textContent=language==='bn'?'EN':'বাংলা';updateTitration();});
document.querySelectorAll('.exp').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.exp').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.target).classList.add('active')}));
const elements={H:['Hydrogen','হাইড্রোজেন',1,1,1],C:['Carbon','কার্বন',6,14,2],N:['Nitrogen','নাইট্রোজেন',7,15,2],O:['Oxygen','অক্সিজেন',8,16,2],Na:['Sodium','সোডিয়াম',11,1,3],Mg:['Magnesium','ম্যাগনেসিয়াম',12,2,3],Al:['Aluminium','অ্যালুমিনিয়াম',13,13,3],Cl:['Chlorine','ক্লোরিন',17,17,3],Fe:['Iron','লোহা',26,8,4],Cu:['Copper','তামা',29,11,4]};function find(){const s=$('#elementInput').value.trim();const e=elements[s[0]?.toUpperCase()+s.slice(1).toLowerCase()];if(!e){$('#elementResult').innerHTML='<b>?</b><div><strong>'+(language==='bn'?'মৌল পাওয়া যায়নি':'Element not found')+'</strong><small>'+(language==='bn'?'তালিকার কোনো প্রতীক লিখে আবার চেষ্টা করো।':'Try a symbol from the demo set.')+'</small></div>';return}const sym=s[0].toUpperCase()+s.slice(1).toLowerCase();$('#elementResult').innerHTML=`<b>${sym}</b><div><strong>${e[0]} · ${e[1]}</strong><small>${language==='bn'?'পারমাণবিক সংখ্যা':'Atomic number'}: ${e[2]} | ${language==='bn'?'গ্রুপ':'Group'}: ${e[3]} | ${language==='bn'?'পর্যায়':'Period'}: ${e[4]}</small></div>`}$('#findElement').addEventListener('click',find);$('#elementInput').addEventListener('keydown',e=>{if(e.key==='Enter')find()});$('#year').textContent=new Date().getFullYear();
const capacity = 5000;
let acid = false;
let indicator = false;
let filled = false;
let added = 0; // hundredths of a millilitre
let recorded = null;
let hint = null;

function titrationPH(volume) {
  const excess = (0.100 * (25 - volume)) / (25 + volume);
  const root = Math.hypot(excess, 2e-7);
  const hydrogen = excess >= 0 ? (root + excess) / 2 : 2e-14 / (root - excess);
  return -Math.log10(hydrogen);
}

for (let value = 0; value <= 50; value += 5) {
  const y = 25 + 3.1 * value;
  $('#benchTicks').insertAdjacentHTML('beforeend',
    `<path d="M168 ${y}h13" stroke="#52718c"/><text x="188" y="${y + 4}" font-size="10">${value}</text>`);
}

function updateTitration() {
  const volume = added / 100;
  const ph = titrationPH(volume);
  const y = 25 + 3.1 * volume;
  $('#benchPH').textContent = acid ? ph.toFixed(2) : '—';
  $('#benchVolume').textContent = filled ? volume.toFixed(2) : '—';
  $('#baseLiquid').setAttribute('y', y);
  $('#baseLiquid').setAttribute('height', 182 - y);
  $('#baseLiquid').setAttribute('visibility', filled && added < capacity ? 'visible' : 'hidden');
  $('#meniscus').setAttribute('d', `M154 ${y}q11 6 22 0`);
  $('#meniscus').setAttribute('visibility', filled ? 'visible' : 'hidden');
  $('#flaskLiquid').setAttribute('visibility', acid ? 'visible' : 'hidden');
  $('#flaskLiquid').setAttribute('y', 321 - volume * 0.65);
  $('#flaskLiquid').setAttribute('fill', indicator && ph >= 8.2
    ? (added === 2505 ? '#f7c6db' : '#ea78aa') : '#e1f3fa');

  const message = hint ?? (
    !acid ? ['প্রথমে ফ্লাস্কে HCl যোগ করো।', 'Start by adding HCl to the flask.'] :
    !indicator ? ['এবার ফেনলফথ্যালিন যোগ করো।', 'Now add phenolphthalein.'] :
    !filled ? ['বুরেট ০.০০ mL দাগ পর্যন্ত NaOH দিয়ে ভরো।', 'Fill the burette with NaOH to the 0.00 mL mark.'] :
    added === 2505 ? ['হালকা গোলাপি রং স্থায়ী হয়েছে। এন্ডপয়েন্টের পাঠ লিখে রাখো।', 'A faint pink colour persists. Record the endpoint reading.'] :
    added > 2505 ? ['গাঢ় গোলাপি রং দেখাচ্ছে। এন্ডপয়েন্ট পেরিয়ে গেছ। আবার শুরু করে শেষ দিকে ফোঁটায় ফোঁটায় দাও।', 'The deeper pink shows you passed the endpoint. Reset and add drops near the end.'] :
    added === 2500 ? ['সমতুল্য বিন্দুতে pH প্রায় ৭। সূচকের এন্ডপয়েন্ট দেখতে এক ফোঁটা যোগ করো।', 'At equivalence, pH is about 7. Add one drop to see the indicator endpoint.'] :
    added >= 2400 ? ['এন্ডপয়েন্ট কাছে। এবার ফোঁটায় ফোঁটায় যোগ করো।', 'The endpoint is near. Switch to single drops.'] :
    ['NaOH যোগ করো এবং বুরেটের মেনিসকাস পড়ো।', 'Add NaOH and read the burette meniscus.']
  );
  const reading = recorded === null ? '' : (language === 'bn' ? ' লিখে রাখা পাঠ: ' : ' Recorded reading: ') + recorded + ' mL.';
  $('#observation').textContent = message[language === 'bn' ? 0 : 1] + reading;
}

function onBench(id, action) {
  $('#' + id).addEventListener('click', () => {
    hint = null;
    action();
    updateTitration();
  });
}

onBench('fillAcid', () => { acid = true; });
onBench('addIndicator', () => {
  if (acid) indicator = true;
  else hint = ['আগে ফ্লাস্কে HCl যোগ করো।', 'Add HCl to the flask first.'];
});
onBench('fillBase', () => { filled = true; });

function dispense(amount) {
  if (!acid || !indicator || !filled) {
    hint = ['আগে HCl, সূচক ও বুরেট প্রস্তুত করো।', 'Prepare the HCl, indicator and burette first.'];
    return;
  }
  if (added + amount > capacity) {
    hint = ['বুরেটে এই পরিমাণ NaOH অবশিষ্ট নেই।', 'There is not enough NaOH left in the burette.'];
    return;
  }
  added += amount;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('#benchDrop').animate([{opacity: 1, transform: 'translateY(0)'}, {opacity: 0, transform: 'translateY(107px)'}], 400);
  }
}

onBench('addBulk', () => dispense(100));
onBench('addDrop', () => dispense(5));
onBench('recordReading', () => {
  if (added === 2505) recorded = (added / 100).toFixed(2);
  else hint = ['হালকা গোলাপি রং স্থায়ী হলে পাঠ লিখে রাখো।', 'Record the reading when the faint pink colour persists.'];
});
onBench('resetTitration', () => {
  acid = indicator = filled = false;
  added = 0;
  recorded = null;
});
updateTitration();
