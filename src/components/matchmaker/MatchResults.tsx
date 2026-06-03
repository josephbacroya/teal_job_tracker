"use client";

import { motion } from "framer-motion";
import { Briefcase, Target, ChevronRight } from "lucide-react";

type RecommendedJob = {
  title: string;
  company: string;
  matchPercentage: number;
  reasoning: string;
};

type MatchData = {
  level: string;
  coreSkills: string[];
  recommendedJobs: RecommendedJob[];
};

export function MatchResults({ data }: { data: MatchData }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 mt-8"
    >
      {/* Candidate Profile Summary */}
      <motion.div variants={item} className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Profile Analyzed</h3>
            <p className="text-muted-foreground">Based on your resume, here is what we found</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Estimated Level</p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
              {data.level}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Core Skills Detected</p>
            <div className="flex flex-wrap gap-2">
              {data.coreSkills.map((skill, index) => (
                <span key={index} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Recommendations */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center space-x-3 mb-6">
          <Briefcase className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Recommended Roles</h3>
        </div>
        
        <div className="grid gap-4">
          {data.recommendedJobs.map((job, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.01 }}
              className="group relative bg-card border rounded-xl p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-muted-foreground font-medium">{job.company}</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                    {job.reasoning}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-primary">{job.matchPercentage}% Match</span>
                    <div className="h-2 w-24 bg-primary/10 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${job.matchPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
