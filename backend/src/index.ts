import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign,verify } from 'hono/jwt'
import {userRouter} from './routes/user'
import {blogRouter} from './routes/blog'



// Create the main Hono app
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
		JWT_SECRET: string
	}
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);


//middlewware
app.use('/api/v1/blog/*', async (c, next) => {
	// get the header and verify
	//if correct then return true else return false
	const header = c.req.header('Authorization');
	if (header) {
		const response = await verify(header, c.env.JWT_SECRET)
		if (response.id) {
			return next();
		}
		else {
			c.status(401);
			return c.json({ error: "Unauthorized" });
		}
	}
	// await next()
  })

  
export default app;
