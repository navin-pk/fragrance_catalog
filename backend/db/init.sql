CREATE TABLE users (
    user_id SERIAL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE houses (
    house_id SERIAL,
    house_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    founded INT NOT NULL,
    PRIMARY KEY (house_id)
);

CREATE TABLE perfumers (
    perfumer_id SERIAL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (perfumer_id)
);

CREATE TABLE retailers (
    retail_id SERIAL,
    retail_name VARCHAR(100) NOT NULL,
    website VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    PRIMARY KEY (retail_id)
);

CREATE TABLE fragrances (
    frag_id SERIAL,
    frag_name VARCHAR(100) NOT NULL,
    house_id INT,
    release_date DATE NOT NULL,
    description TEXT,
    PRIMARY KEY (frag_id),
    FOREIGN KEY (house_id) REFERENCES houses(house_id) ON DELETE SET NULL
);

CREATE TABLE details (
    details_id SERIAL,
    frag_id INT,
    concentration VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    sillage VARCHAR(50) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    PRIMARY KEY (details_id),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE
);

CREATE TABLE prices (
    price_id SERIAL,
    details_id INT,
    retail_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    PRIMARY KEY (price_id),
    FOREIGN KEY (details_id) REFERENCES details(details_id) ON DELETE CASCADE,
    FOREIGN KEY (retail_id) REFERENCES retailers(retail_id) ON DELETE SET NULL
);

CREATE TABLE reviews (
    review_id SERIAL,
    frag_id INT NOT NULL,
    rating INT CHECK (rating >= 0 AND rating <= 5),
    review_text TEXT,
    reviewer_name VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (review_id),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE
);

CREATE TABLE notes (
    note_id SERIAL,
    note_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    PRIMARY KEY (note_id)
);

CREATE TABLE fragrance_perfumers (
    frag_id INT,
    perfumer_id INT,
    PRIMARY KEY (frag_id, perfumer_id),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE,
    FOREIGN KEY (perfumer_id) REFERENCES perfumers(perfumer_id) ON DELETE CASCADE
);

CREATE TABLE fragrance_notes (
    frag_id INT,
    note_id INT,
    PRIMARY KEY (frag_id, note_id),
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE
);

CREATE TABLE retailer_fragrance (
    retail_id INT,
    frag_id INT,
    PRIMARY KEY (retail_id, frag_id),
    FOREIGN KEY (retail_id) REFERENCES retailers(retail_id) ON DELETE CASCADE,
    FOREIGN KEY (frag_id) REFERENCES fragrances(frag_id) ON DELETE CASCADE
);

CREATE INDEX fragrance_house ON fragrances(house_id);
CREATE INDEX review_frag ON reviews(frag_id);
CREATE INDEX details_frag ON details(frag_id);
CREATE INDEX price_details ON prices(details_id);
CREATE INDEX price_retail ON prices(retail_id);