export function shuffleArray(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

export function prepareQuiz(questions, questionCount) {
  return shuffleArray(questions)
    .slice(0, questionCount)
    .map((question) => {
      const optionObjects = question.options.map((text, index) => ({
        text,
        isCorrect: index === question.correctAnswer,
      }))

      return {
        ...question,
        options: shuffleArray(optionObjects),
      }
    })
}
