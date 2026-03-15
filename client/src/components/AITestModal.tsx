'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Brain, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateSkillQuestions, evaluateSkillAnswers, type VerificationQuestion } from '@/lib/gemini';
import { useAuthStore } from '@/lib/store';

interface AITestModalProps {
  skill: string;
  isOpen: boolean;
  onClose: () => void;
}

type QuizState = 'IDLE' | 'GENERATING' | 'QUIZ' | 'EVALUATING' | 'RESULTS' | 'ERROR';

export default function AITestModal({ skill, isOpen, onClose }: AITestModalProps) {
  const [state, setState] = useState<QuizState>('IDLE');
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateSkillVerification } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      startGeneration();
    } else {
      // Reset state when modal closes
      setTimeout(() => {
        setState('IDLE');
        setQuestions([]);
        setCurrentIdx(0);
        setAnswers(['', '', '', '', '']);
        setEvaluation(null);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const startGeneration = async () => {
    setState('GENERATING');
    try {
      const q = await generateSkillQuestions(skill);
      setQuestions(q);
      setState('QUIZ');
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      setState('ERROR');
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setState('EVALUATING');
    try {
      const result = await evaluateSkillAnswers(skill, questions, answers);
      setEvaluation(result);
      
      // Persist to Firestore
      await updateSkillVerification(skill, {
        status: result.score >= 75 && result.isHuman ? 'verified' : 'failed',
        score: result.score,
        feedback: result.feedback,
        aiProbability: result.aiProbability,
      });
      
      setState('RESULTS');
    } catch (err) {
      setError("Evaluation failed. Please try again.");
      setState('ERROR');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden glass rounded-3xl border border-white/10 shadow-2xl"
          style={{ background: 'rgba(15, 15, 25, 0.95)' }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Skill Verification</h3>
                <p className="text-sm text-gray-400">Verifying expertise in <span className="text-indigo-400 font-semibold">{skill}</span></p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
            {state === 'GENERATING' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white">Generating Questions...</h4>
                <p className="text-gray-400 mt-2">Gemini is crafting custom challenges for your skill level.</p>
              </motion.div>
            )}

            {state === 'QUIZ' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
                <div className="mb-6 flex items-center justify-between text-sm">
                  <span className="text-indigo-400 font-mono">Question {currentIdx + 1} of 5</span>
                  <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIdx + 1) / 5) * 100}%` }}
                    />
                  </div>
                </div>
                
                <h4 className="text-xl text-white font-medium mb-6 leading-relaxed">
                  {questions[currentIdx]?.question}
                </h4>

                <textarea
                  value={answers[currentIdx]}
                  onChange={(e) => {
                    const nextAnswers = [...answers];
                    nextAnswers[currentIdx] = e.target.value;
                    setAnswers(nextAnswers);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[150px] transition-all"
                  placeholder="Provide a detailed technical answer..."
                />

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentIdx].trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all transform hover:translate-x-1"
                  >
                    {currentIdx < 4 ? 'Next Question' : 'Finish & Evaluate'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {state === 'EVALUATING' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white">Analyzing Responses...</h4>
                <p className="text-gray-400 mt-2">Our AI is evaluating technical accuracy and authenticity.</p>
              </motion.div>
            )}

            {state === 'RESULTS' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center">
                {evaluation.score >= 75 && evaluation.isHuman ? (
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">Verification Successful!</h4>
                    <p className="text-emerald-400 mt-1 font-medium">Rank: Expert Mentor</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">Verification Failed</h4>
                    <p className="text-red-400 mt-1 font-medium">
                      {!evaluation.isHuman ? 'AI-generated content detected' : 'Technical score below threshold'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">Technical Score</p>
                    <p className="text-2xl font-bold text-indigo-400">{evaluation.score}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">Authenticity</p>
                    <p className="text-2xl font-bold text-indigo-400">{evaluation.isHuman ? 'High' : 'Low'}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl text-left border border-white/5 mb-8">
                  <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Detailed Feedback</h5>
                  <p className="text-gray-300 italic">"{evaluation.feedback}"</p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
                >
                  Return to Profile
                </button>
              </motion.div>
            )}

            {state === 'ERROR' && (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white">{error}</h4>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2 bg-white/5 text-white rounded-xl"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
