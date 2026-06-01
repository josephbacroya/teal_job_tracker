// prisma/seed.ts
// Architecture note: Seeds give you a realistic starting point for development
// and demos. Never run seeds against production — use migrations for schema
// changes and real data for production seeding.

import { PrismaClient, ApplicationStatus, InterviewType, InterviewOutcome } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.interview.deleteMany();
  await prisma.note.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash("Demo1234!", 12);
  const user = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "demo@jobtrackr.dev",
      password: hashedPassword,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create sample applications
  const applications = await Promise.all([
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Stripe",
        jobTitle: "Senior Software Engineer",
        location: "San Francisco, CA (Hybrid)",
        salaryMin: 180000,
        salaryMax: 240000,
        jobUrl: "https://stripe.com/jobs",
        appliedAt: new Date("2025-10-15"),
        status: ApplicationStatus.TECHNICAL_INTERVIEW,
        notes: "Referral from Sarah K. Great tech stack — Go, Ruby, TypeScript.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Vercel",
        jobTitle: "Staff Frontend Engineer",
        location: "Remote",
        salaryMin: 200000,
        salaryMax: 260000,
        jobUrl: "https://vercel.com/careers",
        appliedAt: new Date("2025-10-20"),
        status: ApplicationStatus.RECRUITER_SCREEN,
        notes: "Applied through their website. Role is fully remote.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Linear",
        jobTitle: "Full Stack Engineer",
        location: "Remote",
        salaryMin: 160000,
        salaryMax: 200000,
        appliedAt: new Date("2025-10-22"),
        status: ApplicationStatus.APPLIED,
        notes: "Small team, incredible product. Very selective.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Figma",
        jobTitle: "Software Engineer, Editor",
        location: "New York, NY",
        salaryMin: 170000,
        salaryMax: 220000,
        appliedAt: new Date("2025-09-30"),
        status: ApplicationStatus.REJECTED,
        notes: "Got to final round. Rejected due to HC freeze.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Notion",
        jobTitle: "Senior Backend Engineer",
        location: "San Francisco, CA",
        salaryMin: 190000,
        salaryMax: 250000,
        appliedAt: new Date("2025-11-01"),
        status: ApplicationStatus.FINAL_INTERVIEW,
        notes: "4th round — system design tomorrow.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Anthropic",
        jobTitle: "Software Engineer, Products",
        location: "San Francisco, CA",
        salaryMin: 200000,
        salaryMax: 300000,
        appliedAt: new Date("2025-11-05"),
        status: ApplicationStatus.OFFER,
        notes: "OFFER RECEIVED! $240k base + equity. Decision by Nov 20.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "Supabase",
        jobTitle: "Developer Advocate",
        location: "Remote",
        salaryMin: 140000,
        salaryMax: 170000,
        appliedAt: new Date("2025-11-10"),
        status: ApplicationStatus.WISHLIST,
        notes: "Love the product. Check if they have eng roles.",
      },
    }),
    prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName: "PlanetScale",
        jobTitle: "Senior Engineer",
        location: "Remote",
        salaryMin: 165000,
        salaryMax: 210000,
        appliedAt: new Date("2025-09-15"),
        status: ApplicationStatus.REJECTED,
        notes: "Failed take-home.",
      },
    }),
  ]);

  console.log(`✅ Created ${applications.length} applications`);

  // Add interviews to the Stripe application
  const stripeApp = applications[0];
  await prisma.interview.createMany({
    data: [
      {
        applicationId: stripeApp.id,
        type: InterviewType.PHONE,
        scheduledAt: new Date("2025-10-18T14:00:00"),
        location: "Phone call",
        notes: "30 min intro with recruiter Sarah. Went well.",
        outcome: InterviewOutcome.PASSED,
      },
      {
        applicationId: stripeApp.id,
        type: InterviewType.TECHNICAL,
        scheduledAt: new Date("2025-10-25T10:00:00"),
        location: "Zoom",
        notes: "LeetCode medium — sliding window. Solved it.",
        outcome: InterviewOutcome.PASSED,
      },
      {
        applicationId: stripeApp.id,
        type: InterviewType.TECHNICAL,
        scheduledAt: new Date("2025-11-08T13:00:00"),
        location: "Zoom",
        notes: "System design: design a payment processing system.",
        outcome: InterviewOutcome.PENDING,
      },
    ],
  });

  // Add interview to Notion application
  const notionApp = applications[4];
  await prisma.interview.create({
    data: {
      applicationId: notionApp.id,
      type: InterviewType.FINAL,
      scheduledAt: new Date("2025-11-12T11:00:00"),
      location: "Zoom",
      notes: "Panel with 3 engineers. 45 min system design.",
      outcome: InterviewOutcome.PENDING,
    },
  });

  // Add notes
  await prisma.note.createMany({
    data: [
      {
        applicationId: stripeApp.id,
        content: "Recruiter mentioned team is ~8 engineers. Working on Stripe Billing.",
      },
      {
        applicationId: stripeApp.id,
        content: "Prep: study distributed systems, CAP theorem, Stripe API design.",
      },
    ],
  });

  console.log("✅ Created interviews and notes");
  console.log("\n🎉 Seed complete!");
  console.log("   Email:    demo@jobtrackr.dev");
  console.log("   Password: Demo1234!\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
