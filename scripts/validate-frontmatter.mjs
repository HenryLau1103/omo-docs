import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import matter from 'gray-matter';

const ajv = new Ajv();
addFormats(ajv);

const dirToSchema = {
  'specs': 'spec',
  'prd': 'prd',
  'api': 'api',
  'changelog': 'changelog',
  'plans': 'plan'
};

let hasErrors = false;

for (const [dirName, schemaName] of Object.entries(dirToSchema)) {
  const schemaPath = `docs/.schemas/${schemaName}.schema.json`;
  if (!existsSync(schemaPath)) {
    console.warn(`⚠️ Schema not found: ${schemaPath}`);
    continue;
  }
  
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  
  const docsDir = `docs/${dirName}`;
  if (!existsSync(docsDir)) continue;
  
  const entries = readdirSync(docsDir, { withFileTypes: true });
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .filter(e => e.name !== 'index.md')
    .map(e => e.name);
  
  const subdirs = entries.filter(e => e.isDirectory());
  if (subdirs.length > 0) {
    console.warn(`⚠️ ${docsDir}/ 包含子目錄 (已忽略): ${subdirs.map(d => d.name).join(', ')}`);
  }
  
  for (const file of files) {
    const content = readFileSync(join(docsDir, file), 'utf8');
    const { data } = matter(content);
    
    if (!validate(data)) {
      console.error(`❌ ${docsDir}/${file}: ${JSON.stringify(validate.errors)}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${docsDir}/${file}`);
    }
  }
}

process.exit(hasErrors ? 1 : 0);
