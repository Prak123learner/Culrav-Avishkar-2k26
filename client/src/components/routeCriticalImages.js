import CulravBG from "../assets/common/backgrounds/CulravBG.webp";
import AvishkarBG from "../assets/common/backgrounds/AvishkarBG.webp";
import CulravLogo from "../assets/pages/culrav/CULRAV LOGO-display.webp";
import AvishkarLogo from "../assets/pages/avishkar/avishkarrr-display.webp";
import AnunaadCard from "../assets/pages/culrav/cards/Anunaad_Without_Hover.webp";
import RangmanchCard from "../assets/pages/culrav/cards/Rangmanch_without_hover.webp";
import DarkroomCard from "../assets/pages/culrav/cards/Darkroom_without_Hover.webp";
import CyberquestCard from "../assets/pages/avishkar/cards/Cyberquest_without_hover.webp";
import ElectromaniaCard from "../assets/pages/avishkar/cards/Electromania_withouthover.webp";
import GenesisCard from "../assets/pages/avishkar/cards/Genesis_without_hover.webp";
import SACPortrait from "../data/Team/sac_president/dr_sushil kumar.png";
import FacultyPortrait from "../data/Team/Faculty_incharge/SameerSir.jpeg";
import FacultySecondPortrait from "../data/Team/Faculty_incharge/VP_singh_sir.png";
import GalleryFirst from "../assets/pages/gallery/javed ali-thumb.webp";
import GallerySecond from "../assets/pages/gallery/galleryImg1-thumb.webp";

export const teamFirstPortraits = [SACPortrait, FacultyPortrait, FacultySecondPortrait];

export const routeCriticalImages = {
  "/culrav": [CulravBG, CulravLogo, AnunaadCard, RangmanchCard, DarkroomCard],
  "/avishkar": [AvishkarBG, AvishkarLogo, CyberquestCard, ElectromaniaCard, GenesisCard],
  "/gallery": [GalleryFirst, GallerySecond],
  "/team": ["/media/common/textures/parchment-bg.webp", ...teamFirstPortraits],
};
