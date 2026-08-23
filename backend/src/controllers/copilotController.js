import { aiService } from '../ai/aiService.js';
import prisma from '../config/database.js';

export const chatCopilot = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const reply = await aiService.chatCopilot({ message, history, profile, user });

    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
};
