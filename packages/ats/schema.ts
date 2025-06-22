export const atsschema=`#graphql


type ATSResult {
  id: String!
  resumeId: String!
  resume: Resume!
  score: Int!
  atsResultData: JSON
  Issues: String
  missingSkills: [String]
  createdAt: String!
  userId: String!
  user: User!
  suggestions: String
}



type RunATSOutput {
  id: String!
  score: Int!
  missingSkills:[String]
  Issues: String
  atsResultData: JSON
  suggestions: String
  userId: String!
  resumeId: String!
}

type Mutation {
  runATSAnalysis(resumeId:String!,userId:String!): RunATSOutput!
}

`