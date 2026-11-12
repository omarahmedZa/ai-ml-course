# CURRICULUM

35 topics, 10 units, 10 checkpoints. Ordered so every prerequisite is taught before it is needed.
Minutes are reading time per lesson. Checkpoints are ~10 min mixed recall, not new material.

**Standing rule:** nothing in Unit 1+ re-explains Unit 0. If a Unit 0 idea is needed, it is referenced by number, not re-taught.

---

## Unit 0 — Mathematical floor
*Blocker removal. Assumes only arithmetic.*

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 1 | Vectors, matrices, dot product | read any score function as a dot product and check shapes mechanically | — | 8 |
| 2 | Slope → gradient | compute a gradient and explain why training steps *against* it | 1 | 10 |
| 3 | Probability, expectation, likelihood | explain why a loss is a negative log-likelihood; read mean/variance off a distribution | 1 | 10 |

**Checkpoint 1** — after 3.

## Unit 1 — Machine learning foundations

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 4 | Supervised learning as function fitting | write down (X, y, f_θ, L) for any task and say what is being learned | 1, 3 | 8 |
| 5 | Generalization | diagnose over- vs underfitting from train/test curves and pick the fix | 4 | 10 |
| 6 | Linear & logistic regression | derive a logistic decision boundary; explain why squared error is wrong for classification | 1, 2, 3 | 10 |
| 7 | Trees & ensembles | explain axis-aligned splits, bagging vs boosting, and when trees beat linear models | 5 | 10 |

**Checkpoint 2** — after 7.

## Unit 2 — Neural network mechanics

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 8 | The neuron | prove that stacked linear layers collapse to one linear layer, so nonlinearity is mandatory | 1, 6 | 8 |
| 9 | Layers & the forward pass | trace shapes and values through a 2-layer net by hand | 8 | 10 |
| 10 | Backpropagation | apply the chain rule to a small graph and say what each gradient *means* | 2, 9 | 10 |
| 11 | The training loop | write the 5-line loop; explain learning rate, batch, epoch, and read a loss curve | 10 | 8 |

**Checkpoint 3** — after 11.

## Unit 3 — Making deep learning work

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 12 | Overfitting in DL | pick among dropout, weight decay, augmentation, early stopping for a given symptom | 5, 11 | 8 |
| 13 | Optimization failure modes | diagnose vanishing/exploding gradients; name the fix (init, norm, residual, clipping) | 11 | 10 |
| 14 | Architecture families | state what MLP / CNN / RNN each assume about data, and choose one | 9 | 8 |

**Checkpoint 4** — after 14.

## Unit 4 — Natural language processing

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 15 | Tokenization | explain vocab, subwords, OOV, and why token count ≠ word count | 1 | 8 |
| 16 | Embeddings | explain the distributional hypothesis and compute cosine similarity | 15 | 8 |
| 17 | RNN → LSTM | explain the fixed-vector bottleneck and how gates address it | 10, 14 | 10 |
| 18 | Seq2seq & encoder–decoder | explain translation as encode-then-decode and state the alignment problem | 17 | 8 |

**Checkpoint 5** — after 18.

## Unit 5 — Reinforcement learning

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 19 | The RL frame | formalize a task as (S, A, P, R, γ) and define return | 3 | 10 |
| 20 | Value functions & the Bellman equation | write V and Q and explain the recursive expectation | 19 | 10 |
| 21 | Exploration vs exploitation | run ε-greedy by hand; explain regret on a bandit | 19 | 8 |
| 22 | Two solution families | contrast Q-learning (value) vs policy gradient (policy) on what they learn and when each fails | 20, 21 | 10 |

**Checkpoint 6** — after 22.

## Unit 6 — Deep reinforcement learning

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 23 | Function approximation | explain why tables die and why approximation kills convergence guarantees | 22 | 8 |
| 24 | DQN | explain replay buffer + target network as fixes for correlated data and moving targets | 23 | 10 |
| 25 | Policy gradient at scale | trace REINFORCE → baseline → A2C/PPO and explain the variance problem | 22, 23 | 10 |

**Checkpoint 7** — after 25.

## Unit 7 — Attention and LLMs

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 26 | Attention | compute scaled dot-product attention by hand for 2 tokens; explain Q/K/V roles | 1, 18 | 12 |
| 27 | The Transformer block | name every sub-layer, its purpose, and why residual + LayerNorm are required | 26, 13 | 10 |
| 28 | Pretraining | contrast next-token (GPT) vs masked (BERT) objectives; explain what scale buys | 27, 11 | 10 |
| 29 | Alignment & inference | explain SFT → RLHF/DPO; how context window and temperature shape output | 28, 22 | 10 |

**Checkpoint 8** — after 29.

## Unit 8 — Explainable AI

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 30 | Why explainability | distinguish intrinsic vs post-hoc, local vs global; state the accountability use case | 7, 11 | 8 |
| 31 | Attribution methods | explain what gradient saliency, LIME and SHAP actually compute, and their failure modes | 30, 2 | 12 |
| 32 | Evaluating explanations | test faithfulness; explain the correlation ≠ causation trap | 31 | 10 |

**Checkpoint 9** — after 32.

## Unit 9 — Federated learning

| # | Topic | Objective — you can… | Prereq | Min |
|---|-------|----------------------|--------|-----|
| 33 | Federated setting & FedAvg | describe the round protocol, write the averaging rule, justify data locality | 11 | 10 |
| 34 | Non-IID data & convergence | explain client drift and name the fixes; state the local-steps trade-off | 33, 5 | 10 |
| 35 | Privacy & threat model | explain DP noise, secure aggregation, and poisoning/backdoor attacks | 33 | 10 |

**Checkpoint 10** — after 35.

---

## Deliverables per unit
- **Cheat sheet** — `output/cheatsheet-unit-N.tex`, max 2 sides, compiled with XeLaTeX.
- **Deck** — `decks/unit-N.pptx`, ≤12 slides, speaker notes carry the depth.
- **K-12 layer** — skipped. This is an adult/university topic, not K-12 math/ELA/science/social studies.
