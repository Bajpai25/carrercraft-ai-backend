"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobschema = void 0;
exports.jobschema = `#graphql

type Job{
    id: String!
    url: String!
    title: String
    userId:String
    company: String
    description:String
    location: String
    type: String
}

type Query{
    getJobs:[Job]
    getJobbyUserId(userId:String!): [Job]
    getJobbyId(id:String!): Job
}

type Mutation{
    uploadJob(url:String! , userId:String , type:String):Job!
}


`;
