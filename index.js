import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
import connectDB from './config/db.js';
import nodemailer from 'nodemailer';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { userRouter } from './routes/userRoutes.js';
import { InvoiceRouter } from './routes/invoiceRoutes.js';
import { ClientRouter } from './routes/clientRoutes.js';
import { ProfileRouter } from './routes/profileRouter.js';
import errorHandler from "./middleware/errorHandler.js";
import { logger,logEvents } from "./middleware/logger.js";
import pdfTemplate from './documents/index.js';
import emailTemplate from './documents/email.js';
import pdf from 'html-pdf';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


connectDB();
app.use(logger);
app.use(cors());

app.use(express.json({ limit: '30mb', extended: true}));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser())

const PORT = process.env.PORT || 4000;

app.use('/', express.static(path.join(__dirname, 'public')))
app.use("/users",userRouter);
app.use("/clients",ClientRouter);
app.use("/profiles",ProfileRouter);
app.use("/invoices",InvoiceRouter);

app.all('*',(req,res)=>{
  res.status(404)
  if(req.accepts('html')){
      res.sendFile(path.join(__dirname,'views','404.html'))
  } else if (req.accepts('json')){
      res.json({message:'404 Not Found'})
  } else {
      res.type('txt').send('404 Not Found')
  }
})

app.use(errorHandler);

let options = { format: 'A4'};

app.post('/send-pdf',async (req, res) => {
    const { email, company } = req.body;
  
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
  
      const mail = {
        from: `billing-web-app <no-reply@billing-web-app.com>`, // sender address
        to: `${email}`, // list of receivers
        replyTo: `${company.email}`,
        subject: `Invoice from ${
          company.businessName ? company.businessName : company.name
        }`, // Subject line
        text: `Invoice from ${
          company.businessName ? company.businessName : company.name
        }`, // plain text body
        html: emailTemplate(req.body), // html body
        attachments: [
          {
            filename: 'invoice.pdf',
            path: `${__dirname}/invoice.pdf`,
          },
        ],
      };
      transporter.sendMail(mail, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Mail has been sent', info.response);
          res.status(200).json({ message: 'Mail has been sent successfully' });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
);

  app.post('/create-pdf', (req, res) => {
    pdf.create(pdfTemplate(req.body), {}).toFile('invoice.pdf', (err) => {
      if (err) {
        res.send(Promise.reject());
      } else {
        res.send(Promise.resolve());
      }
    });
  }
);

  app.get('/fetch-pdf', (req, res) => {
    res.sendFile(`${__dirname}/invoice.pdf`);
  }
);

mongoose.connection.once('open',()=> {
    console.log('Connected to mongoDB');
    app.listen(PORT, () => console.log("Server is running on:", PORT));
})

mongoose.connection.on('error',err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
})

  
