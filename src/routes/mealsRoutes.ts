import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../database/database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middleware/checkSessionIdExists";
import { checkUserId } from "@/middleware/checkUserId";

interface Params {
  id: string;
}

export const mealRoutes = async (app: FastifyInstance) => {
  app.get(
    "/",
    {
      preHandler: [checkUserId],
    },
    async (req, res) => {
      try {
        const meals = await knex("meals")
          .join("users", "meals.user_id", "=", "users.id")
          .where("user_id", req.user_id)
          .select("meals.*", "users.name as user_name");

        return { meals };
      } catch (error) {
        console.error("Error fetching meals:", error);
        return res.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  app.get(
    "/calories",
    {
      preHandler: [checkUserId],
    },
    async (req) => {
      const totalCalories = await knex("meals")
        .sum("calories", { as: "Calories" })
        .where("user_id", req.user_id)
        .first();

      return {
        totalCalories,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkUserId],
    },
    async (req) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = req.cookies;

      const { id } = getMealParamsSchema.parse(req.params);

      const meal = await knex("meals")
        .where({ session_id: sessionId, id })
        .first();

      return {
        meal,
      };
    }
  );

  app.post(
    "/",
    {
      preHandler: [checkUserId],
    },
    async (req, res) => {
      const createMealSchema = z.object({
        name: z.string(),
        desc: z.string(),
        calories: z.number().int(),
        isInTheDiet: z.boolean(),
      });

      const { name, desc, calories, isInTheDiet } = createMealSchema.parse(
        req.body
      );
      const { sessionId } = req.cookies;

      const user = await knex("users").where("session_id", sessionId).first();

      if (!user) {
        return res.status(401).send({ error: "User not authorized." });
      }

      await knex("meals").insert({
        id: randomUUID(),
        name,
        desc,
        calories,
        isInTheDiet,
        user_id: user.id,
      });

      return res.status(201).send();
    }
  );

  app.put<{ Params: Params }>(
    "/:id",
    {
      preHandler: [checkUserId],
    },
    async (req, res) => {
      const updateMealSchema = z.object({
        name: z.string().optional(),
        desc: z.string().optional(),
        calories: z.number().int().optional(),
        isInTheDiet: z.boolean().optional(),
      });

      const updates = updateMealSchema.parse(req.body);
      const { id } = req.params;

      const meal = await knex("meals").where({ id }).first();
      if (!meal) {
        return res.status(404).send({ error: "Meal not found" });
      }

      await knex("meals").where({ id }).update(updates);
    }
  );

  app.delete<{ Params: Params }>("/:id", async (req, res) => {
    const { id } = req.params;
    await knex("meals").where("id", id).del();

    return res.status(204).send();
  });

  app.get(
    "/diet-summary",
    {
      preHandler: [checkUserId],
    },
    async (req, res) => {
      try {
        const { user_id } = req;

        const dietSummary = await knex("meals")
          .where("user_id", user_id)
          .groupBy("isInTheDiet")
          .select("isInTheDiet")
          .count({ count: "*" });

        const withinDiet = dietSummary.find(
          (entry) => Number(entry.isInTheDiet) === 1
        );
        const outOfDiet = dietSummary.find(
          (entry) => Number(entry.isInTheDiet) === 0
        );

        return {
          withinDiet: withinDiet ? withinDiet.count : 0,
          outOfDiet: outOfDiet ? outOfDiet.count : 0,
        };
      } catch (error) {
        console.error("Error fetching diet summary:", error);
        return res.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  app.get(
    "/total-meals",
    {
      preHandler: [checkUserId],
    },
    async (req, res) => {
      try {
        const totalMeals = await knex("meals")
          .where("user_id", req.user_id)
          .count<{ count: number }>("id as count")
          .first();

        return res.status(200).send({ totalMeals: totalMeals?.count || 0 });
      } catch (error) {
        console.error("Error fetching total meals:", error);
        return res.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  app.get(
    "/best-diet-sequence",
    {
      preHandler: [checkUserId],
    },
    async (req, res) => {
      try {
        const meals = await knex("meals")
          .where("user_id", req.user_id)
          .orderBy("created_at")
          .select("isInTheDiet");

        let maxSequence = 0;
        let currentSequence = 0;

        for (const meal of meals) {
          if (meal.isInTheDiet) {
            currentSequence += 1;
            maxSequence = Math.max(maxSequence, currentSequence);
          } else {
            currentSequence = 0;
          }
        }

        return res.status(200).send({ bestDietSequence: maxSequence });
      } catch (error) {
        console.error("Error fetching best diet sequence:", error);
        return res.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
};
