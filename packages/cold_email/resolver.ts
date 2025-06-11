import { Prisma, PrismaClient } from "@prisma/client";

const prisma=new PrismaClient();


export const  coldemailResolver= {
Query:{
    getColdEmails: async () => {
      return await prisma.coldEmail.findMany();
    },
    getColdEmailByUserId: async (_parent: any, args: { userId: string }) => {
      const { userId } = args;
      return await prisma.coldEmail.findMany({
        where: { userId:userId },
      });
    },
    getColdEmailById: async (_parent: any, args: { id: string }) => {
      const { id } = args;
      return await prisma.coldEmail.findUnique({
        where: { id:id },
      });
    }
  },

  
}