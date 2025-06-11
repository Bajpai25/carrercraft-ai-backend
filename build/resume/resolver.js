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
exports.resumeResolver = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("../cloudinary"));
const graphql_upload_ts_1 = require("graphql-upload-ts");
const prisma = new client_1.PrismaClient();
exports.resumeResolver = {
    Query: {
        getResume: () => __awaiter(void 0, void 0, void 0, function* () {
            const resumes = yield prisma.resume.findMany();
            return resumes;
        }),
        getResumeByUserId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { userId } = args;
            const resumes = yield prisma.resume.findMany({
                where: { userId },
            });
            return resumes;
        }),
        getResumeById: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = args;
            const resume = yield prisma.resume.findUnique({
                where: { id },
            });
            return resume;
        })
    },
    Upload: graphql_upload_ts_1.GraphQLUpload, // Add the Upload scalar
    Mutation: {
        uploadResume: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { filePDF, userId } = args;
            try {
                if (!filePDF || !userId) {
                    throw new Error("File URL && UserID is required!");
                }
                // Wait for file to resolve
                const uploadedFile = yield filePDF;
                const { createReadStream, filename, mimetype } = uploadedFile;
                console.log("File details:", uploadedFile);
                console.log(`Uploading file: ${filename} for user: ${userId}`);
                // Ensure the file is a PDF
                if (mimetype !== "application/pdf") {
                    throw new Error("Only PDF files are allowed!");
                }
                // Upload PDF directly to Cloudinary
                const uploadedResponse = yield new Promise((resolve, reject) => {
                    const cloudStream = cloudinary_1.default.uploader.upload_stream({ folder: "resumes", resource_type: "raw" }, (error, result) => {
                        if (error)
                            return reject(error);
                        return resolve(result);
                    });
                    createReadStream().pipe(cloudStream);
                });
                if (uploadedResponse) {
                    // Save file URL in database
                    const resume = yield prisma.resume.create({
                        data: {
                            fileUrl: uploadedResponse.secure_url, // Extract Cloudinary URL
                            userId
                        },
                    });
                    return resume;
                }
                else {
                    throw new Error("There was a problem in uploading the resume");
                }
            }
            catch (err) {
                console.error("Upload error:", err);
                throw new Error("Failed to upload the resume");
            }
        }),
    },
};
