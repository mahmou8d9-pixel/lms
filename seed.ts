import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import userModel from "./models/user.model";
import CourseModel from "./models/course.model";
import OrderModel from "./models/order.model";
import NotificationModel from "./models/notification.model";
import { redis } from "./utils/redis";

dotenv.config();

const DB_URL: string = process.env.DB_URL || "";

// Standard hashed password for mock users: "User@123456"
const DEFAULT_PASSWORD = "User@123456";

const mockUsersData = [
  {
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/sarah",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Omar Hassan",
    email: "omar.hassan@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/omar",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Alex Chen",
    email: "alex.chen@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/alex",
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Fatima Al-Mansoor",
    email: "fatima.almansoor@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/fatima",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "David Miller",
    email: "david.miller@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/david",
      url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/elena",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Tariq Ziad",
    email: "tariq.ziad@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/tariq",
      url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Layla Ibrahim",
    email: "layla.ibrahim@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/layla",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    role: "user",
    avatar: {
      public_id: "avatars/marcus",
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    name: "Kareem Adel",
    email: "kareem.adel@example.com",
    role: "admin",
    avatar: {
      public_id: "avatars/kareem",
      url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  },
];

const mockCoursesData = [
  {
    name: "Full-Stack Web Development with Next.js 14, Node.js & TypeScript",
    description:
      "Master modern full-stack web development building production-grade web applications with Next.js 14 App Router, Server Actions, TypeScript, Node.js, MongoDB, and Tailwind CSS. Learn auth, state management, caching, and CI/CD deployment.",
    categories: "tech",
    price: 79,
    estimatedPrice: 199,
    tags: "Next.js, React, Node.js, TypeScript, Fullstack, Web Development",
    level: "Intermediate",
    demoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: {
      public_id: "courses/nextjs_thumb",
      url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80",
    },
    benefits: [
      {
        title:
          "Build full-stack applications with Next.js 14 App Router & Server Actions",
      },
      {
        title: "Implement secure JWT auth, cookies, and role-based permissions",
      },
      { title: "Master MongoDB schema modeling, indexing, and aggregations" },
      { title: "Integrate Stripe payment checkout and webhook verification" },
      { title: "Deploy production applications on Vercel, Docker, and AWS" },
    ],
    prerequisites: [
      {
        title:
          "Comfortable with modern JavaScript (ES6+) and asynchronous programming",
      },
      { title: "Basic knowledge of React components, props, and hooks" },
    ],
    courseData: [
      {
        title: "Introduction to Next.js 14 & App Architecture",
        description:
          "Overview of Next.js 14 App Router, Server Components vs Client Components, routing conventions, and setup.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Getting Started",
        videoLength: "45 mins",
        videoPlayer: "YouTube",
        links: [
          {
            title: "Next.js 14 Official Documentation",
            url: "https://nextjs.org/docs",
          },
          {
            title: "Project GitHub Repository",
            url: "https://github.com/example/nextjs-starter",
          },
        ],
        suggestion: "Ensure Node.js 18.17+ is installed before starting.",
        questions: [
          {
            user: { name: "Omar Hassan", email: "omar.hassan@example.com" },
            question:
              "When should I prefer Server Components over Client Components?",
            questionReplies: [
              {
                user: {
                  name: "Sarah Jenkins",
                  email: "sarah.jenkins@example.com",
                },
                answer:
                  "Default to Server Components for data fetching and heavy dependencies; use Client Components only when you need interactive hooks like useState, useEffect, or browser APIs.",
              },
            ],
          },
        ],
      },
      {
        title: "Server Actions, Mutations & Data Fetching",
        description:
          "Deep dive into Server Actions, optimistic UI updates, revalidation, and caching strategies in Next.js 14.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Core Concepts",
        videoLength: "65 mins",
        videoPlayer: "YouTube",
        links: [
          {
            title: "Server Actions Deep Dive",
            url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations",
          },
        ],
        suggestion:
          "Practice implementing optimistic updates with useOptimistic hook.",
        questions: [],
      },
      {
        title: "Stripe Payment Gateway & Production Deployment",
        description:
          "Connect Stripe checkout sessions, verify webhook signatures, manage user orders in MongoDB, and deploy with Docker.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Payments & Production",
        videoLength: "80 mins",
        videoPlayer: "YouTube",
        links: [
          { title: "Stripe Node SDK Docs", url: "https://stripe.com/docs/api" },
        ],
        suggestion: "Use the Stripe CLI for local webhook event testing.",
        questions: [],
      },
    ],
    reviews: [
      {
        user: { name: "Alex Chen", email: "alex.chen@example.com" },
        rating: 5,
        comment:
          "Outstanding course! The explanations of Next.js 14 App Router and server actions are clearer than any other tutorial online.",
        commentReplies: [],
      },
      {
        user: { name: "Layla Ibrahim", email: "layla.ibrahim@example.com" },
        rating: 5,
        comment:
          "The Stripe integration section alone is worth ten times the price. Clean code and great structure.",
        commentReplies: [],
      },
    ],
    rating: 5,
    purchased: 42,
  },
  {
    name: "Mastering React 18, Redux Toolkit & Tailwind CSS",
    description:
      "Become an expert frontend engineer by mastering modern React 18 concurrent features, custom hooks, Redux Toolkit for complex state management, and modern responsive UI development with Tailwind CSS.",
    categories: "tech",
    price: 59,
    estimatedPrice: 149,
    tags: "React, Redux Toolkit, Tailwind CSS, Frontend, JavaScript",
    level: "Beginner",
    demoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: {
      public_id: "courses/react_thumb",
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    },
    benefits: [
      { title: "Build robust, component-driven React applications" },
      {
        title: "Master global state management using Redux Toolkit & RTK Query",
      },
      {
        title:
          "Design responsive, dark-mode ready interfaces with Tailwind CSS",
      },
      { title: "Write clean custom hooks for reusable logic" },
    ],
    prerequisites: [
      { title: "Basic knowledge of HTML, CSS, and modern JavaScript" },
    ],
    courseData: [
      {
        title: "React Fundamentals: Props, State, and Lifecycle",
        description:
          "Understanding JSX, component architecture, hooks lifecycle, and state lifting.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Foundation",
        videoLength: "50 mins",
        videoPlayer: "YouTube",
        links: [{ title: "React Dev Docs", url: "https://react.dev" }],
        suggestion: "Code along in CodeSandbox or Vite locally.",
        questions: [],
      },
      {
        title: "State Management with Redux Toolkit & RTK Query",
        description:
          "Setting up store, slices, reducers, and automated API caching with RTK Query.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Advanced State",
        videoLength: "75 mins",
        videoPlayer: "YouTube",
        links: [
          { title: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org" },
        ],
        suggestion:
          "Use Redux DevTools extension for inspecting state dispatches.",
        questions: [],
      },
    ],
    reviews: [
      {
        user: { name: "David Miller", email: "david.miller@example.com" },
        rating: 5,
        comment:
          "Finally understood Redux Toolkit thanks to this! RTK Query section is pure gold.",
        commentReplies: [],
      },
    ],
    rating: 4.9,
    purchased: 35,
  },
  {
    name: "Python for Data Science, Machine Learning & AI",
    description:
      "A comprehensive, practical roadmap to Python programming, Pandas, NumPy, Scikit-Learn, data visualization with Matplotlib & Seaborn, and an intro to Deep Learning with PyTorch.",
    categories: "tech",
    price: 89,
    estimatedPrice: 220,
    tags: "Python, Data Science, Machine Learning, AI, Pandas, PyTorch",
    level: "Intermediate",
    demoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: {
      public_id: "courses/python_thumb",
      url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80",
    },
    benefits: [
      { title: "Analyze real datasets using Pandas and NumPy" },
      {
        title:
          "Build predictive models with Linear Regression, Random Forests & XGBoost",
      },
      {
        title:
          "Evaluate models with precision, recall, ROC-AUC, and cross-validation",
      },
      { title: "Create interactive data dashboards and visual reports" },
    ],
    prerequisites: [
      { title: "High school level algebra and basic programming familiarity" },
    ],
    courseData: [
      {
        title: "Data Wrangling with Pandas & NumPy",
        description:
          "Cleaning messy data, handling missing values, filtering, grouping, and aggregations.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Data Wrangling",
        videoLength: "60 mins",
        videoPlayer: "YouTube",
        links: [
          { title: "Pandas Documentation", url: "https://pandas.pydata.org" },
        ],
        suggestion:
          "Use Jupyter Notebooks or Google Colab for interactive runs.",
        questions: [],
      },
    ],
    reviews: [
      {
        user: { name: "Omar Hassan", email: "omar.hassan@example.com" },
        rating: 5,
        comment:
          "Clear explanations and practical datasets from Kaggle. Super recommended!",
        commentReplies: [],
      },
    ],
    rating: 4.8,
    purchased: 28,
  },
  {
    name: "UI/UX Design Masterclass: Wireframing to Figma Prototypes",
    description:
      "Master the art of user interface and user experience design. Learn design systems, typography, color theory, layout grids, auto-layout 5.0, interactive component variants, and developer handoff in Figma.",
    categories: "tech",
    price: 49,
    estimatedPrice: 129,
    tags: "UI/UX, Figma, Design System, Prototyping, Wireframing",
    level: "Beginner",
    demoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: {
      public_id: "courses/figma_thumb",
      url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    },
    benefits: [
      { title: "Build professional design systems with tokens and variables" },
      { title: "Master Figma auto-layout, components, and nested variants" },
      { title: "Create micro-interactions and animated prototypes" },
      { title: "Conduct user research and usability testing" },
    ],
    prerequisites: [
      {
        title:
          "No prior design experience required. Just curiosity and creativity!",
      },
    ],
    courseData: [
      {
        title: "Figma Fundamentals & Auto-Layout Deep Dive",
        description:
          "Frames, constraints, auto-layout nesting, responsive resizing, and typography scales.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Figma Mastery",
        videoLength: "55 mins",
        videoPlayer: "YouTube",
        links: [
          {
            title: "Figma Community Resources",
            url: "https://www.figma.com/community",
          },
        ],
        suggestion: "Practice recreating 3 popular mobile app screens.",
        questions: [],
      },
    ],
    reviews: [
      {
        user: {
          name: "Fatima Al-Mansoor",
          email: "fatima.almansoor@example.com",
        },
        rating: 5,
        comment:
          "This course transformed my design process. The auto-layout tips saved me hours of work.",
        commentReplies: [],
      },
    ],
    rating: 4.9,
    purchased: 50,
  },
  {
    name: "Docker, Kubernetes & AWS DevOps Bootcamp",
    description:
      "A hands-on, enterprise DevOps curriculum covering containerization with Docker, multi-stage builds, orchestration with Kubernetes (EKS), automated CI/CD pipelines with GitHub Actions, and AWS cloud hosting.",
    categories: "tech",
    price: 99,
    estimatedPrice: 249,
    tags: "DevOps, Docker, Kubernetes, AWS, CI/CD, Cloud",
    level: "Hard",
    demoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: {
      public_id: "courses/devops_thumb",
      url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=80",
    },
    benefits: [
      {
        title: "Containerize microservices with minimal, secure Docker images",
      },
      {
        title: "Deploy and scale Kubernetes deployments, services, and ingress",
      },
      { title: "Set up automated test & deploy pipelines in GitHub Actions" },
      { title: "Manage infrastructure as code and deploy to AWS EKS" },
    ],
    prerequisites: [
      { title: "Basic Linux terminal commands and basic git workflow" },
    ],
    courseData: [
      {
        title: "Docker Essentials: Images, Containers & Volumes",
        description:
          "Building efficient multi-stage Dockerfiles, managing container networks and data persistence.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Containers",
        videoLength: "70 mins",
        videoPlayer: "YouTube",
        links: [
          { title: "Docker Documentation", url: "https://docs.docker.com" },
        ],
        suggestion:
          "Install Docker Desktop and test container commands locally.",
        questions: [],
      },
    ],
    reviews: [
      {
        user: { name: "Tariq Ziad", email: "tariq.ziad@example.com" },
        rating: 5,
        comment:
          "Exceptional depth! The Kubernetes ingress and secrets management chapters were top notch.",
        commentReplies: [],
      },
    ],
    rating: 4.9,
    purchased: 31,
  },
  {
    name: "Agile Product Management & Business Strategy",
    description:
      "Learn how Silicon Valley product managers discover customer needs, validate product ideas, define MVP scopes, build roadmap strategies, and lead high-performing cross-functional engineering teams.",
    categories: "business",
    price: 69,
    estimatedPrice: 175,
    tags: "Business, Product Management, Agile, Leadership, Scrum",
    level: "Beginner",
    demoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: {
      public_id: "courses/business_thumb",
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    },
    benefits: [
      {
        title:
          "Write crisp PRDs (Product Requirement Documents) and user stories",
      },
      { title: "Measure success with North Star metrics and OKRs" },
      { title: "Run sprint planning, retrospectives, and backlog grooming" },
      { title: "Master product discovery and continuous customer interviews" },
    ],
    prerequisites: [
      {
        title:
          "Open to anyone aspiring to work in technology or startup leadership",
      },
    ],
    courseData: [
      {
        title: "The Product Lifecycle & Opportunity Scoring",
        description:
          "From market sizing (TAM/SAM/SOM) to customer persona development and opportunity matrices.",
        videoUrl: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        videoThumbnail: {
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80",
        },
        videoSection: "Discovery",
        videoLength: "48 mins",
        videoPlayer: "YouTube",
        links: [
          {
            title: "Product Coalition Articles",
            url: "https://productcoalition.com",
          },
        ],
        suggestion:
          "Draft a mock PRD for a feature you wish your favorite app had.",
        questions: [],
      },
    ],
    reviews: [
      {
        user: { name: "Marcus Vance", email: "marcus.vance@example.com" },
        rating: 4.8,
        comment:
          "Helped me transition from engineering to associate product manager. Practical templates!",
        commentReplies: [],
      },
    ],
    rating: 4.8,
    purchased: 22,
  },
];

const mockNotifications = [
  {
    title: "New Course Order Placed",
    message:
      "Omar Hassan purchased 'Full-Stack Web Development with Next.js 14'",
    status: "unread",
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
  },
  {
    title: "New Student Question",
    message: "Sarah Jenkins posted a question in 'Next.js 14 Server Actions'",
    status: "unread",
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
  },
  {
    title: "New 5-Star Course Review",
    message: "Alex Chen left a 5-star review on 'Python for Data Science & AI'",
    status: "unread",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    title: "Course Purchase Confirmed",
    message: "Fatima Al-Mansoor enrolled in 'UI/UX Design Masterclass'",
    status: "unread",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    title: "Payment Settlement Success",
    message: "Stripe payout #PO-88219 has been processed successfully",
    status: "read",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    title: "New Student Question Reply",
    message: "Instructor replied to David Miller's question in 'Docker & AWS'",
    status: "read",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    title: "Certificate Generated",
    message: "Certificate of completion issued to Elena Rostova",
    status: "read",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    title: "New User Registered",
    message: "Marcus Vance signed up and verified their email address",
    status: "read",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(DB_URL);
    console.log("Connected successfully!");

    // 1. Seed / Upsert Users
    console.log("\n--- Seeding Users ---");
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const createdUsers: any[] = [];

    for (const u of mockUsersData) {
      let user = await userModel.findOne({ email: u.email });
      if (!user) {
        user = await userModel.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          avatar: u.avatar,
          isVerified: true,
          courses: [],
        });
        console.log(`Created user: ${u.name} (${u.email}) [${u.role}]`);
      } else {
        console.log(`User already exists: ${u.name} (${u.email})`);
      }
      createdUsers.push(user);
    }

    // Also get all users in database (including pre-existing ones)
    const allUsers = await userModel.find();
    console.log(`Total users in system: ${allUsers.length}`);

    // 2. Seed / Upsert Courses
    console.log("\n--- Seeding Courses ---");
    const createdCourses: any[] = [];

    for (const c of mockCoursesData) {
      let course = await CourseModel.findOne({ name: c.name });
      if (!course) {
        course = await CourseModel.create(c);
        console.log(`Created course: "${c.name}" - $${c.price}`);
      } else {
        console.log(`Course already exists: "${c.name}"`);
      }
      createdCourses.push(course);
    }

    const allCourses = await CourseModel.find();
    console.log(`Total courses in system: ${allCourses.length}`);

    // 3. Seed Orders (Invoices) distributed across past 11 months
    console.log("\n--- Seeding Orders (Invoices) for Analytics ---");
    const existingOrdersCount = await OrderModel.countDocuments();

    // Only create orders if there are fewer than 15 orders
    if (existingOrdersCount < 15) {
      const now = new Date();
      const newOrdersToInsert: any[] = [];

      // Create 2-3 orders per 28-day window over the last 11 periods
      for (let period = 0; period < 11; period++) {
        const periodOrdersCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 orders per period

        for (let j = 0; j < periodOrdersCount; j++) {
          const randomUser =
            allUsers[Math.floor(Math.random() * allUsers.length)];
          const randomCourse =
            allCourses[Math.floor(Math.random() * allCourses.length)];

          // Days offset in the past
          const daysAgo = period * 28 + Math.floor(Math.random() * 24);
          const orderDate = new Date(
            now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
          );

          const orderDoc = {
            courseId: (randomCourse._id as any).toString(),
            userId: (randomUser._id as any).toString(),
            payment_info: {
              id: "pi_mock_" + Math.random().toString(36).substring(2, 12),
              status: "succeeded",
              amount: randomCourse.price * 100,
              currency: "usd",
              payment_method_types: ["card"],
            },
            createdAt: orderDate,
            updatedAt: orderDate,
          };

          newOrdersToInsert.push(orderDoc);

          // Update user's courses list if not already present
          const courseIdStr = (randomCourse._id as any).toString();
          const hasCourse = randomUser.courses?.some(
            (c: any) => c.courseId === courseIdStr,
          );
          if (!hasCourse) {
            randomUser.courses.push({ courseId: courseIdStr });
            await userModel.updateOne(
              { _id: randomUser._id },
              { $addToSet: { courses: { courseId: courseIdStr } } },
            );
          }

          // Increment course purchased counter
          await CourseModel.updateOne(
            { _id: randomCourse._id },
            { $inc: { purchased: 1 } },
          );
        }
      }

      await OrderModel.insertMany(newOrdersToInsert);
      console.log(
        `Inserted ${newOrdersToInsert.length} mock orders distributed across recent months.`,
      );
    } else {
      console.log(
        `Existing orders (${existingOrdersCount}) are sufficient. Skipping orders insertion.`,
      );
    }

    // 4. Seed Notifications
    console.log("\n--- Seeding Notifications ---");
    for (const notif of mockNotifications) {
      const exists = await NotificationModel.findOne({
        title: notif.title,
        message: notif.message,
      });
      if (!exists) {
        await NotificationModel.create(notif);
        console.log(`Created notification: [${notif.status}] ${notif.title}`);
      }
    }

    // 5. Invalidate Redis Cache
    console.log("\n--- Clearing Redis Cache ---");
    try {
      await redis.del("allCourses");
      for (const course of allCourses) {
        await redis.del((course._id as any).toString());
      }
      console.log(
        "Redis cache cleared successfully for 'allCourses' and courses!",
      );
    } catch (redisErr: any) {
      console.warn("Redis warning (ignorable if offline):", redisErr.message);
    }

    console.log("\n=============================================");
    console.log(" MOCK DATA SEEDING COMPLETED SUCCESSFULLY! ");
    console.log("=============================================");
    console.log(`Test users default password: ${DEFAULT_PASSWORD}`);
    console.log(
      `Mock users created: ${mockUsersData.map((u) => u.email).join(", ")}`,
    );
    console.log("=============================================\n");

    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
