import { LabItem, Project } from "@/types";

export type Language = "fr" | "en";

type LanguageParam = string | string[] | undefined;

export function getLanguage(language: LanguageParam): Language {
  if (Array.isArray(language)) {
    return language[0] === "fr" ? "fr" : "en";
  }
  return language === "fr" ? "fr" : "en";
}

export function withLanguage(path: string, language: Language) {
  return `${path}?lang=${language}`;
}

export const uiCopy = {
  en: {
    navHome: "Home",
    navProjects: "Projects",
    navLab: "Lab",
    heroRole: "UI/UX Designer & Front-End Developer",
    heroTitle: "Hi, I'm Hugo Dimitrijevic.",
    heroAccent: "I design and build adaptive digital experiences.",
    heroDescription:
      "UI/UX Designer and Front-End Developer, I combine design thinking with implementation to create user-centered interfaces. I'm currently completing a Master in Transition numérique et Codesign at CNAM Paris and working in apprenticeship at GRDF, with a strong focus on generative AI, Adaptive UI, and design systems.",
    ctaProjects: "View Projects",
    ctaLab: "Explore the Lab →",
    selectedWork: "Selected Work",
    allProjects: "All projects →",
    labSubtitle: "Interactive experiments & mini-tools",
    allExperiments: "All experiments →",
    projectsIntro: "A curated selection of design and front-end work.",
    labIntro:
      "Interactive experiments, mini-tools and front-end playgrounds. Each project is self-contained and ready to explore.",
    backToProjects: "← Back to Projects",
    backToLab: "← Back to Lab",
    projectSummary: "Project Summary",
    role: "Role",
    year: "Year",
    problem: "The Problem",
    process: "The Process",
    solution: "The Solution",
    impact: "The Impact",
    liveDemo: "Live Demo →",
    comingSoon: "Interactive experience coming soon",
    comingSoonDescription:
      "This mini-project is being built. Drop in a React component here to make it interactive.",
    footerRole: "UI/UX Designer",
  },
  fr: {
    navHome: "Accueil",
    navProjects: "Projets",
    navLab: "Lab",
    heroRole: "Designer UI/UX & Développeur Front-End",
    heroTitle: "Salut, moi c'est Hugo Dimitrijevic.",
    heroAccent: "Je conçois et développe des expériences digitales adaptatives.",
    heroDescription:
      "Designer UI/UX et développeur Front-End, je combine réflexion design et implémentation pour créer des interfaces centrées utilisateur. Je termine actuellement un Master en Transition numérique et Codesign au CNAM Paris et je suis en alternance chez GRDF, avec un fort intérêt pour l'IA générative, l'Adaptive UI et les design systems.",
    ctaProjects: "Voir les projets",
    ctaLab: "Explorer le Lab →",
    selectedWork: "Sélection de projets",
    allProjects: "Tous les projets →",
    labSubtitle: "Expériences interactives & mini-outils",
    allExperiments: "Toutes les expériences →",
    projectsIntro: "Une sélection de projets design et front-end.",
    labIntro:
      "Expériences interactives, mini-outils et playgrounds front-end. Chaque projet est autonome et prêt à être exploré.",
    backToProjects: "← Retour aux projets",
    backToLab: "← Retour au Lab",
    projectSummary: "Résumé du projet",
    role: "Rôle",
    year: "Année",
    problem: "Le problème",
    process: "Le processus",
    solution: "La solution",
    impact: "L'impact",
    liveDemo: "Démo live →",
    comingSoon: "Expérience interactive bientôt disponible",
    comingSoonDescription:
      "Ce mini-projet est en cours de développement. Ajoutez un composant React ici pour le rendre interactif.",
    footerRole: "Designer UI/UX",
  },
} as const;

type LocalizedProjectFields = Pick<Project, "description" | "role" | "problem" | "process" | "solution" | "impact">;

const projectCopy: Record<string, Record<Language, LocalizedProjectFields>> = {
  "application-sirse-grdf": {
    en: {
      description: "Redesign and creation of interfaces for the internal SIRSE application as part of my apprenticeship.",
      role: "UI/UX Designer & Front-End Developer",
      problem:
        "The SIRSE application needed clearer and more consistent interfaces to improve the experience for internal users.",
      process: "UX audit of the existing product, Figma mockup design, then front-end integration of the new interfaces.",
      solution:
        "Implemented streamlined user flows and modernized screens aligned with business needs and field usage.",
      impact: "Improved tool readability and smoother usage for internal teams.",
    },
    fr: {
      description: "Refonte et création d'interfaces pour l'application interne SIRSE dans le cadre de mon alternance.",
      role: "Designer UI/UX & Développeur Front-End",
      problem:
        "L'application SIRSE nécessitait des interfaces plus claires et cohérentes pour améliorer l'expérience des utilisateurs internes.",
      process: "Audit UX de l'existant, conception de maquettes sur Figma, puis intégration front-end des nouvelles interfaces.",
      solution:
        "Mise en place de parcours rationalisés et d'écrans modernisés, alignés avec les besoins métiers et les usages terrain.",
      impact: "Amélioration de la lisibilité de l'outil et meilleure fluidité d'usage pour les équipes internes.",
    },
  },
  "ia-generatives-images-prouesse-controverse": {
    en: {
      description:
        "Design of an interactive website in Figma exploring the creative and ethical impacts of generative image AI.",
      role: "UI/UX Designer & Researcher",
      problem:
        "The debate around generative AI remains complex, with a need for educational mediation between innovation, usage, and ethics.",
      process:
        "Desk research, UX framing, content structuring, then interactive prototyping in Figma as part of my Master's program at CNAM.",
      solution:
        "Created an interactive web experience that puts opportunities, limitations, and controversies of AI image generation into perspective.",
      impact:
        "Produced an educational support that helps students and designers better understand generative AI challenges.",
    },
    fr: {
      description: "Conception d'un site web interactif sur Figma explorant les impacts créatifs et éthiques de l'IA générative d'images.",
      role: "UI/UX Designer & Chercheur",
      problem:
        "Le débat autour de l'IA générative reste complexe, avec un besoin de médiation pédagogique entre innovation, usages et enjeux éthiques.",
      process:
        "Recherche documentaire, cadrage UX, structuration des contenus, puis prototypage interactif sur Figma dans le cadre du Master au CNAM.",
      solution:
        "Création d'une expérience web interactive qui met en perspective opportunités, limites et controverses liées à la génération d'images par IA.",
      impact:
        "Production d'un support de sensibilisation favorisant la compréhension des enjeux de l'IA générative auprès d'un public étudiant et design.",
    },
  },
  "programme-leader-seine-et-marne-attractivite": {
    en: {
      description: "Improvement of communication and information tools for the European LEADER program.",
      role: "Web Designer",
      problem:
        "Existing digital materials did not make information sufficiently accessible for project holders and local partners.",
      process:
        "Analyzed communication needs, proposed website redesign directions, then created visual assets adapted to target audiences.",
      solution:
        "Designed clearer and more attractive web content and interfaces focused on message clarity and program visibility.",
      impact: "Strengthened program visibility and improved perceived quality of information materials.",
    },
    fr: {
      description: "Amélioration des outils de communication et d'information du programme européen LEADER.",
      role: "Designer Web",
      problem:
        "Les supports numériques existants ne facilitaient pas suffisamment l'accès à l'information pour les porteurs de projets et partenaires locaux.",
      process:
        "Analyse des besoins de communication, proposition de pistes de refonte web, puis création de supports visuels adaptés aux publics cibles.",
      solution:
        "Conception de contenus et interfaces web plus lisibles et attractifs, orientés vers la clarté des messages et la valorisation du programme.",
      impact: "Renforcement de la visibilité du programme et amélioration de la qualité perçue des supports d'information.",
    },
  },
};

type LocalizedLabFields = Pick<LabItem, "description">;

const labCopy: Record<string, Record<Language, LocalizedLabFields>> = {
  "ascii-image-studio": {
    en: {
      description:
        "Advanced image-to-ASCII studio with visual tuning, custom character sets, animation controls, and export-ready rendering workflows.",
    },
    fr: {
      description:
        "Studio image-vers-ASCII avancé avec réglages visuels, jeux de caractères personnalisés, contrôles d'animation et workflows de rendu prêts à l'export.",
    },
  },
  "kanban-board": {
    en: {
      description:
        "Production-grade interactive board with drag-and-drop, card creation, priority badges, inline editing, and smooth state handling without external dependencies.",
    },
    fr: {
      description:
        "Tableau interactif de niveau production avec glisser-déposer, création de cartes, badges de priorité, édition en ligne et gestion d'état fluide sans dépendances externes.",
    },
  },
  "color-palette-generator": {
    en: {
      description: "Advanced palette studio with harmony modes, tuning controls, and design-ready color token export.",
    },
    fr: {
      description:
        "Studio de palettes avancé avec modes d'harmonie, réglages fins et export de tokens couleur prêts pour le design.",
    },
  },
  "css-animation-playground": {
    en: {
      description:
        "Advanced motion playground to design, tune, and preview CSS keyframe animations in real time with immediate visual feedback.",
    },
    fr: {
      description:
        "Playground motion avancé pour concevoir, ajuster et prévisualiser des animations CSS keyframes en temps réel avec retour visuel immédiat.",
    },
  },
  "typography-tester": {
    en: {
      description:
        "Design-focused typography workspace to evaluate font pairings, hierarchy scales, spacing rhythm, and line-heights directly in the browser.",
    },
    fr: {
      description:
        "Espace typographique orienté design pour évaluer associations de polices, échelles hiérarchiques, rythme d'espacement et interlignes directement dans le navigateur.",
    },
  },
  "pomodoro-timer": {
    en: {
      description:
        "Complete productivity timer with focus sessions, short and long breaks, session tracking, and clear interaction states for daily deep-work routines.",
    },
    fr: {
      description:
        "Un timer productivité complet avec sessions de concentration, pauses courtes et longues, suivi des sessions et états d'interaction clairs pour le travail en profondeur.",
    },
  },
  "markdown-previewer": {
    en: {
      description:
        "Developer-friendly writing studio with side-by-side Markdown editing, live HTML rendering, and a custom zero-dependency parser for precise output control.",
    },
    fr: {
      description:
        "Studio d'écriture orienté développeur avec édition Markdown côte à côte, rendu HTML en direct et parseur custom sans dépendance pour un contrôle précis du rendu.",
    },
  },
};

export function getLocalizedProject(project: Project, language: Language): Project {
  const copy = projectCopy[project.slug]?.[language];
  return copy ? { ...project, ...copy } : project;
}

export function getLocalizedLabItem(item: LabItem, language: Language): LabItem {
  const copy = labCopy[item.slug]?.[language];
  return copy ? { ...item, ...copy } : item;
}
