import { Application } from "oak";
import mainRouter from "./routes/mainRouter.ts";

const app = new Application();
app.use(mainRouter.routes());
// app.use(mainRouter.allowedMethods());

await app.listen({ port: 8000 });
