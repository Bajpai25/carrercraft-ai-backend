import { PrismaClient } from "@prisma/client";


const prisma =new PrismaClient();



export const CoverResolver={
    Query:{
        getCoverletter:async()=>{
            const Coverletters=await prisma.coverLetter.findMany();
            return Coverletters;
        },
        getCoverletterByUserId:async(_parent:any , args:{userId:string})=>{
            const {userId}=args;
            const coverletter=await prisma.coverLetter.findMany({
                where:{userId}
            })
            return coverletter;
        },
        getCoverletterById:async(_parent :any , args:{id:string})=>{
            const {id}=args;
            const coverletter=await prisma.coverLetter.findUnique({
                where:{id:id}
            })
            return coverletter;
        }
    },
    Mutation:{
        createCoverletter:async(_parent:any , args:{
            fileUrl: string , userId:string , 
        })=>{
            const {fileUrl, userId}=args;
            
        }
    }
}