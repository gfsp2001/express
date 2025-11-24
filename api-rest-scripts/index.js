import app from "./app.js";
import { config } from 'dotenv'
import bodyParser from "body-parser";
import cors from "cors";
import scripts_routes from "./routes/script.routes.js";

config()

async function main() {

    try {
        var port = process.env.PORT_BACK;
        app.listen(port)
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        app.use(bodyParser.json({ limit: '50mb', extended: true }));
        app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

        app.use('/api', scripts_routes);

        console.info("server is running on port " + port);
        
    } catch (error) {
        throw new Error('No se ha podido ejecutar el servidor')
    }

}

main()