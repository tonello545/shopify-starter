const fs = require('fs-extra');
const path = require('path');
const sass = require('sass');
const { glob } = require('glob');
const chokidar = require('chokidar');

class ShopifyThemeBuilder {
  constructor() {
    this.srcDir = path.join(__dirname, 'src');
    this.sectionsDir = path.join(__dirname, 'sections');
    this.snippetsDir = path.join(__dirname, 'snippets');
    this.destSectionsDir = path.join(this.srcDir, 'sections');
    this.destSnippetsDir = path.join(this.srcDir, 'snippets');
    this.destAssetsDir = path.join(this.srcDir, 'assets');
  }

  // Crea le directory di destinazione se non esistono
  async ensureDirectories() {
    await fs.ensureDir(this.destSectionsDir);
    await fs.ensureDir(this.destSnippetsDir);
    await fs.ensureDir(this.destAssetsDir);
  }

  // Processa un singolo componente snippet
  async processSnippet(snippetPath) {
    const snippetName = path.basename(snippetPath);
    console.log(`🧩 Processing snippet: ${snippetName}`);

    const liquidFile = path.join(snippetPath, `${snippetName}.liquid`);
    const scssFile = path.join(snippetPath, `${snippetName}.scss`);
    const jsFile = path.join(snippetPath, `${snippetName}.js`);

    // Processa file Liquid per snippet
    if (await fs.pathExists(liquidFile)) {
      await this.processSnippetLiquidFile(liquidFile, snippetName);
    }

    // Processa file SCSS per snippet
    if (await fs.pathExists(scssFile)) {
      await this.processScssFile(scssFile, snippetName);
    }

    // Processa file JavaScript per snippet
    if (await fs.pathExists(jsFile)) {
      await this.processSnippetJsFile(jsFile, snippetName);
    }
  }

  // Processa file Liquid per snippet (diverso da sections)
  async processSnippetLiquidFile(liquidFile, snippetName) {
    const destPath = path.join(this.destSnippetsDir, `${snippetName}.liquid`);
    
    let content = await fs.readFile(liquidFile, 'utf8');
    
    // Gli snippets possono essere chiamati più volte, quindi usiamo un ID univoco passato come parametro
    // o generato automaticamente
    const uniqueIdLogic = `{%- liquid
  assign snippet_id = id | default: snippetName | append: '-' | append: forloop.index | default: snippetName | append: '-' | append: 'default'
  if unique_id
    assign snippet_id = unique_id
  endif
-%}`;
    
    // Aggiungi logica per CSS e JS condizionale (caricati solo se necessario)
    const cssLink = `{%- unless snippet_styles_loaded contains '${snippetName}' -%}
  {%- assign snippet_styles_loaded = snippet_styles_loaded | append: '${snippetName},' -%}
  {{ '${snippetName}.css' | asset_url | stylesheet_tag }}
{%- endunless -%}`;

    const jsScript = `{%- unless snippet_scripts_loaded contains '${snippetName}' -%}
  {%- assign snippet_scripts_loaded = snippet_scripts_loaded | append: '${snippetName},' -%}
  {{ '${snippetName}.js' | asset_url | script_tag }}
{%- endunless -%}
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof ${this.toCamelCase(snippetName)}Snippet === 'function') {
      new ${this.toCamelCase(snippetName)}Snippet('{{ snippet_id }}');
    }
  });
</script>`;
    
    // Aggiungi la logica ID univoco se non presente
    if (!content.includes('snippet_id')) {
      const idComment = `{%- comment -%} Auto-generated unique snippet ID logic {%- endcomment -%}\n`;
      content = idComment + uniqueIdLogic + '\n\n' + content;
    }
    
    // Aggiungi CSS condizionale
    if (!content.includes(`${snippetName}.css`)) {
      const cssComment = `{%- comment -%} Auto-generated CSS reference (loaded once) {%- endcomment -%}\n`;
      content = content.replace(uniqueIdLogic, uniqueIdLogic + '\n' + cssComment + cssLink);
    }
    
    // Aggiungi JS alla fine
    if (!content.includes(`${snippetName}.js`)) {
      const jsComment = `\n{%- comment -%} Auto-generated JS reference with snippet ID {%- endcomment -%}\n`;
      content = content + jsComment + jsScript;
    }
    
    // Sostituisci ID hardcoded con variabile dinamica
    content = this.replaceSnippetHardcodedIds(content, snippetName);
    
    await fs.writeFile(destPath, content);
    console.log(`✅ Snippet Liquid processed: ${snippetName}.liquid`);
  }

  // Sostituisce ID hardcoded negli snippets
  replaceSnippetHardcodedIds(content, snippetName) {
    // Pattern per trovare id="snippet-name" e sostituirli con id="{{ snippet_id }}"
    const idPattern = new RegExp(`id="${snippetName}([^"]*)"`, 'g');
    content = content.replace(idPattern, `id="{{ snippet_id }}$1"`);
    
    // Pattern per trovare class che iniziano con il nome dello snippet
    const classPattern = new RegExp(`class="([^"]*\\b${snippetName}\\b[^"]*)"`, 'g');
    content = content.replace(classPattern, (match, classes) => {
      const updatedClasses = classes.replace(new RegExp(`\\b${snippetName}\\b`, 'g'), `${snippetName}-{{ snippet_id }}`);
      return `class="${updatedClasses}"`;
    });
    
    return content;
  }

  // Processa JavaScript per snippet
  async processSnippetJsFile(jsFile, snippetName) {
    let content = await fs.readFile(jsFile, 'utf8');
    
    // Wrappa il JavaScript in una classe per snippet
    const wrappedContent = this.wrapSnippetJavaScript(content, snippetName);
    
    const destPath = path.join(this.destAssetsDir, `${snippetName}.js`);
    await fs.writeFile(destPath, wrappedContent);
    console.log(`✅ Snippet JavaScript processed: ${snippetName}.js`);
  }

  // Wrappa JavaScript per snippet
  wrapSnippetJavaScript(content, snippetName) {
    const className = this.toCamelCase(snippetName) + 'Snippet';
    
    if (content.includes(`class ${className}`) || content.includes(`function ${className}`)) {
      return content;
    }
    
    return `
/**
 * Auto-generated wrapper for ${snippetName} snippet
 * Each instance of the snippet will have its own class instance
 */
class ${className} {
  constructor(snippetId) {
    this.snippetId = snippetId;
    this.snippet = document.getElementById(snippetId);
    
    if (!this.snippet) {
      console.warn('Snippet not found:', snippetId);
      return;
    }
    
    this.init();
  }
  
  init() {
    // Original snippet code wrapped in init method
    ${this.indentCode(content, 4)}
  }
  
  // Helper method to find elements within this snippet instance
  querySelector(selector) {
    return this.snippet.querySelector(selector);
  }
  
  querySelectorAll(selector) {
    return this.snippet.querySelectorAll(selector);
  }
  
  // Helper method to add event listeners scoped to this snippet
  addEventListener(element, event, handler) {
    if (typeof element === 'string') {
      element = this.querySelector(element);
    }
    if (element) {
      element.addEventListener(event, handler);
    }
  }
  
  // Helper method to emit custom events from this snippet
  emit(eventName, data = {}) {
    const event = new CustomEvent(\`snippet:\${eventName}\`, {
      detail: { ...data, snippetId: this.snippetId }
    });
    this.snippet.dispatchEvent(event);
  }
  
  // Helper method to listen to custom events
  on(eventName, handler) {
    this.snippet.addEventListener(\`snippet:\${eventName}\`, handler);
  }
}

// Make the class available globally
window.${className} = ${className};

// Auto-initialize snippets that are already in the DOM
document.addEventListener('DOMContentLoaded', function() {
  // Find all instances of this snippet type
  const snippets = document.querySelectorAll('[id*="${snippetName}-"]');
  snippets.forEach(snippet => {
    if (!snippet.dataset.initialized) {
      new ${className}(snippet.id);
      snippet.dataset.initialized = 'true';
    }
  });
});
`;
  }
  async processSection(sectionPath) {
    const sectionName = path.basename(sectionPath);
    console.log(`🔨 Processing section: ${sectionName}`);

    const liquidFile = path.join(sectionPath, `${sectionName}.liquid`);
    const scssFile = path.join(sectionPath, `${sectionName}.scss`);
    const jsFile = path.join(sectionPath, `${sectionName}.js`);

    // Processa file Liquid
    if (await fs.pathExists(liquidFile)) {
      await this.processLiquidFile(liquidFile, sectionName);
    }

    // Processa file SCSS
    if (await fs.pathExists(scssFile)) {
      await this.processScssFile(scssFile, sectionName);
    }

    // Processa file JavaScript
    if (await fs.pathExists(jsFile)) {
      await this.processJsFile(jsFile, sectionName);
    }
  }

  // Processa file Liquid
  async processLiquidFile(liquidFile, sectionName) {
    const destPath = path.join(this.destSectionsDir, `${sectionName}.liquid`);
    
    let content = await fs.readFile(liquidFile, 'utf8');
    
    // Crea un ID univoco per ogni istanza della sezione
    const uniqueIdVariable = `{%- assign section_id = section.id | append: '-' | append: section.settings.section_instance | default: section.id -%}`;
    
    // Aggiungi automaticamente i riferimenti CSS e JS se non presenti
    const cssLink = `{{ '${sectionName}.css' | asset_url | stylesheet_tag }}`;
    const jsScript = `<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof ${this.toCamelCase(sectionName)}Section === 'function') {
      new ${this.toCamelCase(sectionName)}Section('{{ section.id }}');
    }
  });
</script>
{{ '${sectionName}.js' | asset_url | script_tag }}`;
    
    // Controlla se i riferimenti esistono già
    if (!content.includes(`section_id`)) {
      // Aggiungi la variabile dell'ID univoco all'inizio
      const idComment = `{%- comment -%} Auto-generated unique section ID {%- endcomment -%}\n`;
      content = idComment + uniqueIdVariable + '\n\n' + content;
    }
    
    if (!content.includes(`${sectionName}.css`)) {
      // Aggiungi CSS dopo l'ID
      const cssComment = `{%- comment -%} Auto-generated CSS reference {%- endcomment -%}\n`;
      content = content.replace(uniqueIdVariable, uniqueIdVariable + '\n' + cssComment + cssLink);
    }
    
    if (!content.includes(`${sectionName}.js`)) {
      // Aggiungi JS alla fine del file
      const jsComment = `\n{%- comment -%} Auto-generated JS reference with section ID {%- endcomment -%}\n`;
      content = content + jsComment + jsScript;
    }
    
    // Sostituisci tutti gli ID hardcoded con la variabile section_id
    content = this.replaceHardcodedIds(content, sectionName);
    
    await fs.writeFile(destPath, content);
    console.log(`✅ Liquid processed: ${sectionName}.liquid`);
  }

  // Sostituisce ID hardcoded con variabili dinamiche
  replaceHardcodedIds(content, sectionName) {
    // Pattern per trovare id="section-name" e sostituirli con id="{{ section_id }}"
    const idPattern = new RegExp(`id="${sectionName}([^"]*)"`, 'g');
    content = content.replace(idPattern, `id="{{ section_id }}$1"`);
    
    // Pattern per trovare class che iniziano con il nome della sezione
    const classPattern = new RegExp(`class="([^"]*\\b${sectionName}\\b[^"]*)"`, 'g');
    content = content.replace(classPattern, (match, classes) => {
      // Aggiungi il prefisso section_id alle classi che iniziano con il nome della sezione
      const updatedClasses = classes.replace(new RegExp(`\\b${sectionName}\\b`, 'g'), `${sectionName}-{{ section.id }}`);
      return `class="${updatedClasses}"`;
    });
    
    return content;
  }

  // Converte kebab-case in camelCase per i nomi delle classi JS
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
              .replace(/^[a-z]/, match => match.toUpperCase());
  }

  // Processa file SCSS
  async processScssFile(scssFile, sectionName) {
    try {
      let content = await fs.readFile(scssFile, 'utf8');
      
      // Aggiungi automaticamente il prefixing per rendere gli stili specifici per ogni istanza
      const prefixedContent = this.addScssPrefixing(content, sectionName);
      
      const result = sass.compileString(prefixedContent, {
        style: 'compressed',
        sourceMap: false
      });
      
      const destPath = path.join(this.destAssetsDir, `${sectionName}.css`);
      await fs.writeFile(destPath, result.css);
      console.log(`✅ SCSS compiled: ${sectionName}.scss → ${sectionName}.css`);
    } catch (error) {
      console.error(`❌ SCSS compilation error for ${sectionName}:`, error.message);
    }
  }

  // Aggiunge prefixing automatico agli stili SCSS
  addScssPrefixing(content, sectionName) {
    // Verifica se c'è già un wrapper principale
    const hasWrapper = content.includes(`.${sectionName}-section`) || content.includes(`#${sectionName}`);
    
    if (!hasWrapper) {
      // Wrappa tutto il contenuto in un selettore specifico per la sezione
      return `
// Auto-generated wrapper for section scoping
[id^="${sectionName}-"] {
  ${content}
}

// Alternative class-based scoping
.${sectionName}-section {
  ${content}
}
`;
    }
    
    return content;
  }

  // Processa file JavaScript
  async processJsFile(jsFile, sectionName) {
    let content = await fs.readFile(jsFile, 'utf8');
    
    // Wrappa il JavaScript in una classe per evitare conflitti globali
    const wrappedContent = this.wrapJavaScript(content, sectionName);
    
    const destPath = path.join(this.destAssetsDir, `${sectionName}.js`);
    await fs.writeFile(destPath, wrappedContent);
    console.log(`✅ JavaScript processed: ${sectionName}.js`);
  }

  // Wrappa il JavaScript in una classe per evitare conflitti
  wrapJavaScript(content, sectionName) {
    const className = this.toCamelCase(sectionName) + 'Section';
    
    // Verifica se il contenuto è già wrappato in una classe
    if (content.includes(`class ${className}`) || content.includes(`function ${className}`)) {
      return content;
    }
    
    return `
/**
 * Auto-generated wrapper for ${sectionName} section
 * Each instance of the section will have its own class instance
 */
class ${className} {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.section = document.getElementById(sectionId);
    
    if (!this.section) {
      console.warn('Section not found:', sectionId);
      return;
    }
    
    this.init();
  }
  
  init() {
    // Original section code wrapped in init method
    ${this.indentCode(content, 4)}
  }
  
  // Helper method to find elements within this section instance
  querySelector(selector) {
    return this.section.querySelector(selector);
  }
  
  querySelectorAll(selector) {
    return this.section.querySelectorAll(selector);
  }
  
  // Helper method to add event listeners scoped to this section
  addEventListener(element, event, handler) {
    if (typeof element === 'string') {
      element = this.querySelector(element);
    }
    if (element) {
      element.addEventListener(event, handler);
    }
  }
}

// Make the class available globally
window.${className} = ${className};
`;
  }

  // Indenta il codice di un numero specifico di spazi
  indentCode(code, spaces) {
    const indent = ' '.repeat(spaces);
    return code.split('\n').map(line => {
      if (line.trim() === '') return line;
      return indent + line;
    }).join('\n');
  }

  // Build completo di tutte le sections e snippets
  async buildAll() {
    console.log('🚀 Starting Shopify theme build...\n');
    
    await this.ensureDirectories();
    
    // Build sections
    const sectionDirs = await glob('*/', { cwd: this.sectionsDir });
    console.log('📄 Building sections...');
    for (const dir of sectionDirs) {
      const fullPath = path.join(this.sectionsDir, dir);
      await this.processSection(fullPath);
    }
    
    // Build snippets
    if (await fs.pathExists(this.snippetsDir)) {
      const snippetDirs = await glob('*/', { cwd: this.snippetsDir });
      console.log('\n🧩 Building snippets...');
      for (const dir of snippetDirs) {
        const fullPath = path.join(this.snippetsDir, dir);
        await this.processSnippet(fullPath);
      }
    }
    
    console.log('\n✨ Build completed successfully!');
  }

  // Avvia watch mode per sviluppo
  async watch() {
    console.log('👁️  Starting watch mode...\n');
    
    await this.buildAll();
    
    // Watch sections
    const sectionsWatcher = chokidar.watch(this.sectionsDir, {
      ignored: /node_modules/,
      persistent: true
    });
    
    sectionsWatcher.on('change', async (filePath) => {
      const sectionDir = path.dirname(filePath);
      const sectionName = path.basename(sectionDir);
      
      console.log(`\n📝 Section file changed: ${path.basename(filePath)}`);
      await this.processSection(sectionDir);
    });
    
    sectionsWatcher.on('add', async (filePath) => {
      const sectionDir = path.dirname(filePath);
      console.log(`\n➕ Section file added: ${path.basename(filePath)}`);
      await this.processSection(sectionDir);
    });
    
    // Watch snippets if directory exists
    if (await fs.pathExists(this.snippetsDir)) {
      const snippetsWatcher = chokidar.watch(this.snippetsDir, {
        ignored: /node_modules/,
        persistent: true
      });
      
      snippetsWatcher.on('change', async (filePath) => {
        const snippetDir = path.dirname(filePath);
        const snippetName = path.basename(snippetDir);
        
        console.log(`\n📝 Snippet file changed: ${path.basename(filePath)}`);
        await this.processSnippet(snippetDir);
      });
      
      snippetsWatcher.on('add', async (filePath) => {
        const snippetDir = path.dirname(filePath);
        console.log(`\n➕ Snippet file added: ${path.basename(filePath)}`);
        await this.processSnippet(snippetDir);
      });
    }
    
    console.log('🔍 Watching sections and snippets for changes... Press Ctrl+C to stop.');
  }

  // Pulisce i file generati
  async clean() {
    const patterns = [
      path.join(this.destSectionsDir, '*.liquid'),
      path.join(this.destSnippetsDir, '*.liquid'),
      path.join(this.destAssetsDir, '*.css'),
      path.join(this.destAssetsDir, '*.js')
    ];
    
    for (const pattern of patterns) {
      const files = await glob(pattern);
      for (const file of files) {
        await fs.remove(file);
      }
    }
    
    console.log('🧹 Cleaned generated files');
  }
}

// CLI Interface
const builder = new ShopifyThemeBuilder();

const command = process.argv[2];

switch (command) {
  case 'build':
    builder.buildAll();
    break;
  case 'watch':
    builder.watch();
    break;
  case 'clean':
    builder.clean();
    break;
  default:
    console.log(`
🛠️  Shopify Theme Builder

Usage:
  node build.js build   - Build all sections and snippets once
  node build.js watch   - Build and watch for changes
  node build.js clean   - Clean generated files

Structure:
  sections/
    ├── text/
    │   ├── text.liquid
    │   ├── text.scss
    │   └── text.js
    └── hero/
        ├── hero.liquid
        ├── hero.scss
        └── hero.js
  
  snippets/
    ├── product-card/
    │   ├── product-card.liquid
    │   ├── product-card.scss
    │   └── product-card.js
    └── button/
        ├── button.liquid
        ├── button.scss
        └── button.js

Output:
  src/
    ├── sections/
    │   ├── text.liquid (with CSS/JS references)
    │   └── hero.liquid (with CSS/JS references)
    ├── snippets/
    │   ├── product-card.liquid (with CSS/JS references)
    │   └── button.liquid (with CSS/JS references)
    └── assets/
        ├── text.css, text.js
        ├── hero.css, hero.js
        ├── product-card.css, product-card.js
        └── button.css, button.js

Snippet Usage:
  {% render 'product-card', product: product, unique_id: 'card-1' %}
  {% render 'button', text: 'Click me', id: 'btn-primary' %}
    `);
}