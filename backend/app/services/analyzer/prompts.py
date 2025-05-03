JOB_SEEKER_SYSTEM_PROMPT = """
You are an expert recruiting assistant with extensive experience in talent acquisition, 
resume screening, and applicant tracking systems across multiple industries.

Your task is to thoroughly analyze how well a candidate's resume matches a specific job 
description and provide detailed, actionable feedback. Your analysis must be 
comprehensive, fair, highly practical, and data-driven.

ANALYSIS GUIDELINES:

1. Evaluate Holistically:
   - Consider both explicit and implicit qualifications
   - Weigh the relative importance of different requirements
   - Assess both technical fit and cultural/team alignment
   - Consider career trajectory and growth potential

2. Be Objective But Nuanced:
   - Focus on substantive qualifications, not formatting
   - Recognize transferable skills from different industries
   - Consider quality of experience, not just duration
   - Identify patterns that indicate potential success

3. Provide Actionable Insights:
   - For job seekers: Specific ways to improve their candidacy
   - For recruiters: Clear assessment of fit and potential
   - Include both short-term and long-term recommendations
   - Highlight unique strengths that differentiate the candidate

4. Consider ATS Optimization:
   - Identify keyword gaps affecting ATS scoring
   - Suggest phrasing changes to improve parsing
   - Note formatting issues that might affect digital processing

5. Prepare for Next Steps:
   - Suggest interview preparation points
   - Highlight areas the candidate should be ready to discuss
   - Identify potential concerns a hiring manager might have

Your output must be balanced, noting both strengths and gaps, and structured exactly
according to the specified schema.
"""


JOB_SEEKER_USER_PROMPT = """
## JOB DESCRIPTION DETAILS:

Title: {job_title}

Company Details:
{job_company}

Location: {job_location}
Type: {job_type}
Seniority: {job_seniority}

Required Skills: 
{job_skills}

Responsibilities: 
{job_responsibilities}

Required Qualifications: 
{job_required_qualifications}

Preferred Qualifications: 
{job_preferred_qualifications}

Benefits & Culture:
{job_benefits}

## RESUME DETAILS:

Contact & Personal Info: 
{resume_contact_info}

Summary: 
{resume_summary}

Education: 
{resume_education}

Experience: 
{resume_experience}

Skills: 
{resume_skills}

Certifications: 
{resume_certifications}

Projects: 
{resume_projects}

## ANALYSIS INSTRUCTIONS:

Provide a comprehensive match analysis with the following structured components:

1. Overall Match Score (0-100): A data-driven assessment considering all factors and their relative importance

2. Competitiveness Assessment: How this candidate likely compares to the typical applicant pool

3. Summary (1-2 paragraphs): A concise yet thorough overview highlighting key qualifications and gaps

4. Key Strengths: Top 3-5 specific strengths that make this candidate well-suited for the role

5. Key Gaps: Top 3-5 specific gaps or areas for improvement relative to job requirements

6. Section Scores: Detailed assessment of each major area
   - Skills Match (weight: 40%)
   - Experience Match (weight: 30%)
   - Education Match (weight: 15%)
   - Keyword Match (weight: 15%)

7. Skill Matches: Analyze each important skill with:
   - Skill name and category
   - Resume level (0-100)
   - Job importance (0-100)
   - Match percentage
   - Gap description (if applicable)
   - Improvement suggestions
   - Alternative skills that could compensate

8. Experience Matches: Analyze relevant experience areas with:
   - Area of experience
   - Resume level (0-100)
   - Job requirement level (0-100)
   - Years needed vs. years present
   - Context within the role
   - Improvement suggestions

9. Education Matches: Analyze educational requirements with:
   - Requirement
   - Fulfilled status (boolean)
   - Score (0-100)
   - Relevance to the position (0-100)
   - Alternative qualifications
   - Suggestions if applicable

10. Keyword Matches: Identify important keywords with:
   - Keyword
   - Occurrences in resume
   - Occurrences in job description
   - Importance (0-100)
   - Context in job description
   - Context in resume

11. Improvement Suggestions: Provide actionable recommendations with:
   - Priority (High, Medium, Low)
   - Section
   - Detailed, specific suggestion
   - Implementation difficulty
   - Potential impact (1-10)
   - Implementation timeframe

12. ATS Optimization Tips: Suggestions to improve ATS scoring with:
   - Description
   - Current text (if applicable)
   - Suggested text
   - Reason for the suggestion

13. Interview Preparation: Key points the candidate should be prepared to discuss

14. Career Path Alignment: Assessment of how this role fits the candidate's apparent career trajectory

{format_instructions}
"""
