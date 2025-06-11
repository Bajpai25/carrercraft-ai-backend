export const coverletterschema=`#graphql

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
`