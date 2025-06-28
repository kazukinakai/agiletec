#!/usr/bin/env tsx

/**
 * VibeSurfer実験: Ready.ai → React変換テスト
 */

import { UniversalParser } from './universal-parser.js';
import type { ParseInput, ExportFormat } from './universal-parser.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function testReadyAiToReact() {
  console.log('🧪 Ready.ai → React変換テストを開始');
  
  try {
    // 既存のReady.aiデータを読み込み
    const scrapedDataPath = join(process.cwd(), 'scraped-data', 'current', 'index.html');
    const htmlContent = await readFile(scrapedDataPath, 'utf-8');
    
    console.log(`📄 HTMLサイズ: ${(htmlContent.length / 1024).toFixed(1)}KB`);
    
    // ユニバーサルパーサーで解析
    const parser = new UniversalParser();
    
    const input: ParseInput = {
      tool: 'ready-ai',
      content: htmlContent,
      options: {
        includeStyles: true,
        extractProps: true,
        analyzeComponents: true
      }
    };
    
    console.log('🔍 コンポーネント解析中...');
    const components = await parser.parse(input);
    
    console.log(`✅ ${components.length}個のコンポーネントを検出:`);
    components.forEach((comp, i) => {
      console.log(`  ${i + 1}. ${comp.name} (${comp.type}) - 信頼度: ${comp.confidence}`);
    });
    
    // React形式でエクスポート
    console.log('\n🔄 React + TypeScript + Tailwindに変換中...');
    
    const exportFormat: ExportFormat = {
      framework: 'react',
      styling: 'tailwind',
      typescript: true
    };
    
    const result = await parser.export(components, exportFormat);
    
    console.log(`📦 生成されたファイル数: ${result.files.length}`);
    console.log(`📚 必要な依存関係: ${result.dependencies.join(', ')}`);
    
    // 結果をファイルに保存
    const outputDir = join(process.cwd(), 'vibesurfer-experiments', 'output');
    await import('fs/promises').then(fs => fs.mkdir(outputDir, { recursive: true }));
    
    for (const file of result.files) {
      const filePath = join(outputDir, file.path);
      await import('fs/promises').then(fs => fs.writeFile(filePath, file.content, 'utf-8'));
      console.log(`💾 保存: ${file.path}`);
    }
    
    // パッケージ.json生成
    const packageJson = {
      name: 'ready-ai-to-react-conversion',
      version: '1.0.0',
      dependencies: result.dependencies.reduce((acc, dep) => {
        acc[dep] = 'latest';
        return acc;
      }, {} as Record<string, string>)
    };
    
    await import('fs/promises').then(fs => 
      fs.writeFile(
        join(outputDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      )
    );
    
    console.log('\n🎉 変換完了！出力ディレクトリ: vibesurfer-experiments/output/');
    console.log('\n📋 次のステップ:');
    console.log('  1. cd vibesurfer-experiments/output');
    console.log('  2. npm install');
    console.log('  3. コンポーネントを確認・調整');
    
    // 分析レポート
    console.log('\n📊 分析レポート:');
    const totalConfidence = components.reduce((sum, comp) => sum + comp.confidence, 0);
    const avgConfidence = totalConfidence / components.length;
    console.log(`  平均信頼度: ${(avgConfidence * 100).toFixed(1)}%`);
    
    const typeDistribution = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`  コンポーネント分布:`, typeDistribution);
    
    // アクセシビリティ・パフォーマンススコア
    const avgAccessibility = components.reduce((sum, comp) => 
      sum + comp.metadata.accessibility.score, 0) / components.length;
    const avgPerformance = components.reduce((sum, comp) => 
      sum + comp.metadata.performance.score, 0) / components.length;
      
    console.log(`  平均アクセシビリティスコア: ${avgAccessibility.toFixed(1)}/100`);
    console.log(`  平均パフォーマンススコア: ${avgPerformance.toFixed(1)}/100`);
    
  } catch (error) {
    console.error('❌ 変換エラー:', error);
    console.log('\n💡 トラブルシューティング:');
    console.log('  1. Ready.aiデータが存在するか確認: pnpm sync:ready-ai --dry-run');
    console.log('  2. scraped-data/current/index.html が存在するか確認');
    console.log('  3. 依存関係インストール: pnpm install');
  }
}

async function testV0Integration() {
  console.log('\n🧪 v0統合テスト（プロトタイプ）');
  
  // v0サンプル（実際にはv0 APIから取得）
  const v0Sample = `
    export default function HeroSection() {
      return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Welcome to the Future</h1>
            <p className="text-xl mb-8">Build amazing apps with AI-powered tools</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
              Get Started
            </button>
          </div>
        </div>
      );
    }
  `;
  
  console.log('📝 v0 Reactコンポーネントサンプル:');
  console.log(v0Sample.slice(0, 200) + '...');
  
  // TODO: v0パーサー実装後にここで実際の変換テスト
  console.log('⚠️  v0パーサーは未実装（Phase 2で対応予定）');
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🌊 VibeSurfer変換テストスイート\n');
  
  testReadyAiToReact()
    .then(() => testV0Integration())
    .then(() => {
      console.log('\n✨ 全テスト完了！');
      console.log('\n🚀 VibeSurfer MVP開発準備が整いました');
    })
    .catch(error => {
      console.error('💥 テスト失敗:', error);
      process.exit(1);
    });
}