import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStudent extends Document {
  name: string;                     
  roll: string;                     
  email: string;                    
  department: string;               
  tech_stack: string[];             
  profile_image?: string;           
  face_encoding?: number[];         
  projects: Types.ObjectId[];       
  internships: Types.ObjectId[];    
  competitions: Types.ObjectId[];   
  certificates: Types.ObjectId[];   
}


const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    roll: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    tech_stack: { type: [String], default: [] },
    profile_image: { type: String },
    face_encoding: { type: [Number] },

   
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    internships: [{ type: Schema.Types.ObjectId, ref: "Internship" }],
    competitions: [{ type: Schema.Types.ObjectId, ref: "Competition" }],
    certificates: [{ type: Schema.Types.ObjectId, ref: "Certificate" }],
  },
  { timestamps: true } 
);


const Student = mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
