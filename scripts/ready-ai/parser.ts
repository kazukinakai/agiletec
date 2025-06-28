import * as cheerio from 'cheerio';
import { CONFIG, COMPONENT_PATTERNS } from './config.js';
import { logger } from '../utils/logger.js';
import type { ParsedComponent, ComponentProps } from '../types/ready-ai.d.ts';

/**
 * HTMLコンテンツを解析してコンポーネントに分割
 */
export async function parseHtmlContent(html: string, css: string): Promise<ParsedComponent[]> {
  try {
    return await logger.timeAsync('HTML解析', async () => {
      const $ = cheerio.load(html);
      
      // Ready.ai固有の要素を除去
      removeReadyAiElements($);
      
      // セマンティックコンポーネントを識別
      const components = await identifyComponents($, css);
      
      logger.info('HTML解析完了', {
        componentCount: components.length,
        types: components.map(c => c.type)
      });
      
      return components;
    });
    
  } catch (error) {
    logger.error('HTML解析エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Ready.ai固有の要素を除去
 */
function removeReadyAiElements($: cheerio.CheerioAPI): void {
  CONFIG.conversion.removeSelectors.forEach(selector => {
    $(selector).remove();
  });
  
  // データ属性も除去
  $('*').each((_, element) => {
    const $element = $(element);
    const attributes = element.attribs;
    
    if (attributes) {
      Object.keys(attributes).forEach(attr => {
        if (attr.startsWith('data-ready') || attr.startsWith('data-component-id')) {
          $element.removeAttr(attr);
        }
      });
    }
  });
}

/**
 * セマンティックコンポーネントを識別
 */
async function identifyComponents($: cheerio.CheerioAPI, css: string): Promise<ParsedComponent[]> {
  const components: ParsedComponent[] = [];
  
  // 各コンポーネントタイプを順番に識別
  for (const [type, selectors] of Object.entries(COMPONENT_PATTERNS)) {
    for (const selector of selectors) {
      const $elements = $(selector);
      
      if ($elements.length > 0) {
        $elements.each((index, element) => {
          const $element = $(element);
          const component = createComponentFromElement($, $element, type as keyof typeof COMPONENT_PATTERNS, css);
          
          if (component) {
            components.push(component);
          }
        });
        
        // 一つのタイプで見つかったら他のセレクターはスキップ
        break;
      }
    }
  }
  
  // その他のセクションを識別
  const otherSections = identifyOtherSections($, components);
  components.push(...otherSections);
  
  return components;
}

/**
 * 要素からコンポーネントを作成
 */
function createComponentFromElement(
  $: cheerio.CheerioAPI,
  $element: cheerio.Cheerio<cheerio.Element>,
  type: keyof typeof COMPONENT_PATTERNS,
  css: string
): ParsedComponent | null {
  try {
    // HTMLコンテンツを取得
    const html = $.html($element);
    if (!html || html.trim().length === 0) {
      return null;
    }
    
    // コンポーネント名を生成
    const name = generateComponentName(type, $element);
    
    // 関連するスタイルを抽出
    const styles = extractRelatedStyles($element, css);
    
    // Propsを抽出
    const props = extractComponentProps($element);
    
    // 信頼度を計算
    const confidence = calculateConfidence($element, type);
    
    return {
      name,
      type,
      html,
      styles,
      props,
      confidence
    };
    
  } catch (error) {
    logger.warn('コンポーネント作成エラー', {
      type,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * コンポーネント名を生成
 */
function generateComponentName(type: string, $element: cheerio.Cheerio<cheerio.Element>): string {
  const baseNames = {
    header: 'Header',
    hero: 'Hero',
    features: 'Features',
    testimonials: 'Testimonials',
    cta: 'CallToAction',
    footer: 'Footer'
  };
  
  const baseName = baseNames[type as keyof typeof baseNames] || 'Section';
  
  // 複数ある場合は番号を追加
  const id = $element.attr('id');
  const className = $element.attr('class');
  
  if (id) {
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanId.length > 0) {
      return `${baseName}${cleanId.charAt(0).toUpperCase()}${cleanId.slice(1)}`;
    }
  }
  
  if (className) {
    const primaryClass = className.split(' ')[0];
    const cleanClass = primaryClass.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanClass.length > 0) {
      return `${baseName}${cleanClass.charAt(0).toUpperCase()}${cleanClass.slice(1)}`;
    }
  }
  
  return baseName;
}

/**
 * 関連するCSSスタイルを抽出
 */
function extractRelatedStyles($element: cheerio.Cheerio<cheerio.Element>, css: string): string[] {
  const styles: string[] = [];
  
  // 要素のクラス名を取得
  const classNames = $element.attr('class')?.split(' ') || [];
  const id = $element.attr('id');
  
  // CSS内から関連するルールを抽出
  const cssLines = css.split('\n');
  let currentRule = '';
  let inRule = false;
  
  for (const line of cssLines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('{')) {
      inRule = true;
      currentRule = trimmedLine;
    } else if (trimmedLine.includes('}')) {
      inRule = false;
      currentRule += ' ' + trimmedLine;
      
      // 関連するルールかチェック
      const isRelated = classNames.some(className => 
        currentRule.includes(`.${className}`)
      ) || (id && currentRule.includes(`#${id}`));
      
      if (isRelated) {
        styles.push(currentRule.trim());
      }
      
      currentRule = '';
    } else if (inRule) {
      currentRule += ' ' + trimmedLine;
    }
  }
  
  return styles;
}

/**
 * コンポーネントのPropsを抽出（修正版）
 */
function extractComponentProps($element: cheerio.Cheerio<cheerio.Element>): ComponentProps {
  const props: ComponentProps = {};
  
  try {
    // テキストコンテンツを抽出
    const textElements = $element.find('h1, h2, h3, h4, h5, h6, p, span, a');
    if (textElements.length > 0) {
      props.text = {};
      textElements.each((index, el) => {
        try {
          const $el = cheerio.load(el);
          const text = $el.text().trim();
          const tagName = el.tagName?.toLowerCase() || 'text';
          
          if (text.length > 0) {
            const key = `${tagName}${index > 0 ? index : ''}`;
            props.text![key] = text;
          }
        } catch (textError) {
          // 個別要素のエラーは無視して続行
        }
      });
    }
    
    // 画像を抽出
    const images = $element.find('img');
    if (images.length > 0) {
      props.images = {};
      images.each((index, img) => {
        try {
          const $img = cheerio.load(img);
          const src = $img('img').attr('src');
          const alt = $img('img').attr('alt') || '';
          
          if (src) {
            const key = `image${index > 0 ? index : ''}`;
            props.images![key] = src;
            if (alt) {
              props.images![`${key}Alt`] = alt;
            }
          }
        } catch (imgError) {
          // 個別要素のエラーは無視して続行
        }
      });
    }
    
    // リンクを抽出
    const links = $element.find('a[href]');
    if (links.length > 0) {
      props.links = {};
      links.each((index, link) => {
        try {
          const $link = cheerio.load(link);
          const href = $link('a').attr('href');
          const text = $link('a').text().trim();
          
          if (href) {
            const key = `link${index > 0 ? index : ''}`;
            props.links![key] = href;
            if (text) {
              props.links![`${key}Text`] = text;
            }
          }
        } catch (linkError) {
          // 個別要素のエラーは無視して続行
        }
      });
    }
  } catch (error) {
    logger.warn('Props抽出エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  return props;
}

/**
 * 信頼度を計算
 */
function calculateConfidence($element: cheerio.Cheerio<cheerio.Element>, type: string): number {
  let confidence = 0.5; // ベース信頼度
  
  const tagName = $element.get(0)?.tagName?.toLowerCase();
  const className = $element.attr('class') || '';
  const id = $element.attr('id') || '';
  
  // セマンティックHTMLタグによる加点
  const semanticTags = {
    header: ['header', 'nav'],
    hero: ['section', 'main'],
    features: ['section', 'div'],
    testimonials: ['section', 'div'],
    cta: ['section', 'div'],
    footer: ['footer']
  };
  
  if (semanticTags[type as keyof typeof semanticTags]?.includes(tagName || '')) {
    confidence += 0.3;
  }
  
  // クラス名による加点
  const typeKeywords = {
    header: ['header', 'nav', 'navigation', 'top'],
    hero: ['hero', 'banner', 'landing', 'main'],
    features: ['features', 'services', 'benefits'],
    testimonials: ['testimonials', 'reviews', 'feedback'],
    cta: ['cta', 'call-to-action', 'action', 'button'],
    footer: ['footer', 'bottom']
  };
  
  const keywords = typeKeywords[type as keyof typeof typeKeywords] || [];
  const classText = (className + ' ' + id).toLowerCase();
  
  keywords.forEach(keyword => {
    if (classText.includes(keyword)) {
      confidence += 0.1;
    }
  });
  
  // コンテンツによる加点
  const hasText = $element.text().trim().length > 10;
  const hasImages = $element.find('img').length > 0;
  const hasLinks = $element.find('a').length > 0;
  
  if (hasText) confidence += 0.1;
  if (hasImages && type === 'hero') confidence += 0.1;
  if (hasLinks && (type === 'header' || type === 'footer')) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

/**
 * その他のセクションを識別
 */
function identifyOtherSections($: cheerio.CheerioAPI, existingComponents: ParsedComponent[]): ParsedComponent[] {
  const sections: ParsedComponent[] = [];
  const existingElements = new Set(existingComponents.map(c => c.html));
  
  // 主要なセクション要素を探す
  $('section, div[class*="section"], .container > div').each((index, element) => {
    const $element = $(element);
    const html = $.html($element);
    
    // 既に処理済みの要素はスキップ
    if (html && !existingElements.has(html)) {
      const textContent = $element.text().trim();
      
      // 十分なコンテンツがある場合のみ
      if (textContent.length > 50) {
        const component = createComponentFromElement($, $element, 'section' as any, '');
        if (component) {
          component.type = 'section' as any;
          sections.push(component);
        }
      }
    }
  });
  
  return sections;
}

/**
 * コンポーネントの依存関係を解析
 */
export function analyzeComponentDependencies(components: ParsedComponent[]): {
  component: string;
  dependencies: string[];
}[] {
  return components.map(component => {
    const dependencies: string[] = [];
    
    // 他のコンポーネントからの参照をチェック
    components.forEach(other => {
      if (other.name !== component.name) {
        if (other.html.includes(component.name) || 
            other.styles.some(style => style.includes(component.name))) {
          dependencies.push(other.name);
        }
      }
    });
    
    return {
      component: component.name,
      dependencies
    };
  });
}
