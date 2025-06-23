"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobResolver = void 0;
const client_1 = require("@prisma/client");
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const puppeteer_1 = require("puppeteer");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
const prisma = new client_1.PrismaClient();
exports.jobResolver = {
    Query: {
        getJobs: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield prisma.job.findMany();
        }),
        getJobbyUserId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { userId } = args;
            return yield prisma.job.findMany({
                where: { userId },
            });
        }),
        getJobbyId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = args;
            return yield prisma.job.findUnique({
                where: { id },
            });
        })
    },
    Mutation: {
        uploadJob: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { url, userId, type } = args;
            // scrape the job data
            const browser = yield puppeteer_extra_1.default.launch({
                headless: true,
                executablePath: (0, puppeteer_1.executablePath)(),
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--start-maximized"
                ],
            });
            // for scraping the greenhouse job data
            // if(type==="greenhouse"){
            //   const page = await browser.newPage();
            //   await page.goto(url, { waitUntil: "load", timeout: 60000 });
            //   // Wait for the selectors to load before scraping
            //   await page.waitForSelector(".app-title", { timeout: 60000 });
            //   await page.waitForSelector(".location", { timeout: 60000 });
            //   // Scrape job data
            //   const job_data = await page.evaluate(() => {
            //     const title = document.querySelector(".app-title")?.textContent || "No title found";
            //     const description = document.querySelector("#content")?.textContent || "No description found";
            //     const location = document.querySelector(".location")?.textContent || "No location found";
            //     const company = document.querySelector(".company-name")?.textContent || "No company found";
            //     return {
            //       title,
            //       description,
            //       location,
            //       company,
            //     };
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
            //   return newJob; // Ensure we return the job after scraping
            // }
            if (type === "greenhouse") {
                const page = yield browser.newPage();
                yield page.goto(url, { waitUntil: "load", timeout: 60000 });
                // Scrape job data directly (skip waiting for specific selectors)
                const job_data = yield page.evaluate(() => {
                    const getText = (selector) => {
                        var _a;
                        const element = document.querySelector(selector);
                        return ((_a = element === null || element === void 0 ? void 0 : element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "Not found";
                    };
                    const title = getText(".app-title");
                    const description = getText("#content");
                    const location = getText(".location");
                    const company = getText(".company-name");
                    return { title, description, location, company };
                });
                // Store the new job data in the database
                const newJob = yield prisma.job.create({
                    data: {
                        url,
                        title: job_data.title,
                        description: job_data.description,
                        location: job_data.location,
                        company: job_data.company,
                        userId,
                        type
                    },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "workday") {
                const page = yield browser.newPage();
                yield page.goto(url, { waitUntil: "load", timeout: 60000 });
                // Extracting data using selectors or XPath
                // Wait for the job posting content to load
                yield page.waitForSelector('h2[data-automation-id="jobPostingHeader"]');
                // Scraping job details
                const jobDetails = yield page.evaluate(() => {
                    var _a, _b, _c;
                    const jobTitle = ((_a = document.querySelector('h2[data-automation-id="jobPostingHeader"]')) === null || _a === void 0 ? void 0 : _a.textContent) || 'N/A';
                    const location = ((_b = document.querySelector('div[data-automation-id="locations"]')) === null || _b === void 0 ? void 0 : _b.textContent) || 'N/A';
                    const description = ((_c = document.querySelector('div[data-automation-id="jobPostingDescription"]')) === null || _c === void 0 ? void 0 : _c.textContent) || 'N/A';
                    return {
                        jobTitle,
                        location,
                        description
                    };
                });
                // Store the new job data in the database
                const newJob = yield prisma.job.create({
                    data: {
                        url,
                        title: jobDetails.jobTitle,
                        description: jobDetails.description,
                        location: jobDetails.location,
                        userId,
                        type
                    },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "jobslever") {
                const page = yield browser.newPage();
                yield page.goto(url, { waitUntil: "load", timeout: 60000 });
                // Extracting data using selectors or XPath
                // Wait for the job posting content to load
                yield page.waitForSelector('.posting-headline');
                // Scraping job details
                const jobDetails = yield page.evaluate(() => {
                    var _a, _b, _c, _d;
                    const jobTitle = ((_a = document.querySelector('.posting-headline h2')) === null || _a === void 0 ? void 0 : _a.textContent) || 'N/A';
                    const location = ((_b = document.querySelector('.posting-category.location')) === null || _b === void 0 ? void 0 : _b.textContent) || 'N/A';
                    const description = ((_c = document.querySelector('div[data-qa="job-description"]')) === null || _c === void 0 ? void 0 : _c.textContent) || 'N/A';
                    const company = ((_d = document.querySelector('a.main-header-logo img')) === null || _d === void 0 ? void 0 : _d.getAttribute('alt')) || 'N/A';
                    return {
                        jobTitle,
                        location,
                        description,
                        company
                    };
                });
                // Store the new job data in the database
                const newJob = yield prisma.job.create({
                    data: {
                        url,
                        title: jobDetails.jobTitle,
                        description: jobDetails.description,
                        location: jobDetails.location,
                        company: jobDetails.company,
                        userId,
                        type
                    },
                });
                yield browser.close();
                return newJob;
            }
            if (type === "keka") {
                const page = yield browser.newPage();
                yield page.goto(url, { waitUntil: "load", timeout: 60000 });
                // Wait for essential elements
                yield page.waitForSelector("h1.kch-text-heading", { timeout: 60000 });
                const jobDetails = yield page.evaluate(() => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    const jobTitle = ((_b = (_a = document.querySelector("h1.kch-text-heading")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) ||
                        "No title found";
                    const location = ((_e = (_d = (_c = document.querySelector(".ki-location")) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.replace("location_on", "").trim()) || "No location found";
                    const description = ((_g = (_f = document.querySelector(".job-description-container")) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) ||
                        "No description found";
                    const company = ((_j = (_h = document.querySelector(".navbar-brand span")) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.trim()) ||
                        "No company found";
                    return {
                        jobTitle,
                        location,
                        description,
                        company,
                    };
                });
                const newJob = yield prisma.job.create({
                    data: {
                        url,
                        title: jobDetails.jobTitle,
                        description: jobDetails.description,
                        location: jobDetails.location,
                        company: jobDetails.company,
                        userId,
                        type,
                    },
                });
                yield browser.close();
                return newJob;
            }
            // scrape the jobsvite website
            if (type === 'jobsvite') {
                const page = yield browser.newPage();
                yield page.goto(url, { waitUntil: "load", timeout: 60000 });
                // Extracting data using selectors or XPath
                // Wait for the job posting content to load
                yield page.waitForSelector('.jv-header');
                // Scraping job details
                const jobDetails = yield page.evaluate(() => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    const jobTitle = ((_b = (_a = document.querySelector('.jv-header')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || 'N/A';
                    const location = ((_d = (_c = document.querySelector('.jv-job-detail-meta')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || 'N/A';
                    const description = ((_f = (_e = document.querySelector('.jv-job-detail-description')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || 'N/A';
                    const company = ((_h = (_g = document.querySelector('.jv-logo a')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || 'N/A';
                    return { jobTitle, location, description, company };
                });
                // Store the new job data in the database
                const newJob = yield prisma.job.create({
                    data: {
                        url,
                        title: jobDetails.jobTitle,
                        description: jobDetails.description,
                        location: jobDetails.location,
                        company: jobDetails.company,
                        userId,
                        type
                    },
                });
                yield browser.close();
                return newJob;
            }
        }),
    },
};
