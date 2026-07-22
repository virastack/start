/**
 * Minimal i18n dictionary for the ViraStack Start.
 * Default locale is English; pass --tr to switch to Turkish.
 */

const dictionaries = {
  en: {
    cancel: "Operation cancelled.",
    "telemetry.notice":
      "ViraStack collects anonymous usage data (template, i18n choice, selected tools) to improve the CLI. No personal data is ever collected. Disable anytime with --telemetry-disable.",

    "projectName.message": "What is your project named?",
    "projectName.placeholder": "virastack-app",
    "projectName.errorEmpty":
      'Please enter a project name, or "." to use the current directory.',
    "projectName.errorInvalid":
      "Please enter a valid npm package name (lowercase letters, numbers, dashes).",
    "projectName.confirmNonEmptyDir":
      'Directory "{dir}" is not empty. Continue anyway?',

    "template.message": "Which template would you like to use?",
    "template.nextjs.label": "Next.js App Router",
    "template.nextjs.hint": "Recommended",
    "template.tanstack.label": "TanStack Start",
    "template.tanstack.hint": "Coming soon",
    "template.tanstack.notReady":
      "The TanStack Start template isn't ready yet. Using Next.js instead.",

    "i18n.message": "Would you like multi-language (i18n) support?",
    "i18n.active": "Yes",
    "i18n.inactive": "No",
    "i18n.notReady":
      "The multi-language (i18n) template isn't ready for this stack yet. Using the standard template instead.",

    "tools.message": "Which ViraStack tools would you like to include?",
    "tools.mask.label": "@virastack/mask",
    "tools.mask.hint": "Headless input formatter",
    "tools.password.label": "@virastack/password",
    "tools.password.hint": "Password visibility toggle",
    "tools.ai.label": "@virastack/ai",
    "tools.ai.hint": "AI rules for Cursor & Claude",

    "scaffold.copying": "Creating project files...",
    "scaffold.copyDone": "Project files created.",
    "scaffold.gitInit": "Initializing git repository...",
    "scaffold.gitInitDone": "Git repository initialized.",
    "scaffold.gitInitSkipped": "Skipped git initialization.",
    "scaffold.installing": "Installing dependencies with {pm}...",
    "scaffold.installDone": "Dependencies installed.",
    "scaffold.installFailed":
      "Failed to install dependencies. Run install manually.",
    "scaffold.aiInit": "Applying @virastack/ai rules...",
    "scaffold.aiInitDone": "@virastack/ai rules applied.",
    "scaffold.aiInitFailed":
      'Could not apply @virastack/ai rules automatically. Run "npx @virastack/ai init" manually.',

    "done.title": "You're all set!",
    "done.cd": "  cd {dir}",
    "done.dev": "  {cmd}",

    "add.toolMissing": "Please specify a tool to add. Available tools: {list}.",
    "add.toolInvalid": 'Unknown tool "{tool}". Available tools: {list}.',
    "add.notAProject": "No package.json found in the current directory.",
    "add.installing": "Adding {pkg}...",
    "add.done": "{pkg} added.",
    "add.installFailed": "Failed to add {pkg}.",

    help: `Usage:
  npx virastack [init]        Scaffold a new project (interactive)
  npx virastack add <tool>    Add a ViraStack tool to an existing project

Tools:
  mask, password, ai

Options:
  --tr                  Ask questions in Turkish
  --telemetry-disable   Disable anonymous usage tracking
  -v, --version         Print the version
  -h, --help            Show this help message`,
  },

  tr: {
    cancel: "İşlem iptal edildi.",
    "telemetry.notice":
      "ViraStack, CLI'ı geliştirmek için anonim kullanım verisi toplar (şablon, i18n tercihi, seçilen araçlar). Hiçbir kişisel veri toplanmaz. --telemetry-disable ile her zaman kapatabilirsiniz.",

    "projectName.message": "Projenizin adı ne olsun?",
    "projectName.placeholder": "virastack-app",
    "projectName.errorEmpty":
      'Lütfen bir proje adı girin, ya da mevcut dizini kullanmak için "." yazın.',
    "projectName.errorInvalid":
      "Lütfen geçerli bir npm paket adı girin (küçük harf, rakam, tire).",
    "projectName.confirmNonEmptyDir":
      '"{dir}" dizini boş değil. Devam edilsin mi?',

    "template.message": "Hangi şablonla başlamak istiyorsunuz?",
    "template.nextjs.label": "Next.js App Router",
    "template.nextjs.hint": "Önerilen",
    "template.tanstack.label": "TanStack Start",
    "template.tanstack.hint": "Yakında",
    "template.tanstack.notReady":
      "TanStack Start şablonu henüz hazır değil. Next.js kullanılacak.",

    "i18n.message": "Çoklu dil (i18n) desteği ister misiniz?",
    "i18n.active": "Evet",
    "i18n.inactive": "Hayır",
    "i18n.notReady":
      "Bu şablon için çoklu dil (i18n) sürümü henüz hazır değil. Standart şablon kullanılacak.",

    "tools.message": "Projenize hangi ViraStack araçları eklensin?",
    "tools.mask.label": "@virastack/mask",
    "tools.mask.hint": "Headless input formatlayıcı",
    "tools.password.label": "@virastack/password",
    "tools.password.hint": "Şifre görünürlük anahtarı",
    "tools.ai.label": "@virastack/ai",
    "tools.ai.hint": "Cursor & Claude için AI kuralları",

    "scaffold.copying": "Proje dosyaları oluşturuluyor...",
    "scaffold.copyDone": "Proje dosyaları oluşturuldu.",
    "scaffold.gitInit": "Git deposu başlatılıyor...",
    "scaffold.gitInitDone": "Git deposu başlatıldı.",
    "scaffold.gitInitSkipped": "Git başlatma adımı atlandı.",
    "scaffold.installing": "Bağımlılıklar {pm} ile kuruluyor...",
    "scaffold.installDone": "Bağımlılıklar kuruldu.",
    "scaffold.installFailed":
      "Bağımlılıklar kurulamadı. Kurulumu manuel olarak çalıştırın.",
    "scaffold.aiInit": "@virastack/ai kuralları uygulanıyor...",
    "scaffold.aiInitDone": "@virastack/ai kuralları uygulandı.",
    "scaffold.aiInitFailed":
      '@virastack/ai kuralları otomatik uygulanamadı. "npx @virastack/ai init" komutunu manuel çalıştırın.',

    "done.title": "Her şey hazır!",
    "done.cd": "  cd {dir}",
    "done.dev": "  {cmd}",

    "add.toolMissing":
      "Lütfen eklemek istediğiniz aracı belirtin. Kullanılabilir araçlar: {list}.",
    "add.toolInvalid": '"{tool}" bilinmeyen bir araç. Kullanılabilir araçlar: {list}.',
    "add.notAProject": "Bu dizinde package.json bulunamadı.",
    "add.installing": "{pkg} ekleniyor...",
    "add.done": "{pkg} eklendi.",
    "add.installFailed": "{pkg} eklenemedi.",

    help: `Kullanım:
  npx virastack [init]        İnteraktif olarak yeni bir proje oluştur
  npx virastack add <araç>    Mevcut projeye bir ViraStack aracı ekle

Araçlar:
  mask, password, ai

Seçenekler:
  --tr                  Soruları Türkçe sor
  --telemetry-disable   Anonim kullanım verisi toplamayı kapat
  -v, --version         Sürümü göster
  -h, --help            Bu yardım mesajını göster`,
  },
};

let currentLocale = "en";

export function setLocale(locale) {
  currentLocale = dictionaries[locale] ? locale : "en";
}

export function getLocale() {
  return currentLocale;
}

export function t(key, vars = {}) {
  const dictionary = dictionaries[currentLocale] ?? dictionaries.en;
  const template = dictionary[key] ?? dictionaries.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}
