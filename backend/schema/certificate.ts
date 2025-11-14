import mongoose, { Schema, Document, Types } from "mongoose";


export interface ICertificate extends Document {
  title: string;          
  organization: string;   
  issue_date: Date;       
     
  certificate_link?: string; 
  student: Types.ObjectId;   
}


const CertificateSchema = new Schema<ICertificate>(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    issue_date: { type: Date, required: true },
    
    certificate_link: { type: String },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  },
  { timestamps: true }
);


const Certificate = mongoose.model<ICertificate>("Certificate", CertificateSchema);
export default Certificate;
