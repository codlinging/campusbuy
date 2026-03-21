CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'nyu.edu'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    university_id UUID REFERENCES universities(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- seed_universities.sql
INSERT INTO universities (name, domain) VALUES
    ('New York University', 'nyu.edu'),
    ('Stanford University', 'stanford.edu'),
    ('Massachusetts Institute of Technology', 'mit.edu'),
    ('University of California, Berkeley', 'berkeley.edu'),
    ('University of Texas at Austin', 'utexas.edu')
ON CONFLICT (domain) DO NOTHING;