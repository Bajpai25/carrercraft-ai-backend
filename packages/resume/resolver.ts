import { Prisma, PrismaClient } from "@prisma/client";
import cloudinary from "../cloudinary";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";


const prisma = new PrismaClient();

interface UploadArgs {
  filePDF: Promise<FileUpload>;
  userId: string;
}

export const resumeResolver = {
  Query: {
    getResume: async () => {
      const resumes = await prisma.resume.findMany();
      return resumes;
    },
    getResumeByUserId: async (_parent: any, args: { userId: string }) => {
      const { userId } = args;
      const resumes = await prisma.resume.findMany({
        where: { userId },
      });
      return resumes;
    },
    getResumeById: async (_parent: any, args: { id: string }) => {
      const { id } = args;
      const resume = await prisma.resume.findUnique({
        where: { id },
      });
      return resume;
    }
  },
  
  Upload: GraphQLUpload, // Add the Upload scalar
  Mutation: {
    uploadResume: async (_parent: any, args: UploadArgs) => {
      const { filePDF, userId } = args;
      try {
        if (!filePDF || !userId) {
          throw new Error("File URL && UserID is required!");
        }

        // Wait for file to resolve
        const uploadedFile = await filePDF;

        const { createReadStream, filename, mimetype } = uploadedFile;

        console.log("File details:", uploadedFile);
        console.log(`Uploading file: ${filename} for user: ${userId}`);

        // Ensure the file is a PDF
        if (mimetype !== "application/pdf") {
          throw new Error("Only PDF files are allowed!");
        }

        // Upload PDF directly to Cloudinary
        const uploadedResponse = await new Promise((resolve, reject) => {
          const cloudStream = cloudinary.uploader.upload_stream(
            { folder: "resumes", resource_type: "raw" },
            (error, result) => {
              if (error) return reject(error);
              return resolve(result);
            }
          );

          createReadStream().pipe(cloudStream);
        });

        if (uploadedResponse) {
          // Save file URL in database
          const resume = await prisma.resume.create({
            data: {
              fileUrl: (uploadedResponse as any).secure_url, // Extract Cloudinary URL
              userId
            },
          });

          return resume;
        } else {
          throw new Error("There was a problem in uploading the resume");
        }
      } catch (err) {
        console.error("Upload error:", err);
        throw new Error("Failed to upload the resume");
      }
    },
  },
};
