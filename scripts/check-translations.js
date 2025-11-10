/**
 * Script để kiểm tra tính đồng bộ giữa các file translation
 * Chạy: node scripts/check-translations.js
 */

const fs = require('fs');
const path = require('path');

// Đọc file translations
const viPath = path.join(__dirname, '../src/locales/vi.ts');
const enPath = path.join(__dirname, '../src/locales/en.ts');

console.log('🔍 Checking translation files...\n');

// Hàm đệ quy để lấy tất cả keys
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  
  return keys;
}

// Hàm parse đơn giản (chỉ để demo, trong thực tế nên dùng parser tốt hơn)
function parseTranslationFile(content) {
  // Remove comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/\/\/.*/g, '');
  
  // Extract the object
  const match = content.match(/export const \w+ = ({[\s\S]*});/);
  if (!match) return null;
  
  try {
    // This is a simple eval - in production use a proper parser
    return eval('(' + match[1] + ')');
  } catch (e) {
    console.error('Error parsing:', e.message);
    return null;
  }
}

try {
  const viContent = fs.readFileSync(viPath, 'utf8');
  const enContent = fs.readFileSync(enPath, 'utf8');
  
  const viObj = parseTranslationFile(viContent);
  const enObj = parseTranslationFile(enContent);
  
  if (!viObj || !enObj) {
    console.error('❌ Could not parse translation files');
    process.exit(1);
  }
  
  const viKeys = getAllKeys(viObj).sort();
  const enKeys = getAllKeys(enObj).sort();
  
  console.log(`📊 Statistics:`);
  console.log(`   Vietnamese keys: ${viKeys.length}`);
  console.log(`   English keys: ${enKeys.length}`);
  console.log('');
  
  // Check for missing keys in English
  const missingInEn = viKeys.filter(key => !enKeys.includes(key));
  if (missingInEn.length > 0) {
    console.log('❌ Missing in English translation:');
    missingInEn.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  // Check for extra keys in English
  const extraInEn = enKeys.filter(key => !viKeys.includes(key));
  if (extraInEn.length > 0) {
    console.log('⚠️  Extra keys in English (not in Vietnamese):');
    extraInEn.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  if (missingInEn.length === 0 && extraInEn.length === 0) {
    console.log('✅ All translation keys are synchronized!');
  } else {
    console.log('❌ Translation files are not synchronized');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
