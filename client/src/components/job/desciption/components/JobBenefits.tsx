import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card";
import { getBenefitIcon } from "@/components/shared/icons";
import { FaAward } from "react-icons/fa";

interface JobBenefitsProps {
  benefits: string[];
}

const JobBenefits: React.FC<JobBenefitsProps> = ({ benefits }) => {
  return (
    <Card className="shadow-md border-t-4 border-t-green-500 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FaAward size={18} className="text-green-500" />
          Benefits & Perks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="flex-shrink-0 mt-0.5">
                {getBenefitIcon(benefit)}
              </span>
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default JobBenefits;
