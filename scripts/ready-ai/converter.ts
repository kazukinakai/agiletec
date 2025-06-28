import * as cheerio from 'cheerio';
import { CONFIG, CSS_MAPPING, ASTRO_TEMPLATE } from './config.js';
import { logger } from '../utils/logger.js';
import type { ParsedComponent, ConversionResult, ComponentProps } from '../types/ready-ai.d.ts';

/**
 * ParsedComponentをAstroコンポーネントに変換
 */
export async function convertToAstroComponent(component: ParsedComponent): Promise<ConversionResult> {
  try {
    return await logger.timeAsync(`${component.name}変換`, async () => {
      // HTMLをAstro形式に変換
      const { html: convertedHtml, props: extractedProps } = convertHtmlToAstro(component.html, component.props);
      
      // CSSをUnoCSS形式に変換
      const convertedStyles = convertCssToUnoCSS(component.styles);
      
      // Propsインターフェースを生成
      const propsInterface = generatePropsInterface(extractedProps);
      const propsDestructure = generatePropsDestructure(extractedProps);
      
      // Astroテンプレートに組み込み
      const astroComponent = ASTRO_TEMPLATE
        .replace('{{PROPS_INTERFACE}}', propsInterface)
        .replace('{{PROPS_DESTRUCTURE}}', propsDestructure)
        .replace('{{COMPONENT_HTML}}', convertedHtml)
        .replace('{{COMPONENT_STYLES}}', convertedStyles);
      
      const result: ConversionResult = {
        astroComponent,
        styles: convertedStyles,
        filename: component.name,
        success: true
      };
      
      logger.info(`${component.name}変換完了`, {
        propsCount: Object.keys(extractedProps).length,
        stylesCount: component.styles.length
      });
      
      return result;
    });
    
  } catch (error) {
    logger.error(`${component.name}変換エラー`, {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      astroComponent: '',
      styles: '',
      filename: component.name,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * HTMLをAstro形式に変換
 */
function convertHtmlToAstro(html: string, originalProps: ComponentProps): {
  html: string;
  props: Record<string, any>;
} {
  const $ = cheerio.load(html);
  const props: Record<string, any> = {};
  
  // テキストコンテンツをpropsに変換
  if (originalProps.text) {
    Object.entries(originalProps.text).forEach(([key, value]) => {
      const propName = toCamelCase(key);
      props[propName] = value;
      
      // HTMLの該当部分を置換
      const selector = getTextSelector(key, value);
      if (selector) {
        $(selector).each((_, element) => {
          const $element = $(element);
          if ($element.text().trim() === value) {
            $element.text(`{${propName}}`);
          }
        });
      }
    });
  }
  
  // 画像のsrc属性をpropsに変換
  if (originalProps.images) {
    Object.entries(originalProps.images).forEach(([key, value]) => {
      if (!key.endsWith('Alt')) {
        const propName = toCamelCase(key);
        props[propName] = value;
        
        // src属性を置換
        $(`img[src="${value}"]`).attr('src', `{${propName}}`);
        
        // alt属性も処理
        const altKey = `${key}Alt`;
        if (originalProps.images![altKey]) {
          const altPropName = `${propName}Alt`;
          props[altPropName] = originalProps.images![altKey];
          $(`img[src="{${propName}}"]`).attr('alt', `{${altPropName}}`);
        }
      }
    });
  }
  
  // リンクのhref属性をpropsに変換
  if (originalProps.links) {
    Object.entries(originalProps.links).forEach(([key, value]) => {
      if (!key.endsWith('Text')) {
        const propName = toCamelCase(key);
        props[propName] = value;
        
        // href属性を置換
        $(`a[href="${value}"]`).attr('href', `{${propName}}`);
      }
    });
  }
  
  // カスタムプロパティを追加
  if (originalProps.custom) {
    Object.entries(originalProps.custom).forEach(([key, value]) => {
      props[toCamelCase(key)] = value;
    });
  }
  
  return {
    html: $.html(),
    props
  };
}

/**
 * テキストセレクターを生成
 */
function getTextSelector(key: string, value: string): string | null {
  const tagMatch = key.match(/^(h[1-6]|p|span|a)/);
  if (tagMatch) {
    return tagMatch[1];
  }
  return null;
}

/**
 * CSSをUnoCSS形式に変換
 */
function convertCssToUnoCSS(styles: string[]): string {
  const convertedStyles: string[] = [];
  
  styles.forEach(cssRule => {
    let convertedRule = cssRule;
    
    // 色の変換
    Object.entries(CSS_MAPPING.colors).forEach(([cssColor, unoColor]) => {
      const regex = new RegExp(cssColor.replace('#', '\\#'), 'gi');
      convertedRule = convertedRule.replace(regex, `var(--un-${unoColor})`);
    });
    
    // スペーシングの変換
    Object.entries(CSS_MAPPING.spacing).forEach(([cssValue, unoValue]) => {
      const regex = new RegExp(cssValue, 'g');
      convertedRule = convertedRule.replace(regex, `var(--un-spacing-${unoValue})`);
    });
    
    // フォントサイズの変換
    Object.entries(CSS_MAPPING.fontSize).forEach(([cssSize, unoClass]) => {
      if (convertedRule.includes(`font-size: ${cssSize}`)) {
        convertedRule = convertedRule.replace(
          `font-size: ${cssSize}`,
          `/* ${unoClass} */`
        );
      }
    });
    
    // Flexbox/Grid の変換
    convertedRule = convertFlexboxToUno(convertedRule);
    convertedRule = convertGridToUno(convertedRule);
    
    // グラデーションの変換
    convertedRule = convertGradientToUno(convertedRule);
    
    convertedStyles.push(convertedRule);
  });
  
  return convertedStyles.join('\n\n');
}

/**
 * Flexboxクラスの変換
 */
function convertFlexboxToUno(css: string): string {
  const flexMappings = {
    'display: flex': '/* flex */',
    'flex-direction: column': '/* flex-col */',
    'flex-direction: row': '/* flex-row */',
    'justify-content: center': '/* justify-center */',
    'justify-content: space-between': '/* justify-between */',
    'align-items: center': '/* items-center */',
    'align-items: flex-start': '/* items-start */',
    'align-items: flex-end': '/* items-end */'
  };
  
  Object.entries(flexMappings).forEach(([cssProperty, unoComment]) => {
    css = css.replace(new RegExp(cssProperty, 'g'), unoComment);
  });
  
  return css;
}

/**
 * Gridクラスの変換
 */
function convertGridToUno(css: string): string {
  const gridMappings = {
    'display: grid': '/* grid */',
    'grid-template-columns: repeat\\(2, 1fr\\)': '/* grid-cols-2 */',
    'grid-template-columns: repeat\\(3, 1fr\\)': '/* grid-cols-3 */',
    'grid-template-columns: repeat\\(4, 1fr\\)': '/* grid-cols-4 */',
    'gap: 20px': '/* gap-5 */',
    'gap: 16px': '/* gap-4 */'
  };
  
  Object.entries(gridMappings).forEach(([cssProperty, unoComment]) => {
    css = css.replace(new RegExp(cssProperty, 'g'), unoComment);
  });
  
  return css;
}

/**
 * グラデーションの変換
 */
function convertGradientToUno(css: string): string {
  // linear-gradient変換
  const gradientRegex = /background:\s*linear-gradient\(([^)]+)\)/g;
  
  return css.replace(gradientRegex, (match, params) => {
    const parts = params.split(',').map((p: string) => p.trim());
    
    if (parts.length >= 3) {
      const angle = parts[0];
      const color1 = parts[1].split(' ')[0];
      const color2 = parts[2].split(' ')[0];
      
      // 簡単なマッピング（実際はより複雑な変換が必要）
      let direction = 'to-r';
      if (angle.includes('135deg')) direction = 'to-br';
      if (angle.includes('45deg')) direction = 'to-tr';
      
      return `/* bg-gradient-${direction} from-[${color1}] to-[${color2}] */`;
    }
    
    return match;
  });
}

/**
 * Propsインターフェースを生成
 */
function generatePropsInterface(props: Record<string, any>): string {
  if (Object.keys(props).length === 0) {
    return '';
  }
  
  const lines: string[] = [];
  
  Object.entries(props).forEach(([key, value]) => {
    const type = inferType(value);
    const optional = shouldBeOptional(key, value) ? '?' : '';
    lines.push(`  ${key}${optional}: ${type};`);
  });
  
  return lines.join('\n');
}

/**
 * Props分割代入を生成
 */
function generatePropsDestructure(props: Record<string, any>): string {
  const keys = Object.keys(props);
  
  if (keys.length === 0) {
    return '';
  }
  
  // デフォルト値を設定
  const withDefaults = keys.map(key => {
    const defaultValue = getDefaultValue(props[key]);
    return defaultValue ? `${key} = ${defaultValue}` : key;
  });
  
  return withDefaults.join(', ');
}

/**
 * 型を推論
 */
function inferType(value: any): string {
  if (typeof value === 'string') {
    // URLかどうかチェック
    if (value.startsWith('http') || value.startsWith('/')) {
      return 'string';
    }
    return 'string';
  }
  
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'string[]';
  
  return 'string';
}

/**
 * オプショナルかどうか判定
 */
function shouldBeOptional(key: string, value: any): boolean {
  // Alt属性は通常オプショナル
  if (key.endsWith('Alt')) return true;
  
  // 空文字列や null の場合はオプショナル
  if (value === '' || value === null || value === undefined) return true;
  
  return false;
}

/**
 * デフォルト値を取得
 */
function getDefaultValue(value: any): string | null {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  
  return null;
}

/**
 * kebab-case または snake_case を camelCase に変換
 */
function toCamelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * 複数のコンポーネントを一括変換
 */
export async function convertAllComponents(components: ParsedComponent[]): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  
  for (const component of components) {
    const result = await convertToAstroComponent(component);
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  logger.info('一括変換完了', {
    total: components.length,
    success: successCount,
    failed: components.length - successCount
  });
  
  return results;
}

/**
 * コンポーネント間の依存関係を解決
 */
export function resolveDependencies(results: ConversionResult[]): ConversionResult[] {
  // 依存関係に基づいてインポート文を追加
  return results.map(result => {
    if (!result.success) return result;
    
    let astroComponent = result.astroComponent;
    
    // 他のコンポーネントへの参照をチェック
    results.forEach(otherResult => {
      if (otherResult.filename !== result.filename && otherResult.success) {
        const componentName = otherResult.filename;
        const regex = new RegExp(`<${componentName}[^>]*>`, 'g');
        
        if (regex.test(astroComponent)) {
          // インポート文を追加
          const importStatement = `import ${componentName} from './${componentName}.astro';\n`;
          astroComponent = astroComponent.replace('---\n', `---\n${importStatement}`);
        }
      }
    });
    
    return {
      ...result,
      astroComponent
    };
  });
}
