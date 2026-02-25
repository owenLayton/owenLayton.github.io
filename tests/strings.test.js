describe('STRINGS data integrity', () => {
  test('has all required top-level keys', () => {
    const requiredKeys = ['siteName', 'siteTitle', 'sidebar', 'about', 'resume', 'games', 'contact', 'notFound', 'chatbot'];
    for (const key of requiredKeys) {
      expect(STRINGS).toHaveProperty(key);
    }
  });

  describe('sidebar', () => {
    const s = STRINGS.sidebar;

    test('has all required properties', () => {
      expect(typeof s.header).toBe('string');
      expect(typeof s.aboutMe).toBe('string');
      expect(typeof s.games).toBe('string');
      expect(typeof s.resume).toBe('string');
      expect(typeof s.contact).toBe('string');
      expect(typeof s.categoryProfessional).toBe('string');
      expect(typeof s.categoryPersonal).toBe('string');
      expect(typeof s.hamburgerLabel).toBe('string');
    });
  });

  describe('about', () => {
    const s = STRINGS.about;

    test('has required string properties', () => {
      expect(typeof s.pageTitle).toBe('string');
      expect(typeof s.name).toBe('string');
      expect(typeof s.tagline).toBe('string');
      expect(typeof s.introParagraph).toBe('string');
      expect(typeof s.sectionTitle).toBe('string');
      expect(typeof s.glanceTitle).toBe('string');
      expect(typeof s.downloadCV).toBe('string');
    });

    test('bio is a non-empty array of strings', () => {
      expect(Array.isArray(s.bio)).toBe(true);
      expect(s.bio.length).toBeGreaterThan(0);
      s.bio.forEach(p => expect(typeof p).toBe('string'));
    });

    test('highlights is a non-empty array of {title, text}', () => {
      expect(Array.isArray(s.highlights)).toBe(true);
      expect(s.highlights.length).toBeGreaterThan(0);
      s.highlights.forEach(h => {
        expect(typeof h.title).toBe('string');
        expect(typeof h.text).toBe('string');
      });
    });
  });

  describe('resume', () => {
    const s = STRINGS.resume;

    test('has all required string properties', () => {
      expect(typeof s.pageTitle).toBe('string');
      expect(typeof s.heading).toBe('string');
      expect(typeof s.downloadCV).toBe('string');
    });
  });

  describe('games', () => {
    const s = STRINGS.games;

    test('has all required string properties', () => {
      expect(typeof s.pageTitle).toBe('string');
      expect(typeof s.heading).toBe('string');
      expect(typeof s.subheading).toBe('string');
      expect(typeof s.categoryProfessional).toBe('string');
      expect(typeof s.categoryPersonal).toBe('string');
      expect(typeof s.backLink).toBe('string');
      expect(typeof s.galleryTitle).toBe('string');
      expect(typeof s.videosTitle).toBe('string');
      expect(typeof s.metaRole).toBe('string');
      expect(typeof s.metaTools).toBe('string');
      expect(typeof s.metaPlatforms).toBe('string');
      expect(typeof s.notFoundTitle).toBe('string');
      expect(typeof s.notFoundMessage).toBe('string');
      expect(typeof s.notFoundButton).toBe('string');
    });

    test('template functions return correct strings', () => {
      expect(STRINGS.games.screenshotAlt('Foo')).toBe('Foo screenshot');
      expect(STRINGS.games.trailerTitle('Bar')).toBe('Bar trailer');
      expect(STRINGS.games.videoTitle('Baz')).toBe('Baz video');
    });
  });

  describe('contact', () => {
    test('has all required properties', () => {
      const s = STRINGS.contact;
      expect(typeof s.pageTitle).toBe('string');
      expect(typeof s.heading).toBe('string');
      expect(typeof s.subheading).toBe('string');
      expect(typeof s.labelName).toBe('string');
      expect(typeof s.labelEmail).toBe('string');
      expect(typeof s.labelMessage).toBe('string');
      expect(typeof s.submitButton).toBe('string');
      expect(typeof s.successMessage).toBe('string');
      expect(typeof s.errorMessage).toBe('string');
    });
  });

  describe('notFound', () => {
    test('has all required properties', () => {
      const s = STRINGS.notFound;
      expect(typeof s.pageTitle).toBe('string');
      expect(typeof s.code).toBe('string');
      expect(typeof s.heading).toBe('string');
      expect(typeof s.message).toBe('string');
      expect(typeof s.homeButton).toBe('string');
    });
  });

  describe('chatbot', () => {
    test('has all required properties', () => {
      const s = STRINGS.chatbot;
      expect(typeof s.title).toBe('string');
      expect(typeof s.loadError).toBe('string');
      expect(typeof s.chooseAdventure).toBe('string');
      expect(typeof s.restart).toBe('string');
      expect(typeof s.newAdventure).toBe('string');
      expect(typeof s.chooseAdventureBtn).toBe('string');
      expect(typeof s.welcomeGreeting).toBe('string');
      expect(typeof s.randomAdventureBtn).toBe('string');
    });
  });
});
