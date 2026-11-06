class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const string = value => ({stringValue:value});
const unpack = value => value?.stringValue || "";
const stamp = (status, sid = "") => ({
  mapValue:{fields:{status:string(status),sid:string(sid),updatedAt:string(new Date().toISOString())}}
});

export default async function handler(req, res) {
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"POST required."});

  const project = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.BULKSMSBD_API_KEY;
  const sender = process.env.BULKSMSBD_SENDER_ID;
  const authorization = req.headers.authorization || "";
  const {uid,id} = req.body || {};

  if(!/^Bearer \S+$/.test(authorization))
    return res.status(401).json({error:"Sign-in required."});
  if(typeof uid!=="string"||typeof id!=="string"||!/^[\w-]{1,128}$/.test(uid)||!/^attendance_\d{4}-\d{2}-\d{2}$/.test(id))
    return res.status(400).json({error:"Invalid attendance record."});
  if(!project||!apiKey||!sender)
    return res.status(503).json({error:"SMS provider setup is required."});

  const base = "https://firestore.googleapis.com/v1/projects/"+encodeURIComponent(project)+"/databases/(default)/documents/";

  async function firestore(path, options={}) {
    const response=await fetch(base+path,{
      ...options,headers:{Authorization:authorization,"Content-Type":"application/json"},
      signal:AbortSignal.timeout(8000)
    });
    if(!response.ok) throw new RequestError(response.status,response.status===403?"Admin access required.":"Attendance record could not be accessed or changed.");
    return response.json();
  }

  function patch(path,value,updateTime) {
    const query=new URLSearchParams({"updateMask.fieldPaths":"message","currentDocument.updateTime":updateTime});
    return firestore(path+"?"+query,{method:"PATCH",body:JSON.stringify({fields:{message:value}})});
  }

  try {
    const path="students/"+uid+"/records/"+id;
    const [student,record]=await Promise.all([firestore("students/"+uid),firestore(path)]);
    const fields=record.fields;
    const message=fields.message?.mapValue.fields || {};
    const sid=unpack(message.sid);
    const status=unpack(message.status);

    if(unpack(fields.kind)!=="attendance"||unpack(fields.state)!=="absent")
      throw new RequestError(409,"The record is no longer marked absent.");
    if(sid||["sending","unknown","submitted"].includes(status))
      return res.status(200).json({status});

    const guardian=unpack(student.fields.guardian);
    if(!/^\+8801[3-9]\d{8}$/.test(guardian))
      throw new RequestError(422,"Use a Bangladeshi guardian mobile number in +880 format.");

    const data=new FormData();
    data.set("api_key",apiKey);
    data.set("senderid",sender);
    data.set("type","text");
    data.set("number",guardian.slice(1));
    data.set("message","সায়েমস কেমিস্ট্রি: "+unpack(student.fields.name)+" "+unpack(fields.date)+" তারিখে ক্লাসে অনুপস্থিত ছিল।");

    // A conditional write verifies admin permission and prevents concurrent sends.
    await patch(path,stamp("sending"),record.updateTime);
    let outcome=stamp("unknown");
    let resultStatus="unknown";

    try {
      const response=await fetch("https://bulksmsbd.net/api/smsapi",{
        method:"POST",body:data,redirect:"error",signal:AbortSignal.timeout(9000)
      });
      const payload=await response.text();
      let result;
      try { result=JSON.parse(payload); } catch { result=payload.trim(); }
      const code=String(result?.response_code ?? result?.code ?? result ?? "").trim();

      if(response.ok && code==="202") {
        resultStatus="submitted";
      } else if(/^10(?:02|03|06|07|11|12|13|14|15|16|17|18|19|20|21|31|32)$/.test(code)) {
        resultStatus="rejected ("+code+")";
      }
      outcome=stamp(resultStatus);
    } finally {
      for(let attempt=0;attempt<3;attempt++) {
        const latest=await firestore(path);
        try { await patch(path,outcome,latest.updateTime); break; }
        catch(error) { if(attempt===2||![400,409,412].includes(error.status)) throw error; }
      }
    }
    return res.status(200).json({status:resultStatus});
  } catch(error) {
    return res.status(error.status||502).json({error:error.status?error.message:"SMS provider could not confirm the request. Check the message log."});
  }
}
