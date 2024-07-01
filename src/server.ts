import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { checkUserProfile } from "./utils";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const allowedOrigins = ["http://localhost:3000", "https://www.btckeys.io"];
const corsOptions = {
    origin: function (origin: any, callback: any) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow credentials (cookies, etc.) to be sent
  };
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())


function validate(req: Request, res: Response, next: NextFunction) {
    try {
        // const { id, token } = req.query as any;
        // if (!id || !token) {
        //     return res.status(404).send("Not found");
        // }
        // checkUserProfile(id, token);
        next();
    } catch (e) {
        return res.status(500).send("Error");
    }
}

app.use(validate);

app.get("/staked/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const nfts = await prisma.nFT.findMany({
            where: {
                userId: id
            }
        })
        return res.status(200).json(nfts.map((n: any) => ({...n, stakeTime: n.stakeTime.toString()})));
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error");
    }
})

const collectionAddress = ""; // update this
app.post("/stake/:id", async (req, res) => {
    try {
        const { nfts } = req.body;
        const { id } = req.params;
        let user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id
                }
            })
        }
        await prisma.nFT.createMany({
            data: nfts.map((n: any) => ({
                mint: n.mint, 
                name: n.name, 
                image: n.image, 
                collection: n.collectionAddress, 
                userId: id, 
                stakeTime: BigInt(Date.now()),
                stakePoints: n.stakePoints
            }))
        });
        return res.status(200).send("Success");
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error");
    }
});

app.post("/unstake/:id", async (req, res) => {
    try {
        const { nfts } = req.body;
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id
            },
        });
        if (!user) return res.status(404).send("Not found");
        const addresses = nfts.map((n: any) => n.mint);
        await prisma.nFT.updateMany({
            where: {
                userId: id,
                mint: {
                    in: addresses
                }
            },
            data: {
                userId: null
            }
        });
        return res.status(200).send("Success");
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error");
    }
});


app.post("/claim", async (req, res) => {
    try {
        // not sure how to implement this
        return res.status(200).json({});
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error");
    }
})

const PORT = process.env.PORT || 3005;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });