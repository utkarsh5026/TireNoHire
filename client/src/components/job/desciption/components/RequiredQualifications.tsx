import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGraduationCap, FaCheckCircle } from "react-icons/fa";

interface RequiredQualificationsProps {
  required_qualifications: string[];
}

const RequiredQualifications = ({
  required_qualifications,
}: RequiredQualificationsProps) => {
  return (
    <Card className="shadow-md border-l-4 border-l-blue-500 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaGraduationCap size={20} className="text-blue-500" />
          Required Qualifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {required_qualifications.map((qualification) => (
            <li
              key={qualification}
              className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-blue-500 mt-1">
                <FaCheckCircle size={14} />
              </span>
              <span className="leading-relaxed text-muted-foreground">
                {qualification}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RequiredQualifications;
