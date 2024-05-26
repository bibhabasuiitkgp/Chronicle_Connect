import {Hono} from 'hono'; 
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign,verify } from 'hono/jwt'
import z from "zod"
import {signupInput} from "@bibhabasucvsc/medium_validation"


// const signupInput = z.object({
// 	email: z.string().email(),
// 	password: z.string().min(6)
// })


// export const userRouter = new Hono();
export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
		JWT_SECRET: string
	}
}>();

userRouter.post('/signup', async (c) => {  // POST /api/v1/signup
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	

	const body = await c.req.json();  // { email: string, password: string }
	const {success} = signupInput.safeParse(await c.req.json());
	if(!success) {
		c.status(403);
		return c.json({ error: "invalid input" });
	}
	try { 
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);  	// initializing JWT
		return c.json({ jwt });
	} catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})

userRouter.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})