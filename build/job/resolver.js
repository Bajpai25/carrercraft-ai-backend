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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobResolver = void 0;
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
