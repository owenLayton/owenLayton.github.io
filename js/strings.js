/* ========================================
   Localised Strings
   All user-facing text in one place.
   Edit this file to update site content.
   ======================================== */

const STRINGS = {

  /* ---------- Global / Shared ---------- */
  siteName: 'Owen Layton',
  siteTitle: 'Owen Layton — Game Developer Portfolio',

  /* ---------- Sidebar ---------- */
  sidebar: {
    header: 'Owen Layton',
    aboutMe: '&#127968; About Me',
    games: '&#127918; Games',
    resume: '&#128196; Resume',
    contact: '&#9993; Contact',
    categoryProfessional: 'Professional',
    categoryPersonal: 'Personal',
    hamburgerLabel: 'Toggle navigation',
  },

  /* ---------- About / Home Page ---------- */
  about: {
    pageTitle: 'Owen Layton — Game Developer Portfolio',
    photoAlt: 'Owen Layton',
    name: 'Owen Layton',
    tagline: 'Game Developer &amp; Creative Technologist',
    introParagraph: 'Welcome to my portfolio! I\'m a game developer passionate about creating engaging interactive experiences. Browse my professional and personal projects, or get in touch to collaborate.',
    viewGames: 'View My Games',
    getInTouch: 'Get In Touch',

    sectionTitle: 'About Me',
    bio: [
      'I\'m a game developer with a passion for building interactive experiences that players remember. From concept to ship, I love the entire process of bringing ideas to life — designing systems, solving tricky technical problems, and polishing until it feels just right.',
      'I\'ve worked across professional studios and personal projects, gaining experience with a range of engines, tools, and team sizes. Whether it\'s gameplay programming, tools development, or prototyping something weird and experimental, I\'m happiest when I\'m building.',
      'Outside of game development, I enjoy tinkering with creative tech projects, exploring new frameworks, and finding the fun in every technical challenge. I\'m always open to interesting collaborations and new opportunities.',
    ],

    glanceTitle: 'At a Glance',
    highlights: [
      { title: 'Engines &amp; Tools', text: 'Unreal Engine, Unity, Godot, and custom tooling' },
      { title: 'Languages', text: 'C++, C#, Python, JavaScript, Blueprints' },
      { title: 'Disciplines', text: 'Gameplay programming, systems design, tools development, prototyping' },
      { title: 'Interests', text: 'Creative tech, procedural generation, interactive storytelling' },
    ],

    downloadCV: '&#11015; Download CV',
  },

  /* ---------- Resume Page ---------- */
  resume: {
    pageTitle: 'Resume — Owen Layton',
    heading: 'Resume',
    downloadCV: '&#11015; Download CV',
  },

  /* ---------- Games Page ---------- */
  games: {
    pageTitle: 'Games — Owen Layton',
    heading: 'My Games',
    subheading: 'A collection of professional and personal game projects I\'ve worked on.',
    backLink: '&larr; Back to all games',
    galleryTitle: 'Gallery',
    videosTitle: 'Videos',
    metaRole: 'Role:',
    metaTools: 'Tools:',
    metaPlatforms: 'Platforms:',
    notFoundTitle: 'Game Not Found',
    notFoundMessage: 'Sorry, that game doesn\'t exist.',
    categoryProfessional: 'Professional',
    categoryPersonal: 'Personal',
    notFoundButton: 'Back to Games',
    screenshotAlt: (title) => `${title} screenshot`,
    trailerTitle: (title) => `${title} trailer`,
    videoTitle: (title) => `${title} video`,
  },

  /* ---------- Contact Page ---------- */
  contact: {
    pageTitle: 'Contact — Owen Layton',
    heading: 'Get In Touch',
    subheading: 'Have a question, want to collaborate, or just want to say hi? Send me a message!',
    labelName: 'Name',
    labelEmail: 'Email',
    labelMessage: 'Message',
    placeholderName: 'Your name',
    placeholderEmail: 'your@email.com',
    placeholderMessage: 'What\'s on your mind?',
    submitButton: 'Send Message &#10148;',
    successMessage: 'Message sent! I\'ll get back to you soon.',
    errorMessage: 'Something went wrong. Please try emailing me directly.',
  },

  /* ---------- 404 Page ---------- */
  notFound: {
    pageTitle: '404 — Page Not Found',
    code: '404',
    heading: 'Page Not Found',
    message: 'Looks like you\'ve wandered into uncharted territory.',
    homeButton: 'Country Roads Take Me Home',
  },

  /* ---------- Chatbot ---------- */
  chatbot: {
    title: 'Adventure Bot',
    loadError: 'Adventure data could not be loaded.',
    chooseAdventure: 'Choose your next adventure:',
    restart: 'Restart',
    newAdventure: 'New Adventure',
    chooseAdventureBtn: 'Choose Adventure',
    welcomeGreeting: 'Welcome, adventurer! Choose your path, or let fate decide...',
    randomAdventureBtn: 'Surprise Me!',
  },
};
