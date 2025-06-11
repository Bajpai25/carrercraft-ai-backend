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
exports.CoverResolver = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.CoverResolver = {
    Query: {
        getCoverletter: () => __awaiter(void 0, void 0, void 0, function* () {
            const Coverletters = yield prisma.coverLetter.findMany();
            return Coverletters;
        }),
        getCoverletterByUserId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { userId } = args;
            const coverletter = yield prisma.coverLetter.findMany({
                where: { userId }
            });
            return coverletter;
        }),
        getCoverletterById: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = args;
            const coverletter = yield prisma.coverLetter.findUnique({
                where: { id: id }
            });
            return coverletter;
        })
    },
    Mutation: {
        createCoverletter: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { fileUrl, userId } = args;
        })
    }
};
