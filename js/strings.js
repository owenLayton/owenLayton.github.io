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
    pageTitle: 'Owen Layton - Software Engineeer',
    photoAlt: 'Owen Layton',
    name: 'Owen Layton',
    tagline: 'Software Engineer &amp; Game Developer',
    introParagraph: 'Welcome to my portfolio! I\'m a game developer passionate about creating engaging interactive experiences. Browse my professional and personal projects, or get in touch to collaborate.',
    viewGames: 'View My Games',
    getInTouch: 'Get In Touch',

    sectionTitle: 'About Me',
    bio: [
      'I like to make games.',
      '\n','\n','\n','\n','\n','\n','\n','\n',
      '\n','\n','\n','\n','\n','\n','\n','\n',
      'Oh, you wanted more?',
      'I\'ve worked on two shipped mobile titles as a Unity Developer, taking responsibility in small teams to deliver the best possible products, leaning deep into UI systems and optimisation. While I prefer frontend work, full-stack is my playground and I am completely comfortable with and capable of writing end-to-end features, architecting key areas of the game, and working cross-team with all levels of designers and artists.',
      'I have a deep understanding of monetisation in freemium games, building retention features, and ensuring high quality of life for the players.',
      'When I have a few days available, I also like to design new ideas for games or when I really have time (and am not burned out enough to be creatively bankrupt) I like to participate in game jams! When I am burned out, I like to think about participating in game jams.',
      'Among all the other buzzwords you undoubtedly want to read here, I prefer to write in C#, and I\'m more than capable on Javascript and Node.js, though honestly I prefer statically typed languages and think Typescript would be a suitable move for me. I\'m also learning C++ and Unreal Engine in my own time, because I want to work more on console and PC.',
      'Outside of work, I like to play games. Board games such as Heat, where I hold the personal record among my friends of "coming third one time", or Catan where I have been told "Please stop, you\'ve already won".',
      'I enjoy card games such as Pokémon TCG, where I have been told "I love your company but I hate your decks", and my all-time favourite Star Realms, where I am oft-quoted saying "Please stop, you\'ve already won".',
      'I also enjoy wargaming, from 4X games such as Civilisation (V for streamlined experience, 6 for micromanagement and Switch gaming on the move), to tabletop games like Warhammer 40,000, where I represent the 10,000 Bananas, or Custodes as they prefer to be called. While I\'m still learning to be better at 40k, I often get helpful comments from the staff at my local gaming store, including "Please stop, it\'s closing time and you\'ve already lost".',
      'If you crack the code I have hidden on this website, please contact me with a job offer (Hint, it has something to do with how I like making games). Now I must bid you adieu, I have to go look for that damn fourth chaos emerald.' 
    ],

    glanceTitle: 'At a Glance',
    highlights: [
      { title: 'Engines &amp; Tools', text: 'Unity' },
      { title: 'Languages', text: 'C#, JavaScript, Java, C++' },
      { title: 'Disciplines', text: 'UI programming, systems design, tools development, prototyping' },
      { title: 'Interests', text: 'Yes' },
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
    welcomeGreeting: 'Welcome, adventurer! Choose your path, or let fate decide...\n I\'m AI generated for now, expect updates to come soon.',
    randomAdventureBtn: 'Surprise Me!',
  },
};
