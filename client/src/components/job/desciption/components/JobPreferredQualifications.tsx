import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { FaStar, FaRegCircle } from "react-icons/fa";

interface JobPreferredQualificationsProps {
  preferred_qualifications: string[];
}

const JobPreferredQualifications: React.FC<JobPreferredQualificationsProps> = ({
  preferred_qualifications,
}) => {
  return (
    <Card className="shadow-md border-l-4 border-l-purple-500 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaStar size={20} className="text-purple-500" />
          Preferred Qualifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {preferred_qualifications.map((qualification) => (
            <li
              key={qualification}
              className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-purple-500 mt-1">
                <FaRegCircle size={14} />
              </span>
              <span className="leading-relaxed">{qualification}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default JobPreferredQualifications;
