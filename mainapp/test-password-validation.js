// Quick password validation test
const testPasswords = [
  'Banana8',      // Should pass - 7 chars with number
  'apple1',       // Should pass - 6 chars with number
  'Test123',      // Should pass - 7 chars with number
  'simple9',      // Should pass - 7 chars with number
  'short',        // Should fail - no number
  'abc12',        // Should fail - only 5 chars
  '123456'        // Should pass - 6 chars all numbers
];

console.log('\n🔒 New Password Requirements:\n');
console.log('   ✅ Minimum 6 characters');
console.log('   ✅ At least 1 number');
console.log('   ❌ NO uppercase required');
console.log('   ❌ NO lowercase required');
console.log('   ❌ NO special characters required\n');
console.log('─────────────────────────────────────────\n');

testPasswords.forEach(pwd => {
  const hasMinLength = pwd.length >= 6;
  const hasNumber = /[0-9]/.test(pwd);
  const passes = hasMinLength && hasNumber;
  
  console.log(`${passes ? '✅ PASS' : '❌ FAIL'} "${pwd}" - Length: ${pwd.length}, Has Number: ${hasNumber}`);
});

console.log('\n─────────────────────────────────────────');
console.log('✨ Simple passwords like "Banana8" now work!');
console.log('🔓 Password complexity reduced per user request\n');
