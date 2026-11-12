# AI/ML Course Resources

## Knowledge

### Unit 0 — Mathematical floor
- [Video: 3Blue1Brown — *Essence of Linear Algebra*, ch. 9 "Dot products and duality"](https://www.3blue1brown.com/lessons/dot-products)
  Geometric meaning of the dot product in 12 minutes. Use for: intuition behind every score function in the course.
- [Video: 3Blue1Brown — *Essence of Calculus*, ch. 10 "The gradient"](https://www.3blue1brown.com/lessons/gradient)
  Why the gradient points uphill. Use for: Unit 0.2 and everything about training.

### Unit 1 — ML foundations
- [Video series: StatQuest — *Machine Learning* (Josh Starmer)](https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF)
  One concept per video, no hand-waving. Use for: trees, boosting, cross-validation, ROC.
- [Docs: scikit-learn User Guide, ch. 1–3](https://scikit-learn.org/stable/user_guide.html)
  The reference implementation of everything in Unit 1. Use for: exact API and defaults.

### Units 2–3 — Deep learning mechanics
- [Video series: 3Blue1Brown — *Neural Networks* (4 parts)](https://www.3blue1brown.com/topics/neural-networks)
  Best available visual treatment of backprop. Use for: topics 8–11.
- [Video: Karpathy — *Neural Networks: Zero to Hero*, ep. 1–2](https://karpathy.ai/zero-to-hero.html)
  Builds backprop from scratch in code. Use for: making topic 10 concrete.
- [Book: Goodfellow, Bengio & Courville — *Deep Learning*, ch. 7–8](https://www.deeplearningbook.org)
  Free PDF. Use for: regularization and optimization details beyond the lesson.

### Unit 4 — NLP
- [Course: Hugging Face NLP Course, ch. 1–2](https://huggingface.co/learn/nlp-course)
  Tokenizers and fine-tuning with runnable code. Use for: topics 15–16.
- [Article: Jay Alammar — *The Illustrated Word2Vec*](https://jalammar.github.io/illustrated-word2vec/)
  Embeddings explained visually. Use for: topic 16.

### Unit 5–6 — RL and Deep RL
- [Book: Sutton & Barto — *Reinforcement Learning: An Introduction*, 2nd ed., ch. 1–6](http://incompleteideas.net/book/the-book-2nd.html)
  The primary source. Free PDF. Use for: MDPs, Bellman equations, TD learning.
- [Course: David Silver — UCL RL lectures 1–5](https://www.davidsilver.uk/teaching/)
  The clearest lecture treatment of value-based methods. Use for: topics 19–22.
- [Course: OpenAI — *Spinning Up in Deep RL*](https://spinningup.openai.com)
  Theory plus reference implementations. Use for: DQN, policy gradients, PPO.

### Unit 7 — Attention and LLMs
- [Article: Jay Alammar — *The Illustrated Transformer*](https://jalammar.github.io/illustrated-transformer/)
  The standard visual walkthrough. Use for: topics 26–27.
- [Video: Karpathy — *Let's build GPT: from scratch*](https://www.youtube.com/watch?v=kCc8FmEb1nY)
  Codes a transformer line by line. Use for: making attention concrete.
- [Paper: Vaswani et al. 2017, *Attention Is All You Need*](https://arxiv.org/abs/1706.03762)
  Read §3 only. Use for: exact equations.

### Unit 8 — Explainable AI
- [Book: Christoph Molnar — *Interpretable Machine Learning*](https://christophm.github.io/interpretable-ml-book/)
  Free, rigorous, opinionated. Use for: all of Unit 8.
- [Paper: Lundberg & Lee 2017, *A Unified Approach to Interpreting Model Predictions*](https://arxiv.org/abs/1705.07874)
  SHAP's origin. Use for: what SHAP actually computes.

### Unit 9 — Federated learning
- [Paper: McMahan et al. 2017, *Communication-Efficient Learning of Deep Networks from Decentralized Data*](https://arxiv.org/abs/1602.05629)
  The FedAvg paper. Use for: topic 33.
- [Docs: Flower — federated learning framework](https://flower.ai/docs/)
  Practical protocol reference. Use for: topics 33–35.

## Wisdom (Communities)
- [Cross Validated (stats.stackexchange.com)](https://stats.stackexchange.com)
  Strongest moderation of any ML Q&A site. Use for: "is my reasoning about this loss/estimator right?"
- [r/MachineLearning](https://reddit.com/r/MachineLearning)
  Research-oriented, hostile to hand-waving. Use for: paper discussion, "is this approach sane?"
- [Hugging Face Forums](https://discuss.huggingface.co)
  Practitioners who actually fine-tune models. Use for: Unit 7 debugging.
- [r/reinforcementlearning](https://reddit.com/r/reinforcementlearning)
  Use for: RL reproducibility myths and hyperparameter reality checks.

## Gaps
- **Past exam papers.** None found. Highest-value resource for the mission; I need the user to supply them so lessons can target the actual question style.
- **Course syllabus / lecture notes.** Unknown. If the exam weights topics differently from this curriculum, the plan must be re-weighted.
