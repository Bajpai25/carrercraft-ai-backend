"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coldemailschema = void 0;
exports.coldemailschema = `#graphql

type ColdEmail{
    id: String!
    fileUrl: String!
    data: String
    userId: String
}

type Query{
    getColdEmails: [ColdEmail]
    getColdEmailByUserId(userId: String!): [ColdEmail]
    getColdEmailById(id: String!): ColdEmail    
}
`;
