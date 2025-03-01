//db.js
import mongoose from "mongoose";
import dotenv from "dotenv" ;
dotenv.config() ; 
const DBNAME = "ATTENDEASE_DB"
const DBCONNECT = async () => {
  try {
      const ConnectInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DBNAME}`) ; 
      console.log("Database connection is successfull");

  } catch (error) {
        console.log("Db connection failed",error);
  }
}
export default DBCONNECT ; 