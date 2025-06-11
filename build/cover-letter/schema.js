"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coverletterschema = void 0;
exports.coverletterschema = `#graphql

type Coverletter{
    id:String!
    fileUrl: String!
    data: String
    userId:String
}

type Query{
    getCoverletter: [Coverletter]
    getCoverletterByUserId(userId:String!): [Coverletter]
    getCoverletterById(id:String!): Coverletter    
}


type Mutation{
    createCoverletter(userId:String , fileUrl:String!):Coverletter!
}
`;
