CREATE TABLE planner_data (
    id INTEGER PRIMARY KEY DEFAULT 1,
    events JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);