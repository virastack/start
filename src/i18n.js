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
    "projectName.errorNonInteractive":
      "Project name is required in non-interactive mode. Pass a name, use --name, or \".\".",
    "projectName.confirmNonEmptyDir":
      'Directory "{dir}" is not empty. Continue anyway?',

    "template.message": "Which template would you like to use?",
    "template.nextjs.label": "Next.js App Router",
    "template.nextjs.hint": "Recommended",
    "template.tanstack.label": "TanStack Start",
    "template.tanstack.hint": "Coming soon",
    "template.tanstack.notReady":
      "The TanStack Start template isn't ready yet. Using Next.js instead.",
    "template.errorInvalid":
      'Unknown template "{template}". Available templates: nextjs, tanstack.',

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
      "Failed to install dependencies.",
    "scaffold.skipInstall":
      "Skipping dependency install (--skip-install).",
    "scaffold.offline":
      "You appear to be offline. Skipping dependency install and AI setup — run them manually when you're back online.",
    "scaffold.aiInit": "Configuring ViraStack AI rules...",
    "scaffold.aiInitDone": "🤖 ViraStack AI agent rules successfully integrated.",
    "scaffold.aiInitFailed":
      "Failed to configure ViraStack AI rules.",
    "scaffold.aiInitSkipped":
      "Skipping AI setup because dependency install failed.",

    "done.title": "You're all set!",
    "done.partialTitle": "Project files are ready — finish setup manually:",
    "done.installFailedNote":
      "Dependency install failed. The project was created, but you need to install packages before running it.",
    "done.cd": "  cd {dir}",
    "done.manualInstall": "  {cmd}",
    "done.manualAi": "  {cmd}",
    "done.dev": "  {cmd}",

    "add.toolMissing": "Please specify a tool to add. Available tools: {list}.",
    "add.toolInvalid": 'Unknown tool "{tool}". Available tools: {list}.',
    "add.notAProject": "No package.json found in the current directory.",
    "add.installing": "Adding {pkg}...",
    "add.done": "{pkg} added.",
    "add.installFailed": "Failed to add {pkg}.",

    help: `Usage:
  npx virastack [init] [name]   Scaffold a new project
  npx virastack add <tool>      Add a ViraStack tool to an existing project

Tools:
  mask, password, ai

Options:
  --name <name>         Project name (or pass as positional arg / ".")
  --template <name>     Template: nextjs | tanstack
  --tools <list>        Comma-separated tools (e.g. mask,password)
  --i18n / --no-i18n    Enable or disable the i18n template
  --yes, -y             Non-interactive mode (use flags/defaults)
  --skip-install        Scaffold files only; skip install + AI setup
  --tr                  Ask questions in Turkish
  --telemetry-disable   Disable anonymous usage tracking
  -v, --version         Print the version
  -h, --help            Show this help message

Examples:
  npx virastack
  npx virastack my-app --yes
  npx virastack init my-app --template nextjs --tools mask --yes`,
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
    "projectName.errorNonInteractive":
      'İnteraktif olmayan modda proje adı zorunlu. Bir ad, --name veya "." verin.',
    "projectName.confirmNonEmptyDir":
      '"{dir}" dizini boş değil. Devam edilsin mi?',

    "template.message": "Hangi şablonla başlamak istiyorsunuz?",
    "template.nextjs.label": "Next.js App Router",
    "template.nextjs.hint": "Önerilen",
    "template.tanstack.label": "TanStack Start",
    "template.tanstack.hint": "Yakında",
    "template.tanstack.notReady":
      "TanStack Start şablonu henüz hazır değil. Next.js kullanılacak.",
    "template.errorInvalid":
      'Bilinmeyen şablon "{template}". Kullanılabilir şablonlar: nextjs, tanstack.',

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
      "Bağımlılıklar kurulamadı.",
    "scaffold.skipInstall":
      "Bağımlılık kurulumu atlanıyor (--skip-install).",
    "scaffold.offline":
      "İnternet bağlantısı yok gibi görünüyor. Bağımlılık kurulumu ve AI yapılandırması atlandı — çevrimiçi olduğunuzda manuel çalıştırın.",
    "scaffold.aiInit": "ViraStack AI kuralları yapılandırılıyor...",
    "scaffold.aiInitDone": "🤖 ViraStack AI ajan kuralları projeye başarıyla entegre edildi.",
    "scaffold.aiInitFailed":
      "ViraStack AI kuralları yapılandırılamadı.",
    "scaffold.aiInitSkipped":
      "Bağımlılık kurulumu başarısız olduğu için AI yapılandırması atlandı.",

    "done.title": "Her şey hazır!",
    "done.partialTitle": "Proje dosyaları hazır — kurulumu manuel tamamlayın:",
    "done.installFailedNote":
      "Bağımlılık kurulumu başarısız. Proje oluşturuldu, ancak çalıştırmadan önce paketleri kurmanız gerekiyor.",
    "done.cd": "  cd {dir}",
    "done.manualInstall": "  {cmd}",
    "done.manualAi": "  {cmd}",
    "done.dev": "  {cmd}",

    "add.toolMissing":
      "Lütfen eklemek istediğiniz aracı belirtin. Kullanılabilir araçlar: {list}.",
    "add.toolInvalid": '"{tool}" bilinmeyen bir araç. Kullanılabilir araçlar: {list}.',
    "add.notAProject": "Bu dizinde package.json bulunamadı.",
    "add.installing": "{pkg} ekleniyor...",
    "add.done": "{pkg} eklendi.",
    "add.installFailed": "{pkg} eklenemedi.",

    help: `Kullanım:
  npx virastack [init] [ad]     Yeni bir proje oluştur
  npx virastack add <araç>      Mevcut projeye bir ViraStack aracı ekle

Araçlar:
  mask, password, ai

Seçenekler:
  --name <ad>           Proje adı (veya positional arg / ".")
  --template <ad>       Şablon: nextjs | tanstack
  --tools <liste>       Virgülle ayrılmış araçlar (örn. mask,password)
  --i18n / --no-i18n    i18n şablonunu aç / kapat
  --yes, -y             İnteraktif olmayan mod (flag/varsayılanlar)
  --skip-install        Sadece dosyaları oluştur; kurulum + AI atla
  --tr                  Soruları Türkçe sor
  --telemetry-disable   Anonim kullanım verisi toplamayı kapat
  -v, --version         Sürümü göster
  -h, --help            Bu yardım mesajını göster

Örnekler:
  npx virastack
  npx virastack my-app --yes
  npx virastack init my-app --template nextjs --tools mask --yes`,
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
