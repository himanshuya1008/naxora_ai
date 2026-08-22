/**
 * Customer DNA Engine
 * ===================
 * An AI Sales Intelligence Platform module that turns raw website behavior
 * and voice-conversation data into a structured, explainable customer
 * profile — NOT biological DNA; "DNA" here means the durable, evolving
 * signature of who this customer is and how they buy.
 *
 * Deliberately independent of the voice bot pipeline (ai/conversationBrain,
 * sockets/, services/voice/) and of the older ai/customerDNA module: this
 * engine reads data those systems already persist (Message, ObjectionLog,
 * ConversationScoreSnapshot, BehaviorEvent, Lead, Visitor) but never calls
 * into their code, and owns its own table (customer_dna), its own scoring
 * formulas (scoringConfig.js), and its own REST surface
 * (routes/customerDnaRoutes.js). Every score, label, and recommendation is a
 * deterministic, traceable function of real stored data, EXCEPT pain-point/
 * fallback-objection extraction (intentAnalyzer.js), which is one LLM call
 * per profile build — needed because a substring-keyword approach only
 * works in English, and this platform's real conversations are not all in
 * English. That call degrades to an English-keyword heuristic, never throws,
 * if the LLM is unavailable.
 *
 * Composition (see profileBuilder.js for the full wiring):
 *   behaviorAnalyzer + intentAnalyzer -> companyAnalyzer, communicationAnalyzer,
 *   personalityAnalyzer -> leadScoring -> recommendationEngine -> profileBuilder
 *   (assembles the final shape) -> memoryManager (persistence + continuity)
 *
 * customerDNAService.js is the only file other code should import from —
 * see routes/customerDnaRoutes.js -> controllers/customerDnaController.js.
 */

export { analyzeCustomer, getProfile, updateProfile, getDashboard } from './customerDNAService.js';
