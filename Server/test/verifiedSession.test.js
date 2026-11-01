const {test}=require("node:test");const assert=require("node:assert/strict");
const jwt=require("jsonwebtoken");const authorization=require("../src/middleware/authorization");const jwtGenerator=require("../src/utils/jwtGenerator");
test("protected API rejects pre-verification sessions but accepts verified sessions",()=>{
 const previous=process.env.JWTSECRET;process.env.JWTSECRET="unit-test-secret-never-used-in-production";
 try{
  let passed=false;const response={status(code){this.code=code;return this;},json(body){this.body=body;}};
  authorization({header:()=>jwt.sign({user:7},process.env.JWTSECRET)},response,()=>{passed=true});
  assert.equal(response.code,401);assert.equal(passed,false);
  const req={header:()=>jwtGenerator(7)};authorization(req,response,()=>{passed=true});
  assert.equal(passed,true);assert.equal(req.authUserId,7);
 }finally{if(previous===undefined)delete process.env.JWTSECRET;else process.env.JWTSECRET=previous;}
});
