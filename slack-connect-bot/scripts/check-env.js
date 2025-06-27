#!/usr/bin/env node

import { existsSync, readdirSync } from 'fs'
import { resolve, basename } from 'path'

const projectRoot = process.cwd()
let hasEnvFile = false
const foundEnvFiles = []

console.log('🔍 Checking for .env files...\n')

// プロジェクトルートのファイルをスキャン
const files = readdirSync(projectRoot)

for (const file of files) {
  const fileName = basename(file).toLowerCase()
  const originalFileName = basename(file)
  
  // envを含むファイルを検出（大文字小文字無視）
  // .env, .env.*, .env-*, *.env, *env*, *-env* をすべて検出
  if (fileName === '.env' || 
      fileName.startsWith('.env.') || 
      fileName.startsWith('.env-') ||
      fileName.startsWith('.env_') ||
      fileName.endsWith('.env') ||
      fileName.endsWith('-env') ||
      fileName.endsWith('_env') ||
      (fileName.includes('env') && 
       !fileName.includes('node_modules') && 
       !fileName.includes('check-env') &&
       (fileName.startsWith('.') || fileName.includes('.env') || fileName.endsWith('env')))) {
    const filePath = resolve(projectRoot, file)
    if (existsSync(filePath)) {
      console.error(`❌ Found ${originalFileName} - This file should not exist!`)
      foundEnvFiles.push(originalFileName)
      hasEnvFile = true
    }
  }
}

if (hasEnvFile) {
  console.error('\n⚠️  Security Warning!')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('`.env` files are not allowed in this project.')
  console.error('All secrets must be managed through Infisical.')
  console.error('\nFound files:')
  foundEnvFiles.forEach(file => console.error(`  - ${file}`))
  console.error('\nPlease remove all .env files:')
  console.error(`  rm ${foundEnvFiles.join(' ')}`)
  console.error('\nThen use:')
  console.error('  pnpm dev           # for development')
  console.error('  pnpm deploy        # for deployment')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  process.exit(1)
} else {
  console.log('✅ No .env files found - Good!')
  console.log('\n📝 Remember:')
  console.log('  - Manage secrets in Infisical GUI')
  console.log('  - Use `pnpm dev` to run with secrets')
  console.log('  - Never create .env files locally')
}