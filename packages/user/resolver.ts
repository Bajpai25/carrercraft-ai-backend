import { Prisma, PrismaClient } from "@prisma/client";


const prisma=new PrismaClient();

export const userResolver = {
    Query: {
      getUser:async()=>{
        const users=await prisma.user.findMany();
        return users;
      },
      getUserbyId:async (_parent:any , args:{id:string})=>{
        const {id}=args;
        const user=await prisma.user.findUnique({
          where:{id:id}
        })
        return user;
      }
      
    },
    Mutation: {
      createUser:async (_parent: any, args: { input: { firstName: string; lastName: string; email: string; password:string } }) => {
        const { firstName, lastName, email,password } = args.input;
      try{
        const newUser=await prisma.user.create({
            data:{
                firstName,lastName,email,password
            }
        })
        return newUser
      }
      catch(err){
        console.error(err);
      }
      },
      loginUser: async (
      _parent: any,
      args: { input: { email: string; password: string } }
    ) => {
      const { email, password } = args.input;
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || user.password !== password) {
          throw new Error("Invalid credentials");
        }

        return user;
      } catch (err) {
        console.error(err);
        throw new Error("Login failed");
      }
    },
    },
  };
  