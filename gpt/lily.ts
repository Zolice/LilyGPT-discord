//config to init the openai
import { OpenAI } from "openai";

//dotenv
import * as dotenv from 'dotenv';
dotenv.config();


const Lily = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default Lily