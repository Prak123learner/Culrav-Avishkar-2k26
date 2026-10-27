import SushilKumar from "./sac_president/dr_sushil kumar.png";
import SatishChandra from "./treasurer/satish_chandra.png";
import SameerSir from "./Faculty_incharge/SameerSir.jpeg";
import VPSingh from "./Faculty_incharge/VP_singh_sir.png";
import Indu from "./Faculty_cor_Cul/indu.jpg";
import Karthik from "./Faculty_cor_Cul/karthik.jpg";
import FacultySatishChandra from "./Faculty_cor_Cul/satish_chandra.png";
import Somen from "./Faculty_cor_Cul/Somen.jpeg";
import Shubham from "./Faculty_cor_Cul/subham.jpeg";
import VibhavPrakash from "./Faculty_Cor_Tech/Vibhav_Prakash.jpg";
import AbhishekKundu from "./Faculty_Cor_Tech/Abhishek_kundu.jpeg";
import JagatJyoti from "./Faculty_Cor_Tech/jagat_jyoti.jpg";
import JitendraKumar from "./Faculty_Cor_Tech/jitendra_kumar.jpg";
import SandeepKumarSingh from "./Faculty_Cor_Tech/Sandeep_kumar_singh.jpeg";

const festivalPhotos = import.meta.glob("./festival-2026/*", { eager: true, import: "default" });
const photo = (filename) => filename ? festivalPhotos[`./festival-2026/${filename}`] : null;
const person = (name, role, image, instagram) => ({ name, role, img: photo(image), instagram });

export const teamData = [
  { id: "sac", name: "SAC President", members: [{ name: "Dr Sushil Kumar", img: SushilKumar }] },
  { id: "faculty-incharge", name: "Faculty Incharge", members: [{ name: "Dr. Sameer Srivastava", img: SameerSir }, { name: "Dr. V.P. Singh", img: VPSingh }] },
  { id: "treasurer", name: "Treasurer", members: [{ name: "Dr Satish Chandra", img: SatishChandra }] },
  { id: "faculty-coordinators-tech", name: "Faculty Coordinators · Technical", members: [{ name: "Dr Vibhav Prakash Singh", img: VibhavPrakash }, { name: "Dr Sandeep Kumar Singh", img: SandeepKumarSingh }, { name: "Dr Jitendra N. Gangwar", img: JitendraKumar }, { name: "Dr Abhishek Kundu", img: AbhishekKundu }, { name: "Dr Jagat Jyoti Rath", img: JagatJyoti }] },
  { id: "faculty-coordinators-cultural", name: "Faculty Coordinators · Cultural", members: [{ name: "Dr Somen Dey", img: Somen }, { name: "Dr Satish Chandra", img: FacultySatishChandra }, { name: "Dr Karthick Senthil Kumar", img: Karthik }, { name: "Dr Shubham Gupta", img: Shubham }, { name: "Dr Indu Dohore", img: Indu }] },
  {
    id: "festival-secretaries", name: "Festival Secretaries", members: [
      person("Sunil Nayak", "Dance Lead", "sunil-nayak.webp", "sunilnyk.ipynb"), person("Revan Channa", "Dance Lead", "revan-channa.webp", "revanclaw_"), person("Vanshika Gautam", "Dance Lead", "vanshika-gautam.webp", "oneshika_23"),
      person("Kallol Mondal", "Creative Art Lead", "kallol-mondal.webp", "kallolclonaren"), person("Harsh Sharma", "Creative Art Lead", "harsh-sharma.webp", "not_too_harshh"), person("Kartikay Singh", "Music Lead", "kartikay-singh.webp", "kartikay3101"), person("Ayush Joshi", "Music Lead", "ayush-joshi.webp", "ayush_joshi_ajpiano"),
      person("Harsh Singhal", "Media Lead"), person("Anisha Singh", "Media Lead"), person("Hardik", "Dramatics Lead", "hardik.webp", "hardikk._21"), person("Jayant", "Dramatics Lead", "jayant.webp", "jayant_20_noi"),
      person("Ayush Kumar", "Avishkar Lead", "ayush-kumar.webp", "05ayush_"), person("Darsh Sarju Shah", "Avishkar Lead", "darsh-sarju-shah.webp", "darshshah_2005"), person("Krish Kumar", "Avishkar Lead", "krish-kumar.webp", "krishkumarrdx"), person("Prakhar Kumar Shandilya", "Avishkar Lead"), person("Yash Chauhan", "Avishkar Lead"),
      person("Harshvardhan P Patil", "Gnosiomania Lead", "harshvardhan-patil.webp", "0_0hashbrowns"), person("Shreyansh Rathi", "Gnosiomania Lead", "shreyansh-rathi.webp", "rathi_ji_shreyansh"), person("Aashutosh Prasad Pathak", "Gnosiomania Lead", "aashutosh-pathak.webp", "aashutosh4all"), person("Anupama Kumari", "Gnosiomania Lead", "anupama-kumari.webp", "im.anupma"),
      person("Vishesh Vigh", "Web Team Lead"), person("Prakhar Patni", "Web Team Lead", "prakhar.webp", "prxk.hxr"), person("Divyanshu Yadav", "PR Lead", "divyanshu-yadav.webp", "divyanshuyadav000"), person("Suyash Ranjan", "PR Lead", "suyash-ranjan.webp", "suyash_ranjan_"), person("Guransh Goyal", "PR Lead", "guransh-goyal.webp", "guransh.goyal"), person("Kanishk Agrawal", "PR Lead", "kanishk-agrawal.webp", "k.agrawal_official"), person("Mayank Gausingha", "PR Lead", "mayank-gausingha.webp", "Mynkkgausinga"), person("Saumya Sharma", "PR Lead", "saumya-sharma.webp", "_saumya.0603_"), person("Sneha Jain", "PR Lead", "sneha-jain.webp", "schnozzle754"), person("Poorvi Jaiswal", "PR Lead", "poorvi-jaiswal.webp", "poodlesuke"), person("Priyanshi Agrawal", "Modeling / Fashion / Footprints Lead", "priyanshi-agrawal.webp", "its_priyaanshiii"), person("Anubha Sharma", "Modeling / Fashion / Footprints Lead", "anubha-sharma.webp", "anubhasharma38")
    ]
  },
  {
    id: "departmental-coordinators", name: "Departmental Coordinators", members: [
      person("Aaditya", undefined, "aaditya.webp", "the.aaditya._02"),
      person("Abhishek Kumar Jha", undefined, "department-card-20261027-01.webp", "abhishekjha_16"),
      person("Aditya Shukla", undefined, "aditya-shukla.webp", "aditya_shukla79"),
      person("Akshat Mishra", undefined, "akshat-mishra.webp", "akshatmi2005"),
      person("Akshay Kumar", undefined, "akshay-kumar.webp", "akshay_chaudhary_ak"),
      person("Anaranyo Sarkar"),
      person("Anisha Nigam", undefined, "anisha-nigam.webp", "17__anisha"),
      person("Anshumaan Singh", undefined, "anshumaan-singh.webp", "anshumaanborntolead"),
      person("Aryan Raj", undefined, "aryan-raj.webp", "nott.your.aryan"),
      person("Avinash Gupta", undefined, "avinash-kumar.webp", "gupta_avinash09"),
      person("Ayush Tiwari", undefined, "ayush-tiwari.webp", "ayushtiwari5071"),
      person("Dhruv Goyal", undefined, "dhruv-goyal.webp", "dhruv_goyal_08"),
      person("Harshit K. Jayaswal", undefined, "harshit-singh.webp", "harshitk.jayaswal"),
      person("Harshit Singh", undefined, "harshit-singh-dc.webp"),
      person("Khyati Jain", undefined, "khyati-jain.webp", "khyatijain_19"),
      person("Manik Dev Azad", undefined, "manik-dev-azad.webp", "mani._.k_"),
      person("Naveli Gupta", undefined, "department-card-20261027-02.webp", "naveli_gupta"),
      person("Nishant Tiwari"),
      person("Sange Choedon", undefined, "sange-choedon.webp", "imchoyye_"),
      person("Satvik Yadav", undefined, "satvik-yadav.webp", "satvik_037"),
      person("Tanish Gupta", undefined, "tanish-gupta.webp", "tanish.gupta.01"),
      person("Uplaksh Mittal", undefined, "uplaksh-mittal.webp", "Uplakshmittal"),
      person("Vatsal Kumar", undefined, "vatsal-kumar.webp", "vatsal.baranwal"),
      person("Vikash Meena", undefined, "vikash-meena.webp", "v_i_k_a_s_h_8955")
    ]
  }
];

