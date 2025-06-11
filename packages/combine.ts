
import { userschema } from "./user";
import { userResolver } from "./user";
import { resumeResolver } from "./resume";
import { resumeschema } from "./resume";
import { CoverResolver } from "./cover-letter";
import { coverletterschema } from "./cover-letter";
import { jobResolver } from "./job";
import { jobschema } from "./job";
import { coldemailResolver } from "./cold_email/resolver";
import { coldemailschema } from "./cold_email/schema";

import { gql } from "apollo-server-express";


export const typeDefs=gql`${userschema}${resumeschema}${coverletterschema}${jobschema}${coldemailschema}`;


export const resolvers={
    Query:{
        ...userResolver.Query,
        ...resumeResolver.Query,
        ...CoverResolver.Query,
        ...jobResolver.Query,
        ...coldemailResolver.Query
    },
    Mutation:{
        ...userResolver.Mutation,
        ...resumeResolver.Mutation,
        ...CoverResolver.Mutation,
        ...jobResolver.Mutation,
       
    }
}