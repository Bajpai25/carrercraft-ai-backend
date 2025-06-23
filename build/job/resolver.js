"use strict";
// import { PrismaClient } from "@prisma/client";
// // import { get } from "http";
// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import { executablePath } from "puppeteer";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobResolver = void 0;
// puppeteer.use(StealthPlugin());
// const prisma = new PrismaClient();
// export const jobResolver = {
//   Query: {
//     getJobs: async () => {
//       return await prisma.job.findMany();
//     },
//     getJobbyUserId: async (_parent: any, args: { userId: string }) => {
//       const { userId } = args;
//       return await prisma.job.findMany({
//         where: { userId },
//       });
//     },
//     getJobbyId: async (_parent: any, args: { id: string }) => {   
//       const { id } = args;
//       return await prisma.job.findUnique({
//         where: { id },
//       });
//     } 
//   },
//   Mutation: {
//     uploadJob: async (_parent: any, args: { url: string, userId: string , type:string }) => {
//       const { url, userId ,type} = args;
//     // scrape the job data
//       const browser = await puppeteer.launch({
//         headless: true,
//         executablePath: executablePath(),
//         args: [
//     "--no-sandbox",
//     "--disable-setuid-sandbox",
//     "--disable-blink-features=AutomationControlled",
//     "--start-maximized"
//   ],
//       });
//       // for scraping the greenhouse job data
//       // if(type==="greenhouse"){
//       //   const page = await browser.newPage();
//       //   await page.goto(url, { waitUntil: "load", timeout: 60000 });
//       //   // Wait for the selectors to load before scraping
//       //   await page.waitForSelector(".app-title", { timeout: 60000 });
//       //   await page.waitForSelector(".location", { timeout: 60000 });
//       //   // Scrape job data
//       //   const job_data = await page.evaluate(() => {
//       //     const title = document.querySelector(".app-title")?.textContent || "No title found";
//       //     const description = document.querySelector("#content")?.textContent || "No description found";
//       //     const location = document.querySelector(".location")?.textContent || "No location found";
//       //     const company = document.querySelector(".company-name")?.textContent || "No company found";
//       //     return {
//       //       title,
//       //       description,
//       //       location,
//       //       company,
//       //     };
//       //   });
//       //   // Store the new job data in the database
//       //   const newJob = await prisma.job.create({
//       //     data: {
//       //       url,
//       //       title: job_data.title,
//       //       description: job_data.description,
//       //       location: job_data.location,
//       //       company: job_data.company,
//       //       userId,
//       //       type
//       //     },
//       //   });
//       //   await browser.close();
//       //   return newJob; // Ensure we return the job after scraping
//       // }
//       if (type === "greenhouse") {
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: "load", timeout: 60000 });
//   // Scrape job data directly (skip waiting for specific selectors)
//   const job_data = await page.evaluate(() => {
//     const getText = (selector: string) => {
//       const element = document.querySelector(selector);
//       return element?.textContent?.trim() || "Not found";
//     };
//     const title = getText(".app-title");
//     const description = getText("#content");
//     const location = getText(".location");
//     const company = getText(".company-name");
//     return { title, description, location, company };
//   });
//   // Store the new job data in the database
//   const newJob = await prisma.job.create({
//     data: {
//       url,
//       title: job_data.title,
//       description: job_data.description,
//       location: job_data.location,
//       company: job_data.company,
//       userId,
//       type
//     },
//   });
//   await browser.close();
//   return newJob;
// }
//  if(type==="workday") {
//     const page = await browser.newPage();
//         await page.goto(url, { waitUntil: "load", timeout: 60000 });
//     // Extracting data using selectors or XPath
//   // Wait for the job posting content to load
//   await page.waitForSelector('h2[data-automation-id="jobPostingHeader"]');
//   // Scraping job details
//   const jobDetails = await page.evaluate(() => {
//       const jobTitle = document.querySelector('h2[data-automation-id="jobPostingHeader"]')?.textContent || 'N/A';
//       const location = document.querySelector('div[data-automation-id="locations"]')?.textContent || 'N/A';
//       const description = document.querySelector('div[data-automation-id="jobPostingDescription"]')?.textContent|| 'N/A';
//       return {
//           jobTitle,
//           location,
//           description
//       };
//   });
//   // Store the new job data in the database
//   const newJob = await prisma.job.create({
//     data: {
//       url,
//       title: jobDetails.jobTitle,
//       description: jobDetails.description,
//       location: jobDetails.location,
//       userId,
//       type
//     },
//   });
//   await browser.close();
// return newJob;
// }
// if(type==="jobslever") {
//     const page = await browser.newPage();
//         await page.goto(url, { waitUntil: "load", timeout: 60000 });
//     // Extracting data using selectors or XPath
//   // Wait for the job posting content to load
//   await page.waitForSelector('.posting-headline');
//   // Scraping job details
//   const jobDetails = await page.evaluate(() => {
//       const jobTitle = document.querySelector('.posting-headline h2')?.textContent || 'N/A';
//       const location = document.querySelector('.posting-category.location')?.textContent || 'N/A';
//       const description = document.querySelector('div[data-qa="job-description"]')?.textContent|| 'N/A';
//       const company=document.querySelector('a.main-header-logo img')?.getAttribute('alt')||'N/A'
//       return {
//           jobTitle,
//           location,
//           description,
//           company
//       };
//   });
//   // Store the new job data in the database
//   const newJob = await prisma.job.create({
//     data: {
//       url,
//       title: jobDetails.jobTitle,
//       description: jobDetails.description,
//       location: jobDetails.location,
//       company:jobDetails.company,
//       userId,
//       type
//     },
//   });
//   await browser.close();
// return newJob;
// }
// if (type === "keka") {
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: "load", timeout: 60000 });
//   // Wait for essential elements
//   await page.waitForSelector("h1.kch-text-heading", { timeout: 60000 });
//   const jobDetails = await page.evaluate(() => {
//     const jobTitle =
//       document.querySelector("h1.kch-text-heading")?.textContent?.trim() ||
//       "No title found";
//     const location =
//       document.querySelector(".ki-location")?.parentElement?.textContent
//         ?.replace("location_on", "")
//         .trim() || "No location found";
//     const description =
//       document.querySelector(".job-description-container")?.textContent?.trim() ||
//       "No description found";
//     const company =
//       document.querySelector(".navbar-brand span")?.textContent?.trim() ||
//       "No company found";
//     return {
//       jobTitle,
//       location,
//       description,
//       company,
//     };
//   });
//   const newJob = await prisma.job.create({
//     data: {
//       url,
//       title: jobDetails.jobTitle,
//       description: jobDetails.description,
//       location: jobDetails.location,
//       company: jobDetails.company,
//       userId,
//       type,
//     },
//   });
//   await browser.close();
//   return newJob;
// }
// // scrape the jobsvite website
// if(type==='jobsvite'){
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: "load", timeout: 60000 });
// // Extracting data using selectors or XPath
// // Wait for the job posting content to load
// await page.waitForSelector('.jv-header');
// // Scraping job details
// const jobDetails = await page.evaluate(() => {
//     const jobTitle = document.querySelector('.jv-header')?.textContent?.trim() || 'N/A';
//     const location = document.querySelector('.jv-job-detail-meta')?.textContent?.trim() || 'N/A';
//     const description = document.querySelector('.jv-job-detail-description')?.textContent?.trim() || 'N/A';
//     const company = document.querySelector('.jv-logo a')?.textContent?.trim() || 'N/A';
//     return { jobTitle, location, description, company };
// });
// // Store the new job data in the database
// const newJob = await prisma.job.create({
// data: {
// url,
// title: jobDetails.jobTitle,
// description: jobDetails.description,
// location: jobDetails.location,
// company:jobDetails.company,
// userId,
// type
// },
// });
// await browser.close();
// return newJob;
// }
//     },
//   },
// };
// this is the prev new  playwright code 
// import { PrismaClient } from "@prisma/client";
// import { chromium } from "playwright";
// const prisma = new PrismaClient();
// export const jobResolver = {
//   Query: {
//     getJobs: async () => {
//       return await prisma.job.findMany();
//     },
//     getJobbyUserId: async (_parent:any, args: { userId: string }) => {
//       const { userId } = args;
//       return await prisma.job.findMany({ where: { userId } });
//     },
//     getJobbyId: async (_parent:any, args: { id: string }) => {
//       const { id } = args;
//       return await prisma.job.findUnique({ where: { id } });
//     },
//   },
//   Mutation: {
//     uploadJob: async (_parent:any, args: { url: string; userId: string; type: string }) => {
//       const { url, userId, type } = args;
//       const browser = await chromium.launch({ headless: true });
//       const page = await browser.newPage();
//       await page.goto(url, { waitUntil: "networkidle" });
//       if (type === "greenhouse") {
//         const title = await page.locator(".app-title").textContent();
//         const description = await page.locator("#content").textContent();
//         const location = await page.locator(".location").textContent();
//         const company = await page.locator(".company-name").textContent();
//         const newJob = await prisma.job.create({
//           data: {
//             url,
//             title: title?.trim() || "Not found",
//             description: description?.trim() || "Not found",
//             location: location?.trim() || "Not found",
//             company: company?.trim() || "Not found",
//             userId,
//             type,
//           },
//         });
//         await browser.close();
//         return newJob;
//       }
//       if (type === "workday") {
//         await page.waitForSelector('h2[data-automation-id="jobPostingHeader"]');
//         const jobTitle = await page.locator('h2[data-automation-id="jobPostingHeader"]').textContent();
//         const locationLocators = page.locator('div[data-automation-id="locations"]');
//         const count = await locationLocators.count();
//         let location = "N/A";
//         for (let i = 0; i < count; i++) {
//           const text = (await locationLocators.nth(i).textContent())?.trim();
//           if (text) {
//             location = text;
//             break;
//           }
//         }
//         const description = await page.locator('div[data-automation-id="jobPostingDescription"]').textContent();
//         const newJob = await prisma.job.create({
//           data: {
//             url,
//             title: jobTitle?.trim() || "N/A",
//             description: description?.trim() || "N/A",
//             location,
//             userId,
//             type,
//           },
//         });
//         await browser.close();
//         return newJob;
//       }
//       if (type === "jobslever") {
//         await page.waitForSelector(".posting-headline");
//         const jobTitle = await page.locator(".posting-headline h2").textContent();
//         const location = await page.locator(".posting-category.location").textContent();
//         const description = await page.locator("div[data-qa='job-description']").textContent();
//         const company = await page.locator("a.main-header-logo img").getAttribute("alt");
//         const newJob = await prisma.job.create({
//           data: {
//             url,
//             title: jobTitle?.trim() || "N/A",
//             description: description?.trim() || "N/A",
//             location: location?.trim() || "N/A",
//             company: company?.trim() || "N/A",
//             userId,
//             type,
//           },
//         });
//         await browser.close();
//         return newJob;
//       }
//       if (type === "keka") {
//         await page.waitForSelector("h1.kch-text-heading");
//         const jobTitle = await page.locator("h1.kch-text-heading").textContent();
//         const locationRaw = await page.locator(".ki-location").locator("xpath=..")?.textContent();
//         const location = locationRaw?.replace("location_on", "").trim() || "No location found";
//         const description = await page.locator(".job-description-container").textContent();
//         const company = await page.locator(".navbar-brand span").textContent();
//         const newJob = await prisma.job.create({
//           data: {
//             url,
//             title: jobTitle?.trim() || "N/A",
//             description: description?.trim() || "N/A",
//             location,
//             company: company?.trim() || "N/A",
//             userId,
//             type,
//           },
//         });
//         await browser.close();
//         return newJob;
//       }
//       if (type === "jobsvite") {
//         await page.waitForSelector(".jv-header");
//         const jobTitle = await page.locator(".jv-header").textContent();
//         const location = await page.locator(".jv-job-detail-meta").textContent();
//         const description = await page.locator(".jv-job-detail-description").textContent();
//         const company = await page.locator(".jv-logo a").textContent();
//         const newJob = await prisma.job.create({
//           data: {
//             url,
//             title: jobTitle?.trim() || "N/A",
//             description: description?.trim() || "N/A",
//             location: location?.trim() || "N/A",
//             company: company?.trim() || "N/A",
//             userId,
//             type,
//           },
//         });
//         await browser.close();
//         return newJob;
//       }
//       await browser.close();
//       throw new Error("Unsupported job board type.");
//     },
//   },
// };
const client_1 = require("@prisma/client");
const playwright_1 = require("playwright");
const prisma = new client_1.PrismaClient();
function getFirstNonEmptyText(page, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const locators = page.locator(selector);
        const count = yield locators.count();
        for (let i = 0; i < count; i++) {
            const text = (_a = (yield locators.nth(i).textContent())) === null || _a === void 0 ? void 0 : _a.trim();
            if (text)
                return text;
        }
        return "Not found";
    });
}
exports.jobResolver = {
    Query: {
        getJobs: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield prisma.job.findMany();
        }),
        getJobbyUserId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { userId } = args;
            return yield prisma.job.findMany({ where: { userId } });
        }),
        getJobbyId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = args;
            return yield prisma.job.findUnique({ where: { id } });
        }),
    },
    Mutation: {
        uploadJob: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { url, userId, type } = args;
            const browser = yield playwright_1.chromium.launch({ headless: true });
            const page = yield browser.newPage();
            yield page.goto(url, { waitUntil: "networkidle" });
            if (type === "greenhouse") {
                const title = yield getFirstNonEmptyText(page, ".app-title");
                const description = yield getFirstNonEmptyText(page, "#content");
                const location = yield getFirstNonEmptyText(page, ".location");
                const company = yield getFirstNonEmptyText(page, ".company-name");
                const newJob = yield prisma.job.create({
                    data: { url, title, description, location, company, userId, type },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "workday") {
                yield page.waitForSelector('h2[data-automation-id="jobPostingHeader"]');
                const jobTitle = yield getFirstNonEmptyText(page, 'h2[data-automation-id="jobPostingHeader"]');
                const location = yield getFirstNonEmptyText(page, 'div[data-automation-id="locations"]');
                const description = yield getFirstNonEmptyText(page, 'div[data-automation-id="jobPostingDescription"]');
                const newJob = yield prisma.job.create({
                    data: { url, title: jobTitle, description, location, userId, type },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "jobslever") {
                yield page.waitForSelector(".posting-headline");
                const jobTitle = yield getFirstNonEmptyText(page, ".posting-headline h2");
                const location = yield getFirstNonEmptyText(page, ".posting-category.location");
                const description = yield getFirstNonEmptyText(page, "div[data-qa='job-description']");
                const company = (yield page.locator("a.main-header-logo img").getAttribute("alt")) || "N/A";
                const newJob = yield prisma.job.create({
                    data: { url, title: jobTitle, description, location, company, userId, type },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "keka") {
                yield page.waitForSelector("h1.kch-text-heading");
                const jobTitle = yield getFirstNonEmptyText(page, "h1.kch-text-heading");
                const locationRaw = yield getFirstNonEmptyText(page, ".ki-location");
                const location = locationRaw.replace("location_on", "").trim() || "No location found";
                const description = yield getFirstNonEmptyText(page, ".job-description-container");
                const company = yield getFirstNonEmptyText(page, ".navbar-brand span");
                const newJob = yield prisma.job.create({
                    data: { url, title: jobTitle, description, location, company, userId, type },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "jobsvite") {
                yield page.waitForSelector(".jv-header");
                const jobTitle = yield getFirstNonEmptyText(page, ".jv-header");
                const location = yield getFirstNonEmptyText(page, ".jv-job-detail-meta");
                const description = yield getFirstNonEmptyText(page, ".jv-job-detail-description");
                const company = yield getFirstNonEmptyText(page, ".jv-logo a");
                const newJob = yield prisma.job.create({
                    data: { url, title: jobTitle, description, location, company, userId, type },
                });
                yield browser.close();
                return newJob;
            }
            yield browser.close();
            throw new Error("Unsupported job board type.");
        }),
    },
};
