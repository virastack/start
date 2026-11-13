/**
 * Minimal i18n dictionary for the ViraStack Start.
 * Default locale is English; pass --tr to switch to Turkish.
 */

const dictionaries = {
  en: {
    cancel: "Operation cancelled.",

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
    "template.nextjs.hint": "App Router + Server Components",
    "template.tanstack.label": "TanStack Start",
    "template.tanstack.hint": "Type-safe routing + SSR",
    "template.tanstack.notReady":
      "The TanStack Start template isn't available in this install. Using Next.js instead.",
    "template.errorInvalid":
      'Unknown template "{template}". Available templates: nextjs, tanstack.',

    "agents.message": "Which AI coding tools do you use?",
    "agents.claude.label": "Claude Code",
    "agents.cursor.label": "Cursor",
    "agent.errorInvalid":
      'Invalid --agent value "{value}". Use claude, cursor (comma separated) or none.',

    "i18n.message": "Would you like multi-language (i18n) support?",
    "i18n.active": "Yes",
    "i18n.inactive": "No",
    "i18n.notReady":
      "The multi-language (i18n) template isn't ready for this stack yet. Using the standard template instead.",

    "tools.message": "Which ViraStack tools would you like to include?",
    "tools.mask.hint": "Input masks for React Hook Form: phone, card, date, currency",
    "tools.password.hint": "Accessible password hook: show/hide, strength, server checks",
    "tools.address.hint": "Turkish address hook: province, district, neighbourhood and postal code",
    "tools.ai.hint": "Architecture rules for Claude Code, Cursor and AGENTS.md",

    "scaffold.copying": "Creating project files...",
    "scaffold.copyDone": "Project files created.",
    "scaffold.gitInit": "Creating the initial git commit...",
    "scaffold.gitInitDone": "Initial git commit created.",
    "scaffold.gitInitSkipped": "Skipped the initial git commit.",
    "scaffold.installing": "Installing dependencies with {pm}...",
    "scaffold.installDone": "Dependencies installed.",
    "scaffold.installFailed":
      "Failed to install dependencies.",
    "scaffold.skipInstall":
      "Skipping dependency install (--skip-install).",
    "scaffold.offline":
      "You appear to be offline. Skipping dependency install and AI setup — run them manually when you're back online.",
    "scaffold.aiInit": "Configuring ViraStack AI rules...",
    "scaffold.aiInitDone": "ViraStack AI rules added.",
    "scaffold.aiInitFailed":
      "Failed to configure ViraStack AI rules.",
    "scaffold.skillsInit": "Adding design skills...",
    "scaffold.skillsProgress": "Adding design skills ({current}/{total}: {name})",
    "scaffold.skillsInitDone": "Design skills added.",
    "scaffold.skillsInitFailed": "{failed} of {total} design skills could not be added.",


    "done.partialTitle": "Project files are ready. Finish setup with the steps above.",
    "done.nextSteps": "Next steps",
    "done.installFailedNote":
      "Dependency install failed. The project was created, but you need to install packages before running it.",

    "add.toolMissing": "Please specify what to add.",
    "add.startTooOld": "{pkg} needs ViraStack Start {required} or newer. This project was created with {current}.",
    "add.tools": "Tools",
    "add.modules": "Modules",
    "add.registryUnavailable": "Could not reach the ViraStack registry. Check your connection and try again.",
    "add.toolInvalid": '"{tool}" is not available.',
    "add.notAProject": "No package.json found in the current directory.",
    "add.installing": "Adding {pkg}...",
    "add.done": "{pkg} added.",
    "add.installFailed": "Failed to add {pkg}.",
    "add.notStart": "This command works in projects created with ViraStack Start.",
    "add.alreadyInstalled": "{pkg} is already in this project. Nothing changed.",
    "add.conflict": "{pkg} was not added. Nothing changed.",
    "add.conflictList": "This project already has files or messages with the same names:\n  {list}",
    "add.useInPage": "Add it to a page of yours:\n  {code}\nSteps for your framework: {url}",
    "add.pages": "Its pages are ready:\n  {list}",
    "add.conflictRoutes": "These routes of the project answer the same URLs as the module's pages:\n  {list}",
    "add.pagesAdded": "{pkg} was already here, so only its missing pages were added.",
    "add.pagesSkipped": "These pages were not added, because routes of the project answer the same URLs:\n  {list}",
    "add.conflictLinks": "These paths lead outside the project through a symbolic link:\n  {list}",
    "add.messagesFailed": "The messages could not be compiled. Run the project's postinstall script.",
    "add.conflictNoPages": "To keep your page and add the module without its pages, run it again with {flag}.",
    "add.routeTreeMissing": "This project has no generate-routes script, so src/routeTree.gen.ts was not updated. The dev server updates it when it starts.",
    "add.routeTreeFailed": "src/routeTree.gen.ts could not be updated. Run generate-routes, or start the dev server, which updates it.",
    "remove.missing": "Please specify what to remove.",
    "remove.removing": "Removing {pkg}...",
    "remove.done": "{pkg} removed.",
    "remove.packagesKept": "Its packages and shadcn components stay, because other code may use them.",
    "remove.failed": "Failed to remove {pkg}.",
    "remove.notInstalled": "{pkg} is not in this project. Nothing changed.",
    "remove.changedList": "You changed these:\n  {list}",
    "remove.confirm": "Delete them too?",
    "remove.kept": "{pkg} was not removed. Nothing changed.",
    "remove.needsYes": "Nothing changed. Run it again with --yes to delete them too.",
    "remove.changedPages": "These pages differ from the module's. They may be your own (after --no-pages) or module pages you edited:\n  {list}",
    "remove.confirmPages": "Delete these pages too?",
    "remove.pagesStay": "The pages stay. If they still import the module, change or delete them.",
    "remove.pagesKept": "These pages differ from the module's, so they stay: they may be your own (after --no-pages) or module pages you edited. If they still import the module, change or delete them:\n  {list}",
    "remove.symlinks": "These are symbolic links, or inside one, so they stay:\n  {list}",
    "add.untranslated": "Added English text for: {locales}. Translate it when you are ready.",

    help: `Usage:
  pnpm dlx virastack [init] [name]   Scaffold a new project
  pnpm dlx virastack add <name>      Add a ViraStack tool or module to an existing project
  pnpm dlx virastack remove <module> Remove a module
  pnpm dlx virastack add ai --agent <list>  Add AI rules for the given tools

Tools:
  mask, password, address, ai

Modules:
  {modules}

Options:
  --name <name>         Project name (or pass as positional arg / ".")
  --template <name>     Template: nextjs | tanstack
  --tools <list>        Comma-separated tools (e.g. mask,password)
  --agent <list>        AI coding tools: claude, cursor (comma separated) or none
  --no-pages            With add: leave a module's pages out, for a project with its own
  --i18n / --no-i18n    Enable or disable the i18n template
  --yes, -y             Non-interactive mode (use flags/defaults)
  --skip-install        Skip dependency install (AI rules and skills are still added)
  --tr                  Ask questions in Turkish
  --telemetry-disable   Disable anonymous usage tracking
  -v, --version         Print the version
  -h, --help            Show this help message

Examples:
  pnpm dlx virastack
  pnpm dlx virastack my-app --yes
  pnpm dlx virastack init my-app --template nextjs --tools mask --agent claude --yes`,
  },

  tr: {
    cancel: "İşlem iptal edildi.",

    "projectName.message": "Projenin adı ne olsun?",
    "projectName.placeholder": "virastack-app",
    "projectName.errorEmpty":
      'Lütfen bir proje adı gir ya da mevcut klasörü kullanmak için "." yaz.',
    "projectName.errorInvalid":
      "Lütfen geçerli bir npm paket adı gir (küçük harf, rakam, tire).",
    "projectName.errorNonInteractive":
      'İnteraktif olmayan modda proje adı zorunlu. Bir ad, --name veya "." ver.',
    "projectName.confirmNonEmptyDir":
      '"{dir}" klasörü boş değil. Devam edilsin mi?',

    "template.message": "Hangi şablonla başlamak istiyorsun?",
    "template.nextjs.label": "Next.js App Router",
    "template.nextjs.hint": "App Router + Server Components",
    "template.tanstack.label": "TanStack Start",
    "template.tanstack.hint": "Type-safe routing + SSR",
    "template.tanstack.notReady":
      "Bu kurulumda TanStack Start şablonu yok. Next.js kullanılacak.",
    "template.errorInvalid":
      'Bilinmeyen şablon "{template}". Kullanılabilir şablonlar: nextjs, tanstack.',

    "agents.message": "Hangi AI kodlama araçlarını kullanıyorsun?",
    "agents.claude.label": "Claude Code",
    "agents.cursor.label": "Cursor",
    "agent.errorInvalid":
      'Geçersiz --agent değeri "{value}". claude, cursor (virgülle) veya none kullan.',

    "i18n.message": "Çoklu dil (i18n) desteği ister misin?",
    "i18n.active": "Evet",
    "i18n.inactive": "Hayır",
    "i18n.notReady":
      "Bu şablon için çoklu dil (i18n) sürümü henüz hazır değil. Standart şablon kullanılacak.",

    "tools.message": "Projene hangi ViraStack araçları eklensin?",
    "tools.mask.hint": "React Hook Form için input maskeleri: telefon, IBAN, TCKN",
    "tools.password.hint": "Erişilebilir parola hook’u: göster/gizle, güç, sunucu kontrolü",
    "tools.address.hint": "Türkiye adres hook’u: il, ilçe, mahalle ve posta kodu",
    "tools.ai.hint": "Claude Code, Cursor ve AGENTS.md için mimari kurallar",

    "scaffold.copying": "Proje dosyaları oluşturuluyor...",
    "scaffold.copyDone": "Proje dosyaları oluşturuldu.",
    "scaffold.gitInit": "İlk git commit'i oluşturuluyor...",
    "scaffold.gitInitDone": "İlk git commit'i oluşturuldu.",
    "scaffold.gitInitSkipped": "İlk git commit'i atlandı.",
    "scaffold.installing": "Bağımlılıklar {pm} ile kuruluyor...",
    "scaffold.installDone": "Bağımlılıklar kuruldu.",
    "scaffold.installFailed":
      "Bağımlılıklar kurulamadı.",
    "scaffold.skipInstall":
      "Bağımlılık kurulumu atlanıyor (--skip-install).",
    "scaffold.offline":
      "İnternet bağlantısı yok gibi görünüyor. Bağımlılık kurulumu ve AI yapılandırması atlandı, çevrimiçi olduğunda elle çalıştır.",
    "scaffold.aiInit": "ViraStack AI kuralları yapılandırılıyor...",
    "scaffold.aiInitDone": "ViraStack AI kuralları eklendi.",
    "scaffold.aiInitFailed":
      "ViraStack AI kuralları yapılandırılamadı.",
    "scaffold.skillsInit": "Tasarım skill'leri ekleniyor...",
    "scaffold.skillsProgress": "Tasarım skill'leri ekleniyor ({current}/{total}: {name})",
    "scaffold.skillsInitDone": "Tasarım skill'leri eklendi.",
    "scaffold.skillsInitFailed": "{total} tasarım skill'inden {failed} tanesi eklenemedi.",


    "done.partialTitle": "Proje dosyaları hazır. Kurulumu yukarıdaki adımlarla tamamla.",
    "done.nextSteps": "Sonraki adımlar",
    "done.installFailedNote":
      "Bağımlılık kurulumu başarısız. Proje oluşturuldu, ama çalıştırmadan önce paketleri kurman gerekiyor.",

    "add.toolMissing":
      "Lütfen neyi eklemek istediğini belirt.",
    "add.startTooOld": "{pkg} için ViraStack Start {required} veya üstü gerekiyor. Bu proje {current} ile kuruldu.",
    "add.tools": "Araçlar",
    "add.modules": "Modüller",
    "add.registryUnavailable": "ViraStack registry'sine ulaşılamadı. Bağlantını kontrol edip tekrar dene.",
    "add.toolInvalid": '"{tool}" bulunamadı.',
    "add.notAProject": "Bu dizinde package.json bulunamadı.",
    "add.installing": "{pkg} ekleniyor...",
    "add.done": "{pkg} eklendi.",
    "add.installFailed": "{pkg} eklenemedi.",
    "add.notStart": "Bu komut ViraStack Start ile kurulan projelerde çalışır.",
    "add.alreadyInstalled": "{pkg} bu projede zaten var. Hiçbir şey değişmedi.",
    "add.conflict": "{pkg} eklenmedi. Hiçbir şey değişmedi.",
    "add.conflictList": "Bu projede aynı adlı dosya veya çeviriler var:\n  {list}",
    "add.useInPage": "Kendi sayfana ekle:\n  {code}\nFramework'üne göre adımlar: {url}",
    "add.pages": "Sayfaları hazır:\n  {list}",
    "add.conflictRoutes": "Projendeki bu route'lar modülün sayfalarıyla aynı adreste:\n  {list}",
    "add.pagesAdded": "{pkg} projede zaten vardı, yalnızca eksik sayfaları eklendi.",
    "add.pagesSkipped": "Bu sayfalar eklenmedi, çünkü projendeki route'lar aynı adreste:\n  {list}",
    "add.conflictLinks": "Bu yollar sembolik bir link üzerinden projenin dışına çıkıyor:\n  {list}",
    "add.messagesFailed": "Çeviriler derlenemedi. Projenin postinstall script'ini çalıştır.",
    "add.conflictNoPages": "Kendi sayfanı koruyup modülü sayfaları olmadan eklemek için {flag} ile tekrar çalıştır.",
    "add.routeTreeMissing": "Bu projede generate-routes script'i yok, bu yüzden src/routeTree.gen.ts güncellenmedi. Dev sunucusu açılırken onu günceller.",
    "add.routeTreeFailed": "src/routeTree.gen.ts güncellenemedi. generate-routes'u çalıştır ya da dev sunucusunu aç, o günceller.",
    "remove.missing": "Lütfen neyi kaldırmak istediğini belirt.",
    "remove.removing": "{pkg} kaldırılıyor...",
    "remove.done": "{pkg} kaldırıldı.",
    "remove.packagesKept": "Paketleri ve shadcn bileşenleri duruyor, çünkü başka kodlar da kullanıyor olabilir.",
    "remove.failed": "{pkg} kaldırılamadı.",
    "remove.notInstalled": "{pkg} bu projede yok. Hiçbir şey değişmedi.",
    "remove.changedList": "Bunları değiştirmişsin:\n  {list}",
    "remove.confirm": "Bunlar da silinsin mi?",
    "remove.kept": "{pkg} kaldırılmadı. Hiçbir şey değişmedi.",
    "remove.needsYes": "Hiçbir şey değişmedi. Bunları da silmek için --yes ile tekrar çalıştır.",
    "remove.changedPages": "Bu sayfalar modülünkilerden farklı. Senin sayfaların (--no-pages sonrası) ya da düzenlediğin modül sayfaları olabilir:\n  {list}",
    "remove.confirmPages": "Bu sayfalar da silinsin mi?",
    "remove.pagesStay": "Sayfalar duruyor. Hâlâ modülü import ediyorlarsa değiştir ya da sil.",
    "remove.pagesKept": "Bu sayfalar modülünkilerden farklı, bu yüzden duruyor: senin sayfaların (--no-pages sonrası) ya da düzenlediğin modül sayfaları olabilir. Hâlâ modülü import ediyorlarsa değiştir ya da sil:\n  {list}",
    "remove.symlinks": "Bunlar sembolik link ya da bir linkin içinde, bu yüzden duruyor:\n  {list}",
    "add.untranslated": "Şu diller için İngilizce metin eklendi: {locales}. Hazır olduğunda çevirebilirsin.",

    help: `Kullanım:
  pnpm dlx virastack [init] [ad]     Yeni bir proje oluştur
  pnpm dlx virastack add <ad>        Mevcut projeye bir ViraStack aracı veya modülü ekle
  pnpm dlx virastack remove <modül>  Bir modülü kaldır
  pnpm dlx virastack add ai --agent <liste>  Seçilen araçlar için AI kurallarını ekle

Araçlar:
  mask, password, address, ai

Modüller:
  {modules}

Seçenekler:
  --name <ad>           Proje adı (veya positional arg / ".")
  --template <ad>       Şablon: nextjs | tanstack
  --tools <liste>       Virgülle ayrılmış araçlar (örn. mask,password)
  --agent <liste>       AI kodlama araçları: claude, cursor (virgülle) veya none
  --no-pages            add ile: modülün sayfalarını ekleme, projende kendi sayfaların varsa
  --i18n / --no-i18n    i18n şablonunu aç / kapat
  --yes, -y             İnteraktif olmayan mod (flag/varsayılanlar)
  --skip-install        Bağımlılık kurulumunu atla (AI kuralları ve skill'ler yine eklenir)
  --tr                  Soruları Türkçe sor
  --telemetry-disable   Anonim kullanım verisi toplamayı kapat
  -v, --version         Sürümü göster
  -h, --help            Bu yardım mesajını göster

Örnekler:
  pnpm dlx virastack
  pnpm dlx virastack my-app --yes
  pnpm dlx virastack init my-app --template nextjs --tools mask --agent claude --yes`,
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
