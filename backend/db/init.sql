CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_created TIMESTAMP DEFAULT now()
);

CREATE TABLE houses (
    house_id SERIAL PRIMARY KEY,
    house_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    founded INTEGER
);

CREATE TABLE perfumers (
    perfumer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
);

CREATE TABLE retailers (
    retail_id SERIAL PRIMARY KEY,
    retail_name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    status VARCHAR(50)
);

CREATE TABLE fragrances (
    frag_id SERIAL PRIMARY KEY,
    frag_name VARCHAR(255) NOT NULL,
    house_id INTEGER,
    release_date DATE,
    description TEXT,
    FOREIGN KEY (house_id) REFERENCES houses(house_id) ON DELETE SET NULL
);

CREATE TABLE details (
    details_id SERIAL PRIMARY KEY,
    frag_id INTEGER NOT NULL,
    concentration VARCHAR(100),
    size VARCHAR(50),
    sillage VARCHAR(50),
    gender VARCHAR(50),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE
);

CREATE TABLE prices (
    price_id SERIAL PRIMARY KEY,
    details_id INTEGER,
    retail_id INTEGER,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    FOREIGN KEY (details_id) REFERENCES details(details_id) ON DELETE CASCADE,
    FOREIGN KEY (retail_id) REFERENCES retailers(retail_id) ON DELETE SET NULL
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    frag_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    review_text TEXT,
    reviewer_name VARCHAR(255) DEFAULT 'Anonymous',
    created_at TIMESTAMP DEFAULT now(),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE
);

CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    note_name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50)
);

CREATE TABLE fragrance_perfumers (
    frag_id INTEGER,
    perfumer_id INTEGER,
    PRIMARY KEY (frag_id, perfumer_id),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE,
    FOREIGN KEY (perfumer_id) REFERENCES perfumers(perfumer_id) ON DELETE CASCADE
);

CREATE TABLE fragrance_notes (
    frag_id INTEGER,
    note_id INTEGER,
    PRIMARY KEY (frag_id, note_id),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE
);

CREATE TABLE retailer_fragrance (
    retail_id INTEGER,
    frag_id INTEGER,
    PRIMARY KEY (retail_id, frag_id),
    FOREIGN KEY (retail_id) REFERENCES retailers(retail_id) ON DELETE CASCADE,
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE
);

CREATE INDEX fragrance_house ON fragrances(house_id);
CREATE INDEX review_frag ON reviews(frag_id);
CREATE INDEX details_frag ON details(frag_id);
CREATE INDEX price_details ON prices(details_id);
CREATE INDEX price_retail ON prices(retail_id);

-- Fake test data --

INSERT INTO houses (house_name, country, founded) VALUES
('Lune House', 'France', 2010),
('Zest Labs', 'Italy', 2015),
('Noir Atelier', 'USA', 2008);

INSERT INTO perfumers (first_name, last_name) VALUES
('Antoine', 'Lie'),
('Fabio', 'Mancini'),
('Christophe', 'Raynaud');

INSERT INTO retailers (retail_name, website, status) VALUES
('Fragrance Direct', 'www.fragrancedirect.com', 'active'),
('Luxury Scents', 'www.luxuryscents.com', 'active'),
('Aroma Online', 'www.aromaonline.com', 'active');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Moonlight Whisper', 1, '2020-03-15', 'A mystical blend with bergamot and jasmine'),
('Citrus Bloom', 2, '2021-06-20', 'Bright and fresh with vibrant citrus notes'),
('Amber Nights', 3, '2019-11-10', 'Rich and warm with amber and vanilla base');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(1, '100ml Eau de Parfum', '100ml', 'Strong', 'Unisex'),
(2, '50ml Eau de Toilette', '50ml', 'Moderate', 'Unisex'),
(3, '75ml Eau de Parfum', '75ml', 'Strong', 'Unisex');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(1, 1, 120.00, 'USD'),
(1, 2, 125.00, 'USD'),
(2, 1, 45.00, 'USD'),
(2, 3, 48.00, 'USD'),
(3, 2, 180.00, 'USD'),
(3, 3, 175.00, 'USD');

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO notes (note_name, type) VALUES
('bergamot', 'top'),
('jasmine', 'middle'),
('musk', 'base'),
('lemon', 'top'),
('orange blossom', 'middle'),
('cedar', 'base'),
('amber', 'middle'),
('vanilla', 'base'),
('patchouli', 'base');

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8), (3, 9);

INSERT INTO users (username, email) VALUES
('sam_user', 'sam@example.com'),
('ava_user', 'ava@example.com'),
('lee_user', 'lee@example.com'),
('jordan_user', 'jordan@example.com');

INSERT INTO reviews (frag_id, rating, review_text, reviewer_name) VALUES
(1, 5, 'Lovely and long-lasting fragrance', 'Sam'),
(1, 4, 'Nice evening scent, very elegant', 'Ava'),
(2, 4, 'Great for daytime, fresh and clean', 'Lee'),
(3, 5, 'Exceptional composition, highly recommend', 'Jordan'),
(2, 5, 'Best citrus fragrance I''ve smelled', 'Maya'),
(3, 4, 'Warm and cozy for winter', 'Alex');
