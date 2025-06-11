"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeschema = void 0;
exports.resumeschema = `#graphql
scalar Upload
scalar JSON

type Resume{
    id: String!
    fileUrl: String!
    resume_data: JSON
}

type Query{
    getResume:[Resume]
    getResumeByUserId(userId:String!): [Resume]
    getResumeById(id:String!): Resume
}


type Mutation{
    uploadResume(filePDF:Upload!,userId:String!):Resume!
}

`;
