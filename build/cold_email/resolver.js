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
exports.coldemailResolver = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.coldemailResolver = {
    Query: {
        getColdEmails: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield prisma.coldEmail.findMany();
        }),
        getColdEmailByUserId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { userId } = args;
            return yield prisma.coldEmail.findMany({
                where: { userId: userId },
            });
        }),
        getColdEmailById: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = args;
            return yield prisma.coldEmail.findUnique({
                where: { id: id },
            });
        })
    },
};
