export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}
