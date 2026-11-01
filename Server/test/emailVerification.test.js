const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createEmailVerification } = require("../src/utils/emailVerification");
const user = { id: 7, firebaseUid: "uid7", email: "ana@example.com" };
const authFor = (overrides={}) => ({ getUser: async () => ({uid:"uid7",email:user.email,emailVerified:false}), ...overrides });
test("unverified accounts are blocked with an actionable 403", async()=>{
 await assert.rejects(createEmailVerification({auth:authFor()}).requireVerified(user), e=>e.code==="EMAIL_NOT_VERIFIED" && e.status===403);
});
test("only a matching, enabled, verified Firebase identity can enter", async()=>{
 await createEmailVerification({auth:authFor({getUser:async()=>({email:user.email,emailVerified:true})})}).requireVerified(user);
 for(const record of [{email:"other@example.com",emailVerified:true},{email:user.email,emailVerified:true,disabled:true}]) {
  await assert.rejects(createEmailVerification({auth:authFor({getUser:async()=>record})}).requireVerified(user),/identidad/);
 }
});
test("verification mail uses Firebase, Spanish locale, and never returns session credentials",async()=>{
 const calls=[];
 const service=createEmailVerification({apiKey:"test-key",auth:authFor({createCustomToken:async()=>"internal-custom-token"}),fetchImpl:async(url,options)=>{
  calls.push({url,options,body:JSON.parse(options.body)});
  return {ok:true,json:async()=>calls.length===1?{idToken:"internal-id-token",refreshToken:"private"}:{email:user.email}};
 }});
 assert.deepEqual(await service.send(user),{verified:false});
 assert.match(calls[0].url,/accounts:signInWithCustomToken/);
 assert.equal(calls[1].body.requestType,"VERIFY_EMAIL");
 assert.equal(calls[1].body.idToken,"internal-id-token");
 assert.equal(calls[1].options.headers["X-Firebase-Locale"],"es");
});
test("delivery failure is not reported as successful",async()=>{
 const service=createEmailVerification({auth:authFor({createCustomToken:async()=>"token"}),fetchImpl:async()=>({ok:false})});
 await assert.rejects(service.send(user),/No pudimos enviar/);
});
test("verified accounts do not receive redundant messages",async()=>{
 const service=createEmailVerification({auth:authFor({getUser:async()=>({email:user.email,emailVerified:true})}),fetchImpl:()=>assert.fail("must not send")});
 assert.deepEqual(await service.send(user),{verified:true});
});
test("legacy users get an unverified Firebase identity without granting access",async()=>{
 let created;
 const service=createEmailVerification({auth:authFor({getUser:async()=>{throw {code:"auth/user-not-found"}},createUser:async data=>{created=data;return data}})});
 await assert.rejects(service.requireVerified({id:7,email:user.email}),e=>e.code==="EMAIL_NOT_VERIFIED");
 assert.deepEqual(created,{uid:"7",email:user.email,emailVerified:false});
});
