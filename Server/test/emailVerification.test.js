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
test("legacy users get an unverified Firebase identity without granting access",async()=>{
 let created;
 const service=createEmailVerification({auth:authFor({getUser:async()=>{throw {code:"auth/user-not-found"}},createUser:async data=>{created=data;return data}})});
 await assert.rejects(service.requireVerified({id:7,email:user.email}),e=>e.code==="EMAIL_NOT_VERIFIED");
 assert.deepEqual(created,{uid:"7",email:user.email,emailVerified:false});
});

test("only validated identity is marked verified after code confirmation",async()=>{
 let update;const service=createEmailVerification({auth:authFor({updateUser:async(uid,fields)=>{update={uid,...fields}}})});
 await service.markVerified(user);assert.deepEqual(update,{uid:"uid7",emailVerified:true});
});
