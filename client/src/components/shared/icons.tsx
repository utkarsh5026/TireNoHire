import {
  FaJs,
  FaReact,
  FaAngular,
  FaVuejs,
  FaHtml5,
  FaCss3Alt,
  FaSass,
  FaNodeJs,
  FaPython,
  FaJava,
  FaPhp,
  FaLaravel,
  FaDatabase,
  FaAws,
  FaMicrosoft,
  FaGoogle,
  FaDocker,
  FaGit,
  FaSwift,
  FaCode,
  FaServer,
  FaLayerGroup,
  FaGem,
  FaHeartbeat,
  FaGraduationCap,
  FaLaptopHouse,
  FaRunning,
  FaCoffee,
  FaPlaneDeparture,
  FaHome,
  FaCar,
  FaBabyCarriage,
  FaMedal,
  FaTerminal,
  FaBriefcase,
  FaCog,
  FaCloud,
  FaLaptopCode,
  FaGlobe,
  FaMobile,
  FaTools,
  FaUsers,
  FaWrench,
  FaLinkedin,
} from "react-icons/fa";
import {
  SiTypescript,
  SiRuby,
  SiGoland,
  SiRust,
  SiKotlin,
  SiDjango,
  SiFlask,
  SiSpring,
  SiTailwindcss,
  SiExpress,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiRedis,
  SiKubernetes,
  SiIndeed,
  SiGlassdoor,
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";
import { BsBuilding } from "react-icons/bs";
import { ReactNode } from "react";

export const getSkillIcon = (skill: string) => {
  const lowerSkill = skill.toLowerCase();

  if (lowerSkill.includes("javascript") || lowerSkill.includes("js"))
    return <FaJs size={16} className="text-yellow-500" />;
  if (lowerSkill.includes("typescript") || lowerSkill.includes("ts"))
    return <SiTypescript size={16} className="text-blue-600" />;
  if (lowerSkill.includes("python"))
    return <FaPython size={16} className="text-blue-500" />;
  if (lowerSkill.includes("java"))
    return <FaJava size={16} className="text-red-500" />;
  if (lowerSkill.includes("c#"))
    return <TbBrandCSharp size={16} className="text-purple-600" />;
  if (lowerSkill.includes("php"))
    return <FaPhp size={16} className="text-indigo-600" />;
  if (lowerSkill.includes("ruby"))
    return <SiRuby size={16} className="text-red-600" />;
  if (lowerSkill.includes("go"))
    return <SiGoland size={16} className="text-cyan-500" />;
  if (lowerSkill.includes("rust"))
    return <SiRust size={16} className="text-orange-700" />;
  if (lowerSkill.includes("swift"))
    return <FaSwift size={16} className="text-orange-500" />;
  if (lowerSkill.includes("kotlin"))
    return <SiKotlin size={16} className="text-orange-500" />;

  // Frontend
  if (lowerSkill.includes("react"))
    return <FaReact size={16} className="text-cyan-500" />;
  if (lowerSkill.includes("angular"))
    return <FaAngular size={16} className="text-red-600" />;
  if (lowerSkill.includes("vue"))
    return <FaVuejs size={16} className="text-emerald-500" />;
  if (lowerSkill.includes("html"))
    return <FaHtml5 size={16} className="text-orange-600" />;
  if (lowerSkill.includes("css"))
    return <FaCss3Alt size={16} className="text-blue-500" />;
  if (lowerSkill.includes("sass"))
    return <FaSass size={16} className="text-pink-500" />;
  if (lowerSkill.includes("tailwind"))
    return <SiTailwindcss size={16} className="text-cyan-400" />;

  // Backend
  if (lowerSkill.includes("node"))
    return <FaNodeJs size={16} className="text-green-600" />;
  if (lowerSkill.includes("express"))
    return <SiExpress size={16} className="text-gray-700" />;
  if (lowerSkill.includes("django"))
    return <SiDjango size={16} className="text-green-800" />;
  if (lowerSkill.includes("flask"))
    return <SiFlask size={16} className="text-gray-800" />;
  if (lowerSkill.includes("spring"))
    return <SiSpring size={16} className="text-green-500" />;
  if (lowerSkill.includes("laravel"))
    return <FaLaravel size={16} className="text-red-500" />;

  // Database
  if (lowerSkill.includes("mongodb"))
    return <SiMongodb size={16} className="text-green-600" />;
  if (lowerSkill.includes("mysql"))
    return <SiMysql size={16} className="text-blue-600" />;
  if (lowerSkill.includes("postgresql"))
    return <SiPostgresql size={16} className="text-blue-700" />;
  if (lowerSkill.includes("redis"))
    return <SiRedis size={16} className="text-red-600" />;
  if (lowerSkill.includes("database") || lowerSkill.includes("sql"))
    return <FaDatabase size={16} className="text-blue-500" />;

  // Cloud & DevOps
  if (lowerSkill.includes("aws"))
    return <FaAws size={16} className="text-orange-400" />;
  if (lowerSkill.includes("azure"))
    return <FaMicrosoft size={16} className="text-blue-500" />;
  if (lowerSkill.includes("gcp") || lowerSkill.includes("google cloud"))
    return <FaGoogle size={16} className="text-red-500" />;
  if (lowerSkill.includes("docker"))
    return <FaDocker size={16} className="text-blue-500" />;
  if (lowerSkill.includes("kubernetes"))
    return <SiKubernetes size={16} className="text-blue-600" />;
  if (lowerSkill.includes("git"))
    return <FaGit size={16} className="text-orange-600" />;

  // Default categories
  if (lowerSkill.includes("backend") || lowerSkill.includes("server"))
    return <FaServer size={16} className="text-blue-500" />;
  if (lowerSkill.includes("coding") || lowerSkill.includes("programming"))
    return <FaCode size={16} className="text-green-500" />;

  // Default icon for other skills
  return <FaLayerGroup size={16} className="text-primary" />;
};

export const getBenefitIcon = (benefit: string) => {
  const lowerBenefit = benefit.toLowerCase();

  if (
    lowerBenefit.includes("health") ||
    lowerBenefit.includes("medical") ||
    lowerBenefit.includes("insurance")
  )
    return <FaHeartbeat size={16} className="text-red-500" />;

  if (
    lowerBenefit.includes("remote") ||
    lowerBenefit.includes("work from home") ||
    lowerBenefit.includes("wfh")
  )
    return <FaLaptopHouse size={16} className="text-blue-500" />;

  if (
    lowerBenefit.includes("education") ||
    lowerBenefit.includes("tuition") ||
    lowerBenefit.includes("learning")
  )
    return <FaGraduationCap size={16} className="text-green-500" />;

  if (
    lowerBenefit.includes("gym") ||
    lowerBenefit.includes("fitness") ||
    lowerBenefit.includes("wellness")
  )
    return <FaRunning size={16} className="text-cyan-500" />;

  if (
    lowerBenefit.includes("travel") ||
    lowerBenefit.includes("vacation") ||
    lowerBenefit.includes("pto") ||
    lowerBenefit.includes("paid time off")
  )
    return <FaPlaneDeparture size={16} className="text-purple-500" />;

  if (
    lowerBenefit.includes("coffee") ||
    lowerBenefit.includes("snacks") ||
    lowerBenefit.includes("lunch")
  )
    return <FaCoffee size={16} className="text-amber-700" />;

  if (lowerBenefit.includes("housing") || lowerBenefit.includes("relocation"))
    return <FaHome size={16} className="text-indigo-500" />;

  if (
    lowerBenefit.includes("transport") ||
    lowerBenefit.includes("commuter") ||
    lowerBenefit.includes("parking")
  )
    return <FaCar size={16} className="text-slate-500" />;

  if (
    lowerBenefit.includes("parental") ||
    lowerBenefit.includes("child") ||
    lowerBenefit.includes("family")
  )
    return <FaBabyCarriage size={16} className="text-pink-500" />;

  if (
    lowerBenefit.includes("bonus") ||
    lowerBenefit.includes("stock") ||
    lowerBenefit.includes("equity")
  )
    return <FaGem size={16} className="text-amber-500" />;

  return <FaMedal size={16} className="text-primary" />;
};

export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "technical":
      return <FaCode size={16} />;
    case "software":
      return <FaLaptopCode size={16} />;
    case "frontend":
      return <FaGlobe size={16} />;
    case "backend":
      return <FaServer size={16} />;
    case "database":
      return <FaDatabase size={16} />;
    case "cloud":
      return <FaCloud size={16} />;
    case "mobile":
      return <FaMobile size={16} />;
    case "devops":
      return <FaCog size={16} />;
    case "tools":
      return <FaTools size={16} />;
    case "soft skill":
      return <FaUsers size={16} />;
    case "experience":
      return <FaBriefcase size={16} />;
    case "system":
      return <FaWrench size={16} />;
    case "programming":
      return <FaTerminal size={16} />;
    default:
      return <FaLayerGroup size={16} />;
  }
};

export const getJobSiteIcon = (url: string): ReactNode => {
  switch (true) {
    case /linkedin\.com/i.test(url):
      return <FaLinkedin size={16} className="text-blue-500" />;
    case /indeed\.com/i.test(url):
      return <SiIndeed size={16} className="text-blue-800" />;
    case /glassdoor\.(com|co)/i.test(url):
      return <SiGlassdoor size={16} className="text-green-800" />;
    case /ziprecruiter\.com/i.test(url):
      return <FaGlobe size={16} className="text-gray-800" />;
    case /(careers|jobs)\.[\w.]+\.(com|org|net)/i.test(url):
      return <BsBuilding size={16} className="text-gray-800" />;
    default:
      return <FaGlobe size={16} />;
  }
};
