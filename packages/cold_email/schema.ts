export const coldemailschema=`#graphql

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
`