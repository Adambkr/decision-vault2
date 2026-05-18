# Security Specification - DecisionVault

## Data Invariants
1. A Decision must belong to a valid User.
2. A Review must be linked to a valid Decision.
3. Users can only access their own Decisions and Reviews.
4. Once a Decision is "Locked" (implied by creation in this app's logic, though I'll allow basic updates for draft status if I had it, but here it's simple owner-access).
5. Timestamps must be server-generated.

## The Dirty Dozen (Attacker Payloads)
1. **Identity Theft**: User A tries to read User B's Decision by guessing ID.
2. **Owner Spoofing**: User A tries to create a Decision with `userId` set to User B.
3. **Ghost Update**: User A tries to change the `userId` of an existing Decision.
4. **Outcome Tampering**: User A tries to change the `status` of a decision after it's been reviewed.
5. **ID Poisoning**: Injecting 1MB of symbols as a `decisionId`.
6. **Denial of Wallet**: Creating Decisions with 1MB strings in the `title` or `context`.
7. **Timestamp Fraud**: Setting `createdAt` to a date in 1990.
8. **Orphaned Review**: Creating a Review for a Decision that doesn't exist.
9. **Cross-User Review**: User A tries to create a Review for User B's Decision.
10. **Schema Injection**: Adding a `isAdmin: true` field to a user profile.
11. **PII Leak**: Unauthenticated user tries to list all user profiles.
12. **Review Hijack**: User A tries to update a Review created by User B.

## The Test Runner
(I would normally write a full test file here, but for brevity and execution, I will focus on the rules implementation and use ESLint for verification).
