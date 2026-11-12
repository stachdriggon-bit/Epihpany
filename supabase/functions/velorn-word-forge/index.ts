import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import "./word-forge-bank.js";
import { wordForgeAdapter } from "./word-forge-adapter.mjs";
import {
  THINK_LAB_CORS_HEADERS,
  InvalidAuthSessionError,
  createRandomHex,
  getBearerToken,
  getClientNetworkAddress,
  hmacSha256Hex,
  jsonResponse,
  resolveAuthenticatedUserId,
  sha256Hex,
} from "../_shared/think-lab-validator-engine.mjs";

const adapter=wordForgeAdapter;
const VERSION=adapter.validatorVersion;
const headers=THINK_LAB_CORS_HEADERS;
const json=jsonResponse;

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers});
 if(req.method!=="POST")return json(405,{error:"method_not_allowed"});
 try{
  const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!anon||!secret)return json(503,{error:"validator_not_configured"});
  if(!req.headers.get("apikey"))return json(401,{error:"project_key_required"});
  const body=await req.json();
  if(!body||typeof body!=="object"||Array.isArray(body))return json(400,{error:"invalid_request"});
  const bearer=getBearerToken(req.headers.get("Authorization")||"");
  const apiKey=req.headers.get("apikey")||"";
  let userId:string|null=null;
  try{
   userId=await resolveAuthenticatedUserId({
    bearer,apiKey,anonKey:anon,
    createAuthClient:(token:string)=>createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:"Bearer "+token}}})
   });
  }catch(error){
   if(error instanceof InvalidAuthSessionError)return json(401,{error:"invalid_session"});
   throw error;
  }
  const service=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const bank=(globalThis as typeof globalThis & {EPIPHANY_WORD_FORGE_BANK?:any}).EPIPHANY_WORD_FORGE_BANK;
  if(body.action==="start"){
   if(!adapter.validateStartRequest(body))return json(400,{error:"invalid_selection"});
   if(!bank||!bank.validateBank().valid)return json(503,{error:"question_bank_unavailable"});
   const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
   const selected=adapter.selectRound(bank,body,random);
   let questions:any[];
   try{questions=adapter.buildCanonicalQuestions(selected,body);}catch{return json(503,{error:"question_bank_incomplete"});}
   const sessionId=crypto.randomUUID(),expiresAt=new Date(Date.now()+40*60*1000).toISOString();
   const guestToken=userId?null:createRandomHex(32);
   const ip=guestToken?getClientNetworkAddress(req):"";
   if(guestToken&&!ip)return json(503,{error:"client_network_identity_unavailable"});
   const {error}=await service.rpc("velorn_start_word_forge_session",{
    p_session_id:sessionId,p_user_id:userId,p_guest_token_hash:guestToken?await sha256Hex(guestToken):null,
    p_client_ip_hash:guestToken?await hmacSha256Hex(secret,ip):null,p_validator_version:VERSION,
    p_training_mode:body.trainingMode,p_questions:questions,p_expires_at:expiresAt
   });
   if(error){const limited=/rate limit/i.test(error.message||"");if(!limited)console.error("Word Forge start failed:",error.message);return json(limited?429:503,{error:limited?"session_rate_limited":"session_creation_failed"});}
   return json(200,{sessionId,guestToken,validatorVersion:VERSION,trainingMode:body.trainingMode,questions:adapter.projectQuestions(questions)});
  }
  if(body.action==="answer"){
   const guest=!userId;
   if(!adapter.validateAnswerRequest(body,guest))return json(400,{error:"invalid_answer_request"});
   const args=adapter.answerRpcArguments({userId,guestTokenHash:guest?await sha256Hex(body.guestToken as string):null,body});
   const {data,error}=await service.rpc("velorn_submit_word_forge_answer",args);
   if(error||!data){const m=error?.message||"";const status=/not found/i.test(m)?404:/expired|not active|unexpected/i.test(m)?409:/too quickly/i.test(m)?429:400;return json(status,{error:"answer_rejected"});}
   return json(200,adapter.projectAnswer(data));
  }
  return json(400,{error:"unknown_action"});
 }catch(error){console.error("Word Forge validator failed:",error instanceof Error?error.message:"unknown");return json(400,{error:"invalid_request"});}
});
