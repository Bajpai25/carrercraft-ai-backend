export const userschema = `#graphql

type Query {
  getUser:[User]
  getUserbyId(id: String!): User
}

input CreateUserInput {
  firstName: String!
  lastName: String!
  email: String!
  password: String!
}
input LoginUserInput {
  email: String!  
  password: String!
}

type User {
  id: String!
  firstName: String!
  lastName: String!
  email: String!
  password: String!
}

type Mutation {
  createUser(input: CreateUserInput): User
  loginUser(input:LoginUserInput): User
}
`;
