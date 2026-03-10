import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { QuestionBank } from "../entities/question-bank";
import { QuestionRepository } from "./ports/question.repository";
import { CreateQuestionDto } from "../entities/create-question.dto";

export class CreateQuestionInteractor implements UseCase<CreateQuestionDto, ApiResponse<QuestionBank>> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(payload?: CreateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    if (!payload) {
      throw new Error("Missing payload for CreateQuestionInteractor");
    }
    return this.questionRepository.createQuestion(payload);
  }
}
