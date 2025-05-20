import { FaCheckCircle } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobResponsibilitiesProps {
  responsibilities: string[];
}

const JobResponsibilities: React.FC<JobResponsibilitiesProps> = ({
  responsibilities,
}) => {
  return (
    <Card className="shadow-md border-l-4 border-l-green-500 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaCheckCircle size={20} className="text-green-500" />
          Responsibilities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {responsibilities.map((responsibility) => (
            <li
              key={responsibility}
              className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-green-500 mt-1">
                <FaCheckCircle size={14} />
              </span>
              <span className="leading-relaxed text-muted-foreground">
                {responsibility}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default JobResponsibilities;
