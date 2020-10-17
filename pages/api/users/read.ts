import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";

const prisma = new PrismaClient();
type userDTO = {
  id: number;
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    const expectedBody = Joi.object({
      id: Joi.number().required(),
    });

    const { value, error } = expectedBody.validate(req.body);
    if (error) {
      throw new Error(error.message);
    }
    const body = value as userDTO;

    const user = await prisma.user.findOne({
      where: { id: body.id },
    });

    res.json(user);
  } catch (err) {
    res.status(500);
    res.json({ statusCode: 500, message: err.message });
  }
};
