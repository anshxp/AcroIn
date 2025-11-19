import mongoose, { Schema, Document, Types } from "mongoose";


export interface IInternship extends Document {
  company: string;          
  position: string;         
  duration: string;         
  description?: string;     
  certificate_link?: string;
  student: Types.ObjectId;  
}


const InternshipSchema = new Schema<IInternship>(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String },
    certificate_link: { type: String },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  },
  { timestamps: true }
);


const Internship = mongoose.model<IInternship>("Internship", InternshipSchema);
export default Internship;
