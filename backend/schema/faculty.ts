import mongoose,{Schema,Document,Model} from 'mongoose';

export interface Faculty extends Document{
    firstname:string;
    lastName:string;
    email:string;
    password:string;
    profilepic?:string;
    experience:number;
    qualification:string;
    subjects:string[];
    department:string;
    headof:string[];
    designation:string;
    dob:Date;
    linkedin:string;
    skills:string[];
    techstacks:string[];
    phone:string;
    role: string[];
    createdAt:Date;
    updatedAt:Date;
}
const facultySchema:Schema<Faculty>=new Schema({
    firstname:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profilepic:{type:String,default:""},
    experience:{type:Number,required:true},
    qualification:{type:String,required:true},
    subjects:{type:[String],default:[]},
    department:{type:String,required:true},
    headof:{type:[String],default:[]},
    designation:{type:String,required:true},
    dob:{type:Date,required:true},
    linkedin:{type:String,default:""},
    skills:{type:[String],default:[]},
    techstacks:{type:[String],default:[]},
    phone:{type:String,required:true,unique:true},
    role:{type:[String],default:["faculty"],enum:['faculty','dept_admin','super_admin']}
},{
    timestamps:true
});

export const FacultyModel:Model<Faculty>=mongoose.model<Faculty>('Faculty',facultySchema);