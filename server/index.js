import express from 'express';
import cors from 'cors';
import pg from 'pg';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
const app=express();app.disable('x-powered-by');app.set('trust proxy',1);
const {DATABASE_URL,FAMILY_ACCESS_KEY,ALLOWED_ORIGINS}=process.env;
const origins=(ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
if(!DATABASE_URL||!FAMILY_ACCESS_KEY||FAMILY_ACCESS_KEY.length<24||!origins.length)throw Error('Missing DATABASE_URL, FAMILY_ACCESS_KEY (24+ characters), ALLOWED_ORIGINS');
const pool=new pg.Pool({connectionString:DATABASE_URL});
await pool.query("CREATE TABLE IF NOT EXISTS family_answers (person_id TEXT PRIMARY KEY CHECK (person_id IN ('volodymyr','yevheniia','valerii','tymofii')), interests JSONB NOT NULL DEFAULT '{}'::jsonb, votes JSONB NOT NULL DEFAULT '{}'::jsonb, revision INTEGER NOT NULL DEFAULT 1, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())");
await pool.query('ALTER TABLE family_answers ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1');
app.use(cors({origin(origin,cb){if(!origin||origins.includes(origin))return cb(null,true);cb(new Error('Origin not allowed'))}}));
app.use(express.json({limit:'24kb'}));
app.use('/api',rateLimit({windowMs:15*60*1000,limit:120,standardHeaders:'draft-7',legacyHeaders:false}));
function auth(req,res,next){const header=req.get('authorization')||'';const token=header.startsWith('Bearer ')?header.slice(7):'';const a=Buffer.from(token),b=Buffer.from(FAMILY_ACCESS_KEY);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:'Потрібен сімейний код'});next()}
app.get('/health',(_req,res)=>res.json({status:'ok'}));
app.get('/api/answers',auth,async(_req,res,next)=>{try{const q=await pool.query('SELECT person_id,interests,votes,revision,updated_at FROM family_answers ORDER BY person_id');res.set('Cache-Control','no-store').json({answers:q.rows.map(x=>({person:x.person_id,interests:x.interests,votes:x.votes,revision:x.revision,updatedAt:x.updated_at}))})}catch(e){next(e)}});
app.put('/api/answers/:person',auth,async(req,res,next)=>{try{
const person=req.params.person,{interests,votes,revision}=req.body||{};
const people=['volodymyr','yevheniia','valerii','tymofii'];
const keys=new Set(['nature','panorama','mountains','rural','seascape','beach','animals','whales','waterparks','rides','cable','museums','towns','food','quiet','active','walking','boat']);
const choices={gran:['mountains','dunes','unsure'],whale:['yes','maybe','no']};
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
if(!Number.isInteger(revision)||revision<0)return res.status(400).json({error:'Некоректна версія даних'});
if(!people.includes(person)||!obj(interests)||!obj(votes)||Object.entries(interests).some(([k,v])=>!keys.has(k)||![0,1,2].includes(v))||Object.entries(votes).some(([k,v])=>!choices[k]||!obj(v)||!choices[k].includes(v.choice)||typeof v.comment!=='string'||v.comment.length>1500))return res.status(400).json({error:'Некоректні відповіді'});
let q;
if(revision===0){
 q=await pool.query("INSERT INTO family_answers(person_id,interests,votes,revision,updated_at) VALUES($1,$2::jsonb,$3::jsonb,1,now()) ON CONFLICT DO NOTHING RETURNING revision,updated_at",[person,JSON.stringify(interests),JSON.stringify(votes)]);
}else{
 q=await pool.query("UPDATE family_answers SET interests=$2::jsonb,votes=$3::jsonb,revision=revision+1,updated_at=now() WHERE person_id=$1 AND revision=$4 RETURNING revision,updated_at",[person,JSON.stringify(interests),JSON.stringify(votes),revision]);
}
if(!q.rowCount)return res.status(409).json({error:'Відповіді змінилися на іншому пристрої. Оновіть сторінку перед повторним збереженням.'});
res.set('Cache-Control','no-store').json({saved:true,revision:q.rows[0].revision,updatedAt:q.rows[0].updated_at});
}catch(e){next(e)}});
app.use((err,req,res,next)=>{console.error(err.message);res.status(500).json({error:'Сервер тимчасово недоступний'})});
app.listen(Number(process.env.PORT||3000),'0.0.0.0');
