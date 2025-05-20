import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaLayerGroup } from "react-icons/fa";
import { getSkillIcon } from "@/components/shared/icons";

interface JobSkillsProps {
  skills: string[];
}

const JobSkills = ({ skills }: JobSkillsProps) => {
  return (
    <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FaLayerGroup size={18} className="text-primary" />
          Required Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="py-1.5 px-3 transition-all duration-300 hover:bg-primary/20 hover:shadow-sm cursor-default flex gap-1.5 items-center"
            >
              <span
                className={`devicon-${skill
                  .toLowerCase()
                  .replace(/\s/g, "")}-plain colored text-sm`}
              >
                {getSkillIcon(skill)}
              </span>
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobSkills;
