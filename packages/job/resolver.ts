
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";

const prisma = new PrismaClient();

async function getFirstNonEmptyText(page:any, selector:any) {
  const locators = page.locator(selector);
  const count = await locators.count();
  for (let i = 0; i < count; i++) {
    const text = (await locators.nth(i).textContent())?.trim();
    if (text) return text;
  }
  return "Not found";
}

export const jobResolver = {
  Query: {
    getJobs: async () => {
      return await prisma.job.findMany();
    },
    getJobbyUserId: async (_parent:any, args: { userId: string }) => {
      const { userId } = args;
      return await prisma.job.findMany({ where: { userId } });
    },
    getJobbyId: async (_parent:any, args: { id: string }) => {
      const { id } = args;
      return await prisma.job.findUnique({ where: { id } });
    },
  },

  Mutation: {
    uploadJob: async (_parent:any, args: { url: string; userId: string; type: string }) => {
      const { url, userId, type } = args;

      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      if (type === "greenhouse") {
        const title = await getFirstNonEmptyText(page, ".app-title");
        const description = await getFirstNonEmptyText(page, "#content");
        const location = await getFirstNonEmptyText(page, ".location");
        const company = await getFirstNonEmptyText(page, ".company-name");

        const newJob = await prisma.job.create({
          data: { url, title, description, location, company, userId, type },
        });

        await browser.close();
        return newJob;
      }

      if (type === "workday") {
        await page.waitForSelector('h2[data-automation-id="jobPostingHeader"]');
        const jobTitle = await getFirstNonEmptyText(page, 'h2[data-automation-id="jobPostingHeader"]');
        const location = await getFirstNonEmptyText(page, 'div[data-automation-id="locations"]');
        const description = await getFirstNonEmptyText(page, 'div[data-automation-id="jobPostingDescription"]');

        const newJob = await prisma.job.create({
          data: { url, title: jobTitle, description, location, userId, type },
        });

        await browser.close();
        return newJob;
      }

      if (type === "jobslever") {
        await page.waitForSelector(".posting-headline");
        const jobTitle = await getFirstNonEmptyText(page, ".posting-headline h2");
        const location = await getFirstNonEmptyText(page, ".posting-category.location");
        const description = await getFirstNonEmptyText(page, "div[data-qa='job-description']");
        const company = await page.locator("a.main-header-logo img").getAttribute("alt") || "N/A";

        const newJob = await prisma.job.create({
          data: { url, title: jobTitle, description, location, company, userId, type },
        });

        await browser.close();
        return newJob;
      }

      if (type === "keka") {
        await page.waitForSelector("h1.kch-text-heading");
        const jobTitle = await getFirstNonEmptyText(page, "h1.kch-text-heading");
        const locationRaw = await getFirstNonEmptyText(page, ".ki-location");
        const location = locationRaw.replace("location_on", "").trim() || "No location found";
        const description = await getFirstNonEmptyText(page, ".job-description-container");
        const company = await getFirstNonEmptyText(page, ".navbar-brand span");

        const newJob = await prisma.job.create({
          data: { url, title: jobTitle, description, location, company, userId, type },
        });

        await browser.close();
        return newJob;
      }

      if (type === "jobsvite") {
        await page.waitForSelector(".jv-header");
        const jobTitle = await getFirstNonEmptyText(page, ".jv-header");
        const location = await getFirstNonEmptyText(page, ".jv-job-detail-meta");
        const description = await getFirstNonEmptyText(page, ".jv-job-detail-description");
        const company = await getFirstNonEmptyText(page, ".jv-logo a");

        const newJob = await prisma.job.create({
          data: { url, title: jobTitle, description, location, company, userId, type },
        });

        await browser.close();
        return newJob;
      }

      await browser.close();
      throw new Error("Unsupported job board type.");
    },
  },
};

