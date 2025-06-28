#!/usr/bin/env tsx

/**
 * VibeSurfer Universal Parser
 * 複数のコード生成ツールに対応したユニバーサルパーサー
 */

export interface UniversalComponent {
  id: string;
  name: string;
  type: ComponentType;
  source: CodeGenTool;
  content: ComponentContent;
  metadata: ComponentMetadata;
  confidence: number;
}

export type ComponentType = 
  | 'header' | 'footer' | 'hero' | 'features' | 'cta' 
  | 'form' | 'card' | 'button' | 'section' | 'unknown';

export type CodeGenTool = 
  | 'ready-ai' | 'v0' | 'bolt' | 'cursor' | 'uizard' | 'custom';

export interface ComponentContent {
  html: string;
  css: string;
  props: Record<string, any>;
  dependencies: string[];
}

export interface ComponentMetadata {
  framework?: 'react' | 'vue' | 'astro' | 'svelte' | 'html';
  styling?: 'tailwind' | 'css-modules' | 'styled-components' | 'unocss';
  responsive: boolean;
  accessibility: AccessibilityScore;
  performance: PerformanceScore;
}

export interface AccessibilityScore {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface PerformanceScore {
  score: number; // 0-100
  bundleSize: number;
  renderTime: number;
}

/**
 * ユニバーサルパーサーのメインクラス
 */
export class UniversalParser {
  private parsers: Map<CodeGenTool, ToolParser> = new Map();

  constructor() {
    // 各ツール専用パーサーを登録
    this.parsers.set('ready-ai', new ReadyAiParser());
    this.parsers.set('v0', new V0Parser());
    this.parsers.set('bolt', new BoltParser());
    this.parsers.set('cursor', new CursorParser());
  }

  /**
   * 任意のソースからコンポーネントを解析
   */
  async parse(input: ParseInput): Promise<UniversalComponent[]> {
    const parser = this.parsers.get(input.tool);
    if (!parser) {
      throw new Error(`Unsupported tool: ${input.tool}`);
    }

    const components = await parser.parse(input);
    return components.map(comp => this.enrichComponent(comp, input.tool));
  }

  /**
   * コンポーネントを指定フォーマットにエクスポート
   */
  async export(
    components: UniversalComponent[], 
    format: ExportFormat
  ): Promise<ExportResult> {
    const exporter = new UniversalExporter();
    return await exporter.export(components, format);
  }

  /**
   * コンポーネント情報を充実化
   */
  private enrichComponent(
    component: UniversalComponent, 
    tool: CodeGenTool
  ): UniversalComponent {
    return {
      ...component,
      source: tool,
      metadata: {
        ...component.metadata,
        accessibility: this.analyzeAccessibility(component),
        performance: this.analyzePerformance(component)
      }
    };
  }

  private analyzeAccessibility(component: UniversalComponent): AccessibilityScore {
    // 簡易アクセシビリティ分析
    const html = component.content.html;
    const issues: string[] = [];
    let score = 100;

    if (!html.includes('alt=')) {
      issues.push('画像にalt属性がありません');
      score -= 20;
    }
    
    if (!html.includes('aria-')) {
      issues.push('ARIA属性が不足している可能性があります');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions: issues.map(issue => `改善案: ${issue}`)
    };
  }

  private analyzePerformance(component: UniversalComponent): PerformanceScore {
    // 簡易パフォーマンス分析
    const htmlSize = component.content.html.length;
    const cssSize = component.content.css.length;
    const bundleSize = htmlSize + cssSize;

    let score = 100;
    if (bundleSize > 10000) score -= 30;
    if (bundleSize > 5000) score -= 15;

    return {
      score: Math.max(0, score),
      bundleSize,
      renderTime: bundleSize / 1000 // 簡易計算
    };
  }
}

export interface ParseInput {
  tool: CodeGenTool;
  content: string;
  url?: string;
  options?: ParseOptions;
}

export interface ParseOptions {
  includeStyles?: boolean;
  extractProps?: boolean;
  analyzeComponents?: boolean;
}

export interface ExportFormat {
  framework: 'react' | 'vue' | 'astro' | 'svelte';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'unocss';
  typescript?: boolean;
}

export interface ExportResult {
  files: ExportFile[];
  dependencies: string[];
  instructions: string[];
}

export interface ExportFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'type';
}

/**
 * ツール固有パーサーの基底クラス
 */
abstract class ToolParser {
  abstract parse(input: ParseInput): Promise<UniversalComponent[]>;
}

/**
 * Ready.ai専用パーサー（既存実装を活用）
 */
class ReadyAiParser extends ToolParser {
  async parse(input: ParseInput): Promise<UniversalComponent[]> {
    // 既存のReady.ai解析システムを活用
    const { parseHtmlContent } = await import('../scripts/ready-ai/parser.js');
    
    try {
      const components = await parseHtmlContent(input.content, '');
      
      return components.map((comp, index) => ({
        id: `ready-ai-${Date.now()}-${index}`,
        name: comp.name,
        type: comp.type as ComponentType,
        source: 'ready-ai',
        content: {
          html: comp.html,
          css: comp.styles?.join('\n') || '',
          props: comp.props || {},
          dependencies: []
        },
        metadata: {
          framework: 'astro',
          styling: 'unocss',
          responsive: true,
          accessibility: { score: 0, issues: [], suggestions: [] },
          performance: { score: 0, bundleSize: 0, renderTime: 0 }
        },
        confidence: comp.confidence
      }));
    } catch (error) {
      console.error('Ready.ai parsing error:', error);
      return [];
    }
  }
}

/**
 * v0専用パーサー（プロトタイプ）
 */
class V0Parser extends ToolParser {
  async parse(input: ParseInput): Promise<UniversalComponent[]> {
    // v0形式の解析ロジック（今後実装）
    console.log('V0 parser: 未実装');
    return [];
  }
}

/**
 * Bolt専用パーサー（プロトタイプ）
 */
class BoltParser extends ToolParser {
  async parse(input: ParseInput): Promise<UniversalComponent[]> {
    // Bolt形式の解析ロジック（今後実装）
    console.log('Bolt parser: 未実装');
    return [];
  }
}

/**
 * Cursor専用パーサー（プロトタイプ）
 */
class CursorParser extends ToolParser {
  async parse(input: ParseInput): Promise<UniversalComponent[]> {
    // Cursor形式の解析ロジック（今後実装）
    console.log('Cursor parser: 未実装');
    return [];
  }
}

/**
 * ユニバーサルエクスポーター
 */
class UniversalExporter {
  async export(
    components: UniversalComponent[], 
    format: ExportFormat
  ): Promise<ExportResult> {
    const files: ExportFile[] = [];
    const dependencies: string[] = [];
    const instructions: string[] = [];

    for (const component of components) {
      const componentFile = await this.generateComponent(component, format);
      files.push(componentFile);
    }

    // フレームワーク固有の依存関係
    switch (format.framework) {
      case 'react':
        dependencies.push('react', '@types/react');
        break;
      case 'vue':
        dependencies.push('vue');
        break;
      case 'astro':
        dependencies.push('astro');
        break;
      case 'svelte':
        dependencies.push('svelte');
        break;
    }

    // スタイリング依存関係
    switch (format.styling) {
      case 'tailwind':
        dependencies.push('tailwindcss');
        break;
      case 'unocss':
        dependencies.push('@unocss/webpack');
        break;
    }

    return { files, dependencies, instructions };
  }

  private async generateComponent(
    component: UniversalComponent, 
    format: ExportFormat
  ): Promise<ExportFile> {
    let content = '';

    switch (format.framework) {
      case 'react':
        content = this.generateReact(component, format);
        break;
      case 'astro':
        content = this.generateAstro(component, format);
        break;
      default:
        throw new Error(`Unsupported framework: ${format.framework}`);
    }

    return {
      path: `${component.name}.${format.framework === 'astro' ? 'astro' : 'tsx'}`,
      content,
      type: 'component'
    };
  }

  private generateReact(component: UniversalComponent, format: ExportFormat): string {
    const { html, props } = component.content;
    const propsInterface = this.generatePropsInterface(props, format.typescript);
    
    return `${format.typescript ? propsInterface : ''}
export default function ${component.name}(${format.typescript ? 'props: Props' : 'props'}) {
  return (
    ${html.replace(/class=/g, 'className=')}
  );
}`;
  }

  private generateAstro(component: UniversalComponent, format: ExportFormat): string {
    const { html, props } = component.content;
    const propsInterface = this.generatePropsInterface(props, true);
    
    return `---
${propsInterface}

const { ${Object.keys(props).join(', ')} } = Astro.props;
---

${html}`;
  }

  private generatePropsInterface(props: Record<string, any>, typescript: boolean = true): string {
    if (!typescript || Object.keys(props).length === 0) return '';
    
    const propsTypes = Object.keys(props).map(key => `  ${key}: string;`).join('\n');
    return `interface Props {\n${propsTypes}\n}\n`;
  }
}

// CLI実行時のメイン処理
if (import.meta.url === `file://${process.argv[1]}`) {
  const parser = new UniversalParser();
  
  // 使用例
  console.log('🌊 VibeSurfer Universal Parser');
  console.log('Ready.ai → React変換をテスト中...');
  
  // Ready.aiサンプルでテスト
  const sampleInput: ParseInput = {
    tool: 'ready-ai',
    content: '<div class="hero"><h1>テスト</h1></div>',
    options: { includeStyles: true, extractProps: true }
  };
  
  parser.parse(sampleInput)
    .then(components => {
      console.log(`✅ ${components.length}個のコンポーネントを解析`);
      return parser.export(components, {
        framework: 'react',
        styling: 'tailwind',
        typescript: true
      });
    })
    .then(result => {
      console.log(`📦 ${result.files.length}個のファイルを生成`);
      console.log('依存関係:', result.dependencies.join(', '));
    })
    .catch(console.error);
}