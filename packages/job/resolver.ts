import { PrismaClient } from "@prisma/client";
import { get } from "http";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());
const prisma = new PrismaClient();

export const jobResolver = {
  Query: {
    getJobs: async () => {
      return await prisma.job.findMany();
    },
    getJobbyUserId: async (_parent: any, args: { userId: string }) => {
      const { userId } = args;
      return await prisma.job.findMany({
        where: { userId },
      });
    },
    getJobbyId: async (_parent: any, args: { id: string }) => {   
      const { id } = args;
      return await prisma.job.findUnique({
        where: { id },
      });
    } 
  },
  
  Mutation: {
    uploadJob: async (_parent: any, args: { url: string, userId: string , type:string }) => {
      const { url, userId ,type} = args;


    // scrape the job data
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
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
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 60000 });

  // Scrape job data directly (skip waiting for specific selectors)
  const job_data = await page.evaluate(() => {
    const getText = (selector: string) => {
      const element = document.querySelector(selector);
      return element?.textContent?.trim() || "Not found";
    };

    const title = getText(".app-title");
    const description = getText("#content");
    const location = getText(".location");
    const company = getText(".company-name");

    return { title, description, location, company };
  });

  // Store the new job data in the database
  const newJob = await prisma.job.create({
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

  await browser.close();
  return newJob;
}

 if(type==="workday") {
    const page = await browser.newPage();
        await page.goto(url, { waitUntil: "load", timeout: 60000 });
    // Extracting data using selectors or XPath

  
  // Wait for the job posting content to load
  await page.waitForSelector('h2[data-automation-id="jobPostingHeader"]');

  // Scraping job details
  const jobDetails = await page.evaluate(() => {
      const jobTitle = document.querySelector('h2[data-automation-id="jobPostingHeader"]')?.textContent || 'N/A';
      const location = document.querySelector('div[data-automation-id="locations"]')?.textContent || 'N/A';
      const description = document.querySelector('div[data-automation-id="jobPostingDescription"]')?.textContent|| 'N/A';

      return {
          jobTitle,
          location,
          description
      };
  });

  

  // Store the new job data in the database
  const newJob = await prisma.job.create({
    data: {
      url,
      title: jobDetails.jobTitle,
      description: jobDetails.description,
      location: jobDetails.location,
      userId,
      type
    },
  });
  await browser.close();
return newJob;
}
if(type==="jobslever") {
    const page = await browser.newPage();
        await page.goto(url, { waitUntil: "load", timeout: 60000 });
    // Extracting data using selectors or XPath

  
  // Wait for the job posting content to load
  await page.waitForSelector('.posting-headline');

  // Scraping job details
  const jobDetails = await page.evaluate(() => {
      const jobTitle = document.querySelector('.posting-headline h2')?.textContent || 'N/A';
      const location = document.querySelector('.posting-category.location')?.textContent || 'N/A';
      const description = document.querySelector('div[data-qa="job-description"]')?.textContent|| 'N/A';
      const company=document.querySelector('a.main-header-logo img')?.getAttribute('alt')||'N/A'

      return {
          jobTitle,
          location,
          description,
          company
      };
  });

  

  // Store the new job data in the database
  const newJob = await prisma.job.create({
    data: {
      url,
      title: jobDetails.jobTitle,
      description: jobDetails.description,
      location: jobDetails.location,
      company:jobDetails.company,
      userId,
      type
    },
  });
  await browser.close();
return newJob;
}
if (type === "keka") {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 60000 });

  // Wait for essential elements
  await page.waitForSelector("h1.kch-text-heading", { timeout: 60000 });

  const jobDetails = await page.evaluate(() => {
    const jobTitle =
      document.querySelector("h1.kch-text-heading")?.textContent?.trim() ||
      "No title found";

    const location =
      document.querySelector(".ki-location")?.parentElement?.textContent
        ?.replace("location_on", "")
        .trim() || "No location found";

    const description =
      document.querySelector(".job-description-container")?.textContent?.trim() ||
      "No description found";

    const company =
      document.querySelector(".navbar-brand span")?.textContent?.trim() ||
      "No company found";

    return {
      jobTitle,
      location,
      description,
      company,
    };
  });

  const newJob = await prisma.job.create({
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

  await browser.close();
  return newJob;
}


// scrape the jobsvite website

if(type==='jobsvite'){
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
// Extracting data using selectors or XPath


// Wait for the job posting content to load
await page.waitForSelector('.jv-header');

// Scraping job details
const jobDetails = await page.evaluate(() => {
    const jobTitle = document.querySelector('.jv-header')?.textContent?.trim() || 'N/A';
    const location = document.querySelector('.jv-job-detail-meta')?.textContent?.trim() || 'N/A';
    const description = document.querySelector('.jv-job-detail-description')?.textContent?.trim() || 'N/A';
    const company = document.querySelector('.jv-logo a')?.textContent?.trim() || 'N/A';

    return { jobTitle, location, description, company };
});


// Store the new job data in the database
const newJob = await prisma.job.create({
data: {
url,
title: jobDetails.jobTitle,
description: jobDetails.description,
location: jobDetails.location,
company:jobDetails.company,
userId,
type
},
});
await browser.close();
return newJob;

}
      
    },
  },
};
