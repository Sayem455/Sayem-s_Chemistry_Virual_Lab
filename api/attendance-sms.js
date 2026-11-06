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
  const account = process.env.TWILIO_ACCOUNT_SID;
  const secret = process.env.TWILIO_AUTH_TOKEN;
  const sender = process.env.TWILIO_FROM;
  const authorization = req.headers.authorization || "";
  const {uid,id,refresh} = req.body || {};
  if(!/^Bearer \S+$/.test(authorization)) return res.status(401).json({error:"Sign-in required."});
  if(typeof uid!=="string"||typeof id!=="string"||!/^[\w-]{1,128}$/.test(uid)||!/^attendance_\d{4}-\d{2}-\d{2}$/.test(id))
    return res.status(400).json({error:"Invalid attendance record."});
  if(!project||!account||!secret||!sender) return res.status(503).json({error:"SMS provider setup is required."});
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
  const messaging = "https://api.twilio.com/2010-04-01/Accounts/"+encodeURIComponent(account)+"/Messages";
  async function provider(url,options={}) {
    return fetch(url,{...options,headers:{Authorization:"Basic "+Buffer.from(account+":"+secret).toString("base64"),"Content-Type":"application/x-www-form-urlencoded"},signal:AbortSignal.timeout(9000)});
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
    if(refresh&&/^SM[a-f0-9]{32}$/i.test(sid)) {
      // Verify write access before making any provider call.
      const locked=await patch(path,stamp(status,sid),record.updateTime);
      const response=await provider(messaging+"/"+sid+".json");
      if(!response.ok) throw new RequestError(502,"Could not check delivery.");
      const result=await response.json();
      await patch(path,stamp(result.status,sid),locked.updateTime);
      return res.status(200).json({status:result.status});
    }
    if(sid||["sending","unknown"].includes(status)) return res.status(200).json({status});
    const to=unpack(student.fields.guardian);
    if(!/^\+[1-9]\d{9,14}$/.test(to)) throw new RequestError(422,"Guardian phone number is invalid.");
    await patch(path,stamp("sending"),record.updateTime);
    const body="Sayem’s Chemistry: "+unpack(student.fields.name)+" was absent on "+unpack(fields.date)+".";
    let outcome=stamp("unknown");
    let resultStatus="unknown";
    try {
      const response=await provider(messaging+".json",{method:"POST",body:new URLSearchParams({To:to,From:sender,Body:body})});
      if(response.ok) {
        const result=await response.json();
        resultStatus=result.sid ? result.status || "queued" : "unknown";
        outcome=stamp(resultStatus,result.sid || "");
      } else if(response.status>=400&&response.status<500) {
        resultStatus="rejected";
        outcome=stamp(resultStatus);
      }
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
