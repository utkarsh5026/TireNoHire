import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FaBuilding,
  FaChevronUp,
  FaClock,
  FaDollarSign,
  FaMapMarkerAlt,
  FaBriefcase,
  FaIndustry,
  FaHeart,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface JobDetailsProps {
  company: string;
  location: string;
  type: string;
  seniority: string;
  salary_range: string | null;
  industry: string;
  apply_url: string;
}

const JobDetails: React.FC<JobDetailsProps> = ({
  company,
  location,
  type,
  seniority,
  salary_range,
  industry,
  apply_url,
}) => {
  return (
    <Card className="shadow-md border-t-4 border-t-blue-500 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FaBriefcase size={18} className="text-blue-500" />
          Job Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {company && (
          <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FaBuilding size={14} className="text-blue-500" />
              Company:
            </span>
            <span className="text-sm font-medium">{company}</span>
          </div>
        )}

        {location && (
          <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FaMapMarkerAlt size={14} className="text-red-500" />
              Location:
            </span>
            <span className="text-sm font-medium">{location}</span>
          </div>
        )}

        {type && (
          <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FaClock size={14} className="text-amber-500" />
              Job Type:
            </span>
            <span className="text-sm font-medium">{type}</span>
          </div>
        )}

        {seniority && (
          <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FaChevronUp size={14} className="text-green-500" />
              Experience Level:
            </span>
            <span className="text-sm font-medium">{seniority}</span>
          </div>
        )}

        {salary_range && (
          <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FaDollarSign size={14} className="text-emerald-500" />
              Salary Range:
            </span>
            <span className="text-sm font-medium">{salary_range}</span>
          </div>
        )}

        {industry && (
          <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FaIndustry size={14} className="text-purple-500" />
              Industry:
            </span>
            <span className="text-sm font-medium">{industry}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-center">
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          size="lg"
          onClick={() => window.open(apply_url, "_blank")}
        >
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <FaHeart className="h-4 w-4" />
            Apply Now
          </motion.div>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobDetails;
