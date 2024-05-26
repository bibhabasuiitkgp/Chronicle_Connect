import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'


// export const userRouter = new Hono();
export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
		JWT_SECRET: string
	}
}>();

blogRouter.use("/*", async (c, next) => {
	// get the header and verify
	//if correct then return true else return false
	const header = c.req.header('Authorization');
	if (header) {
		const response = await verify(header, c.env.JWT_SECRET)
		if (response.id) {
			c.set("userId", response.id);
			await next();
		}
	}
	return c.text('unauthorized')
})


blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const blog = await prisma.post.findMany();
	return c.json(blog);
})


blogRouter.get('/:id', async (c) => {
	const id = await c.req.param('id')
	console.log(id);
	try {
		const prisma = new PrismaClient({
			datasourceUrl: c.env?.DATABASE_URL,
		}).$extends(withAccelerate());
		const blog = await prisma.post.findFirst({
			where: {
				id: id
			}
		})
		return c.json(blog)
	} catch (e) {
		console.log(e);
		return c.text('error');
	}
})

blogRouter.post('/', async (c) => {
	try {
		const body = await c.req.json();
		const autherId = c.get("userId");
		const prisma = new PrismaClient({
			datasourceUrl: c.env?.DATABASE_URL,
		}).$extends(withAccelerate());

		const blog = await prisma.post.create({
			data: {
				title: body.title,
				content: body.content,
				authorId: autherId
			}
		})

		return c.json({ id: autherId });
	} catch (e) {
		console.log(e);
		return c.text('error');
	}
})

blogRouter.put('/', async (c) => {
	try {
		const body = await c.req.json();
		const prisma = new PrismaClient({
			datasourceUrl: c.env?.DATABASE_URL,
		}).$extends(withAccelerate());

		const blog = await prisma.post.update({
			where: {
				id: body.id
			},
			data: {
				title: body.title,
				content: body.content,
				authorId: body.authorId
			}
		})

		return c.json({ id: blog.id });
	} catch (e) {
		console.log(e);
		return c.text('error');
	}

})



















