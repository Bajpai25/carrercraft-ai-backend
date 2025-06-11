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
exports.userResolver = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.userResolver = {
    Query: {
        getUser: () => __awaiter(void 0, void 0, void 0, function* () {
            const users = yield prisma.user.findMany();
            return users;
        }),
        getUserbyId: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = args;
            const user = yield prisma.user.findUnique({
                where: { id: id }
            });
            return user;
        })
    },
    Mutation: {
        createUser: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { firstName, lastName, email, password } = args.input;
            try {
                const newUser = yield prisma.user.create({
                    data: {
                        firstName, lastName, email, password
                    }
                });
                return newUser;
            }
            catch (err) {
                console.error(err);
            }
        }),
        loginUser: (_parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { email, password } = args.input;
            try {
                const user = yield prisma.user.findUnique({
                    where: { email },
                });
                if (!user || user.password !== password) {
                    throw new Error("Invalid credentials");
                }
                return user;
            }
            catch (err) {
                console.error(err);
                throw new Error("Login failed");
            }
        }),
    },
};
