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

 
