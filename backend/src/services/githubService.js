import axios from 'axios';
import prisma from '../config/database.js';
import { env } from '../config/environment.js';
import { aiService } from '../ai/aiService.js';
import { calculateReadiness } from './readinessService.js';

export const connectGithubUser = async (userId, username) => {
  try {
    const headers = {};
    if (env.GITHUB_TOKEN) {
      headers.Authorization = `token ${env.GITHUB_TOKEN}`;
    }

    // Fetch user profile from GitHub REST API
    const userRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
    const profileData = userRes.data;

    // Fetch repositories from GitHub REST API
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers });
    const reposData = reposRes.data || [];

    // Transactionally save profile and repositories in DB
    const saved = await prisma.$transaction(async (tx) => {
      const ghProfile = await tx.githubProfile.upsert({
        where: { userId },
        update: {
          username: profileData.login,
          avatarUrl: profileData.avatar_url,
          bio: profileData.bio,
          publicRepos: profileData.public_repos,
          followers: profileData.followers,
          following: profileData.following,
          profileUrl: profileData.html_url
        },
        create: {
          userId,
          username: profileData.login,
          avatarUrl: profileData.avatar_url,
          bio: profileData.bio,
          publicRepos: profileData.public_repos,
          followers: profileData.followers,
          following: profileData.following,
          profileUrl: profileData.html_url
        }
      });

      // Clear existing repositories and re-populate
      await tx.githubRepository.deleteMany({
        where: { githubProfileId: ghProfile.id }
      });

      for (const r of reposData) {
        await tx.githubRepository.create({
          data: {
            githubProfileId: ghProfile.id,
            name: r.name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            url: r.html_url
          }
        });
      }

      return ghProfile;
    });

    // Automatically trigger analysis
    await analyzeGithubUser(userId);

    return await getGithubProfile(userId);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const err = new Error(`GitHub user '${username}' not found`);
      err.statusCode = 404;
      throw err;
    }
    if (error.response && error.response.status === 403) {
      const err = new Error('GitHub API rate limit exceeded. Please try again later.');
      err.statusCode = 429;
      throw err;
    }
    throw error;
  }
};

export const getGithubProfile = async (userId) => {
  const profile = await prisma.githubProfile.findUnique({
    where: { userId },
    include: {
      analysis: true,
      repositories: {
        take: 10,
        orderBy: { stars: 'desc' }
      }
    }
  });

  if (!profile) {
    const error = new Error('No GitHub profile connected for this user');
    error.statusCode = 404;
    throw error;
  }

  return {
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    publicRepos: profile.publicRepos,
    followers: profile.followers,
    following: profile.following,
    profileUrl: profile.profileUrl,
    analysis: profile.analysis,
    repositories: profile.repositories
  };
};

export const getGithubRepositories = async (userId) => {
  const profile = await prisma.githubProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    return [];
  }

  return await prisma.githubRepository.findMany({
    where: { githubProfileId: profile.id },
    orderBy: { stars: 'desc' }
  });
};

export const analyzeGithubUser = async (userId) => {
  const profile = await prisma.githubProfile.findUnique({
    where: { userId },
    include: { repositories: true }
  });

  if (!profile) {
    const error = new Error('No connected GitHub profile to analyze');
    error.statusCode = 404;
    throw error;
  }

  const analysisResult = await aiService.analyzeGithub(profile, profile.repositories);

  const updatedAnalysis = await prisma.githubAnalysis.upsert({
    where: { githubProfileId: profile.id },
    update: {
      projectQuality: analysisResult.projectQuality,
      complexityScore: analysisResult.complexityScore,
      relevanceScore: analysisResult.relevanceScore,
      summary: analysisResult.summary,
      topLanguages: analysisResult.topLanguages
    },
    create: {
      githubProfileId: profile.id,
      projectQuality: analysisResult.projectQuality,
      complexityScore: analysisResult.complexityScore,
      relevanceScore: analysisResult.relevanceScore,
      summary: analysisResult.summary,
      topLanguages: analysisResult.topLanguages
    }
  });

  await calculateReadiness(userId);

  return updatedAnalysis;
};
