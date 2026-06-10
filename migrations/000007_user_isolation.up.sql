CREATE TABLE IF NOT EXISTS user_feeds (
    user_id VARCHAR(255) NOT NULL,
    feed_id INT NOT NULL REFERENCES rss_feeds(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, feed_id)
);

CREATE TABLE IF NOT EXISTS user_deleted_articles (
    user_id VARCHAR(255) NOT NULL,
    article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, article_id)
);
