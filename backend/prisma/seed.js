import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Careers
  const careers = [
    {
      title: 'Software Developer',
      description: 'Design, build, and maintain software applications using modern tech stacks.',
      requiredSkills: ['DSA', 'System Design', 'Testing', 'Spring Boot', 'Git', 'Cloud', 'SQL', 'JavaScript'],
      demandLevel: 'High',
      avgSalary: '$105,000 / yr'
    },
    {
      title: 'Data Analyst',
      description: 'Analyze data sets to spot trends, build dashboards, and assist business decision-making.',
      requiredSkills: ['SQL', 'Python', 'Excel', 'Tableau', 'PowerBI', 'Statistics'],
      demandLevel: 'High',
      avgSalary: '$85,000 / yr'
    },
    {
      title: 'Data Scientist',
      description: 'Extract actionable insights from complex structured and unstructured data using ML models.',
      requiredSkills: ['Python', 'R', 'Machine Learning', 'Deep Learning', 'Statistics', 'SQL', 'Pandas'],
      demandLevel: 'Very High',
      avgSalary: '$120,000 / yr'
    },
    {
      title: 'AI/ML Engineer',
      description: 'Build predictive AI solutions and integrate LLMs and deep learning models.',
      requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'NLP', 'Computer Vision', 'MLOps'],
      demandLevel: 'Extremely High',
      avgSalary: '$140,000 / yr'
    },
    {
      title: 'Cybersecurity Analyst',
      description: 'Protect system networks, analyze threat vectors, and implement security protocols.',
      requiredSkills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'SIEM', 'Linux', 'Firewalls'],
      demandLevel: 'High',
      avgSalary: '$98,000 / yr'
    },
    {
      title: 'Cloud Engineer',
      description: 'Deploy, manage, and scale cloud infrastructure on AWS, Azure, or GCP.',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Networking'],
      demandLevel: 'Very High',
      avgSalary: '$115,000 / yr'
    }
  ];

  for (const c of careers) {
    await prisma.career.upsert({
      where: { title: c.title },
      update: c,
      create: c
    });
  }

  // Seed Skills
  const skills = [
    { name: 'DSA', category: 'Computer Science' },
    { name: 'System Design', category: 'Software Architecture' },
    { name: 'SQL', category: 'Database' },
    { name: 'Java', category: 'Programming Language' },
    { name: 'JavaScript', category: 'Programming Language' },
    { name: 'Python', category: 'Programming Language' },
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Machine Learning', category: 'AI' }
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: s,
      create: s
    });
  }

  // Seed IBM SkillsBuild Courses
  const courses = [
    {
      courseName: 'System Design Fundamentals',
      provider: 'IBM SkillsBuild',
      skillName: 'System Design',
      difficulty: 'Intermediate',
      duration: '10 Hours',
      description: 'Master scalable architecture, load balancing, caching, microservices, and database partitioning.',
      externalUrl: 'https://skillsbuild.org/system-design'
    },
    {
      courseName: 'Data Structures & Algorithms Masterclass',
      provider: 'IBM SkillsBuild',
      skillName: 'DSA',
      difficulty: 'Intermediate',
      duration: '25 Hours',
      description: 'In-depth coverage of trees, graphs, dynamic programming, sorting, and big-O analysis.',
      externalUrl: 'https://skillsbuild.org/dsa'
    },
    {
      courseName: 'Relational Database Design & SQL',
      provider: 'IBM SkillsBuild',
      skillName: 'SQL',
      difficulty: 'Beginner',
      duration: '8 Hours',
      description: 'Learn SQL querying, database normalization, indexing, joins, and transaction isolation.',
      externalUrl: 'https://skillsbuild.org/sql'
    },
    {
      courseName: 'Enterprise Java Development & Spring Boot',
      provider: 'IBM SkillsBuild',
      skillName: 'Java',
      difficulty: 'Advanced',
      duration: '20 Hours',
      description: 'Build enterprise web services using Java 17, Spring Boot, JPA, and RESTful principles.',
      externalUrl: 'https://skillsbuild.org/java-springboot'
    },
    {
      courseName: 'Cloud Computing Architecture & AWS',
      provider: 'IBM SkillsBuild',
      skillName: 'AWS',
      difficulty: 'Intermediate',
      duration: '15 Hours',
      description: 'Deploy cloud-native services using AWS EC2, S3, RDS, Lambda, and IAM policies.',
      externalUrl: 'https://skillsbuild.org/aws-cloud'
    },
    {
      courseName: 'Containerization with Docker & Kubernetes',
      provider: 'IBM SkillsBuild',
      skillName: 'Docker',
      difficulty: 'Intermediate',
      duration: '12 Hours',
      description: 'Containerize microservices with Docker images and orchestrate multi-node clusters using K8s.',
      externalUrl: 'https://skillsbuild.org/docker-k8s'
    }
  ];

  for (const crs of courses) {
    const existing = await prisma.course.findFirst({
      where: { courseName: crs.courseName }
    });
    if (!existing) {
      await prisma.course.create({ data: crs });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
