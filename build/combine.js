"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const user_1 = require("./user");
const user_2 = require("./user");
const resume_1 = require("./resume");
const resume_2 = require("./resume");
const cover_letter_1 = require("./cover-letter");
const cover_letter_2 = require("./cover-letter");
const job_1 = require("./job");
const job_2 = require("./job");
const resolver_1 = require("./cold_email/resolver");
const schema_1 = require("./cold_email/schema");
const ats_1 = require("./ats");
const schema_2 = require("./ats/schema");
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `${user_1.userschema}${resume_2.resumeschema}${cover_letter_2.coverletterschema}${job_2.jobschema}${schema_1.coldemailschema}${schema_2.atsschema}`;
exports.resolvers = {
    Query: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, user_2.userResolver.Query), resume_1.resumeResolver.Query), cover_letter_1.CoverResolver.Query), job_1.jobResolver.Query), resolver_1.coldemailResolver.Query),
    Mutation: Object.assign(Object.assign(Object.assign(Object.assign({}, user_2.userResolver.Mutation), cover_letter_1.CoverResolver.Mutation), job_1.jobResolver.Mutation), ats_1.atsresolver.Mutation)
};
