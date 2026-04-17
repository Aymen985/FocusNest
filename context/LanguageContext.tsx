"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "fr" | "ar" | "es" | "de";

// Flag images via flagcdn.com — renders identically on all OS/browsers
export const LANGUAGES: { code: Lang; label: string; nativeName: string; flag: string; countryCode: string }[] = [
  { code: "en", label: "English",  nativeName: "English",  flag: "🇬🇧", countryCode: "gb" },
  { code: "fr", label: "French",   nativeName: "Français", flag: "🇫🇷", countryCode: "fr" },
  { code: "ar", label: "Arabic",   nativeName: "العربية",  flag: "🇸🇦", countryCode: "sa" },
  { code: "es", label: "Spanish",  nativeName: "Español",  flag: "🇪🇸", countryCode: "es" },
  { code: "de", label: "German",   nativeName: "Deutsch",  flag: "🇩🇪", countryCode: "de" },
];

// Consistent flag image component — uses flagcdn.com, works on all platforms
export function FlagImg({ countryCode, className = "w-5 h-3.5" }: { countryCode: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt={countryCode}
      className={`${className} object-cover rounded-sm inline-block shrink-0`}
      loading="lazy"
    />
  );
}

export interface Translations {
  // Nav
  nav_dashboard:  string; nav_pomodoro:   string; nav_timetable:  string;
  nav_progress:   string; nav_forest:     string; nav_assistant:  string;
  nav_flashcards: string; nav_documents:  string; nav_profile:    string;
  nav_logout:     string; nav_login:      string; nav_signup:     string;
  nav_about:      string;
  // Auth
  auth_welcome_back: string;   auth_subtitle_login: string;
  auth_email: string;          auth_password: string;
  auth_forgot: string;         auth_sign_in: string;       auth_signing_in: string;
  auth_no_account: string;     auth_create_one: string;    auth_create_account: string;
  auth_subtitle_signup: string; auth_first_name: string;  auth_last_name: string;
  auth_dob: string;            auth_major: string;         auth_phone: string;
  auth_confirm_password: string; auth_creating: string;   auth_already_have: string;
  auth_reset_title: string;    auth_reset_subtitle: string;
  auth_send_reset: string;     auth_sending: string;       auth_back_to_signin: string;
  // Pages
  page_dashboard_title: string;    page_dashboard_subtitle: string;
  page_dashboard_greeting_morning: string; page_dashboard_greeting_afternoon: string;
  page_dashboard_greeting_evening: string;
  page_dashboard_today_sessions: string; page_dashboard_total_sessions: string;
  page_dashboard_focus_time: string;     page_dashboard_documents: string;
  page_dashboard_today_schedule: string; page_dashboard_quick_actions: string;
  page_dashboard_recent_docs: string;    page_dashboard_no_schedule: string;
  page_dashboard_no_docs: string;
  page_forest_title: string;   page_forest_subtitle: string;
  page_forest_planted: string; page_forest_focus_time: string;
  page_forest_streak: string;  page_forest_abandoned: string;
  page_forest_empty: string;   page_forest_empty_sub: string;
  page_forest_total: string;
  page_pomodoro_title: string;    page_pomodoro_subtitle: string;
  page_pomodoro_focus: string;    page_pomodoro_break: string;
  page_pomodoro_start: string;    page_pomodoro_pause: string;
  page_pomodoro_reset: string;    page_pomodoro_plant: string;
  page_pomodoro_resume: string;   page_pomodoro_session_label: string;
  page_pomodoro_my_forest: string;
  page_documents_title: string;   page_documents_subtitle: string;
  page_documents_drop: string;    page_documents_accept: string;
  page_documents_no_docs: string; page_documents_uploading: string;
  page_profile_personal: string;  page_profile_password: string;
  page_profile_account: string;   page_profile_signout: string;
  page_profile_signout_msg: string; page_profile_avatar: string;
  // Buttons
  btn_save: string;   btn_saving: string; btn_cancel: string;
  btn_delete: string; btn_upload: string; btn_send: string;
  btn_start: string;  btn_pause: string;  btn_reset: string;
  btn_view_all: string; btn_open_timetable: string; btn_start_session: string;
  // Guest
  guest_welcome: string;    guest_description: string;
  guest_signin: string;     guest_create: string;     guest_continue: string;
  // Logout
  logout_confirm: string;   logout_yes: string;
  // Placeholders
  ph_email: string; ph_password: string; ph_search: string;
  ph_what_studying: string; ph_ask_docs: string;
}

const T: Record<Lang, Translations> = {
  en: {
    nav_dashboard: "Dashboard",   nav_pomodoro: "Pomodoro",
    nav_timetable: "Timetable",   nav_progress: "Progress",
    nav_forest: "Forest",         nav_assistant: "Assistant",
    nav_flashcards: "Flashcards", nav_documents: "Documents",
    nav_profile: "Profile",       nav_logout: "Logout",
    nav_login: "Login",           nav_signup: "Sign up",
    nav_about: "About",

    auth_welcome_back: "Welcome back",
    auth_subtitle_login: "Sign in to your FocusNest account",
    auth_email: "Email", auth_password: "Password",
    auth_forgot: "Forgot password?", auth_sign_in: "Sign in",
    auth_signing_in: "Signing in...", auth_no_account: "No account?",
    auth_create_one: "Create one", auth_create_account: "Create account",
    auth_subtitle_signup: "Start building your focus forest",
    auth_first_name: "First name", auth_last_name: "Last name",
    auth_dob: "Date of birth", auth_major: "Major / Subject",
    auth_phone: "Phone", auth_confirm_password: "Confirm password",
    auth_creating: "Creating account...", auth_already_have: "Already have an account?",
    auth_reset_title: "Reset password",
    auth_reset_subtitle: "Enter your email and we'll send you a reset link.",
    auth_send_reset: "Send reset link", auth_sending: "Sending...",
    auth_back_to_signin: "Back to sign in",

    page_dashboard_title: "Dashboard", page_dashboard_subtitle: "Your study hub.",
    page_dashboard_greeting_morning: "Good morning",
    page_dashboard_greeting_afternoon: "Good afternoon",
    page_dashboard_greeting_evening: "Good evening",
    page_dashboard_today_sessions: "Today's sessions",
    page_dashboard_total_sessions: "Total sessions",
    page_dashboard_focus_time: "Focus time",
    page_dashboard_documents: "Documents",
    page_dashboard_today_schedule: "Today's schedule",
    page_dashboard_quick_actions: "Quick actions",
    page_dashboard_recent_docs: "Recent documents",
    page_dashboard_no_schedule: "Nothing scheduled today",
    page_dashboard_no_docs: "No documents yet",

    page_forest_title: "My Forest",
    page_forest_subtitle: "Every completed focus session grows a tree.",
    page_forest_planted: "Trees planted", page_forest_focus_time: "Focus time",
    page_forest_streak: "Current streak", page_forest_abandoned: "Abandoned",
    page_forest_empty: "Your forest is empty",
    page_forest_empty_sub: "Complete a Pomodoro session to plant your first tree.",
    page_forest_total: "trees total",

    page_pomodoro_title: "Pomodoro",
    page_pomodoro_subtitle: "Plant a tree. Stay focused. Grow your forest.",
    page_pomodoro_focus: "Focus", page_pomodoro_break: "Break",
    page_pomodoro_start: "Start", page_pomodoro_pause: "Pause",
    page_pomodoro_reset: "Reset", page_pomodoro_plant: "Plant & Start",
    page_pomodoro_resume: "Resume", page_pomodoro_session_label: "Session label",
    page_pomodoro_my_forest: "My Forest",

    page_documents_title: "Documents",
    page_documents_subtitle: "Upload study materials — your assistant will use them.",
    page_documents_drop: "Drop a file or click to browse",
    page_documents_accept: "PDF, DOCX, or TXT · max 20 MB",
    page_documents_no_docs: "No documents yet",
    page_documents_uploading: "Uploading",

    page_profile_personal: "Personal info", page_profile_password: "Change password",
    page_profile_account: "Account", page_profile_signout: "Sign out",
    page_profile_signout_msg: "Signing out will end your current session.",
    page_profile_avatar: "Choose avatar",

    btn_save: "Save changes", btn_saving: "Saving...", btn_cancel: "Cancel",
    btn_delete: "Delete", btn_upload: "Upload", btn_send: "Send",
    btn_start: "Start", btn_pause: "Pause", btn_reset: "Reset",
    btn_view_all: "View all", btn_open_timetable: "Open timetable",
    btn_start_session: "Start a session",

    guest_welcome: "Welcome to FocusNest",
    guest_description: "Sign in for full access to all features — AI assistant, flashcards, progress tracking, and more. Or continue as a guest with Pomodoro and Timetable.",
    guest_signin: "Sign in for full access",
    guest_create: "Create an account",
    guest_continue: "Continue as guest (limited access)",
    logout_confirm: "Are you sure you want to log out?", logout_yes: "Yes, log out",
    ph_email: "you@example.com", ph_password: "........", ph_search: "Search...",
    ph_what_studying: "What are you studying?", ph_ask_docs: "Ask about your documents...",
  },

  fr: {
    nav_dashboard: "Tableau de bord", nav_pomodoro: "Pomodoro",
    nav_timetable: "Emploi du temps", nav_progress: "Progres",
    nav_forest: "Foret", nav_assistant: "Assistant",
    nav_flashcards: "Fiches", nav_documents: "Documents",
    nav_profile: "Profil", nav_logout: "Deconnexion",
    nav_login: "Connexion", nav_signup: "S'inscrire", nav_about: "A propos",

    auth_welcome_back: "Bon retour",
    auth_subtitle_login: "Connectez-vous a votre compte FocusNest",
    auth_email: "Email", auth_password: "Mot de passe",
    auth_forgot: "Mot de passe oublie?", auth_sign_in: "Se connecter",
    auth_signing_in: "Connexion...", auth_no_account: "Pas de compte?",
    auth_create_one: "Creer un", auth_create_account: "Creer un compte",
    auth_subtitle_signup: "Commencez a construire votre foret",
    auth_first_name: "Prenom", auth_last_name: "Nom",
    auth_dob: "Date de naissance", auth_major: "Filiere / Matiere",
    auth_phone: "Telephone", auth_confirm_password: "Confirmer le mot de passe",
    auth_creating: "Creation du compte...", auth_already_have: "Deja un compte?",
    auth_reset_title: "Reinitialiser le mot de passe",
    auth_reset_subtitle: "Entrez votre email et nous vous enverrons un lien.",
    auth_send_reset: "Envoyer le lien", auth_sending: "Envoi...",
    auth_back_to_signin: "Retour a la connexion",

    page_dashboard_title: "Tableau de bord", page_dashboard_subtitle: "Votre espace d'etude.",
    page_dashboard_greeting_morning: "Bonjour",
    page_dashboard_greeting_afternoon: "Bonne apres-midi",
    page_dashboard_greeting_evening: "Bonsoir",
    page_dashboard_today_sessions: "Sessions d'aujourd'hui",
    page_dashboard_total_sessions: "Sessions totales",
    page_dashboard_focus_time: "Temps de concentration",
    page_dashboard_documents: "Documents",
    page_dashboard_today_schedule: "Programme du jour",
    page_dashboard_quick_actions: "Actions rapides",
    page_dashboard_recent_docs: "Documents recents",
    page_dashboard_no_schedule: "Rien de prevu aujourd'hui",
    page_dashboard_no_docs: "Aucun document",

    page_forest_title: "Ma Foret",
    page_forest_subtitle: "Chaque session complete fait pousser un arbre.",
    page_forest_planted: "Arbres plantes", page_forest_focus_time: "Temps de concentration",
    page_forest_streak: "Serie actuelle", page_forest_abandoned: "Abandonnees",
    page_forest_empty: "Votre foret est vide",
    page_forest_empty_sub: "Completez une session Pomodoro pour planter votre premier arbre.",
    page_forest_total: "arbres au total",

    page_pomodoro_title: "Pomodoro",
    page_pomodoro_subtitle: "Plantez un arbre. Restez concentre. Faites grandir votre foret.",
    page_pomodoro_focus: "Concentration", page_pomodoro_break: "Pause",
    page_pomodoro_start: "Demarrer", page_pomodoro_pause: "Pause",
    page_pomodoro_reset: "Reinitialiser", page_pomodoro_plant: "Planter & Demarrer",
    page_pomodoro_resume: "Reprendre", page_pomodoro_session_label: "Etiquette de session",
    page_pomodoro_my_forest: "Ma Foret",

    page_documents_title: "Documents",
    page_documents_subtitle: "Telechargez vos supports — votre assistant les utilisera.",
    page_documents_drop: "Deposez un fichier ou cliquez pour parcourir",
    page_documents_accept: "PDF, DOCX ou TXT · max 20 Mo",
    page_documents_no_docs: "Aucun document",
    page_documents_uploading: "Telechargement",

    page_profile_personal: "Informations personnelles",
    page_profile_password: "Changer le mot de passe",
    page_profile_account: "Compte", page_profile_signout: "Se deconnecter",
    page_profile_signout_msg: "La deconnexion mettra fin a votre session.",
    page_profile_avatar: "Choisir un avatar",

    btn_save: "Enregistrer", btn_saving: "Enregistrement...", btn_cancel: "Annuler",
    btn_delete: "Supprimer", btn_upload: "Telecharger", btn_send: "Envoyer",
    btn_start: "Demarrer", btn_pause: "Pause", btn_reset: "Reinitialiser",
    btn_view_all: "Tout voir", btn_open_timetable: "Ouvrir l'emploi du temps",
    btn_start_session: "Demarrer une session",

    guest_welcome: "Bienvenue sur FocusNest",
    guest_description: "Connectez-vous pour acceder a toutes les fonctionnalites ou continuez en tant qu'invite.",
    guest_signin: "Connexion pour acces complet",
    guest_create: "Creer un compte",
    guest_continue: "Continuer en tant qu'invite",
    logout_confirm: "Voulez-vous vraiment vous deconnecter?", logout_yes: "Oui, se deconnecter",
    ph_email: "vous@exemple.com", ph_password: "........", ph_search: "Rechercher...",
    ph_what_studying: "Que etudiez-vous?", ph_ask_docs: "Posez une question sur vos documents...",
  },

  ar: {
    nav_dashboard: "لوحة التحكم", nav_pomodoro: "بومودورو",
    nav_timetable: "الجدول الزمني", nav_progress: "التقدم",
    nav_forest: "الغابة", nav_assistant: "المساعد",
    nav_flashcards: "البطاقات", nav_documents: "الوثائق",
    nav_profile: "الملف الشخصي", nav_logout: "تسجيل الخروج",
    nav_login: "تسجيل الدخول", nav_signup: "إنشاء حساب", nav_about: "حول",

    auth_welcome_back: "مرحباً بعودتك",
    auth_subtitle_login: "سجّل دخولك إلى حساب FocusNest",
    auth_email: "البريد الإلكتروني", auth_password: "كلمة المرور",
    auth_forgot: "نسيت كلمة المرور؟", auth_sign_in: "تسجيل الدخول",
    auth_signing_in: "جارٍ الدخول...", auth_no_account: "لا تملك حساباً؟",
    auth_create_one: "أنشئ حساباً", auth_create_account: "إنشاء حساب",
    auth_subtitle_signup: "ابدأ في بناء غابتك",
    auth_first_name: "الاسم الأول", auth_last_name: "اسم العائلة",
    auth_dob: "تاريخ الميلاد", auth_major: "التخصص",
    auth_phone: "الهاتف", auth_confirm_password: "تأكيد كلمة المرور",
    auth_creating: "جارٍ إنشاء الحساب...", auth_already_have: "لديك حساب بالفعل؟",
    auth_reset_title: "إعادة تعيين كلمة المرور",
    auth_reset_subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً.",
    auth_send_reset: "إرسال الرابط", auth_sending: "جارٍ الإرسال...",
    auth_back_to_signin: "العودة لتسجيل الدخول",

    page_dashboard_title: "لوحة التحكم", page_dashboard_subtitle: "مركز دراستك.",
    page_dashboard_greeting_morning: "صباح الخير",
    page_dashboard_greeting_afternoon: "مساء الخير",
    page_dashboard_greeting_evening: "مساء الخير",
    page_dashboard_today_sessions: "جلسات اليوم",
    page_dashboard_total_sessions: "إجمالي الجلسات",
    page_dashboard_focus_time: "وقت التركيز",
    page_dashboard_documents: "الوثائق",
    page_dashboard_today_schedule: "جدول اليوم",
    page_dashboard_quick_actions: "إجراءات سريعة",
    page_dashboard_recent_docs: "الوثائق الأخيرة",
    page_dashboard_no_schedule: "لا شيء مجدول اليوم",
    page_dashboard_no_docs: "لا توجد وثائق بعد",

    page_forest_title: "غابتي",
    page_forest_subtitle: "كل جلسة تركيز مكتملة تزرع شجرة.",
    page_forest_planted: "الأشجار المزروعة", page_forest_focus_time: "وقت التركيز",
    page_forest_streak: "السلسلة الحالية", page_forest_abandoned: "المتروكة",
    page_forest_empty: "غابتك فارغة",
    page_forest_empty_sub: "أكمل جلسة بومودورو لزرع أول شجرة.",
    page_forest_total: "شجرة إجمالاً",

    page_pomodoro_title: "بومودورو",
    page_pomodoro_subtitle: "ازرع شجرة. ابقَ مركّزاً. طوّر غابتك.",
    page_pomodoro_focus: "تركيز", page_pomodoro_break: "استراحة",
    page_pomodoro_start: "ابدأ", page_pomodoro_pause: "إيقاف",
    page_pomodoro_reset: "إعادة تعيين", page_pomodoro_plant: "ازرع وابدأ",
    page_pomodoro_resume: "استأنف", page_pomodoro_session_label: "عنوان الجلسة",
    page_pomodoro_my_forest: "غابتي",

    page_documents_title: "الوثائق",
    page_documents_subtitle: "ارفع موادك الدراسية — سيستخدمها مساعدك.",
    page_documents_drop: "أسقط ملفاً أو انقر للتصفح",
    page_documents_accept: "PDF أو DOCX أو TXT · الحد الأقصى 20 ميجا",
    page_documents_no_docs: "لا توجد وثائق بعد",
    page_documents_uploading: "جارٍ الرفع",

    page_profile_personal: "المعلومات الشخصية",
    page_profile_password: "تغيير كلمة المرور",
    page_profile_account: "الحساب", page_profile_signout: "تسجيل الخروج",
    page_profile_signout_msg: "سيؤدي تسجيل الخروج إلى إنهاء جلستك الحالية.",
    page_profile_avatar: "اختر صورة",

    btn_save: "حفظ التغييرات", btn_saving: "جارٍ الحفظ...", btn_cancel: "إلغاء",
    btn_delete: "حذف", btn_upload: "رفع", btn_send: "إرسال",
    btn_start: "ابدأ", btn_pause: "إيقاف مؤقت", btn_reset: "إعادة تعيين",
    btn_view_all: "عرض الكل", btn_open_timetable: "فتح الجدول",
    btn_start_session: "بدء جلسة",

    guest_welcome: "مرحباً بك في FocusNest",
    guest_description: "سجّل دخولك للوصول الكامل أو تابع كضيف مع وصول إلى بومودورو والجدول الزمني.",
    guest_signin: "تسجيل الدخول للوصول الكامل",
    guest_create: "إنشاء حساب",
    guest_continue: "المتابعة كضيف",
    logout_confirm: "هل أنت متأكد أنك تريد تسجيل الخروج؟", logout_yes: "نعم، تسجيل الخروج",
    ph_email: "you@example.com", ph_password: "........", ph_search: "بحث...",
    ph_what_studying: "ماذا تدرس؟", ph_ask_docs: "اسأل عن وثائقك...",
  },

  es: {
    nav_dashboard: "Panel", nav_pomodoro: "Pomodoro",
    nav_timetable: "Horario", nav_progress: "Progreso",
    nav_forest: "Bosque", nav_assistant: "Asistente",
    nav_flashcards: "Tarjetas", nav_documents: "Documentos",
    nav_profile: "Perfil", nav_logout: "Cerrar sesion",
    nav_login: "Iniciar sesion", nav_signup: "Registrarse", nav_about: "Acerca de",

    auth_welcome_back: "Bienvenido de nuevo",
    auth_subtitle_login: "Inicia sesion en tu cuenta FocusNest",
    auth_email: "Correo electronico", auth_password: "Contrasena",
    auth_forgot: "Olvide mi contrasena", auth_sign_in: "Iniciar sesion",
    auth_signing_in: "Iniciando sesion...", auth_no_account: "No tienes cuenta?",
    auth_create_one: "Crear una", auth_create_account: "Crear cuenta",
    auth_subtitle_signup: "Empieza a construir tu bosque",
    auth_first_name: "Nombre", auth_last_name: "Apellido",
    auth_dob: "Fecha de nacimiento", auth_major: "Carrera / Materia",
    auth_phone: "Telefono", auth_confirm_password: "Confirmar contrasena",
    auth_creating: "Creando cuenta...", auth_already_have: "Ya tienes cuenta?",
    auth_reset_title: "Restablecer contrasena",
    auth_reset_subtitle: "Ingresa tu correo y te enviaremos un enlace.",
    auth_send_reset: "Enviar enlace", auth_sending: "Enviando...",
    auth_back_to_signin: "Volver a iniciar sesion",

    page_dashboard_title: "Panel", page_dashboard_subtitle: "Tu centro de estudio.",
    page_dashboard_greeting_morning: "Buenos dias",
    page_dashboard_greeting_afternoon: "Buenas tardes",
    page_dashboard_greeting_evening: "Buenas noches",
    page_dashboard_today_sessions: "Sesiones de hoy",
    page_dashboard_total_sessions: "Sesiones totales",
    page_dashboard_focus_time: "Tiempo de concentracion",
    page_dashboard_documents: "Documentos",
    page_dashboard_today_schedule: "Horario de hoy",
    page_dashboard_quick_actions: "Acciones rapidas",
    page_dashboard_recent_docs: "Documentos recientes",
    page_dashboard_no_schedule: "Nada programado hoy",
    page_dashboard_no_docs: "Sin documentos aun",

    page_forest_title: "Mi Bosque",
    page_forest_subtitle: "Cada sesion completada hace crecer un arbol.",
    page_forest_planted: "Arboles plantados", page_forest_focus_time: "Tiempo de enfoque",
    page_forest_streak: "Racha actual", page_forest_abandoned: "Abandonadas",
    page_forest_empty: "Tu bosque esta vacio",
    page_forest_empty_sub: "Completa una sesion Pomodoro para plantar tu primer arbol.",
    page_forest_total: "arboles en total",

    page_pomodoro_title: "Pomodoro",
    page_pomodoro_subtitle: "Planta un arbol. Mantente enfocado. Haz crecer tu bosque.",
    page_pomodoro_focus: "Enfoque", page_pomodoro_break: "Descanso",
    page_pomodoro_start: "Iniciar", page_pomodoro_pause: "Pausar",
    page_pomodoro_reset: "Reiniciar", page_pomodoro_plant: "Plantar e Iniciar",
    page_pomodoro_resume: "Reanudar", page_pomodoro_session_label: "Etiqueta de sesion",
    page_pomodoro_my_forest: "Mi Bosque",

    page_documents_title: "Documentos",
    page_documents_subtitle: "Sube tus materiales — tu asistente los usara.",
    page_documents_drop: "Suelta un archivo o haz clic para buscar",
    page_documents_accept: "PDF, DOCX o TXT · max 20 MB",
    page_documents_no_docs: "Sin documentos aun",
    page_documents_uploading: "Subiendo",

    page_profile_personal: "Informacion personal",
    page_profile_password: "Cambiar contrasena",
    page_profile_account: "Cuenta", page_profile_signout: "Cerrar sesion",
    page_profile_signout_msg: "Cerrar sesion terminara tu sesion actual.",
    page_profile_avatar: "Elegir avatar",

    btn_save: "Guardar cambios", btn_saving: "Guardando...", btn_cancel: "Cancelar",
    btn_delete: "Eliminar", btn_upload: "Subir", btn_send: "Enviar",
    btn_start: "Iniciar", btn_pause: "Pausar", btn_reset: "Reiniciar",
    btn_view_all: "Ver todo", btn_open_timetable: "Abrir horario",
    btn_start_session: "Iniciar sesion",

    guest_welcome: "Bienvenido a FocusNest",
    guest_description: "Inicia sesion para acceso completo o continua como invitado.",
    guest_signin: "Iniciar sesion para acceso completo",
    guest_create: "Crear una cuenta",
    guest_continue: "Continuar como invitado",
    logout_confirm: "Estas seguro de que quieres cerrar sesion?", logout_yes: "Si, cerrar sesion",
    ph_email: "tu@ejemplo.com", ph_password: "........", ph_search: "Buscar...",
    ph_what_studying: "Que estas estudiando?", ph_ask_docs: "Pregunta sobre tus documentos...",
  },

  de: {
    nav_dashboard: "Dashboard", nav_pomodoro: "Pomodoro",
    nav_timetable: "Stundenplan", nav_progress: "Fortschritt",
    nav_forest: "Wald", nav_assistant: "Assistent",
    nav_flashcards: "Karteikarten", nav_documents: "Dokumente",
    nav_profile: "Profil", nav_logout: "Abmelden",
    nav_login: "Anmelden", nav_signup: "Registrieren", nav_about: "Uber uns",

    auth_welcome_back: "Willkommen zuruck",
    auth_subtitle_login: "Melde dich bei deinem FocusNest-Konto an",
    auth_email: "E-Mail", auth_password: "Passwort",
    auth_forgot: "Passwort vergessen?", auth_sign_in: "Anmelden",
    auth_signing_in: "Anmeldung...", auth_no_account: "Kein Konto?",
    auth_create_one: "Erstelle eines", auth_create_account: "Konto erstellen",
    auth_subtitle_signup: "Beginne deinen Fokuswald aufzubauen",
    auth_first_name: "Vorname", auth_last_name: "Nachname",
    auth_dob: "Geburtsdatum", auth_major: "Studienfach",
    auth_phone: "Telefon", auth_confirm_password: "Passwort bestatigen",
    auth_creating: "Konto wird erstellt...", auth_already_have: "Bereits ein Konto?",
    auth_reset_title: "Passwort zurucksetzen",
    auth_reset_subtitle: "Gib deine E-Mail ein und wir senden dir einen Link.",
    auth_send_reset: "Link senden", auth_sending: "Senden...",
    auth_back_to_signin: "Zuruck zur Anmeldung",

    page_dashboard_title: "Dashboard", page_dashboard_subtitle: "Dein Lernzentrum.",
    page_dashboard_greeting_morning: "Guten Morgen",
    page_dashboard_greeting_afternoon: "Guten Tag",
    page_dashboard_greeting_evening: "Guten Abend",
    page_dashboard_today_sessions: "Heutige Sitzungen",
    page_dashboard_total_sessions: "Sitzungen gesamt",
    page_dashboard_focus_time: "Fokuszeit",
    page_dashboard_documents: "Dokumente",
    page_dashboard_today_schedule: "Heutiger Zeitplan",
    page_dashboard_quick_actions: "Schnellaktionen",
    page_dashboard_recent_docs: "Neueste Dokumente",
    page_dashboard_no_schedule: "Heute nichts geplant",
    page_dashboard_no_docs: "Noch keine Dokumente",

    page_forest_title: "Mein Wald",
    page_forest_subtitle: "Jede abgeschlossene Fokussitzung lasst einen Baum wachsen.",
    page_forest_planted: "Gepflanzte Baume", page_forest_focus_time: "Fokuszeit",
    page_forest_streak: "Aktuelle Serie", page_forest_abandoned: "Abgebrochen",
    page_forest_empty: "Dein Wald ist leer",
    page_forest_empty_sub: "Schliesse eine Pomodoro-Sitzung ab, um deinen ersten Baum zu pflanzen.",
    page_forest_total: "Baume insgesamt",

    page_pomodoro_title: "Pomodoro",
    page_pomodoro_subtitle: "Pflanze einen Baum. Bleibe fokussiert. Lass deinen Wald wachsen.",
    page_pomodoro_focus: "Fokus", page_pomodoro_break: "Pause",
    page_pomodoro_start: "Start", page_pomodoro_pause: "Pause",
    page_pomodoro_reset: "Zurucksetzen", page_pomodoro_plant: "Pflanzen & Starten",
    page_pomodoro_resume: "Fortsetzen", page_pomodoro_session_label: "Sitzungsbezeichnung",
    page_pomodoro_my_forest: "Mein Wald",

    page_documents_title: "Dokumente",
    page_documents_subtitle: "Lade Lernmaterialien hoch — dein Assistent wird sie verwenden.",
    page_documents_drop: "Datei ablegen oder zum Durchsuchen klicken",
    page_documents_accept: "PDF, DOCX oder TXT · max. 20 MB",
    page_documents_no_docs: "Noch keine Dokumente",
    page_documents_uploading: "Hochladen",

    page_profile_personal: "Personliche Informationen",
    page_profile_password: "Passwort andern",
    page_profile_account: "Konto", page_profile_signout: "Abmelden",
    page_profile_signout_msg: "Das Abmelden beendet deine aktuelle Sitzung.",
    page_profile_avatar: "Avatar wahlen",

    btn_save: "Anderungen speichern", btn_saving: "Speichern...", btn_cancel: "Abbrechen",
    btn_delete: "Loschen", btn_upload: "Hochladen", btn_send: "Senden",
    btn_start: "Starten", btn_pause: "Pausieren", btn_reset: "Zurucksetzen",
    btn_view_all: "Alle anzeigen", btn_open_timetable: "Stundenplan offnen",
    btn_start_session: "Sitzung starten",

    guest_welcome: "Willkommen bei FocusNest",
    guest_description: "Melde dich fur vollen Zugriff an oder fahre als Gast fort.",
    guest_signin: "Anmelden fur vollen Zugriff",
    guest_create: "Konto erstellen",
    guest_continue: "Als Gast fortfahren",
    logout_confirm: "Bist du sicher, dass du dich abmelden mochtest?", logout_yes: "Ja, abmelden",
    ph_email: "du@beispiel.de", ph_password: "........", ph_search: "Suchen...",
    ph_what_studying: "Was lernst du?", ph_ask_docs: "Frag nach deinen Dokumenten...",
  },
};

const STORAGE_KEY = "focusnest_lang";
type LanguageContextType = { lang: Lang; t: Translations; setLang: (l: Lang) => void; };
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    const validLangs: Lang[] = ["en", "fr", "ar", "es", "de"];
    if (saved && validLangs.includes(saved)) { applyLang(saved); setLangState(saved); }
  }, []);

  function applyLang(l: Lang) {
    document.documentElement.setAttribute("lang", l);
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
  }

  function setLang(l: Lang) {
    setLangState(l); applyLang(l); localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LanguageContext.Provider value={{ lang, t: T[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
