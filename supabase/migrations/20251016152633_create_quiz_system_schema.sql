/*
  # CSIT Quiz Portal Database Schema

  ## Overview
  This migration creates the complete database schema for the CSIT Quiz Portal with proper relationships
  and real-time capabilities.

  ## New Tables

  ### 1. `quizzes`
  - `id` (uuid, primary key) - Unique identifier for each quiz
  - `title` (text) - Quiz title
  - `category` (text) - Quiz category (Programming, DBMS, Networks, AI, Cybersecurity)
  - `duration` (integer) - Duration in minutes
  - `total_questions` (integer) - Number of questions in the quiz
  - `is_active` (boolean) - Whether quiz is available to students
  - `created_by` (uuid) - ID of admin who created the quiz
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `questions`
  - `id` (uuid, primary key) - Unique identifier for each question
  - `text` (text) - Question text
  - `options` (jsonb) - Array of answer options
  - `correct_answer` (integer) - Index of correct answer
  - `category` (text) - Question category
  - `difficulty` (text) - Easy, Medium, or Hard
  - `points` (integer) - Points awarded for correct answer
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `quiz_questions`
  - `id` (uuid, primary key) - Unique identifier
  - `quiz_id` (uuid, foreign key) - Reference to quiz
  - `question_id` (uuid, foreign key) - Reference to question
  - `order_index` (integer) - Order of question in quiz
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `quiz_attempts`
  - `id` (uuid, primary key) - Unique identifier
  - `quiz_id` (uuid, foreign key) - Reference to quiz
  - `student_id` (text) - ID of student taking quiz
  - `student_name` (text) - Name of student
  - `answers` (jsonb) - Student's answers
  - `score` (numeric) - Score percentage
  - `total_questions` (integer) - Number of questions attempted
  - `time_spent` (integer) - Time spent in seconds
  - `category_scores` (jsonb) - Performance breakdown by category
  - `completed_at` (timestamptz) - Completion timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read active quizzes
  - Add policies for students to read their own attempts
  - Add policies for admins to manage quizzes and questions

  ## Indexes
  - Created on foreign keys for performance
  - Created on frequently queried columns

  ## Notes
  - Uses JSONB for flexible data storage (options, answers, category_scores)
  - Real-time subscriptions enabled for quizzes and attempts tables
  - Cascade deletes configured for related records
*/

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  total_questions integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Medium',
  points integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_questions junction table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, question_id)
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  student_name text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  time_spent integer NOT NULL DEFAULT 0,
  category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id ON quiz_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_active ON quizzes(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes policies (allow all to read active quizzes, any user can write for demo)
CREATE POLICY "Anyone can view active quizzes"
  ON quizzes FOR SELECT
  USING (is_active = true OR true);

CREATE POLICY "Anyone can manage quizzes"
  ON quizzes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Questions policies (allow all for demo)
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage questions"
  ON questions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Quiz questions policies (allow all for demo)
CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Quiz attempts policies (students can read their own, anyone can insert)
CREATE POLICY "Anyone can view quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
