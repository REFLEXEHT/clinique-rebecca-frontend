// lib/i18n.ts — Système multilingue Clinique de la Rebecca
// 5 langues : français (fr), anglais (en), espagnol (es), créole haïtien (ht), mandarin (zh)

export type Lang = 'fr' | 'en' | 'es' | 'ht' | 'zh'

export const LANGS: { code: Lang; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English',   flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', label: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  { code: 'ht', label: 'Kreyòl',    flag: '🇭🇹', dir: 'ltr' },
  { code: 'zh', label: '中文',       flag: '🇨🇳', dir: 'ltr' },
]

export const T: Record<string, Record<Lang, string>> = {
  // ── Navigation ──────────────────────────────────────────────────────────
  'nav.home':           { fr:'Accueil',       en:'Home',          es:'Inicio',        ht:'Akèy',          zh:'首页' },
  'nav.services':       { fr:'Services',      en:'Services',      es:'Servicios',     ht:'Sèvis',         zh:'服务' },
  'nav.specialites':    { fr:'Spécialités',   en:'Specialties',   es:'Especialidades',ht:'Espesyalite',   zh:'专科' },
  'nav.consultation':   { fr:'Consultation',  en:'Consultation',  es:'Consulta',      ht:'Konsiltasyon',  zh:'咨询' },
  'nav.login':          { fr:'Connexion',     en:'Login',         es:'Iniciar sesión',ht:'Koneksyon',     zh:'登录' },
  'nav.register':       { fr:"S'inscrire",    en:'Sign up',       es:'Registrarse',   ht:'Enskri',        zh:'注册' },
  'nav.rdv':            { fr:'Prendre RDV',   en:'Book appointment',es:'Reservar cita',ht:'Pran RDV',    zh:'预约' },
  'nav.my_space':       { fr:'Mon espace',    en:'My space',      es:'Mi espacio',    ht:'Espas mwen',    zh:'我的空间' },
  'nav.logout':         { fr:'Déconnexion',   en:'Logout',        es:'Cerrar sesión', ht:'Dekonekte',     zh:'退出' },
  'nav.services_title': { fr:'Nos 9 services',en:'Our 9 services',es:'Nuestros 9 servicios',ht:'9 sèvis nou yo',zh:'我们的9项服务' },
  'nav.specs_title':    { fr:'12 spécialités',en:'12 specialties',es:'12 especialidades',ht:'12 espesyalite',zh:'12个专科' },

  // ── Hero ─────────────────────────────────────────────────────────────────
  'hero.badge':         { fr:'Clinique de la Rebecca — Delmas, Haïti', en:'Clinique de la Rebecca — Delmas, Haiti', es:'Clinique de la Rebecca — Delmas, Haití', ht:'Klinik de la Rebecca — Delmas, Ayiti', zh:'丽贝卡诊所 — 德尔马斯，海地' },
  'hero.title1':        { fr:'Votre santé,',  en:'Your health,',  es:'Su salud,',     ht:'Sante ou,',     zh:'您的健康，' },
  'hero.title2':        { fr:'entre de bonnes mains', en:'in good hands', es:'en buenas manos', ht:'nan bon men', zh:'在好手中' },
  'hero.desc':          { fr:'Une équipe de {n} médecins et professionnels de santé dévoués à votre mieux-être, dans un cadre moderne et bienveillant à Delmas.',
                          en:'A team of {n} doctors and health professionals dedicated to your well-being, in a modern and caring environment in Delmas.',
                          es:'Un equipo de {n} médicos y profesionales de salud dedicados a su bienestar, en un entorno moderno y cálido en Delmas.',
                          ht:'Yon ekip {n} doktè ak pwofesyonèl sante ki dedye pou byennèt ou, nan yon anviwonnman modèn ak byenveyans nan Delmas.',
                          zh:'一支由{n}名医生和健康专业人员组成的团队，致力于您的健康，在德尔马斯提供现代化的关爱环境。' },
  'hero.cta_rdv':       { fr:'Prendre rendez-vous', en:'Book appointment', es:'Reservar cita', ht:'Pran randevou', zh:'预约就诊' },
  'hero.cta_specs':     { fr:'Nos spécialistes', en:'Our specialists', es:'Nuestros especialistas', ht:'Espesyalis nou yo', zh:'我们的专家' },
  'hero.stat_doctors':  { fr:'Médecins spécialistes', en:'Specialist doctors', es:'Médicos especialistas', ht:'Doktè espesyalis', zh:'专科医生' },
  'hero.stat_services': { fr:'Services médicaux', en:'Medical services', es:'Servicios médicos', ht:'Sèvis medikal', zh:'医疗服务' },
  'hero.stat_specs':    { fr:'Spécialités', en:'Specialties', es:'Especialidades', ht:'Espesyalite', zh:'专科' },
  'hero.stat_avail':    { fr:'Disponibilité', en:'Availability', es:'Disponibilidad', ht:'Disponibilite', zh:'开放时间' },
  'hero.rdv_today':     { fr:"Aujourd'hui à 14h00", en:'Today at 2:00 PM', es:'Hoy a las 14:00', ht:"Jodiya a 2pm", zh:'今天下午2点' },
  'hero.rdv_avail':     { fr:'RDV disponible', en:'Appointment available', es:'Cita disponible', ht:'RDV disponib', zh:'可预约' },
  'hero.quality':       { fr:'Soins de qualité', en:'Quality care', es:'Atención de calidad', ht:'Swen kalite', zh:'优质护理' },
  'hero.certified':     { fr:'Certifiés & accrédités', en:'Certified & accredited', es:'Certificados & acreditados', ht:'Sertifye & akredite', zh:'认证与资质' },

  // ── Services ─────────────────────────────────────────────────────────────
  'services.tag':       { fr:'Nos 9 services', en:'Our 9 services', es:'Nuestros 9 servicios', ht:'9 sèvis nou yo', zh:'我们的9项服务' },
  'services.title':     { fr:'Des soins complets', en:'Complete care', es:'Atención completa', ht:'Swen konplè', zh:'全面医疗服务' },
  'services.title_em':  { fr:'sous un même toit', en:'under one roof', es:'bajo un mismo techo', ht:'anba yon sèl do', zh:'一站式服务' },
  'services.subtitle':  { fr:'De la consultation médicale à la chirurgie, en passant par le laboratoire et la pharmacie.',
                          en:'From medical consultation to surgery, including laboratory and pharmacy.',
                          es:'Desde la consulta médica hasta la cirugía, pasando por el laboratorio y la farmacia.',
                          ht:'Depi konsiltasyon medikal pou chiriji, laboratwa ak famasi.',
                          zh:'从医疗咨询到外科手术，包括实验室和药房。' },
  'services.more':      { fr:'En savoir plus', en:'Learn more', es:'Más información', ht:'Aprann plis', zh:'了解更多' },

  // ── Specialites ───────────────────────────────────────────────────────────
  'specs.tag':          { fr:'12 spécialités médicales', en:'12 medical specialties', es:'12 especialidades médicas', ht:'12 espesyalite medikal', zh:'12个医疗专科' },
  'specs.title':        { fr:'Des experts dans', en:'Experts in', es:'Expertos en', ht:'Ekspè nan', zh:'各领域专家' },
  'specs.title_em':     { fr:'chaque domaine', en:'every field', es:'cada campo', ht:'chak domèn', zh:'' },
  'specs.title2':       { fr:'de la médecine', en:'of medicine', es:'de la medicina', ht:'medisin', zh:'覆盖所有医学领域' },
  'specs.desc':         { fr:'Chirurgie, gynécologie, pédiatrie, neurologie, orthopédie et bien plus. Nos médecins sont formés dans les meilleures institutions.',
                          en:'Surgery, gynecology, pediatrics, neurology, orthopedics and more. Our doctors are trained at the best institutions.',
                          es:'Cirugía, ginecología, pediatría, neurología, ortopedia y mucho más. Nuestros médicos están formados en las mejores instituciones.',
                          ht:'Chiriji, jinekologi, pedyatri, newoloji, òtopedi ak plis. Doktè nou yo fòme nan pi bon enstitisyon yo.',
                          zh:'外科、妇科、儿科、神经科、骨科等。我们的医生均毕业于顶级医学院校。' },
  'specs.cta':          { fr:'Voir tous nos spécialistes', en:'See all our specialists', es:'Ver todos nuestros especialistas', ht:'Wè tout espesyalis nou yo', zh:'查看所有专家' },

  // ── Témoignages ───────────────────────────────────────────────────────────
  'temoignages.tag':    { fr:'Témoignages', en:'Testimonials', es:'Testimonios', ht:'Temwayaj', zh:'患者评价' },
  'temoignages.title':  { fr:'Ce que disent', en:'What our', es:'Lo que dicen', ht:'Sa', zh:'患者的' },
  'temoignages.title_em':{ fr:'nos patients', en:'patients say', es:'nuestros pacientes', ht:'pasyan nou yo di', zh:'真实评价' },

  // ── CTA ───────────────────────────────────────────────────────────────────
  'cta.title':          { fr:"Prenez soin de vous aujourd'hui", en:'Take care of yourself today', es:'Cuídese hoy mismo', ht:'Pran swen tèt ou jodiya', zh:'今天就关注您的健康' },
  'cta.desc':           { fr:'Consultation en cabinet ou par vidéo, disponible 6 jours sur 7. Notre équipe vous accueille avec bienveillance.',
                          en:'In-office or video consultation, available 6 days a week. Our team welcomes you with care.',
                          es:'Consulta en consultorio o por video, disponible 6 días a la semana. Nuestro equipo le atiende con amabilidad.',
                          ht:'Konsiltasyon nan biwo oswa pa videyo, disponib 6 jou sou 7. Ekip nou an aksèy ou ak byenveyans.',
                          zh:'门诊或视频咨询，每周6天开放。我们的团队热诚欢迎您。' },
  'cta.online':         { fr:'Consultation en ligne', en:'Online consultation', es:'Consulta en línea', ht:'Konsiltasyon anliy', zh:'在线咨询' },

  // ── RDV Modal ─────────────────────────────────────────────────────────────
  'rdv.title':          { fr:'Prendre rendez-vous', en:'Book appointment', es:'Reservar cita', ht:'Pran randevou', zh:'预约就诊' },
  'rdv.name':           { fr:'Nom complet', en:'Full name', es:'Nombre completo', ht:'Non konplè', zh:'姓名' },
  'rdv.phone':          { fr:'Téléphone / WhatsApp', en:'Phone / WhatsApp', es:'Teléfono / WhatsApp', ht:'Telefòn / WhatsApp', zh:'电话 / WhatsApp' },
  'rdv.email':          { fr:'Email', en:'Email', es:'Email', ht:'Imèl', zh:'电子邮件' },
  'rdv.specialite':     { fr:'Spécialité', en:'Specialty', es:'Especialidad', ht:'Espesyalite', zh:'专科' },
  'rdv.date':           { fr:'Date souhaitée', en:'Preferred date', es:'Fecha preferida', ht:'Dat ou vle', zh:'预约日期' },
  'rdv.type':           { fr:'Type de consultation', en:'Consultation type', es:'Tipo de consulta', ht:'Tip konsiltasyon', zh:'就诊方式' },
  'rdv.in_person':      { fr:'En cabinet', en:'In person', es:'Presencial', ht:'Prezansyèl', zh:'到诊' },
  'rdv.video':          { fr:'Par vidéo', en:'By video', es:'Por video', ht:'Pa videyo', zh:'视频' },
  'rdv.payment':        { fr:'Mode de paiement', en:'Payment method', es:'Forma de pago', ht:'Mòd peman', zh:'支付方式' },
  'rdv.submit':         { fr:'Confirmer le rendez-vous', en:'Confirm appointment', es:'Confirmar cita', ht:'Konfime randevou', zh:'确认预约' },
  'rdv.success':        { fr:'Rendez-vous enregistré !', en:'Appointment booked!', es:'¡Cita registrada!', ht:'Randevou anrejistre!', zh:'预约成功！' },
  'rdv.motif':          { fr:'Motif de consultation', en:'Reason for visit', es:'Motivo de consulta', ht:'Rezon konsiltasyon', zh:'就诊原因' },

  // ── Footer ────────────────────────────────────────────────────────────────
  'footer.address':     { fr:'Delmas, Haïti', en:'Delmas, Haiti', es:'Delmas, Haití', ht:'Delmas, Ayiti', zh:'德尔马斯，海地' },
  'footer.hours':       { fr:'Lun–Sam 7h00–17h00', en:'Mon–Sat 7am–5pm', es:'Lun–Sáb 7h–17h', ht:'Lendi–Samdi 7h–5pm', zh:'周一至周六 7:00-17:00' },
  'footer.rights':      { fr:'Tous droits réservés', en:'All rights reserved', es:'Todos los derechos reservados', ht:'Tout dwa rezève', zh:'版权所有' },
  'footer.services':    { fr:'Nos services', en:'Our services', es:'Nuestros servicios', ht:'Sèvis nou yo', zh:'我们的服务' },
  'footer.specialites': { fr:'Spécialités', en:'Specialties', es:'Especialidades', ht:'Espesyalite', zh:'专科' },
  'footer.contact':     { fr:'Contact', en:'Contact', es:'Contacto', ht:'Kontak', zh:'联系我们' },
  'footer.quick_links': { fr:'Liens rapides', en:'Quick links', es:'Enlaces rápidos', ht:'Lyen rapid', zh:'快速链接' },

  // ── Pages ────────────────────────────────────────────────────────────────
  'page.back_home':     { fr:"Retour à l'accueil", en:'Back to home', es:'Volver al inicio', ht:'Retounen paj akèy', zh:'返回首页' },
  'page.not_found':     { fr:'Page introuvable', en:'Page not found', es:'Página no encontrada', ht:'Paj pa jwenn', zh:'页面未找到' },
  'page.loading':       { fr:'Chargement...', en:'Loading...', es:'Cargando...', ht:'Ap chaje...', zh:'加载中...' },
  'page.book_rdv':      { fr:'Prendre RDV', en:'Book RDV', es:'Reservar cita', ht:'Pran RDV', zh:'预约' },

  // ── Login ─────────────────────────────────────────────────────────────────
  'login.title':        { fr:'Connexion', en:'Login', es:'Iniciar sesión', ht:'Koneksyon', zh:'登录' },
  'login.subtitle':     { fr:'Sélectionnez votre profil, puis entrez vos identifiants.', en:'Select your profile, then enter your credentials.', es:'Seleccione su perfil y luego ingrese sus credenciales.', ht:'Chwazi pwofil ou, epi antre enfòmasyon ou.', zh:'选择您的角色，然后输入您的凭据。' },
  'login.role_label':   { fr:'Je me connecte en tant que…', en:'I am logging in as…', es:'Inicio sesión como…', ht:'Mwen konekte kòm…', zh:'我的身份是…' },
  'login.email':        { fr:'Email', en:'Email', es:'Email', ht:'Imèl', zh:'电子邮件' },
  'login.password':     { fr:'Mot de passe', en:'Password', es:'Contraseña', ht:'Modpas', zh:'密码' },
  'login.submit':       { fr:'Se connecter', en:'Log in', es:'Iniciar sesión', ht:'Konekte', zh:'登录' },
  'login.no_account':   { fr:'Pas encore de compte ?', en:"Don't have an account?", es:'¿No tiene una cuenta?', ht:'Ou pako gen yon kont?', zh:'还没有账号？' },
  'login.role_mismatch':{ fr:'Ce compte est enregistré comme "{role}". Veuillez sélectionner le bon profil.', en:'This account is registered as "{role}". Please select the correct profile.', es:'Esta cuenta está registrada como "{role}". Por favor seleccione el perfil correcto.', ht:'Kont sa a anrejistre kòm "{role}". Tanpri chwazi bon pwofil la.', zh:'此账号的角色是"{role}"，请选择正确的身份。' },

  // ── Register ──────────────────────────────────────────────────────────────
  'register.title':     { fr:'Créer un compte', en:'Create an account', es:'Crear una cuenta', ht:'Kreye yon kont', zh:'创建账号' },
  'register.submitted': { fr:'Compte soumis !', en:'Account submitted!', es:'¡Cuenta enviada!', ht:'Kont soumèt!', zh:'账号已提交！' },
  'register.pending':   { fr:"Votre compte est en attente de validation par l'administrateur.", en:'Your account is pending approval by the administrator.', es:'Su cuenta está pendiente de aprobación por el administrador.', ht:"Kont ou an ap tann validasyon administratè a.", zh:'您的账号正在等待管理员审核。' },
  'register.go_login':  { fr:'Se connecter', en:'Log in', es:'Iniciar sesión', ht:'Konekte', zh:'去登录' },

  // ── Spécialistes ─────────────────────────────────────────────────────────
  'specs.no_specialist':{ fr:'Aucun spécialiste disponible pour cette spécialité.', en:'No specialist available for this specialty.', es:'Ningún especialista disponible para esta especialidad.', ht:'Pa gen espesyalis disponib pou espesyalite sa a.', zh:'该专科暂无可用专家。' },
  'specs.book_rdv':     { fr:'Prendre RDV', en:'Book appointment', es:'Reservar cita', ht:'Pran RDV', zh:'预约' },

  // ── Consultation ──────────────────────────────────────────────────────────
  'consult.in_person':  { fr:'En cabinet', en:'In person', es:'Presencial', ht:'Prezansyèl', zh:'到诊' },
  'consult.video':      { fr:'Par vidéo', en:'By video', es:'Por video', ht:'Pa videyo', zh:'视频' },
  'consult.sent':       { fr:'Demande envoyée', en:'Request sent', es:'Solicitud enviada', ht:'Demann voye', zh:'请求已发送' },
  'consult.team_contact':{ fr:'Notre équipe vous contactera rapidement pour confirmer votre rendez-vous.', en:'Our team will contact you shortly to confirm your appointment.', es:'Nuestro equipo se pondrá en contacto pronto para confirmar su cita.', ht:'Ekip nou an pral kontakte ou rapidman pou konfime randevou ou.', zh:'我们的团队将很快联系您确认预约。' },
}

/** Traduit une clé avec interpolation optionnelle de variables {n} */
export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = T[key]
  if (!entry) return key
  let text = entry[lang] ?? entry['fr'] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }
  return text
}

/** Hook React pour utiliser la langue courante */
export function getLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  return (localStorage.getItem('rb_lang') as Lang) || 'fr'
}

export function setLang(lang: Lang) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rb_lang', lang)
    window.location.reload()
  }
}
