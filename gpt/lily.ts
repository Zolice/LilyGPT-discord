//config to init the openai
import { Configuration, OpenAIApi } from "openai";

//dotenv
import * as dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const Lily = new OpenAIApi(configuration);

export default Lily