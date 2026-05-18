import type { Question } from "./types";

export const mockQuestions: Question[] = [
    {
        id: "1",
        title: "How to use React hooks?",
        description: "I'm new to React and struggling to understand how to use hooks like useState and useEffect effectively. Can someone provide a simple example or explanation?",
        author_id: "user123",
        is_solved: false,
        allow_ai_companion: true,
        vote_count: 15,
        created_at: "2023-10-26T10:00:00Z",
        author: { id: "user123", username: "john_doe" },
        question_tags: [{ tag: { name: "react" } }, { tag: { name: "hooks" } }],
        answer: [
            {
                id: "a1",
                body: "React hooks are functions that let you “hook into” React state and lifecycle features from function components. `useState` lets you add state to functional components, and `useEffect` lets you perform side effects in function components.",
                question_id: "1",
                author_id: "user456",
                vote_count: 8,
                is_accepted: true,
                is_ai_generated: false,
                created_at: "2023-10-26T10:30:00Z",
                author: { id: "user456", username: "jane_smith" },
                comments: []
            }
        ],
        comments: [
            {
                id: "c1",
                body: "Great question!",
                target_id: "1",
                target_type: "question",
                created_at: "2023-10-26T10:10:00Z",
                author: { username: "commenter1" }
            }
        ]
    },
    {
        id: "2",
        title: "Python list comprehension for beginners",
        description: "I'm trying to understand list comprehensions in Python. Can someone give a basic explanation and a few examples?",
        author_id: "user789",
        is_solved: true,
        allow_ai_companion: false,
        vote_count: 25,
        created_at: "2023-10-25T14:00:00Z",
        author: { id: "user789", username: "python_learner" },
        question_tags: [{ tag: { name: "python" } }, { tag: { name: "list-comprehension" } }],
        answer: [
            {
                id: "a2",
                body: "List comprehensions provide a concise way to create lists. It consists of brackets containing an expression followed by a `for` clause, then zero or more `for` or `if` clauses. Example: `[x*2 for x in range(10) if x % 2 == 0]`",
                question_id: "2",
                author_id: "user101",
                vote_count: 15,
                is_accepted: true,
                is_ai_generated: false,
                created_at: "2023-10-25T14:30:00Z",
                author: { id: "user101", username: "expert_coder" },
                comments: []
            }
        ],
        comments: []
    }
];
