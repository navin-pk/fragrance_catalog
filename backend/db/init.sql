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

-- Sourced Fragrantica.com to collect fragrance data
-- Use LLM to help generate realistic sample data
INSERT INTO houses (house_name, country, founded) VALUES
('Creed', 'France', 1760),
('Dior', 'France', 1946),
('Chanel', 'France', 1910),
('Tom Ford', 'United States', 2005),
('Yves Saint Laurent', 'France', 1961),
('Versace', 'Italy', 1978),
('Parfums de Marly', 'France', 2009),
('Guerlain', 'France', 1828),
('Armani', 'Italy', 1975),
('Hermès', 'France', 1837);

INSERT INTO perfumers (first_name, last_name) VALUES
('Olivier', 'Creed'),
('Erwin', 'Creed'),
('Jean-Christophe', 'Hérault'),
('François', 'Demachy'),
('Edmond', 'Roudnitska'),
('Jacques', 'Polge'),
('Olivier', 'Polge'),
('Yann', 'Vasnier'),
('Sonia', 'Constant'),
('Guillaume', 'Flavigny'),
('Yves', 'Cassar'),
('Dominique', 'Ropion'),
('Anne', 'Flipo'),
('Carlos', 'Benaïm'),
('Daniela', 'Andrier'),
('Antoine', 'Maisondieu'),
('Christophe', 'Raynaud'),
('Alberto', 'Morillas'),
('Calice', 'Becker'),
('Natalie', 'Gracia-Cetto'),
('Hamid', 'Merati-Kashani'),
('Quentin', 'Bisch'),
('Francis', 'Kurkdjian'),
('Pierre', 'Bourdon');

INSERT INTO retailers (retail_name, website, status) VALUES
('FragranceX', 'https://www.fragrancex.com', 'Active'),
('FragranceNet', 'https://www.fragrancenet.com', 'Active'),
('Sephora', 'https://www.sephora.com', 'Active'),
('Nordstrom', 'https://www.nordstrom.com', 'Active'),
('Bloomingdale''s', 'https://www.bloomingdales.com', 'Active'),
('Macy''s', 'https://www.macys.com', 'Active'),
('Harrods', 'https://www.harrods.com', 'Active'),
('Dior Boutique', 'https://www.dior.com', 'Active'),
('Chanel Boutique', 'https://www.chanel.com', 'Active'),
('Creed Boutique', 'https://www.creedfragrance.com', 'Active'),
('Tom Ford Boutique', 'https://www.tomford.com', 'Active'),
('YSL Beauty', 'https://www.yslbeautyus.com', 'Active');

INSERT INTO notes (note_name, type) VALUES
('Bergamot', 'Top'),
('Lemon', 'Top'),
('Mandarin Orange', 'Top'),
('Grapefruit', 'Top'),
('Calabrian Bergamot', 'Top'),
('Lemon Leaf', 'Top'),
('Pineapple', 'Top'),
('Black Currant', 'Top'),
('Apple', 'Top'),
('Peach', 'Middle'),
('Pear', 'Top'),
('Lychee', 'Top'),
('Cherry', 'Top'),
('Almond', 'Top'),
('Apricot', 'Middle'),
('Pink Pepper', 'Top'),
('Sichuan Pepper', 'Middle'),
('Cardamom', 'Middle'),
('Cinnamon', 'Middle'),
('Nutmeg', 'Middle'),
('Ginger', 'Middle'),
('Saffron', 'Middle'),
('Black Pepper', 'Middle'),
('Jasmine', 'Middle'),
('Rose', 'Middle'),
('Lavender', 'Middle'),
('Geranium', 'Middle'),
('Orange Blossom', 'Middle'),
('Violet', 'Middle'),
('Peony', 'Middle'),
('Turkish Rose', 'Middle'),
('Gardenia', 'Middle'),
('Sandalwood', 'Base'),
('Cedarwood', 'Base'),
('Birch', 'Base'),
('Patchouli', 'Base'),
('Vetiver', 'Base'),
('Oud', 'Base'),
('Guaiac Wood', 'Base'),
('Ebony Wood', 'Middle'),
('Papyrus', 'Middle'),
('Mint', 'Top'),
('Basil', 'Top'),
('Rosemary', 'Top'),
('Fig Leaf', 'Top'),
('Sage', 'Middle'),
('Violet Leaf', 'Top'),
('Juniper Berries', 'Middle'),
('Vanilla', 'Base'),
('Tonka Bean', 'Base'),
('Amber', 'Base'),
('Bourbon Vanilla', 'Base'),
('Honey', 'Base'),
('Frankincense', 'Base'),
('Labdanum', 'Base'),
('Elemi', 'Middle'),
('Incense', 'Base'),
('Ambroxan', 'Base'),
('Musk', 'Base'),
('Oakmoss', 'Base'),
('Licorice', 'Base'),
('Star Anise', 'Middle'),
('Leather', 'Base'),
('Tobacco', 'Middle'),
('Coffee', 'Base'),
('Raspberry', 'Top'),
('Rum', 'Top'),
('Aldehydes', 'Top'),
('Water Notes', 'Top'),
('White Musk', 'Base'),
('Ambergris', 'Base'),
('Rhubarb', 'Top'),
('Civet', 'Base'),
('Cashmeran', 'Base');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Aventus', 1, '2010-09-01', 'Aventus celebrates strength, vision and success, inspired by the dramatic life of Emperor Napoleon. A sophisticated blend for individuals who savor a life well-lived, featuring iconic pineapple and birch notes with a smoky, woody base.'),
('Aventus Cologne', 1, '2018-01-01', 'A fresher interpretation of Aventus with emphasis on citrus and mint notes. Features mandarin orange, ginger, and vetiver for a lighter, more refreshing take on the Aventus DNA.'),
('Absolu Aventus', 1, '2023-01-01', 'A darker, spicier interpretation of Aventus with enhanced fruity and warm spice notes. Features prominent grapefruit, ginger, cinnamon, and cardamom with a rich patchouli and vetiver base.'),
('Aventus for Her', 1, '2016-01-01', 'A feminine version of the legendary Aventus, featuring crisp green apple, musk, rose, and blackcurrant. A fresh, fruity-floral interpretation with signature Creed quality.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(1, 'Eau de Parfum', '50ml', 'Moderate', 'Men'),
(1, 'Eau de Parfum', '100ml', 'Moderate', 'Men'),
(1, 'Eau de Parfum', '120ml', 'Moderate', 'Men'),
(2, 'Eau de Parfum', '50ml', 'Moderate', 'Men'),
(2, 'Eau de Parfum', '100ml', 'Moderate', 'Men'),
(3, 'Parfum', '75ml', 'Strong', 'Men'),
(4, 'Eau de Parfum', '75ml', 'Strong', 'Women');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Sauvage', 2, '2015-09-01', 'A fresh and spicy fragrance featuring Calabrian bergamot and Sichuan pepper. Radically fresh composition with raw and noble ingredients, designed for the modern gentleman.'),
('Sauvage Eau de Parfum', 2, '2018-01-01', 'An enriched interpretation of Sauvage with oriental and vanilla facets. Features bergamot, star anise, nutmeg, and Papua vanilla for a warmer, more sensual experience.'),
('Sauvage Parfum', 2, '2019-01-01', 'The most concentrated interpretation inspired by moonlit prairies and campfires. Features New Caledonian sandalwood, frankincense, and tonka bean for a rich oriental composition.'),
('Sauvage Elixir', 2, '2021-01-01', 'An intensely concentrated fragrance with exceptional longevity. Features nutmeg, cinnamon, cardamom, and licorice with lavender and sandalwood for a spicy, sweet, and powerful composition.'),
('Eau Sauvage', 2, '1966-01-01', 'A legendary citrus aromatic fragrance created by Edmond Roudnitska. Features fresh lemon, bergamot, basil, and rosemary with masculine woody notes of vetiver and oakmoss. A timeless classic.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(5, 'Eau de Toilette', '60ml', 'Strong', 'Men'),
(5, 'Eau de Toilette', '100ml', 'Strong', 'Men'),
(6, 'Eau de Parfum', '60ml', 'Strong', 'Men'),
(6, 'Eau de Parfum', '100ml', 'Strong', 'Men'),
(7, 'Parfum', '60ml', 'Very Strong', 'Men'),
(7, 'Parfum', '100ml', 'Very Strong', 'Men'),
(8, 'Elixir', '60ml', 'Very Strong', 'Men'),
(8, 'Elixir', '100ml', 'Very Strong', 'Men'),
(9, 'Eau de Toilette', '100ml', 'Moderate', 'Men');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Bleu de Chanel', 3, '2010-09-13', 'A woody aromatic fragrance combining aromatic herbs with an opulent center and base. Features citrus top notes with ginger, jasmine, and a woody base of sandalwood, cedar, and vetiver.'),
('Bleu de Chanel Eau de Parfum', 3, '2014-01-01', 'An enriched version featuring Sicilian lemon, mandarin orange, New Caledonian sandalwood, and tonka bean. A smoother, more refined take on the original with enhanced woody notes.'),
('Bleu de Chanel Parfum', 3, '2018-05-01', 'The most intense variant created by Olivier Polge. Features aromatic citrus peel with the fullness of New Caledonian sandalwood and cedar for a rich, woody composition.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(10, 'Eau de Toilette', '50ml', 'Moderate', 'Men'),
(10, 'Eau de Toilette', '100ml', 'Moderate', 'Men'),
(10, 'Eau de Toilette', '150ml', 'Moderate', 'Men'),
(11, 'Eau de Parfum', '50ml', 'Moderate', 'Men'),
(11, 'Eau de Parfum', '100ml', 'Moderate', 'Men'),
(11, 'Eau de Parfum', '150ml', 'Moderate', 'Men'),
(12, 'Parfum', '50ml', 'Strong', 'Men'),
(12, 'Parfum', '100ml', 'Strong', 'Men');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Black Orchid', 4, '2006-01-01', 'Tom Ford''s first fragrance and an immediate success. A luxurious and sensual blend of black orchid, spice, and dark chocolate. An iconic unisex fragrance that redefined modern luxury perfumery.'),
('Ombré Leather', 4, '2018-01-01', 'A captivating leather fragrance with a tactile, sensual quality. Features cardamom, jasmine sambac, and smooth leather with patchouli, amber, and moss. Evokes luxury footwear and sophisticated elegance.'),
('Tobacco Vanille', 4, '2007-01-01', 'An opulent and warm fragrance featuring tobacco leaf and vanilla. With notes of ginger, cocoa, tonka bean, and dried fruits. A rich, enveloping scent perfect for cooler weather.'),
('Lost Cherry', 4, '2018-01-01', 'A seductive and addictive cherry almond fragrance. Opens with tart cherry and bitter almond, developing into Turkish rose and jasmine, with a warm sandalwood and tonka bean base.'),
('Tuscan Leather', 4, '2007-01-01', 'An undisputed icon featuring dry, luxurious leather. Opens with saffron and raspberry, developing into rich leather, suede, and amber with incense. Bold and sophisticated.'),
('Oud Wood', 4, '2007-01-01', 'A refined and balanced oud fragrance. Features rare oud wood with exotic spices, tonka bean, vanilla, amber, and sandalwood. Sophisticated and wearable for daily use.'),
('Black Lacquer', 4, '2024-01-01', 'A dark, mysterious oriental woody fragrance. Features vinyl, ink, black pepper, and rum with ebony wood, elemi, and frankincense. Evokes artistry and unique sophistication.'),
('Tom Ford for Men', 4, '2007-01-01', 'A classic woody floral musk fragrance. Features lemon leaf, ginger, mandarin, and violet leaf with tobacco, orange blossom, amber, and leather. Timeless elegance and versatility.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(13, 'Eau de Parfum', '50ml', 'Strong', 'Unisex'),
(13, 'Eau de Parfum', '100ml', 'Strong', 'Unisex'),
(14, 'Eau de Parfum', '50ml', 'Moderate', 'Unisex'),
(14, 'Eau de Parfum', '100ml', 'Moderate', 'Unisex'),
(15, 'Eau de Parfum', '50ml', 'Moderate', 'Unisex'),
(15, 'Eau de Parfum', '100ml', 'Moderate', 'Unisex'),
(16, 'Eau de Parfum', '50ml', 'Moderate', 'Unisex'),
(16, 'Eau de Parfum', '100ml', 'Moderate', 'Unisex'),
(17, 'Eau de Parfum', '50ml', 'Strong', 'Unisex'),
(17, 'Eau de Parfum', '100ml', 'Strong', 'Unisex'),
(18, 'Eau de Parfum', '50ml', 'Moderate', 'Unisex'),
(18, 'Eau de Parfum', '100ml', 'Moderate', 'Unisex'),
(19, 'Eau de Parfum', '50ml', 'Strong', 'Unisex'),
(19, 'Eau de Parfum', '100ml', 'Strong', 'Unisex'),
(20, 'Eau de Toilette', '50ml', 'Moderate', 'Men'),
(20, 'Eau de Toilette', '100ml', 'Moderate', 'Men');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Y Eau de Toilette', 5, '2017-01-01', 'A woody aromatic fragrance for Generation Y. Features aldehydes, bergamot, ginger, lemon, and mint with apple, violet leaf, sage, and geranium. Fresh and versatile for any occasion.'),
('Y Eau de Parfum', 5, '2018-01-01', 'A seductive interpretation of Y with enhanced depth. Features apple, ginger, and bergamot with sage, juniper berries, and geranium over amberwood, tonka bean, and cedar.'),
('Y Le Parfum', 5, '2021-01-01', 'A powerful and dark fougère composition. Features apple, aldehydes, grapefruit, and ginger with lavender, sage, and geranium over tonka bean, cedar, frankincense, and patchouli.'),
('Y Eau de Parfum Intense', 5, '2023-01-01', 'An intensely sensual fragrance with Provence lavender and Bali patchouli. Features ginger, juniper berries, and bergamot with sage, lavender, and geranium over vetiver, patchouli, and cedar.'),
('Y Elixir', 5, '2024-01-01', 'The quintessential fragrance for the accomplished man. A woody aromatic with lavender, geranium, frankincense, and oud. Sophisticated and powerful with excellent longevity.'),
('MYSLF Le Parfum', 5, '2024-01-01', 'An intense oriental woody fragrance. Features black pepper with orange blossom over bourbon vanilla, amber, woody notes, and patchouli. Modern, floral, and magnetic.'),
('Libre Le Parfum', 5, '2022-01-01', 'A bold oriental floral for women. Features ginger, saffron, mandarin, and bergamot with orange blossom and lavender over bourbon vanilla, honey, tonka bean, and vetiver.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(21, 'Eau de Toilette', '60ml', 'Moderate', 'Men'),
(21, 'Eau de Toilette', '100ml', 'Moderate', 'Men'),
(22, 'Eau de Parfum', '60ml', 'Moderate', 'Men'),
(22, 'Eau de Parfum', '100ml', 'Moderate', 'Men'),
(23, 'Parfum', '60ml', 'Strong', 'Men'),
(23, 'Parfum', '100ml', 'Strong', 'Men'),
(24, 'Eau de Parfum', '60ml', 'Strong', 'Men'),
(24, 'Eau de Parfum', '100ml', 'Strong', 'Men'),
(25, 'Elixir', '60ml', 'Very Strong', 'Men'),
(26, 'Parfum', '60ml', 'Strong', 'Unisex'),
(26, 'Parfum', '100ml', 'Strong', 'Unisex'),
(27, 'Parfum', '50ml', 'Strong', 'Women'),
(27, 'Parfum', '90ml', 'Strong', 'Women');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Eros', 6, '2012-01-01', 'A bold and seductive fragrance for men. Features mint leaves, Italian lemon zest, and green apple with tonka beans, amber, geranium flower, and vanilla. Vibrant and passionate.'),
('Dylan Blue Pour Homme', 6, '2016-01-01', 'A modern aromatic woody-fougère composition. Features aquatic notes, Calabrian bergamot, grapefruit, and fig leaf with violet leaf, papyrus, black pepper, and ambroxan over musk, tonka, and saffron.'),
('Pour Homme Dylan Blue', 6, '2016-01-01', 'Captures the sensual scents of the Mediterranean. Strong aquatic notes refreshed with citrus bergamot and grapefruit, enriched with saffron and musky base notes.'),
('Dylan Blue Pour Femme', 6, '2017-01-01', 'A floral fruity woody composition for women. Features Granny Smith apple, black currant, and clover with peach, rose, and jasmine over musk, white woods, and patchouli.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(28, 'Eau de Toilette', '50ml', 'Strong', 'Men'),
(28, 'Eau de Toilette', '100ml', 'Strong', 'Men'),
(29, 'Eau de Toilette', '50ml', 'Moderate', 'Men'),
(29, 'Eau de Toilette', '100ml', 'Moderate', 'Men'),
(30, 'Eau de Toilette', '50ml', 'Moderate', 'Men'),
(30, 'Eau de Toilette', '100ml', 'Moderate', 'Men'),
(31, 'Eau de Parfum', '30ml', 'Moderate', 'Women'),
(31, 'Eau de Parfum', '50ml', 'Moderate', 'Women'),
(31, 'Eau de Parfum', '100ml', 'Moderate', 'Women');

INSERT INTO fragrances (frag_name, house_id, release_date, description) VALUES
('Layton', 7, '2016-01-01', 'An oriental floral fragrance for women and men. Features apple, lavender, bergamot, and mandarin with geranium, violet, and jasmine over vanilla, cardamom, sandalwood, pepper, guaiac wood, and patchouli.'),
('Layton Exclusif', 7, '2017-01-01', 'An elegant and luxurious interpretation. Features almond, mandarin, bergamot, and watery notes with civet, rose, geranium, gardenia, and water lily over oud, vanilla, coffee, sandalwood, and patchouli.'),
('Delina', 7, '2017-01-01', 'A beautiful floral fragrance for women. Features lychee, rhubarb, bergamot, and nutmeg with Turkish rose, peony, musk, and vanilla over cashmeran, incense, cedar, and vetiver.'),
('Delina Exclusif', 7, '2018-01-01', 'The full quintessence of Delina. Features lychee, pear, bergamot, grapefruit, and pink pepper with Turkish rose, oud, and incense over vanilla, amber, woody notes, musk, and vetiver.'),
('Delina La Rosée', 7, '2021-01-01', 'A fresh interpretation of Delina. Features lychee, pear, bergamot, and pink pepper with Turkish rose, peony, watery notes, and floral notes over white musk, woody notes, and vetiver.');

INSERT INTO details (frag_id, concentration, size, sillage, gender) VALUES
(32, 'Eau de Parfum', '75ml', 'Moderate', 'Unisex'),
(32, 'Eau de Parfum', '125ml', 'Moderate', 'Unisex'),
(33, 'Eau de Parfum', '75ml', 'Strong', 'Unisex'),
(33, 'Eau de Parfum', '125ml', 'Strong', 'Unisex'),
(34, 'Eau de Parfum', '75ml', 'Moderate', 'Women'),
(35, 'Eau de Parfum', '75ml', 'Strong', 'Women'),
(36, 'Eau de Parfum', '75ml', 'Moderate', 'Women');

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1),
(3, 1),
(4, 1);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(5, 4), (6, 4), (7, 4), (8, 4),
(9, 5);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(10, 6), (11, 6), (12, 7);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(13, 8),
(14, 9),
(15, 8),
(16, 8),
(17, 8),
(18, 8),
(19, 10),
(20, 11);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(21, 12), (22, 12), (23, 12), (24, 12), (25, 12);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(26, 14), (26, 15), (26, 16);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(27, 13), (27, 14);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(28, 17), (29, 17), (30, 17),
(31, 18), (31, 19);

INSERT INTO fragrance_perfumers (frag_id, perfumer_id) VALUES
(32, 20), (33, 20),
(34, 21), (35, 21), (36, 21);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(1, 1), (1, 7), (1, 8), (1, 9), (1, 16),
(1, 24), (1, 33), (1, 37),
(1, 61), (1, 62), (1, 34), (1, 50);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(5, 5), (5, 16), (5, 17),
(5, 26), (5, 37), (5, 38),
(5, 60), (5, 34), (5, 57);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(8, 20), (8, 19), (8, 18), (8, 4),
(8, 26),
(8, 63), (8, 33), (8, 51), (8, 38), (8, 37);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(10, 2), (10, 42), (10, 16), (10, 4),
(10, 21), (10, 20), (10, 24),
(10, 57), (10, 33), (10, 38), (10, 37), (10, 34), (10, 61);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(13, 23), (13, 10), (13, 1),
(13, 24), (13, 29), (13, 64),
(13, 50), (13, 38), (13, 33);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(14, 18),
(14, 24), (14, 62),
(14, 38), (14, 51);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(16, 15), (16, 14),
(16, 30), (16, 24), (16, 25),
(16, 33), (16, 50);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(21, 69), (21, 1), (21, 21), (21, 2), (21, 42),
(21, 9), (21, 46), (21, 45), (21, 27),
(21, 33), (21, 38), (21, 37);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(23, 9), (23, 69), (23, 4), (23, 21),
(23, 26), (23, 45), (23, 27),
(23, 50), (23, 34), (23, 55), (23, 38);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(28, 42), (28, 2), (28, 9),
(28, 50), (28, 51), (28, 27), (28, 52);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(29, 70), (29, 5), (29, 4), (29, 43),
(29, 46), (29, 41), (29, 23),
(29, 60), (29, 61), (29, 22);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(32, 9), (32, 26), (32, 1), (32, 3),
(32, 27), (32, 29), (32, 24),
(32, 52), (32, 18), (32, 33), (32, 39), (32, 38);

INSERT INTO fragrance_notes (frag_id, note_id) VALUES
(34, 12), (34, 73), (34, 1), (34, 20),
(34, 30), (34, 31), (34, 61),
(34, 56), (34, 34), (34, 37);

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(1, 10, 365.00, 'USD'),
(2, 10, 495.00, 'USD'),
(3, 10, 595.00, 'USD'),
(4, 10, 345.00, 'USD'),
(5, 10, 465.00, 'USD'),
(6, 10, 525.00, 'USD'),
(7, 10, 395.00, 'USD');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(8, 8, 82.00, 'USD'),
(9, 8, 112.00, 'USD'),
(10, 8, 102.00, 'USD'),
(11, 8, 132.00, 'USD'),
(12, 8, 130.00, 'USD'),
(13, 8, 165.00, 'USD'),
(14, 8, 150.00, 'USD'),
(15, 8, 190.00, 'USD'),
(16, 8, 98.00, 'USD');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(17, 9, 92.00, 'USD'),
(18, 9, 130.00, 'USD'),
(19, 9, 165.00, 'USD'),
(20, 9, 107.00, 'USD'),
(21, 9, 145.00, 'USD'),
(22, 9, 180.00, 'USD'),
(23, 9, 120.00, 'USD'),
(24, 9, 150.00, 'USD');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(25, 11, 160.00, 'USD'),
(26, 11, 240.00, 'USD'),
(27, 11, 135.00, 'USD'),
(28, 11, 210.00, 'USD'),
(29, 11, 135.00, 'USD'),
(30, 11, 210.00, 'USD'),
(31, 11, 145.00, 'USD'),
(32, 11, 225.00, 'USD'),
(33, 11, 145.00, 'USD'),
(34, 11, 225.00, 'USD'),
(35, 11, 135.00, 'USD'),
(36, 11, 210.00, 'USD'),
(37, 11, 165.00, 'USD'),
(38, 11, 245.00, 'USD'),
(39, 11, 110.00, 'USD'),
(40, 11, 165.00, 'USD');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(41, 12, 85.00, 'USD'),
(42, 12, 115.00, 'USD'),
(43, 12, 105.00, 'USD'),
(44, 12, 135.00, 'USD'),
(45, 12, 125.00, 'USD'),
(46, 12, 155.00, 'USD'),
(47, 12, 115.00, 'USD'),
(48, 12, 145.00, 'USD'),
(49, 12, 165.00, 'USD'),
(50, 12, 125.00, 'USD'),
(51, 12, 155.00, 'USD'),
(52, 12, 110.00, 'USD'),
(53, 12, 145.00, 'USD');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(54, 3, 68.00, 'USD'),
(55, 3, 88.00, 'USD'),
(56, 3, 72.00, 'USD'),
(57, 3, 95.00, 'USD'),
(58, 3, 72.00, 'USD'),
(59, 3, 95.00, 'USD'),
(60, 3, 55.00, 'USD'),
(61, 3, 75.00, 'USD'),
(62, 3, 98.00, 'USD');

INSERT INTO prices (details_id, retail_id, amount, currency) VALUES
(63, 4, 215.00, 'USD'),
(64, 4, 285.00, 'USD'),
(65, 4, 235.00, 'USD'),
(66, 4, 305.00, 'USD'),
(67, 4, 215.00, 'USD'),
(68, 4, 235.00, 'USD'),
(69, 4, 215.00, 'USD');

INSERT INTO reviews (frag_id, rating, review_text, reviewer_name, created_at) VALUES
(1, 5, 'Aventus is a modern classic. The pineapple and birch combination is iconic and the longevity is excellent. Worth every penny despite the price.', 'Michael_R', '2024-06-15 10:30:00'),
(1, 4, 'Great fragrance but performance varies by batch. My 2023 bottle lasts about 8 hours with good projection. The fruity opening is amazing.', 'FragranceCollector', '2024-08-22 14:45:00'),
(2, 4, 'Aventus Cologne is perfect for summer. Fresher and more citrus-forward than the original. Great for office wear.', 'SummerScents', '2024-07-03 11:20:00'),
(5, 5, 'Sauvage is incredibly versatile and gets compliments every time I wear it. Perfect for any occasion - office, dates, casual outings.', 'John_D', '2024-07-10 09:15:00'),
(5, 3, 'It''s a good fragrance but extremely overused. Everyone seems to wear this now. Performance is solid though.', 'NicheEnthusiast', '2024-09-05 16:20:00'),
(8, 5, 'Sauvage Elixir is a beast! The licorice note is incredible and it lasts all day. One of the best in my collection.', 'ScentAddict', '2024-10-12 11:00:00'),
(9, 5, 'Eau Sauvage is timeless. The citrus freshness combined with oakmoss creates something truly special. A masterpiece by Roudnitska.', 'ClassicFan', '2024-05-20 13:15:00'),
(10, 4, 'Bleu de Chanel is elegant and sophisticated. The citrus opening is refreshing and it dries down to a beautiful woody scent.', 'Pierre_M', '2024-05-18 13:30:00'),
(12, 5, 'The Parfum version is the best in the Bleu line. Rich, woody, and mature. Performance could be better but the scent is phenomenal.', 'LuxuryFragrance', '2024-11-01 15:45:00'),
(13, 5, 'Black Orchid is absolutely luxurious. The dark chocolate and orchid blend is mesmerizing. Not for beginners but amazing for fragrance lovers.', 'GothicScents', '2024-06-08 10:00:00'),
(14, 4, 'Ombré Leather is my go-to leather fragrance. Smooth, not harsh, and perfect for fall and winter. Compliments guaranteed.', 'LeatherLover', '2024-09-15 14:30:00'),
(15, 5, 'Tobacco Vanille is pure luxury in a bottle. Perfect for cold weather. The tobacco and vanilla combination is addictive.', 'WinterWardrobe', '2024-11-20 16:45:00'),
(16, 4, 'Lost Cherry is sweet but sophisticated. The cherry almond opening is beautiful. Great for date nights.', 'SweetTooth', '2024-08-10 12:00:00'),
(21, 4, 'Y EDT is fresh and versatile. Great for daily wear and the price point is excellent. Modern and youthful.', 'DailyWear', '2024-07-22 10:15:00'),
(22, 5, 'Y EDP is the perfect balance between fresh and sweet. Incredible performance and works year-round.', 'YGeneration', '2024-09-01 11:30:00'),
(25, 5, 'Y Elixir is absolutely incredible. The lavender and oud combination is sophisticated and long-lasting. Worth the price.', 'ElixirFan', '2024-10-28 13:00:00'),
(28, 5, 'Eros is powerful and seductive. The mint opening is refreshing and the vanilla drydown is sweet. Perfect for clubs and nights out.', 'ClubScent', '2024-06-25 15:20:00'),
(29, 4, 'Dylan Blue is fresh and aquatic. Great for summer and spring. Very versatile and gets compliments.', 'AquaticLover', '2024-08-05 09:40:00'),
(32, 5, 'Layton is absolutely stunning. The apple and lavender opening is beautiful and the vanilla drydown is incredible. A masterpiece.', 'NicheLover', '2024-07-15 14:00:00'),
(34, 5, 'Delina is the most beautiful rose fragrance I''ve ever smelled. The lychee adds a perfect fruity sweetness. Feminine and elegant.', 'RoseQueen', '2024-09-10 11:45:00'),
(35, 4, 'Delina Exclusif is richer and more intense than the original. The oud adds depth. Perfect for special occasions.', 'PerfumeAddict', '2024-10-05 16:00:00');

INSERT INTO retailer_fragrance (retail_id, frag_id) VALUES
(1, 1), (1, 5), (1, 10), (1, 13), (1, 21), (1, 28),
(2, 1), (2, 5), (2, 6), (2, 7), (2, 10), (2, 11), (2, 13), (2, 14), (2, 21), (2, 22), (2, 28), (2, 29),
(3, 5), (3, 6), (3, 7), (3, 8), (3, 13), (3, 14), (3, 21), (3, 22), (3, 27), (3, 28), (3, 29), (3, 31),
(4, 1), (4, 5), (4, 10), (4, 13), (4, 14), (4, 15), (4, 21), (4, 22), (4, 32), (4, 34),
(5, 1), (5, 10), (5, 11), (5, 12), (5, 13), (5, 14), (5, 21), (5, 22), (5, 28),
(6, 5), (6, 10), (6, 21), (6, 28), (6, 29),
(7, 1), (7, 2), (7, 3), (7, 13), (7, 14), (7, 15), (7, 16), (7, 17), (7, 32), (7, 33), (7, 34), (7, 35),
(8, 5), (8, 6), (8, 7), (8, 8), (8, 9),
(9, 10), (9, 11), (9, 12),
(10, 1), (10, 2), (10, 3), (10, 4),
(11, 13), (11, 14), (11, 15), (11, 16), (11, 17), (11, 18), (11, 19), (11, 20),
(12, 21), (12, 22), (12, 23), (12, 24), (12, 25), (12, 26), (12, 27);

INSERT INTO users (username, email, date_created) VALUES
('fragrance_enthusiast', 'enthusiast@email.com', '2023-01-15 08:00:00'),
('luxury_scents', 'luxury@email.com', '2023-06-20 10:30:00'),
('classic_collector', 'collector@email.com', '2024-02-10 14:15:00'),
('modern_nose', 'modern@email.com', '2024-08-05 09:45:00'),
('niche_hunter', 'niche@email.com', '2024-03-12 12:00:00'),
('daily_wearer', 'daily@email.com', '2023-11-08 15:30:00');
