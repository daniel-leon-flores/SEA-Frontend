import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { QuestionBank } from "../entities/question-bank";
import { QuestionRepository } from "./ports/question.repository";
import { GetQuestionsDto } from "../entities/get-questions.dto";

export class GetQuestionsInteractor implements UseCase<GetQuestionsDto, ApiResponse<QuestionBank[]>> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(payload?: GetQuestionsDto): Promise<ApiResponse<QuestionBank[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetQuestionsInteractor");
    }
    return this.questionRepository.getQuestions(payload.pagination, payload.subjectId, payload.difficulty);
  }
}
