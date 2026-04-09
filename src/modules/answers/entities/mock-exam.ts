export type MockQuestionType = 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECTION' | 'OPEN' | 'CODE';

export type MockQuestion = {
  id_question: number;
  statement: string;
  question_type: MockQuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  bloom_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  points: number;
  answers?: Array<{
    id_answer: number;
    answer_text: string;
    is_correct: boolean;
  }>;
  codeQuestion?: {
    language: 'python';
    starter_code: string;
    test_cases: Array<{
      input: string;
      expected: string;
    }>;
  };
};

export type MockExamSession = {
  assignmentId: number;
  examName: string;
  examTitle: string;
  subjectName: string;
  unitLabel: string;
  groupLabel: string;
  durationMinutes: number;
  questions: MockQuestion[];
};

const multipleChoiceQuestions: MockQuestion[] = [
  {
    id_question: 1,
    statement: '¿Cuál de las siguientes opciones NO es un tipo primitivo en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'int', is_correct: false },
      { id_answer: 2, answer_text: 'list', is_correct: true },
      { id_answer: 3, answer_text: 'str', is_correct: false },
      { id_answer: 4, answer_text: 'bool', is_correct: false },
    ],
  },
  {
    id_question: 2,
    statement: '¿Qué imprime print(type(None)) en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: '<class \"NoneType\">', is_correct: true },
      { id_answer: 2, answer_text: '<class \"null\">', is_correct: false },
      { id_answer: 3, answer_text: '<class \"object\">', is_correct: false },
      { id_answer: 4, answer_text: '<class \"undefined\">', is_correct: false },
    ],
  },
  {
    id_question: 3,
    statement: '¿Cuál es la forma correcta de definir una lista vacía en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'list()', is_correct: false },
      { id_answer: 2, answer_text: '[]', is_correct: true },
      { id_answer: 3, answer_text: '{}', is_correct: false },
      { id_answer: 4, answer_text: '()', is_correct: false },
    ],
  },
  {
    id_question: 4,
    statement: '¿Qué palabra reservada se usa para definir una función en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'function', is_correct: false },
      { id_answer: 2, answer_text: 'def', is_correct: true },
      { id_answer: 3, answer_text: 'func', is_correct: false },
      { id_answer: 4, answer_text: 'lambda', is_correct: false },
    ],
  },
  {
    id_question: 5,
    statement: '¿Cuál es el resultado de 7 // 2 en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'apply',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: '3.5', is_correct: false },
      { id_answer: 2, answer_text: '3', is_correct: true },
      { id_answer: 3, answer_text: '4', is_correct: false },
      { id_answer: 4, answer_text: '2', is_correct: false },
    ],
  },
  {
    id_question: 6,
    statement: '¿Cuál método convierte un valor a texto en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'text()', is_correct: false },
      { id_answer: 2, answer_text: 'str()', is_correct: true },
      { id_answer: 3, answer_text: 'toString()', is_correct: false },
      { id_answer: 4, answer_text: 'char()', is_correct: false },
    ],
  },
  {
    id_question: 7,
    statement: '¿Cuál de estas estructuras mantiene el orden de inserción y es mutable?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'tuple', is_correct: false },
      { id_answer: 2, answer_text: 'list', is_correct: true },
      { id_answer: 3, answer_text: 'set', is_correct: false },
      { id_answer: 4, answer_text: 'frozenset', is_correct: false },
    ],
  },
  {
    id_question: 8,
    statement: '¿Qué hace la función len([1, 2, 3, 4])?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'apply',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'Devuelve 4', is_correct: true },
      { id_answer: 2, answer_text: 'Devuelve 3', is_correct: false },
      { id_answer: 3, answer_text: 'Devuelve 5', is_correct: false },
      { id_answer: 4, answer_text: 'Devuelve 1', is_correct: false },
    ],
  },
  {
    id_question: 9,
    statement: '¿Qué biblioteca estándar se usa comúnmente para trabajar con fechas y horas?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'medium',
    bloom_level: 'remember',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'datetime', is_correct: true },
      { id_answer: 2, answer_text: 'calendarx', is_correct: false },
      { id_answer: 3, answer_text: 'timeit', is_correct: false },
      { id_answer: 4, answer_text: 'dateutils', is_correct: false },
    ],
  },
  {
    id_question: 10,
    statement: '¿Qué sentencia se usa para manejar excepciones?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'try / except', is_correct: true },
      { id_answer: 2, answer_text: 'if / else', is_correct: false },
      { id_answer: 3, answer_text: 'for / while', is_correct: false },
      { id_answer: 4, answer_text: 'case / switch', is_correct: false },
    ],
  },
  {
    id_question: 11,
    statement: '¿Cuál de las siguientes expresiones devuelve el cuadrado de x en una sola línea?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'x * x', is_correct: true },
      { id_answer: 2, answer_text: 'x ^ 2', is_correct: false },
      { id_answer: 3, answer_text: 'square(x)', is_correct: false },
      { id_answer: 4, answer_text: 'pow(x)', is_correct: false },
    ],
  },
  {
    id_question: 12,
    statement: '¿Qué produce list(range(1, 4))?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: '[1, 2, 3]', is_correct: true },
      { id_answer: 2, answer_text: '[1, 2, 3, 4]', is_correct: false },
      { id_answer: 3, answer_text: '[0, 1, 2]', is_correct: false },
      { id_answer: 4, answer_text: '[1, 4]', is_correct: false },
    ],
  },
  {
    id_question: 13,
    statement: '¿Qué hace el operador in en Python?',
    question_type: 'MULTIPLE_CHOICE',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 10,
    answers: [
      { id_answer: 1, answer_text: 'Comprueba pertenencia', is_correct: true },
      { id_answer: 2, answer_text: 'Calcula división', is_correct: false },
      { id_answer: 3, answer_text: 'Concatena cadenas', is_correct: false },
      { id_answer: 4, answer_text: 'Ordena listas', is_correct: false },
    ],
  },
];

const multipleSelectionQuestions: MockQuestion[] = [
  {
    id_question: 14,
    statement: 'Selecciona las estructuras mutables en Python.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'list', is_correct: true },
      { id_answer: 2, answer_text: 'tuple', is_correct: false },
      { id_answer: 3, answer_text: 'dict', is_correct: true },
      { id_answer: 4, answer_text: 'set', is_correct: true },
    ],
  },
  {
    id_question: 15,
    statement: 'Selecciona los tipos de datos inmutables.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'remember',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'tuple', is_correct: true },
      { id_answer: 2, answer_text: 'list', is_correct: false },
      { id_answer: 3, answer_text: 'str', is_correct: true },
      { id_answer: 4, answer_text: 'int', is_correct: true },
    ],
  },
  {
    id_question: 16,
    statement: 'Selecciona las palabras reservadas relacionadas con control de flujo.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'if', is_correct: true },
      { id_answer: 2, answer_text: 'elif', is_correct: true },
      { id_answer: 3, answer_text: 'then', is_correct: false },
      { id_answer: 4, answer_text: 'else', is_correct: true },
    ],
  },
  {
    id_question: 17,
    statement: 'Selecciona funciones válidas para manipular cadenas.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'upper()', is_correct: true },
      { id_answer: 2, answer_text: 'split()', is_correct: true },
      { id_answer: 3, answer_text: 'push()', is_correct: false },
      { id_answer: 4, answer_text: 'replace()', is_correct: true },
    ],
  },
  {
    id_question: 18,
    statement: 'Selecciona módulos de la biblioteca estándar de Python.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'math', is_correct: true },
      { id_answer: 2, answer_text: 'random', is_correct: true },
      { id_answer: 3, answer_text: 'sequelize', is_correct: false },
      { id_answer: 4, answer_text: 'datetime', is_correct: true },
    ],
  },
  {
    id_question: 19,
    statement: 'Selecciona afirmaciones correctas sobre dict.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'analyze',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'Almacena pares clave-valor', is_correct: true },
      { id_answer: 2, answer_text: 'Es inmutable', is_correct: false },
      { id_answer: 3, answer_text: 'Puede mutar su contenido', is_correct: true },
      { id_answer: 4, answer_text: 'No admite claves repetidas', is_correct: true },
    ],
  },
  {
    id_question: 20,
    statement: 'Selecciona operadores de comparación en Python.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: '==', is_correct: true },
      { id_answer: 2, answer_text: '!=', is_correct: true },
      { id_answer: 3, answer_text: '=>', is_correct: false },
      { id_answer: 4, answer_text: '<=', is_correct: true },
    ],
  },
  {
    id_question: 21,
    statement: 'Selecciona formas válidas de recorrer una secuencia.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'for item in items', is_correct: true },
      { id_answer: 2, answer_text: 'while index < len(items)', is_correct: true },
      { id_answer: 3, answer_text: 'foreach item in items', is_correct: false },
      { id_answer: 4, answer_text: 'for i := items', is_correct: false },
    ],
  },
  {
    id_question: 22,
    statement: 'Selecciona beneficios de usar funciones.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'Reutilización de código', is_correct: true },
      { id_answer: 2, answer_text: 'Mejor legibilidad', is_correct: true },
      { id_answer: 3, answer_text: 'Siempre ejecutan en paralelo', is_correct: false },
      { id_answer: 4, answer_text: 'Facilitan pruebas unitarias', is_correct: true },
    ],
  },
  {
    id_question: 23,
    statement: 'Selecciona declaraciones válidas de importación.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'easy',
    bloom_level: 'remember',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'import math', is_correct: true },
      { id_answer: 2, answer_text: 'from datetime import date', is_correct: true },
      { id_answer: 3, answer_text: 'include os', is_correct: false },
      { id_answer: 4, answer_text: 'import numpy as np', is_correct: true },
    ],
  },
  {
    id_question: 24,
    statement: 'Selecciona piezas típicas de una clase en Python.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: '__init__', is_correct: true },
      { id_answer: 2, answer_text: 'self', is_correct: true },
      { id_answer: 3, answer_text: 'constructor', is_correct: false },
      { id_answer: 4, answer_text: 'métodos de instancia', is_correct: true },
    ],
  },
  {
    id_question: 25,
    statement: 'Selecciona herramientas útiles para depuración.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'print()', is_correct: true },
      { id_answer: 2, answer_text: 'logging', is_correct: true },
      { id_answer: 3, answer_text: 'debugger', is_correct: true },
      { id_answer: 4, answer_text: 'render()', is_correct: false },
    ],
  },
  {
    id_question: 26,
    statement: 'Selecciona tipos de errores que pueden levantarse como excepciones.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'hard',
    bloom_level: 'analyze',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'ValueError', is_correct: true },
      { id_answer: 2, answer_text: 'TypeError', is_correct: true },
      { id_answer: 3, answer_text: 'IndentationError', is_correct: true },
      { id_answer: 4, answer_text: 'MarkupError', is_correct: false },
    ],
  },
  {
    id_question: 27,
    statement: 'Selecciona características de una lista por comprensión.',
    question_type: 'MULTIPLE_SELECTION',
    difficulty: 'hard',
    bloom_level: 'create',
    points: 15,
    answers: [
      { id_answer: 1, answer_text: 'Sintaxis compacta', is_correct: true },
      { id_answer: 2, answer_text: 'Puede incluir filtros', is_correct: true },
      { id_answer: 3, answer_text: 'Siempre devuelve un generador', is_correct: false },
      { id_answer: 4, answer_text: 'Produce una lista', is_correct: true },
    ],
  },
];

const openQuestions: MockQuestion[] = [
  {
    id_question: 28,
    statement: 'Explica con tus palabras la diferencia entre una lista y una tupla en Python.',
    question_type: 'OPEN',
    difficulty: 'easy',
    bloom_level: 'understand',
    points: 20,
  },
  {
    id_question: 29,
    statement: 'Describe un caso de uso para un diccionario en una aplicación real.',
    question_type: 'OPEN',
    difficulty: 'easy',
    bloom_level: 'apply',
    points: 20,
  },
  {
    id_question: 30,
    statement: 'Explica qué problema resuelve una función y por qué mejora el mantenimiento del código.',
    question_type: 'OPEN',
    difficulty: 'medium',
    bloom_level: 'analyze',
    points: 20,
  },
  {
    id_question: 31,
    statement: '¿Cuándo conviene usar una excepción personalizada en Python?',
    question_type: 'OPEN',
    difficulty: 'medium',
    bloom_level: 'analyze',
    points: 20,
  },
  {
    id_question: 32,
    statement: 'Explica la diferencia entre mutabilidad y reasignación con un ejemplo.',
    question_type: 'OPEN',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 20,
  },
  {
    id_question: 33,
    statement: 'Describe cómo trabajarías con un archivo de texto usando Python.',
    question_type: 'OPEN',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 20,
  },
  {
    id_question: 34,
    statement: 'Explica qué es una API REST y cómo la consumirías desde Python.',
    question_type: 'OPEN',
    difficulty: 'hard',
    bloom_level: 'analyze',
    points: 20,
  },
  {
    id_question: 35,
    statement: '¿Qué ventajas tiene programar con pruebas automatizadas?',
    question_type: 'OPEN',
    difficulty: 'medium',
    bloom_level: 'evaluate',
    points: 20,
  },
  {
    id_question: 36,
    statement: 'Explica el rol de la programación orientada a objetos en Python.',
    question_type: 'OPEN',
    difficulty: 'medium',
    bloom_level: 'understand',
    points: 20,
  },
  {
    id_question: 37,
    statement: 'Describe cómo evitarías duplicación de código en un proyecto pequeño.',
    question_type: 'OPEN',
    difficulty: 'easy',
    bloom_level: 'apply',
    points: 20,
  },
  {
    id_question: 38,
    statement: '¿Qué consideraciones tomarías al estructurar un proyecto de Python para mantenimiento a largo plazo?',
    question_type: 'OPEN',
    difficulty: 'hard',
    bloom_level: 'evaluate',
    points: 20,
  },
  {
    id_question: 39,
    statement: 'Explica la diferencia entre iteración y recursión.',
    question_type: 'OPEN',
    difficulty: 'hard',
    bloom_level: 'analyze',
    points: 20,
  },
];

const codeQuestions: MockQuestion[] = [
  {
    id_question: 40,
    statement: 'Escribe una función llamada reverse_string que reciba una cadena y retorne la cadena invertida.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'reverse_string("hola")', expected: 'aloh' },
        { input: 'reverse_string("Python")', expected: 'nohtyP' },
        { input: 'reverse_string("")', expected: '' },
      ],
    },
  },
  {
    id_question: 41,
    statement: 'Crea una función is_even que determine si un número es par.',
    question_type: 'CODE',
    difficulty: 'easy',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'is_even(4)', expected: 'True' },
        { input: 'is_even(7)', expected: 'False' },
        { input: 'is_even(0)', expected: 'True' },
      ],
    },
  },
  {
    id_question: 42,
    statement: 'Implementa una función factorial iterativa.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'factorial(5)', expected: '120' },
        { input: 'factorial(1)', expected: '1' },
        { input: 'factorial(0)', expected: '1' },
      ],
    },
  },
  {
    id_question: 43,
    statement: 'Crea una función count_vowels que cuente vocales en una cadena.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'count_vowels("programación")', expected: '5' },
        { input: 'count_vowels("xyz")', expected: '0' },
        { input: 'count_vowels("Python")', expected: '1' },
      ],
    },
  },
  {
    id_question: 44,
    statement: 'Implementa una función max_of_list que retorne el valor máximo de una lista.',
    question_type: 'CODE',
    difficulty: 'easy',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'max_of_list([1, 8, 3])', expected: '8' },
        { input: 'max_of_list([-5, -1, -9])', expected: '-1' },
        { input: 'max_of_list([7])', expected: '7' },
      ],
    },
  },
  {
    id_question: 45,
    statement: 'Crea una función sum_digits que sume los dígitos de un número entero positivo.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'sum_digits(123)', expected: '6' },
        { input: 'sum_digits(908)', expected: '17' },
        { input: 'sum_digits(5)', expected: '5' },
      ],
    },
  },
  {
    id_question: 46,
    statement: 'Implementa una función normalize_name que capitalice nombre y apellido.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'normalize_name("ana perez")', expected: 'Ana Perez' },
        { input: 'normalize_name("JUAN LOPEZ")', expected: 'Juan Lopez' },
        { input: 'normalize_name("maria")', expected: 'Maria' },
      ],
    },
  },
  {
    id_question: 47,
    statement: 'Crea una función filter_positive que devuelva solo números positivos.',
    question_type: 'CODE',
    difficulty: 'hard',
    bloom_level: 'analyze',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'filter_positive([-2, 0, 3, 9])', expected: '[3, 9]' },
        { input: 'filter_positive([1, 2, 3])', expected: '[1, 2, 3]' },
        { input: 'filter_positive([-1, -4])', expected: '[]' },
      ],
    },
  },
  {
    id_question: 48,
    statement: 'Implementa una función average que calcule el promedio de una lista.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'average([10, 20, 30])', expected: '20.0' },
        { input: 'average([5])', expected: '5.0' },
        { input: 'average([1, 2, 3, 4])', expected: '2.5' },
      ],
    },
  },
  {
    id_question: 49,
    statement: 'Crea una función remove_duplicates que elimine duplicados conservando el orden.',
    question_type: 'CODE',
    difficulty: 'hard',
    bloom_level: 'create',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'remove_duplicates([1, 2, 1, 3])', expected: '[1, 2, 3]' },
        { input: 'remove_duplicates(["a", "a", "b"])', expected: '["a", "b"]' },
        { input: 'remove_duplicates([])', expected: '[]' },
      ],
    },
  },
  {
    id_question: 50,
    statement: 'Implementa una función count_words que cuente palabras en una frase.',
    question_type: 'CODE',
    difficulty: 'medium',
    bloom_level: 'apply',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'count_words("hola mundo")', expected: '2' },
        { input: 'count_words("python es genial")', expected: '3' },
        { input: 'count_words("")', expected: '0' },
      ],
    },
  },
  {
    id_question: 51,
    statement: 'Escribe una función palindrome que determine si un texto es un palíndromo.',
    question_type: 'CODE',
    difficulty: 'hard',
    bloom_level: 'analyze',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'palindrome("reconocer")', expected: 'True' },
        { input: 'palindrome("python")', expected: 'False' },
        { input: 'palindrome("ana")', expected: 'True' },
      ],
    },
  },
  {
    id_question: 52,
    statement: 'Crea una función fibonacci que retorne los primeros n números de la secuencia.',
    question_type: 'CODE',
    difficulty: 'hard',
    bloom_level: 'create',
    points: 25,
    codeQuestion: {
      language: 'python',
      starter_code: '# Escribe tu solución en Python\n\n',
      test_cases: [
        { input: 'fibonacci(5)', expected: '[0, 1, 1, 2, 3]' },
        { input: 'fibonacci(1)', expected: '[0]' },
        { input: 'fibonacci(0)', expected: '[]' },
      ],
    },
  },
];

const mockQuestions = [
  ...multipleChoiceQuestions,
  ...multipleSelectionQuestions,
  ...openQuestions,
  ...codeQuestions,
].slice(0, 50);

export const mockExamSession: MockExamSession = {
  assignmentId: 201,
  examName: 'Python Fundamentals',
  examTitle: 'Evaluación de fundamentos de Python',
  subjectName: 'Programación',
  unitLabel: 'Unidad 1',
  groupLabel: '2A - Ingeniería de Software',
  durationMinutes: 45,
  questions: mockQuestions,
};
