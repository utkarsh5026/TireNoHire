import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  GraduationCap,
  Briefcase,
  Calendar,
  Award,
  Code,
  ExternalLink,
  Star,
  CheckCircle,
  Languages,
  Download,
  Share2,
  Printer,
  Globe,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data following the Pydantic model structure
const mockResumeData = {
  contact_info: {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    website: "alexjohnson.dev",
  },
  summary:
    "Senior Frontend Developer with 7+ years of experience building responsive, user-friendly web applications. Specialized in React, TypeScript, and modern frontend architecture. Passionate about creating intuitive user interfaces and optimizing web performance.",
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      start_date: "2012-09",
      end_date: "2016-05",
      gpa: 3.8,
      achievements: [
        "Graduated with Honors",
        "Dean's List 8 consecutive semesters",
        "Senior thesis on web accessibility patterns",
      ],
    },
    {
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Human-Computer Interaction",
      start_date: "2017-09",
      end_date: "2019-06",
      gpa: 3.9,
      achievements: [
        "Graduate Research Assistant",
        "Published paper on UX optimization",
      ],
    },
  ],
  experience: [
    {
      company: "TechCorp Solutions",
      position: "Senior Frontend Developer",
      start_date: "2020-03",
      end_date: "Present",
      description:
        "Lead frontend developer for enterprise SaaS platform used by Fortune 500 companies.",
      achievements: [
        "Rebuilt the frontend with React and TypeScript, improving performance by 45%",
        "Implemented responsive design, increasing mobile user engagement by 60%",
        "Led a team of 5 developers and mentored 3 junior engineers",
        "Established frontend testing practices that reduced bugs by 30%",
      ],
      skills: [
        "React",
        "TypeScript",
        "Redux",
        "Jest",
        "CI/CD",
        "Team Leadership",
      ],
    },
    {
      company: "InnovateSoft Inc.",
      position: "Frontend Developer",
      start_date: "2016-07",
      end_date: "2020-02",
      description: "Developed user interfaces for fintech applications.",
      achievements: [
        "Created reusable component library that accelerated development by 35%",
        "Implemented complex data visualizations with D3.js",
        "Collaborated with UX designers to improve user workflows",
        "Reduced bundle size by 40% through code splitting and lazy loading",
      ],
      skills: [
        "JavaScript",
        "React",
        "CSS3",
        "Webpack",
        "D3.js",
        "Performance Optimization",
      ],
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML5",
    "CSS3/SASS",
    "Redux",
    "GraphQL",
    "REST APIs",
    "Jest/React Testing Library",
    "Webpack",
    "Git",
    "CI/CD",
    "Responsive Design",
    "Web Accessibility",
    "Performance Optimization",
    "Node.js",
    "Express",
    "Agile/Scrum",
  ],
  certifications: [
    {
      name: "AWS Certified Developer – Associate",
      issuer: "Amazon Web Services",
      date: "2021-06",
      expiry_date: "2024-06",
    },
    {
      name: "Professional Scrum Master I (PSM I)",
      issuer: "Scrum.org",
      date: "2020-04",
      expiry_date: null,
    },
  ],
  projects: [
    {
      name: "EcoTrack",
      description:
        "An open-source web application that helps users track and reduce their carbon footprint.",
      technologies: ["React", "Node.js", "MongoDB", "D3.js", "Material-UI"],
      url: "github.com/alexj/ecotrack",
      start_date: "2021-01",
      end_date: "Present",
    },
    {
      name: "DevConnect",
      description:
        "A social platform for developers to collaborate on projects and share resources.",
      technologies: ["React", "GraphQL", "Apollo", "Express", "PostgreSQL"],
      url: "devconnect.alexjohnson.dev",
      start_date: "2019-08",
      end_date: "2020-12",
    },
  ],
  languages: ["English (Native)", "Spanish (Proficient)", "French (Basic)"],
};

// Format date from YYYY-MM to readable format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  if (dateString === "Present") return "Present";

  const [year, month] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

// Calculate experience duration in years and months
const calculateDuration = (startDate: string, endDate: string) => {
  if (!startDate) return "";

  const start = new Date(startDate);
  const end = endDate === "Present" ? new Date() : new Date(endDate);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  let years = yearDiff;
  let months = monthDiff;

  if (monthDiff < 0) {
    years--;
    months += 12;
  }

  const yearsText =
    years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "";
  const monthsText =
    months > 0 ? `${months} ${months === 1 ? "month" : "months"}` : "";

  if (yearsText && monthsText) {
    return `${yearsText}, ${monthsText}`;
  }

  return yearsText || monthsText || "Less than a month";
};

// Group skills into categories
const groupSkills = (skills: string[]) => {
  const categories = {
    Frontend: [
      "React",
      "JavaScript",
      "TypeScript",
      "HTML5",
      "CSS3",
      "SASS",
      "Redux",
      "Responsive Design",
      "Web Accessibility",
    ],
    Backend: [
      "Node.js",
      "Express",
      "GraphQL",
      "REST APIs",
      "MongoDB",
      "PostgreSQL",
    ],
    DevOps: ["AWS", "CI/CD", "Docker", "Kubernetes", "Git"],
    "Tools & Methods": [
      "Webpack",
      "Jest",
      "Testing Library",
      "Agile",
      "Scrum",
      "Performance Optimization",
    ],
  };

  const grouped = {
    Frontend: [],
    Backend: [],
    DevOps: [],
    "Tools & Methods": [],
    Other: [],
  };

  skills.forEach((skill: string) => {
    let assigned = false;

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => skill.includes(keyword))) {
        grouped[category as keyof typeof grouped].push(skill);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      grouped["Other"].push(skill);
    }
  });

  // Remove empty categories
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
};

const ResumeDisplayPage: React.FC = () => {
  const {
    contact_info,
    summary,
    education,
    experience,
    skills,
    certifications,
    projects,
    languages,
  } = mockResumeData;

  const groupedSkills = groupSkills(skills);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Resume Header with Actions */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Resume Preview</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Printer size={16} />
            <span>Print</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download size={16} />
            <span>Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Share2 size={16} />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Resume Content */}
      <div className=" rounded-xl border shadow-sm overflow-hidden">
        {/* Contact Info Header */}
        <div className="bg-primary/5 p-8 border-b">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarFallback className="text-3xl bg-primary/20">
                {contact_info.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                {contact_info.name}
              </h1>

              {/* Current position from most recent experience */}
              {experience && experience.length > 0 && (
                <h2 className="text-xl text-muted-foreground mt-1">
                  {experience[0].position}
                </h2>
              )}

              {/* Summary */}
              {summary && (
                <p className="mt-4 text-muted-foreground max-w-3xl">
                  {summary}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start">
            {contact_info.email && (
              <a
                href={`mailto:${contact_info.email}`}
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Mail size={16} className="text-muted-foreground" />
                <span>{contact_info.email}</span>
              </a>
            )}

            {contact_info.phone && (
              <a
                href={`tel:${contact_info.phone}`}
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Phone size={16} className="text-muted-foreground" />
                <span>{contact_info.phone}</span>
              </a>
            )}

            {contact_info.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-muted-foreground" />
                <span>{contact_info.location}</span>
              </div>
            )}

            {contact_info.linkedin && (
              <a
                href={`https://${contact_info.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Linkedin size={16} className="text-muted-foreground" />
                <span>{contact_info.linkedin}</span>
              </a>
            )}

            {contact_info.website && (
              <a
                href={`https://${contact_info.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Globe size={16} className="text-muted-foreground" />
                <span>{contact_info.website}</span>
              </a>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content - Experience, Education, Projects */}
            <div className="md:col-span-2 space-y-8">
              {/* Experience Section */}
              {experience && experience.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Briefcase size={20} className="text-primary" />
                    Work Experience
                  </h2>

                  <div className="space-y-6">
                    {experience.map((job, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative pl-6 pb-6 border-l border-muted last:pb-0"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-primary"></div>

                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <h3 className="font-bold text-lg">
                              {job.position}
                            </h3>
                            {job.start_date && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                                <Calendar size={14} />
                                <span>
                                  {formatDate(job.start_date)} -{" "}
                                  {formatDate(job.end_date) || "Present"}
                                </span>
                                <span className="text-xs border rounded-full px-2 py-0.5 border-muted-foreground/30">
                                  {calculateDuration(
                                    job.start_date,
                                    job.end_date
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <Briefcase size={14} className="mr-1" />
                            <span className="font-medium">{job.company}</span>
                          </div>

                          {job.description && (
                            <p className="text-muted-foreground">
                              {job.description}
                            </p>
                          )}

                          {job.achievements && job.achievements.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {job.achievements.map((achievement, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle
                                    size={16}
                                    className="text-green-600 flex-shrink-0 mt-1"
                                  />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.skills.map((skill, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education Section */}
              {education && education.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <GraduationCap size={20} className="text-primary" />
                    Education
                  </h2>

                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative pl-6 pb-6 border-l border-muted last:pb-0"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-primary"></div>

                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <h3 className="font-bold text-lg">
                              {edu.degree}
                              {edu.field ? ` in ${edu.field}` : ""}
                            </h3>
                            {edu.start_date && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                                <Calendar size={14} />
                                <span>
                                  {formatDate(edu.start_date)} -{" "}
                                  {formatDate(edu.end_date) || "Present"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <GraduationCap size={14} className="mr-1" />
                            <span className="font-medium">
                              {edu.institution}
                            </span>
                          </div>

                          {edu.gpa && (
                            <p className="text-sm text-muted-foreground">
                              GPA: {edu.gpa.toFixed(2)}
                            </p>
                          )}

                          {edu.achievements && edu.achievements.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {edu.achievements.map((achievement, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <Star
                                    size={14}
                                    className="text-amber-500 flex-shrink-0 mt-1"
                                  />
                                  <span className="text-sm">{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Section */}
              {projects && projects.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Code size={20} className="text-primary" />
                    Projects
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {projects.map((project, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">
                                {project.name}
                              </CardTitle>
                              {project.url && (
                                <a
                                  href={`https://${project.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>

                            {project.start_date && (
                              <CardDescription>
                                {formatDate(project.start_date)} -{" "}
                                {formatDate(project.end_date) || "Present"}
                              </CardDescription>
                            )}
                          </CardHeader>

                          <CardContent className="space-y-2">
                            {project.description && (
                              <p className="text-sm text-muted-foreground">
                                {project.description}
                              </p>
                            )}

                            {project.technologies &&
                              project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.technologies.map((tech, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - Skills, Certifications, Languages */}
            <div className="space-y-6">
              {/* Skills Section */}
              {skills && skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code size={18} className="text-primary" />
                      Skills
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {Object.entries(groupedSkills).map(
                      ([category, categorySkills]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium">{category}</h4>
                          <div className="flex flex-wrap gap-1">
                            {categorySkills.map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Certifications Section */}
              {certifications && certifications.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award size={18} className="text-primary" />
                      Certifications
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {certifications.map((cert, index) => (
                      <div key={index} className="space-y-1">
                        <div className="font-medium">{cert.name}</div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {cert.issuer}
                          </span>

                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar size={14} />
                            <span>
                              {formatDate(cert.date)}
                              {cert.expiry_date &&
                                ` - ${formatDate(cert.expiry_date)}`}
                            </span>
                          </div>
                        </div>

                        {cert.expiry_date &&
                          new Date(cert.expiry_date) > new Date() && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle size={12} />
                              <span>Active</span>
                            </div>
                          )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Languages Section */}
              {languages && languages.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Languages size={18} className="text-primary" />
                      Languages
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {languages.map((language, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-primary" />
                          <span>{language}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDisplayPage;
