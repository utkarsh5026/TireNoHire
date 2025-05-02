import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Key,
  SlackIcon,
  Bot,
  Upload,
  Scale,
  Bell,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  Check,
  Lock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Define types for our settings
interface LLMSettings {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

interface ResumeSettings {
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
  parseEducation: boolean;
  parseExperience: boolean;
  parseSkills: boolean;
  parseProjects: boolean;
  extractKeywords: boolean;
}

interface JobSettings {
  maxStoredJobs: number;
  jobExpiryDays: number;
  autofetchFromURL: boolean;
  preferredJobSource: "text" | "url" | "file";
}

interface AnalysisSettings {
  skillsWeight: number;
  experienceWeight: number;
  educationWeight: number;
  keywordsWeight: number;
  minimumMatchThreshold: number;
  detailedAnalysis: boolean;
  generateSuggestions: boolean;
  highlightKeywords: boolean;
}

interface DataSettings {
  storeResumes: boolean;
  storeJobDescriptions: boolean;
  analysisRetentionDays: number;
  allowAnonymousAnalysis: boolean;
  dataExportFormat: "json" | "csv" | "pdf";
}

interface NotificationSettings {
  emailNotifications: boolean;
  emailAddress: string;
  newMatchAlert: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface RecruiterSettings {
  maxBatchSize: number;
  defaultSortBy: "score" | "date" | "name";
  autoRejectThreshold: number;
  showCandidateNames: boolean;
}

interface AppSettings {
  llm: LLMSettings;
  resume: ResumeSettings;
  job: JobSettings;
  analysis: AnalysisSettings;
  data: DataSettings;
  notifications: NotificationSettings;
  recruiter: RecruiterSettings;
  userType: "jobSeeker" | "recruiter";
  theme: "light" | "dark" | "system";
}

// Define initial state
const initialSettings: AppSettings = {
  llm: {
    provider: "openai",
    model: "gpt-4",
    apiKey: "",
    temperature: 0.2,
    maxTokens: 2000,
  },
  resume: {
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "docx", "doc"],
    parseEducation: true,
    parseExperience: true,
    parseSkills: true,
    parseProjects: true,
    extractKeywords: true,
  },
  job: {
    maxStoredJobs: 25,
    jobExpiryDays: 30,
    autofetchFromURL: true,
    preferredJobSource: "text",
  },
  analysis: {
    skillsWeight: 40,
    experienceWeight: 30,
    educationWeight: 15,
    keywordsWeight: 15,
    minimumMatchThreshold: 50,
    detailedAnalysis: true,
    generateSuggestions: true,
    highlightKeywords: true,
  },
  data: {
    storeResumes: true,
    storeJobDescriptions: true,
    analysisRetentionDays: 90,
    allowAnonymousAnalysis: false,
    dataExportFormat: "json",
  },
  notifications: {
    emailNotifications: false,
    emailAddress: "",
    newMatchAlert: true,
    weeklyDigest: false,
    marketingEmails: false,
  },
  recruiter: {
    maxBatchSize: 50,
    defaultSortBy: "score",
    autoRejectThreshold: 30,
    showCandidateNames: true,
  },
  userType: "jobSeeker",
  theme: "dark",
};

const SettingsConfiguration: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [activeTab, setActiveTab] = useState("llm");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
  }, []);

  // Handle settings change
  const handleSettingsChange = (
    category: keyof AppSettings,
    key: string,
    value: any
  ) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value,
      },
    }));
    setIsSaved(false);
  };

  // Save settings
  const saveSettings = () => {
    try {
      localStorage.setItem("appSettings", JSON.stringify(settings));
      setIsSaved(true);
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
      console.error("Failed to save settings:", e);
    }
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings(initialSettings);
    setIsSaved(false);
    toast.info("Settings reset to default values");
  };

  // Test API key
  const testApiKey = async () => {
    toast.info("Testing API key...");

    // In a real implementation, this would make an API call to validate the key
    // For demo purposes, we'll just simulate a response after a delay
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% chance of success for demo

      if (success) {
        toast.success("API key is valid!");
      } else {
        toast.error("Invalid API key or connection error");
      }
    }, 1500);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your ResumeMatch application preferences
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isSaved}
              className="flex items-center gap-2"
            >
              {isSaved ? <Check size={16} /> : <Save size={16} />}
              {isSaved ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="llm" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-8">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Bot size={16} />
              <span className="hidden md:inline">LLM Model</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <Upload size={16} />
              <span className="hidden md:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="job" className="flex items-center gap-2">
              <SlackIcon size={16} />
              <span className="hidden md:inline">Job</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Scale size={16} />
              <span className="hidden md:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Save size={16} />
              <span className="hidden md:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell size={16} />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="recruiter"
              className="flex items-center gap-2"
              disabled={settings.userType !== "recruiter"}
            >
              <SlackIcon size={16} />
              <span className="hidden md:inline">Recruiter</span>
            </TabsTrigger>
          </TabsList>

          {/* LLM Model Settings */}
          <TabsContent value="llm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  LLM Model Configuration
                </CardTitle>
                <CardDescription>
                  Configure the Language Model for resume analysis and scoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={settings.llm.provider}
                      onValueChange={(value) =>
                        handleSettingsChange("llm", "provider", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google AI</SelectItem>
                        <SelectItem value="huggingface">HuggingFace</SelectItem>
                        <SelectItem value="local">Local Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select
                      value={settings.llm.model}
                      onValueChange={(value) =>
                        handleSettingsChange("llm", "model", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.llm.provider === "openai" && (
                          <>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-4-turbo">
                              GPT-4 Turbo
                            </SelectItem>
                            <SelectItem value="gpt-3.5-turbo">
                              GPT-3.5 Turbo
                            </SelectItem>
                          </>
                        )}
                        {settings.llm.provider === "anthropic" && (
                          <>
                            <SelectItem value="claude-3-opus">
                              Claude 3 Opus
                            </SelectItem>
                            <SelectItem value="claude-3-sonnet">
                              Claude 3 Sonnet
                            </SelectItem>
                            <SelectItem value="claude-3-haiku">
                              Claude 3 Haiku
                            </SelectItem>
                            <SelectItem value="claude-2">Claude 2</SelectItem>
                          </>
                        )}
                        {settings.llm.provider === "google" && (
                          <>
                            <SelectItem value="gemini-pro">
                              Gemini Pro
                            </SelectItem>
                            <SelectItem value="gemini-ultra">
                              Gemini Ultra
                            </SelectItem>
                          </>
                        )}
                        {settings.llm.provider === "huggingface" && (
                          <>
                            <SelectItem value="mistral-7b">
                              Mistral 7B
                            </SelectItem>
                            <SelectItem value="llama-2-70b">
                              Llama 2 70B
                            </SelectItem>
                            <SelectItem value="falcon-40b">
                              Falcon 40B
                            </SelectItem>
                          </>
                        )}
                        {settings.llm.provider === "local" && (
                          <>
                            <SelectItem value="ollama-llama2">
                              Ollama Llama2
                            </SelectItem>
                            <SelectItem value="ollama-mistral">
                              Ollama Mistral
                            </SelectItem>
                            <SelectItem value="custom">Custom Model</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>API Key</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={settings.llm.apiKey}
                        onChange={(e) =>
                          handleSettingsChange("llm", "apiKey", e.target.value)
                        }
                        placeholder={`Enter your ${settings.llm.provider} API key`}
                        className="pr-10"
                      />
                      <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button onClick={testApiKey}>Test</Button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Lock size={12} />
                    Your API key is stored locally and never sent to our servers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>
                        Temperature: {settings.llm.temperature.toFixed(1)}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={16}
                            className="text-muted-foreground cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Controls the randomness of the model. Lower values
                            (0.0-0.3) make output more deterministic and
                            focused. Higher values (0.7-1.0) make output more
                            creative and varied.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.llm.temperature]}
                      onValueChange={(value) =>
                        handleSettingsChange("llm", "temperature", value[0])
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Max Tokens: {settings.llm.maxTokens}</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={16}
                            className="text-muted-foreground cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Maximum number of tokens the model will generate in
                            a response. Higher values allow for longer, more
                            detailed analysis.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      min={500}
                      max={4000}
                      step={100}
                      value={[settings.llm.maxTokens]}
                      onValueChange={(value) =>
                        handleSettingsChange("llm", "maxTokens", value[0])
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Shorter</span>
                      <span>Longer</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Model Information
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        Current Provider:
                      </span>{" "}
                      {settings.llm.provider === "openai" && "OpenAI"}
                      {settings.llm.provider === "anthropic" && "Anthropic"}
                      {settings.llm.provider === "google" && "Google AI"}
                      {settings.llm.provider === "huggingface" && "HuggingFace"}
                      {settings.llm.provider === "local" && "Local Model"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Model Capabilities:
                      </span>{" "}
                      {settings.llm.provider === "openai" &&
                        settings.llm.model === "gpt-4" &&
                        "Advanced reasoning, nuanced analysis, high accuracy in matching skills and suggesting improvements"}
                      {settings.llm.provider === "anthropic" &&
                        settings.llm.model === "claude-3-opus" &&
                        "Strong comprehension of complex resume formats, excellent for detailed analysis and feedback"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Cost Estimate:
                      </span>{" "}
                      {settings.llm.provider === "openai" &&
                        settings.llm.model === "gpt-4" &&
                        "~$0.05-0.10 per resume analysis"}
                      {settings.llm.provider === "anthropic" &&
                        settings.llm.model === "claude-3-opus" &&
                        "~$0.04-0.08 per resume analysis"}
                      {settings.llm.provider === "local" &&
                        "Free (uses local computing resources)"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("resume")}
                >
                  Next: Resume Settings
                </Button>
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Resume Settings */}
          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Resume Processing Settings
                </CardTitle>
                <CardDescription>
                  Configure how resumes are processed and analyzed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Max File Size (MB)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={settings.resume.maxFileSize}
                      onChange={(e) =>
                        handleSettingsChange(
                          "resume",
                          "maxFileSize",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed File Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {["pdf", "docx", "doc", "txt", "rtf", "odt"].map(
                        (type) => (
                          <Badge
                            key={type}
                            variant={
                              settings.resume.allowedFileTypes.includes(type)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => {
                              const newTypes =
                                settings.resume.allowedFileTypes.includes(type)
                                  ? settings.resume.allowedFileTypes.filter(
                                      (t) => t !== type
                                    )
                                  : [...settings.resume.allowedFileTypes, type];
                              handleSettingsChange(
                                "resume",
                                "allowedFileTypes",
                                newTypes
                              );
                            }}
                          >
                            {type.toUpperCase()}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    Resume Parsing Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Parse Education History</Label>
                        <p className="text-xs text-muted-foreground">
                          Extract education details from resumes
                        </p>
                      </div>
                      <Switch
                        checked={settings.resume.parseEducation}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "resume",
                            "parseEducation",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Parse Work Experience</Label>
                        <p className="text-xs text-muted-foreground">
                          Extract work history and job details
                        </p>
                      </div>
                      <Switch
                        checked={settings.resume.parseExperience}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "resume",
                            "parseExperience",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Parse Skills</Label>
                        <p className="text-xs text-muted-foreground">
                          Identify and categorize skills from resume
                        </p>
                      </div>
                      <Switch
                        checked={settings.resume.parseSkills}
                        onCheckedChange={(checked) =>
                          handleSettingsChange("resume", "parseSkills", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Parse Projects</Label>
                        <p className="text-xs text-muted-foreground">
                          Extract project information and details
                        </p>
                      </div>
                      <Switch
                        checked={settings.resume.parseProjects}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "resume",
                            "parseProjects",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between md:col-span-2">
                      <div className="space-y-0.5">
                        <Label>Extract Keywords</Label>
                        <p className="text-xs text-muted-foreground">
                          Identify important keywords and phrases for job
                          matching
                        </p>
                      </div>
                      <Switch
                        checked={settings.resume.extractKeywords}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "resume",
                            "extractKeywords",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Resume Processing Information
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        Processing Method:
                      </span>{" "}
                      {settings.llm.provider === "local"
                        ? "Local text extraction with OCR for PDFs"
                        : "Cloud-based extraction with advanced parsing"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Privacy:</span>{" "}
                      {settings.llm.provider === "local"
                        ? "Your resume data stays on your device"
                        : "Resume data is sent to API provider for processing"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Processing Time:
                      </span>{" "}
                      {settings.llm.provider === "local"
                        ? "Variable (depends on your device)"
                        : "~5-15 seconds per resume"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("job")}>
                  Next: Job Settings
                </Button>
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Job Settings */}
          <TabsContent value="job">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlackIcon className="h-5 w-5" />
                  Job Description Settings
                </CardTitle>
                <CardDescription>
                  Configure how job descriptions are processed and stored
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Maximum Stored Jobs</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.job.maxStoredJobs}
                      onChange={(e) =>
                        handleSettingsChange(
                          "job",
                          "maxStoredJobs",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of job descriptions to keep in history
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Expiry (Days)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={settings.job.jobExpiryDays}
                      onChange={(e) =>
                        handleSettingsChange(
                          "job",
                          "jobExpiryDays",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Days to keep job descriptions before automatic deletion
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    Job Processing Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between md:col-span-2">
                      <div className="space-y-0.5">
                        <Label>Auto-fetch from URL</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically extract job details when a URL is
                          provided
                        </p>
                      </div>
                      <Switch
                        checked={settings.job.autofetchFromURL}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "job",
                            "autofetchFromURL",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label>Preferred Job Source</Label>
                      <Select
                        value={settings.job.preferredJobSource}
                        onValueChange={(value: "text" | "url" | "file") =>
                          handleSettingsChange(
                            "job",
                            "preferredJobSource",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            Direct Text Input
                          </SelectItem>
                          <SelectItem value="url">URL/Web Link</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Default method for adding new job descriptions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Supported Job Sites
                  </h3>
                  <div className="text-sm">
                    <p className="mb-2">
                      Automatic extraction is supported for these popular job
                      sites:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "LinkedIn",
                        "Indeed",
                        "Glassdoor",
                        "ZipRecruiter",
                        "Monster",
                        "Workday",
                        "Greenhouse",
                        "Lever",
                        "Company Career Pages",
                      ].map((site) => (
                        <Badge key={site} variant="secondary">
                          {site}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("analysis")}
                >
                  Next: Analysis Settings
                </Button>
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Analysis Settings */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Analysis Settings
                </CardTitle>
                <CardDescription>
                  Configure how resumes are analyzed and scored against job
                  descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Scoring Weights</h3>
                  <p className="text-xs text-muted-foreground">
                    Adjust the importance of each factor in the overall match
                    score (total must equal 100%)
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>
                          Skills Weight: {settings.analysis.skillsWeight}%
                        </Label>
                      </div>
                      <Slider
                        min={10}
                        max={70}
                        step={5}
                        value={[settings.analysis.skillsWeight]}
                        onValueChange={(value) => {
                          const remaining =
                            100 -
                            value[0] -
                            settings.analysis.educationWeight -
                            settings.analysis.keywordsWeight;
                          handleSettingsChange(
                            "analysis",
                            "skillsWeight",
                            value[0]
                          );
                          handleSettingsChange(
                            "analysis",
                            "experienceWeight",
                            remaining
                          );
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>
                          Experience Weight:{" "}
                          {settings.analysis.experienceWeight}%
                        </Label>
                      </div>
                      <Slider
                        min={10}
                        max={70}
                        step={5}
                        value={[settings.analysis.experienceWeight]}
                        onValueChange={(value) => {
                          const remaining =
                            100 -
                            value[0] -
                            settings.analysis.educationWeight -
                            settings.analysis.keywordsWeight;
                          handleSettingsChange(
                            "analysis",
                            "experienceWeight",
                            value[0]
                          );
                          handleSettingsChange(
                            "analysis",
                            "skillsWeight",
                            remaining
                          );
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>
                          Education Weight: {settings.analysis.educationWeight}%
                        </Label>
                      </div>
                      <Slider
                        min={5}
                        max={30}
                        step={5}
                        value={[settings.analysis.educationWeight]}
                        onValueChange={(value) => {
                          const remaining =
                            100 -
                            settings.analysis.skillsWeight -
                            settings.analysis.experienceWeight -
                            value[0];
                          handleSettingsChange(
                            "analysis",
                            "educationWeight",
                            value[0]
                          );
                          handleSettingsChange(
                            "analysis",
                            "keywordsWeight",
                            remaining
                          );
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>
                          Keywords Weight: {settings.analysis.keywordsWeight}%
                        </Label>
                      </div>
                      <Slider
                        min={5}
                        max={30}
                        step={5}
                        value={[settings.analysis.keywordsWeight]}
                        onValueChange={(value) => {
                          const remaining =
                            100 -
                            settings.analysis.skillsWeight -
                            settings.analysis.experienceWeight -
                            value[0];
                          handleSettingsChange(
                            "analysis",
                            "keywordsWeight",
                            value[0]
                          );
                          handleSettingsChange(
                            "analysis",
                            "educationWeight",
                            remaining
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label>Total Weight</Label>
                    <Badge
                      variant={
                        settings.analysis.skillsWeight +
                          settings.analysis.experienceWeight +
                          settings.analysis.educationWeight +
                          settings.analysis.keywordsWeight ===
                        100
                          ? "default"
                          : "destructive"
                      }
                    >
                      {settings.analysis.skillsWeight +
                        settings.analysis.experienceWeight +
                        settings.analysis.educationWeight +
                        settings.analysis.keywordsWeight}
                      %
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Analysis Options</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Match Threshold (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={settings.analysis.minimumMatchThreshold}
                        onChange={(e) =>
                          handleSettingsChange(
                            "analysis",
                            "minimumMatchThreshold",
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum score to consider a resume as a potential match
                      </p>
                    </div>

                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Detailed Analysis</Label>
                          <p className="text-xs text-muted-foreground">
                            Provide deeper insights into each matching category
                          </p>
                        </div>
                        <Switch
                          checked={settings.analysis.detailedAnalysis}
                          onCheckedChange={(checked) =>
                            handleSettingsChange(
                              "analysis",
                              "detailedAnalysis",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Generate Suggestions</Label>
                          <p className="text-xs text-muted-foreground">
                            Provide specific improvement suggestions for the
                            resume
                          </p>
                        </div>
                        <Switch
                          checked={settings.analysis.generateSuggestions}
                          onCheckedChange={(checked) =>
                            handleSettingsChange(
                              "analysis",
                              "generateSuggestions",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Highlight Keywords</Label>
                          <p className="text-xs text-muted-foreground">
                            Highlight matching keywords in resume and job
                            description
                          </p>
                        </div>
                        <Switch
                          checked={settings.analysis.highlightKeywords}
                          onCheckedChange={(checked) =>
                            handleSettingsChange(
                              "analysis",
                              "highlightKeywords",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("data")}>
                  Next: Data Settings
                </Button>
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Data Storage Settings
                </CardTitle>
                <CardDescription>
                  Configure how your data is stored and managed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Storage Options</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Store Resumes</Label>
                        <p className="text-xs text-muted-foreground">
                          Save uploaded resumes for future use
                        </p>
                      </div>
                      <Switch
                        checked={settings.data.storeResumes}
                        onCheckedChange={(checked) =>
                          handleSettingsChange("data", "storeResumes", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Store Job Descriptions</Label>
                        <p className="text-xs text-muted-foreground">
                          Save job descriptions for future use
                        </p>
                      </div>
                      <Switch
                        checked={settings.data.storeJobDescriptions}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "data",
                            "storeJobDescriptions",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Analysis Retention (Days)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={settings.data.analysisRetentionDays}
                        onChange={(e) =>
                          handleSettingsChange(
                            "data",
                            "analysisRetentionDays",
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Days to keep analysis results before automatic deletion
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Anonymous Analysis</Label>
                        <p className="text-xs text-muted-foreground">
                          Analyze without requiring account creation
                        </p>
                      </div>
                      <Switch
                        checked={settings.data.allowAnonymousAnalysis}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "data",
                            "allowAnonymousAnalysis",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={settings.data.dataExportFormat}
                    onValueChange={(value: "json" | "csv" | "pdf") =>
                      handleSettingsChange("data", "dataExportFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Default format for exporting analysis results
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Data Privacy Information
                  </h3>
                  <div className="text-sm space-y-2">
                    <p>
                      <span className="text-muted-foreground">
                        Storage Location:
                      </span>{" "}
                      {settings.llm.provider === "local"
                        ? "All data is stored locally on your device"
                        : "Analysis data is stored locally, resumes and job descriptions are processed in the cloud"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Data Retention:
                      </span>{" "}
                      Resumes and job descriptions are kept for{" "}
                      {settings.data.storeResumes
                        ? settings.job.jobExpiryDays
                        : "0"}{" "}
                      days. Analysis results are kept for{" "}
                      {settings.data.analysisRetentionDays} days.
                    </p>
                    <p>
                      <span className="text-muted-foreground">Data Usage:</span>{" "}
                      Your data is used solely for resume analysis and is not
                      shared with third parties.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete All Stored Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Save size={16} />
                    Export All Data
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("notifications")}
                >
                  Next: Notification Settings
                </Button>
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive updates and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive updates and alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingsChange(
                        "notifications",
                        "emailNotifications",
                        checked
                      )
                    }
                  />
                </div>

                {settings.notifications.emailNotifications && (
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={settings.notifications.emailAddress}
                      onChange={(e) =>
                        handleSettingsChange(
                          "notifications",
                          "emailAddress",
                          e.target.value
                        )
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Match Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications for new job matches
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.newMatchAlert}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "notifications",
                            "newMatchAlert",
                            checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Digest</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive a weekly summary of your job matching activity
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.weeklyDigest}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "notifications",
                            "weeklyDigest",
                            checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive updates about new features and services
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.marketingEmails}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "notifications",
                            "marketingEmails",
                            checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Email Preferences
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        Email Frequency:
                      </span>{" "}
                      {settings.notifications.weeklyDigest
                        ? "Weekly digest plus immediate match alerts"
                        : settings.notifications.newMatchAlert
                        ? "Immediate alerts only for new matches"
                        : "No regular emails"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Email Format:
                      </span>{" "}
                      HTML emails with detailed match information
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Unsubscribe:
                      </span>{" "}
                      You can unsubscribe at any time from any email
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {settings.userType === "recruiter" ? (
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("recruiter")}
                  >
                    Next: Recruiter Settings
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setActiveTab("llm")}>
                    Back to LLM Settings
                  </Button>
                )}
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Recruiter Settings */}
          <TabsContent value="recruiter">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlackIcon className="h-5 w-5" />
                  Recruiter Settings
                </CardTitle>
                <CardDescription>
                  Additional settings for recruiters and hiring managers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Maximum Batch Size</Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={settings.recruiter.maxBatchSize}
                      onChange={(e) =>
                        handleSettingsChange(
                          "recruiter",
                          "maxBatchSize",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of resumes to process in a single batch
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-Reject Threshold (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.recruiter.autoRejectThreshold}
                      onChange={(e) =>
                        handleSettingsChange(
                          "recruiter",
                          "autoRejectThreshold",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically flag resumes below this match percentage
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Sort Order</Label>
                  <Select
                    value={settings.recruiter.defaultSortBy}
                    onValueChange={(value: "score" | "date" | "name") =>
                      handleSettingsChange("recruiter", "defaultSortBy", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">
                        Match Score (High to Low)
                      </SelectItem>
                      <SelectItem value="date">
                        Date Added (Newest First)
                      </SelectItem>
                      <SelectItem value="name">Name (A to Z)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Default ordering for candidate lists
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Candidate Names</Label>
                    <p className="text-xs text-muted-foreground">
                      Display candidate names in analysis results
                    </p>
                  </div>
                  <Switch
                    checked={settings.recruiter.showCandidateNames}
                    onCheckedChange={(checked) =>
                      handleSettingsChange(
                        "recruiter",
                        "showCandidateNames",
                        checked
                      )
                    }
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Features for Recruiters
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        Batch Processing:
                      </span>{" "}
                      Analyze up to {settings.recruiter.maxBatchSize} resumes at
                      once against a single job description
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Candidate Ranking:
                      </span>{" "}
                      Automatically rank candidates based on match score and
                      other factors
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Export Options:
                      </span>{" "}
                      Export results in multiple formats for sharing with hiring
                      managers
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Bias Reduction:
                      </span>{" "}
                      Option to anonymize candidates to reduce unconscious bias
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("llm")}>
                  Back to LLM Settings
                </Button>
                <Button onClick={saveSettings} disabled={isSaved}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SettingsConfiguration;
