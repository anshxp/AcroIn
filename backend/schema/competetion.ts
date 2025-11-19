import mongoose, { Schema, Document, Types } from "mongoose";


export interface ICompetition extends Document {
  name: string;             
  organizer: string;        
  position?: string;        
  date: Date;               
  certificate_link?: string;
  student: Types.ObjectId;  
}


const CompetitionSchema = new Schema<ICompetition>(
  {
    name: { type: String, required: true },
    organizer: { type: String, required: true },
    position: { type: String },
    date: { type: Date, required: true },
    certificate_link: { type: String },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  },
  { timestamps: true }
);


const Competition = mongoose.model<ICompetition>("Competition", CompetitionSchema);
export default Competition;
